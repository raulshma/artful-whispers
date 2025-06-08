import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import sharp from "sharp";
import {
  insertDiaryEntrySchema,
  updateUserProfileSchema,
  insertCheckInSchema,
  userProfileSchema,
  updateUserSettingsSchema,
} from "@shared/schema";
import { GoogleGenAI, Modality } from "@google/genai";
import { put } from "@vercel/blob";
import {
  requireAuth,
  optionalAuth,
  type AuthenticatedRequest,
} from "./middleware";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const DEFAULT_MODEL = "gemini-2.0-flash";
const DEFAULT_MODEL_LITE = "gemini-2.0-flash-lite";
const DEFAULT_MODEL_IMAGE = "gemini-2.0-flash-preview-image-generation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (protected route)
  app.get("/api/user", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json(req.user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile (protected route)
  app.patch(
    "/api/user/profile",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = updateUserProfileSchema.parse(req.body);

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const updatedUser = await storage.updateUserProfile(
          req.user.id,
          validatedData
        );

        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser);
      } catch (error) {
        res.status(400).json({ message: "Invalid profile data" });
      }
    }
  );

  // Complete onboarding (protected route)
  app.post(
    "/api/user/complete-onboarding",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const updatedUser = await storage.markUserOnboarded(req.user.id);

        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser);
      } catch (error) {
        res.status(500).json({ message: "Failed to complete onboarding" });
      }
    }
  );

  // Search diary entries (protected route)
  app.get(
    "/api/diary-entries/search",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const query = req.query.q as string;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!query || query.trim().length === 0) {
          return res.status(400).json({ message: "Search query is required" });
        }

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const entries = await storage.searchDiaryEntries(
          req.user.id,
          query.trim(),
          limit,
          offset
        );
        res.json(entries);
      } catch (error) {
        res.status(500).json({ message: "Failed to search diary entries" });
      }
    }
  );

  // Get diary entries with pagination (protected route)
  app.get(
    "/api/diary-entries",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const entries = await storage.getDiaryEntries(
          req.user.id,
          limit,
          offset
        );
        res.json(entries);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch diary entries" });
      }
    }
  );
  // Get diary entry by date (protected route)
  app.get(
    "/api/diary-entries/date/:date",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { date } = req.params;

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const entry = await storage.getDiaryEntryByDate(req.user.id, date);

        if (!entry) {
          return res
            .status(404)
            .json({ message: "No entry found for this date" });
        }

        res.json(entry);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch diary entry" });
      }
    }
  );

  // Get all diary entries for a specific date (protected route)
  app.get(
    "/api/diary-entries/date/:date/all",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { date } = req.params;

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const entries = await storage.getDiaryEntriesByDate(req.user.id, date);
        res.json(entries);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch diary entries for date" });
      }
    }
  );

  // Create new diary entry (protected route)
  app.post(
    "/api/diary-entries",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = insertDiaryEntrySchema.parse(req.body);        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const entry = await storage.createDiaryEntry({
          ...validatedData,
          userId: req.user.id,
        });

        // Start sentiment analysis and image generation in background
        analyzeSentimentAndGenerateImage(entry);

        res.status(201).json(entry);
      } catch (error) {
        res.status(400).json({ message: "Invalid diary entry data" });
      }
    }
  );

  // Update diary entry (protected route)
  app.patch(
    "/api/diary-entries/:id",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const id = parseInt(req.params.id);
        const updates = req.body;

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const updatedEntry = await storage.updateDiaryEntry(id, updates);

        if (!updatedEntry) {
          return res.status(404).json({ message: "Diary entry not found" });
        }

        // If content was updated, re-analyze sentiment
        if (updates.content) {
          analyzeSentimentAndGenerateImage(updatedEntry);
        }

        res.json(updatedEntry);
      } catch (error) {
        res.status(400).json({ message: "Failed to update diary entry" });
      }
    }
  );

  // Toggle favorite status for diary entry (protected route)
  app.patch(
    "/api/diary-entries/:id/favorite",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const id = parseInt(req.params.id);

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const updatedEntry = await storage.toggleFavorite(id, req.user.id);

        if (!updatedEntry) {
          return res.status(404).json({ message: "Diary entry not found" });
        }

        res.json(updatedEntry);
      } catch (error) {
        res.status(400).json({ message: "Failed to toggle favorite" });
      }
    }
  );

  // Create new check-in (protected route)
  app.post(
    "/api/check-ins",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = insertCheckInSchema.parse(req.body);

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const checkIn = await storage.createCheckIn({
          ...validatedData,
          userId: req.user.id,
        });

        res.status(201).json(checkIn);
      } catch (error) {
        console.error("Check-in creation error:", error);
        res.status(400).json({
          message: "Invalid check-in data",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  );

  // Get check-ins with pagination (protected route)
  app.get(
    "/api/check-ins",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const checkIns = await storage.getCheckIns(
          req.user.id,
          limit,
          offset
        );
        res.json(checkIns);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch check-ins" });
      }
    }
  );
  // Get journal summary stats (protected route)
  app.get(
    "/api/stats/journal-summary",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const period = req.query.period as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const stats = await storage.getJournalSummaryStats(req.user.id, period, startDate, endDate);
        res.json(stats);
      } catch (error) {
        console.error("Journal summary stats error:", error);
        res.status(500).json({ message: "Failed to fetch journal summary stats" });
      }
    }
  );
  // Get mood check-in distribution (protected route)
  app.get(
    "/api/stats/mood-checkin-distribution",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const period = req.query.period as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const distribution = await storage.getMoodCheckinDistribution(req.user.id, period, startDate, endDate);
        res.json(distribution);
      } catch (error) {
        console.error("Mood check-in distribution error:", error);
        res.status(500).json({ message: "Failed to fetch mood check-in distribution" });
      }
    }
  );
  // Get calendar data for a specific month (protected route)
  app.get(
    "/api/stats/calendar-data",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const year = parseInt(req.query.year as string) || undefined;
        const month = parseInt(req.query.month as string) || undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const calendarData = await storage.getCalendarData(req.user.id, year, month, startDate, endDate);
        res.json(calendarData);
      } catch (error) {
        console.error("Calendar data error:", error);
        res.status(500).json({ message: "Failed to fetch calendar data" });
      }
    }
  );

  // Profile routes
  // Get user profile (protected route)
  app.get("/api/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let profile = await storage.getUserProfile(req.user.id);
      
      // Create profile if it doesn't exist
      if (!profile) {
        profile = await storage.createUserProfile(req.user.id, req.user.name, req.user.email);
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Update user profile (protected route)
  app.put("/api/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = userProfileSchema.partial().parse(req.body);

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updatedProfile = await storage.updateUserProfileData(req.user.id, validatedData);

      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });

  // Get user statistics (protected route)
  app.get("/api/profile/stats", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let stats = await storage.getUserStats(req.user.id);
      
      // Create or calculate stats if they don't exist
      if (!stats) {
        stats = await storage.calculateUserStats(req.user.id);
      }

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Sync/recalculate user statistics (protected route)
  app.post("/api/profile/stats/sync", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Force recalculation of stats
      const stats = await storage.calculateUserStats(req.user.id);

      res.json({
        message: "Stats synced successfully",
        stats,
      });
    } catch (error) {
      console.error('Stats sync error:', error);
      res.status(500).json({ message: "Failed to sync user statistics" });
    }
  });

  // Get user settings (protected route)
  app.get("/api/settings", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let settings = await storage.getUserSettings(req.user.id);
      
      // Create settings if they don't exist
      if (!settings) {
        settings = await storage.createUserSettings(req.user.id);
      }

      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  // Update user settings (protected route)
  app.put("/api/settings", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = updateUserSettingsSchema.parse(req.body);

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updatedSettings = await storage.updateUserSettings(req.user.id, validatedData);

      if (!updatedSettings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      res.json(updatedSettings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  // Export user data (protected route)
  app.get("/api/account/export", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const exportData = await storage.exportUserData(req.user.id);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user-data-${req.user.id}-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  // Delete user account (protected route)
  app.delete("/api/account", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const deleted = await storage.deleteUserAccount(req.user.id);

      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete account" });
      }

      // Invalidate session - this should be handled by auth middleware
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Generate lofi-style image URL based on mood and emotions
  function generateLofiImageUrl(mood: string, emotions: string[]): string {
    const lofiKeywords = [
      mood,
      ...emotions,
      "lofi",
      "aesthetic",
      "girl",
      "study",
      "cozy",
      "anime",
      "illustration",
      "peaceful",
    ].join(",");
    return `https://source.unsplash.com/1200x800/?${lofiKeywords}`;
  }

  // Analyze sentiment, generate title and image
  async function analyzeSentimentAndGenerateImage(entry: any) {
    try {
      // Fetch user data to personalize prompts
      const user = await storage.getUser(entry.userId);
      
      // Build persona from user details
      const persona = [user?.gender, user?.nationality].filter(Boolean).join(' ');
      const personaDescription = persona || 'person';
      
      // Include languages in context if available
      const languageContext = user?.languages ? ` The person speaks ${user.languages}.` : '';

      // Create a new instance of GoogleGenAI for text and image generation
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

      // Generate title and sentiment analysis
      const analysisPrompt = `
        Analyze this diary entry and respond with ONLY a valid JSON object (no markdown formatting):
        
        Entry: "${entry.content}"
        Context: This entry is from a ${personaDescription}.${languageContext}
        
        Respond with exactly this format:
        {
          "title": "a short, poetic 2-4 word title that captures the essence of this entry",
          "mood": "one word describing the primary mood",
          "emotions": ["array", "of", "emotions", "detected"],
          "imagePrompt": "a detailed prompt for generating a lofi-style image featuring a ${personaDescription} (lofi girl/boy style) in a setting that matches the diary's emotional essence. Include soft colors, gentle lighting, peaceful scenes, and aesthetic elements that reflect the mood and emotions"
        }
      `;

      // Text analysis using the new API format
      const textResponse = await ai.models.generateContent({
        model: DEFAULT_MODEL_LITE,
        contents: analysisPrompt,
        config: {
          temperature: 0.2
        }
      });

      // Extract text from the response
      let analysisText = "";
      if (textResponse.candidates && textResponse.candidates[0]?.content?.parts) {
        for (const part of textResponse.candidates[0].content.parts) {
          if (part.text) {
            analysisText += part.text;
          }
        }
      }
      
      analysisText = analysisText.trim();

      // Clean up any markdown formatting
      if (analysisText.startsWith("```json")) {
        analysisText = analysisText
          .replace(/```json\n?/g, "")
          .replace(/```\n?$/g, "");
      }

      try {
        const analysisData = JSON.parse(analysisText);

        // Update entry with analysis data
        await storage.updateDiaryEntry(entry.id, {
          title: analysisData.title,
          mood: analysisData.mood,
          emotions: JSON.stringify(analysisData.emotions),
          imagePrompt: analysisData.imagePrompt,
        });

        // Generate lofi-style image using Gemini image generation
        try {
          const imagePrompt = `Create a lofi-style illustration: ${analysisData.imagePrompt}. Style: soft watercolor, pastel colors, dreamy atmosphere, aesthetic, minimalist, peaceful, cozy. Character: ${personaDescription} in a relaxing environment that matches the mood: ${analysisData.mood}`;

          // Image generation using the new API format with both TEXT and IMAGE modalities
          const imageResponse = await ai.models.generateContent({
            model: DEFAULT_MODEL_IMAGE,
            contents: imagePrompt,
            config: {
              responseModalities: [Modality.TEXT, Modality.IMAGE],
              temperature: 0.4
            },
          });
          
          // Process the image response
          let imageData = null;
          
          if (imageResponse.candidates && imageResponse.candidates[0]?.content?.parts) {
            // Find the image part in the response
            for (const part of imageResponse.candidates[0].content.parts) {
              if (part.inlineData) {
                imageData = part.inlineData.data;
                break;
              }
            }
          }
          
          if (imageData) {
            try {
              // Convert base64 to buffer
              // Convert base64 to buffer
              const originalBuffer = Buffer.from(imageData, "base64");
              
              // Compress image using sharp
              const compressedBuffer = await sharp(originalBuffer)
                .png({ quality: 90, compressionLevel: 9 })
                .toBuffer();
              
              // Generate a unique filename based on entry ID and timestamp
              const filename = `diary-${entry.id}-${Date.now()}.png`;
              
              // Upload compressed image to Vercel Blob
              const { url } = await put(filename, compressedBuffer, {
                access: 'public',
                contentType: 'image/png'
                // Removed metadata as it's not supported by Vercel Blob
              });
              
              // Store the Vercel Blob URL in the database
              await storage.updateDiaryEntry(entry.id, {
                imageUrl: url,
              });
              
              console.log(`Image stored successfully at: ${url}`);
            } catch (blobError) {
              console.error("Failed to store image in Vercel Blob:", blobError);
              // Fallback to Unsplash if Blob storage fails
              const imageUrl = generateLofiImageUrl(
                analysisData.mood,
                analysisData.emotions
              );
              
              await storage.updateDiaryEntry(entry.id, {
                imageUrl: imageUrl,
              });
            }
          } else {
            throw new Error("No image data returned");
          }
        } catch (imageError) {
          console.error("Image generation failed, using fallback:", imageError);
          // Fallback to curated lofi images
          const imageUrl = generateLofiImageUrl(
            analysisData.mood,
            analysisData.emotions
          );
          
          await storage.updateDiaryEntry(entry.id, {
            imageUrl: imageUrl,
          });
        }
      } catch (parseError) {
        console.error("Failed to parse analysis:", parseError);
        console.error("Raw response:", analysisText);
      }
    } catch (error) {
      console.error("Failed to analyze entry:", error);
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
