
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

const NUTRITION_SCHEMA = {
  type: Type.OBJECT,
  required: ["item_name", "serving_size", "calories"],
  properties: {
    item_name: { type: Type.STRING, description: "The name of the food item." },
    serving_size: { type: Type.STRING, description: "The amount (e.g., '100g' or '1 cup')." },
    calories: { type: Type.INTEGER, description: "Total energy in kcal." },
    total_fat_g: { type: Type.NUMBER },
    saturated_fat_g: { type: Type.NUMBER },
    trans_fat_g: { type: Type.NUMBER },
    cholesterol_mg: { type: Type.INTEGER },
    sodium_mg: { type: Type.INTEGER },
    total_carbohydrate_g: { type: Type.NUMBER },
    dietary_fiber_g: { type: Type.NUMBER },
    total_sugars_g: { type: Type.NUMBER },
    added_sugars_g: { type: Type.NUMBER },
    protein_g: { type: Type.NUMBER },
    vitamins_and_minerals: {
      type: Type.OBJECT,
      properties: {
        vitamin_d_mcg: { type: Type.NUMBER },
        calcium_mg: { type: Type.NUMBER },
        iron_mg: { type: Type.NUMBER },
        potassium_mg: { type: Type.NUMBER }
      }
    }
  }
};

const RESPONSE_WRAPPER_SCHEMA = {
  type: Type.OBJECT,
  required: ["status"],
  properties: {
    status: { 
      type: Type.STRING, 
      enum: ["NEED_INFO", "COMPLETE"],
      description: "Whether the AI has enough information to provide nutrition facts."
    },
    clarifying_question: { 
      type: Type.STRING, 
      description: "A short, helpful question to ask the user if status is NEED_INFO." 
    },
    nutrition_facts: NUTRITION_SCHEMA
  }
};

/**
 * Analyzes food descriptions and images using the Gemini model.
 * The message parts use optional text and inlineData to support multimodal conversation.
 */
export const analyzeFoodWithConversation = async (
  messages: { 
    role: 'user' | 'model', 
    parts: { text?: string, inlineData?: { mimeType: string, data: string } }[] 
  }[]
): Promise<AnalysisResponse> => {
  // Always initialize with named parameter and process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: messages,
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_WRAPPER_SCHEMA,
      systemInstruction: `You are a professional nutritionist. 
      Your goal is to provide highly accurate nutrition facts. 
      CRITICAL REQUIREMENT: You MUST know the specific food identity AND the quantity/portion size (e.g., '2 large eggs', '500ml', 'one cup') before providing the nutrition facts.
      
      - If the user describes a food but omits the quantity (e.g., 'I had some pizza' or 'an apple'), set status to 'NEED_INFO' and ask specifically about the amount or size.
      - If the food identity is vague (e.g., 'a sandwich'), set status to 'NEED_INFO' and ask about the ingredients and the size.
      - Only set status to 'COMPLETE' when you have enough specific information to give accurate estimates for the EXACT amount the user consumed.
      - Always return valid JSON.`
    }
  });

  // Extract generated text using the .text property
  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as AnalysisResponse;
};
