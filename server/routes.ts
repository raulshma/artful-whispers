import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertDiaryEntrySchema,
  updateUserProfileSchema,
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

  // Create new diary entry (protected route)
  app.post(
    "/api/diary-entries",
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = insertDiaryEntrySchema.parse(req.body);

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if entry already exists for this date
        const existingEntry = await storage.getDiaryEntryByDate(
          req.user.id,
          validatedData.date
        );
        if (existingEntry) {
          return res
            .status(400)
            .json({ message: "Entry already exists for this date" });
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
      // Create a new instance of GoogleGenAI for text and image generation
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

      // Generate title and sentiment analysis
      const analysisPrompt = `
        Analyze this diary entry and respond with ONLY a valid JSON object (no markdown formatting):
        
        Entry: "${entry.content}"
        
        Respond with exactly this format:
        {
          "title": "a short, poetic 2-4 word title that captures the essence of this entry",
          "mood": "one word describing the primary mood",
          "emotions": ["array", "of", "emotions", "detected"],
          "imagePrompt": "a detailed prompt for generating a lofi-style image featuring a person (lofi girl/boy style) in a setting that matches the diary's emotional essence. Include soft colors, gentle lighting, peaceful scenes, and aesthetic elements that reflect the mood and emotions"
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
          const imagePrompt = `Create a lofi-style illustration: ${analysisData.imagePrompt}. Style: soft watercolor, pastel colors, dreamy atmosphere, aesthetic, minimalist, peaceful, cozy. Character: lofi girl/boy in a relaxing environment that matches the mood: ${analysisData.mood}`;

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
              const buffer = Buffer.from(imageData, "base64");
              
              // Generate a unique filename based on entry ID and timestamp
              const filename = `diary-${entry.id}-${Date.now()}.png`;
              
              // Upload to Vercel Blob
              const { url } = await put(filename, buffer, {
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
