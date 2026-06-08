import "server-only";

import { generateSchema } from "@/ai/generate-schema";

export async function generateSchemaWithPpio(brief: string) {
  return generateSchema({ brief });
}
