import { createOpenAI } from "@ai-sdk/openai";

export const ppio = createOpenAI({
  apiKey: process.env.PPIO_API_KEY,
  baseURL: process.env.PPIO_BASE_URL ?? "https://api.ppinfra.com/v3/openai",
});
