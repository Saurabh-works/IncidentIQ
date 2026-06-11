import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not configured.");
  process.exit(1);
}

try {
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model,
    contents: "Reply with exactly: IncidentIQ Gemini connection successful",
  });
  console.log(`Model: ${model}`);
  console.log(response.text);
} catch (error) {
  console.error("Gemini connection failed:", error.message);
  process.exitCode = 1;
}
