// Note: Vercel automatically creates a serverless function from this file.
// Make sure to add `@google/genai` to your `package.json` for this to work in a Node.js environment.

import { GoogleGenAI, Type } from "@google/genai";
import type { StartupName } from '../types';

// This is a server-side file, so we can safely use the API key here.
const API_KEY = process.env.API_KEY;

// Vercel API route handler signature.
// You might need to install Vercel's and Node's type definitions for full TypeScript support.
// e.g., `npm install --save-dev @vercel/node @types/node`
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!API_KEY) {
    return res.status(500).json({ error: { message: "API key not configured on the server." } });
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const { industry } = req.body;

  if (!industry) {
    return res.status(400).json({ error: { message: "Industry cannot be empty." } });
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
    
    if (parsedResponse && Array.isArray(parsedResponse.names)) {
        return res.status(200).json(parsedResponse.names);
    } else {
        throw new Error("Failed to parse startup names from the API response.");
    }
  } catch (error) {
    console.error("Error in API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return res.status(500).json({ error: { message: `Failed to generate names: ${errorMessage}` } });
  }
}
