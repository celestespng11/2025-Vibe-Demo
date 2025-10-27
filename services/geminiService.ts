import { GoogleGenAI, Type } from "@google/genai";
import type { StartupName } from '../types';

const API_KEY = process.env.API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateStartupNames = async (industry: string): Promise<StartupName[]> => {
  if (!ai) {
    throw new Error("Gemini API key not configured. Please set the API_KEY environment variable.");
  }

  if (!industry) {
    throw new Error("Industry cannot be empty.");
  }

  const prompt = `Generate 10 creative, modern, and memorable startup names for the "${industry}" industry. For each name, also create a short, catchy tagline.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            names: {
              type: Type.ARRAY,
              description: "A list of 10 startup names with their taglines.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "The generated startup name.",
                  },
                  tagline: {
                    type: Type.STRING,
                    description: "A catchy tagline for the startup name.",
                  },
                },
                required: ["name", "tagline"],
              },
            },
          },
          required: ["names"],
        },
        temperature: 0.8,
        topP: 0.9,
      },
    });

    const jsonString = response.text;
    if (!jsonString) {
        throw new Error("Received an empty response from the API.");
    }
    const parsedResponse = JSON.parse(jsonString);
    
    if (parsedResponse && Array.isArray(parsedResponse.names) && parsedResponse.names.length > 0) {
        return parsedResponse.names;
    } else {
        throw new Error("Failed to parse startup names from the API response.");
    }
  } catch (error) {
    console.error("Error generating startup names:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The provided API key is not valid. Please check your deployment environment variables.');
        }
        throw new Error(`Failed to generate names: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating names.");
  }
};
