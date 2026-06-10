import "server-only";

import { generateSchema, reviseSchema } from "@/ai/generate-schema";
import type { ProjectSchema } from "@/lib/types";

export async function generateSchemaWithPpio(brief: string) {
  return generateSchema({ brief });
}

export async function reviseSchemaWithPpio({
  brief,
  currentSchema,
  instructions,
}: {
  brief: string;
  currentSchema: ProjectSchema;
  instructions: string;
}) {
  return reviseSchema({ brief, currentSchema, instructions });
}
