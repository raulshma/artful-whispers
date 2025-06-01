// This file contains helper functions for Gemini API integration
// The actual API calls are handled on the server side for security

export interface SentimentAnalysis {
  mood: string;
  emotions: string[];
  imagePrompt: string;
}

export interface DiaryAnalysis {
  sentiment: SentimentAnalysis;
  imageUrl?: string;
}

// Helper function to format prompts for Gemini
export function createSentimentPrompt(content: string): string {
  return `
    Analyze the sentiment and mood of this diary entry and respond with a JSON object:
    
    Entry: "${content}"
    
    Respond with:
    {
      "mood": "one word describing the primary mood",
      "emotions": ["array", "of", "emotions", "detected"],
      "imagePrompt": "a detailed prompt for generating a lofi-style, artistic, dreamy image that captures the emotional essence of this entry. Focus on soft colors, gentle lighting, and peaceful scenes"
    }
  `;
}

// Helper function to create image generation prompts
export function createImagePrompt(sentiment: SentimentAnalysis): string {
  return `Create a lofi-style, dreamy, artistic image with soft colors and gentle lighting. 
    Mood: ${sentiment.mood}
    Emotions: ${sentiment.emotions.join(', ')}
    Style: watercolor, pastel colors, peaceful, aesthetic, minimalist
    Scene: ${sentiment.imagePrompt}`;
}
