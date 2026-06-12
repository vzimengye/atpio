import "server-only";

import {
  generateSchema,
  reviseSchema,
  type QuestionnaireLanguage,
} from "@/ai/generate-schema";
import type { ProjectSchema } from "@/lib/types";

export async function generateSchemaWithPpio(
  brief: string,
  outputLanguage?: QuestionnaireLanguage,
) {
  return generateSchema({ brief, outputLanguage });
}

export async function reviseSchemaWithPpio({
  brief,
  currentSchema,
  instructions,
  outputLanguage,
}: {
  brief: string;
  currentSchema: ProjectSchema;
  instructions: string;
  outputLanguage?: QuestionnaireLanguage;
}) {
  return reviseSchema({ brief, currentSchema, instructions, outputLanguage });
}
