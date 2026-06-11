import { GoogleGenAI } from "@google/genai";
import AIUsage from "../models/AIUsage.js";

const provider = "gemini";
const dateKey = () => new Date().toISOString().slice(0, 10);
const requestLimit = () => Number(process.env.GEMINI_DAILY_REQUEST_LIMIT || 1000);
const tokenLimit = () => Number(process.env.GEMINI_DAILY_TOKEN_LIMIT || 1000000);

async function updateUsage(update) {
  return AIUsage.findOneAndUpdate(
    { provider, dateKey: dateKey() },
    {
      $inc: {
        requestCount: update.requests || 0,
        promptTokens: update.promptTokens || 0,
        outputTokens: update.outputTokens || 0,
        totalTokens: update.totalTokens || 0,
        fallbackCount: update.fallbacks || 0,
      },
      $set: { lastUsedAt: new Date(), lastError: update.error || "" },
    },
    { upsert: true, new: true },
  ).lean();
}

export async function getGeminiQuota() {
  const usage = (await AIUsage.findOne({ provider, dateKey: dateKey() }).lean()) || {};
  const requestsUsed = usage.requestCount || 0;
  const tokensUsed = usage.totalTokens || 0;
  return {
    configured: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    requestLimit: requestLimit(),
    requestsUsed,
    requestsAvailable: Math.max(0, requestLimit() - requestsUsed),
    tokenLimit: tokenLimit(),
    tokensUsed,
    tokensAvailable: Math.max(0, tokenLimit() - tokensUsed),
    fallbackCount: usage.fallbackCount || 0,
    lastError: usage.lastError || "",
    estimated: true,
  };
}

export async function getGeminiStatus() {
  const usage = await AIUsage.findOne({ provider, dateKey: dateKey() }).lean();
  const configured = Boolean(process.env.GEMINI_API_KEY);
  const blockedByError = Boolean(usage?.lastError);
  return {
    configured,
    available: configured && !blockedByError,
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    message: !configured ? "Gemini API key is not configured." : blockedByError ? usage.lastError : "Gemini AI is available.",
  };
}

function parseJSON(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const value = JSON.parse(cleaned);
  const requiredStrings = ["rootCause", "impact", "rawSummary"];
  const requiredArrays = ["affectedServices", "evidence", "suggestedFixes", "preventionSteps"];
  if (!requiredStrings.every((key) => typeof value[key] === "string") || !requiredArrays.every((key) => Array.isArray(value[key]))) {
    throw new Error("Gemini returned an invalid RCA structure.");
  }
  return value;
}

export async function generateGeminiRCA(context) {
  if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API key is not configured.");
  const quota = await getGeminiQuota();
  if (!quota.requestsAvailable || !quota.tokensAvailable) throw new Error("Configured Gemini daily budget is exhausted.");

  await updateUsage({ requests: 1 });
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are an incident-response analyst. Analyze the telemetry below and return only valid JSON.

Required JSON shape:
{
  "rootCause": "concise root cause",
  "affectedServices": ["service"],
  "impact": "user/business impact",
  "evidence": ["specific evidence"],
  "suggestedFixes": ["actionable fix"],
  "preventionSteps": ["prevention step"],
  "rawSummary": "brief combined summary"
}

Do not invent evidence. If there is no active incident, clearly say so.

Telemetry:
${JSON.stringify(context)}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.2 },
    });
    const report = parseJSON(response.text);
    const usage = response.usageMetadata || {};
    const promptTokens = usage.promptTokenCount || 0;
    const outputTokens = usage.candidatesTokenCount || 0;
    const totalTokens = usage.totalTokenCount || promptTokens + outputTokens;
    await updateUsage({ promptTokens, outputTokens, totalTokens });
    return { report, model, usage: { promptTokens, outputTokens, totalTokens } };
  } catch (error) {
    await updateUsage({ fallbacks: 1, error: error.message });
    throw error;
  }
}
