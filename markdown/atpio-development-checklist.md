# Atpio Development Checklist

This document lists the changes needed before Atpio can go online. Each section explains why the change matters and shows what the code should look like after.

You will be given access to an existing production codebase as a reference. When in doubt, search that codebase for similar patterns. It already solves most of the problems listed here.

## Priority 1 - Must Fix Before Deployment

### 1.1 Replace Raw Fetch With the AI SDK

Current problem: `src/lib/ppio-schema.ts` calls the LLM with a raw `fetch()`, then manually extracts JSON from the response string. This is fragile. If the model returns markdown fencing, extra text, or malformed JSON, it breaks silently.

What to do: Use the Vercel AI SDK (`ai` package). It handles retries, structured output, streaming, and provider switching for you.

```ts
// src/ai/provider.ts
import { createOpenAI } from "@ai-sdk/openai";

export const ppio = createOpenAI({
  apiKey: process.env.PPIO_API_KEY,
  baseURL: process.env.PPIO_BASE_URL,
});
```

```ts
// src/ai/generate-schema.ts
import { generateObject } from "ai";
import { z } from "zod";
import { ppio } from "./provider";
import { schemaGenerationPrompt } from "./prompt/schema-generation";

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    "short_text",
    "long_text",
    "single_select",
    "multi_select",
    "rating",
    "boolean",
  ]),
  label: z.string(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  pageId: z.string().optional(),
  placeholder: z.string().optional(),
});

const projectSchemaOutput = z.object({
  name: z.string(),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pages: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    fields: z.array(formFieldSchema).max(8),
  }),
});

export async function generateSchema({ brief }: { brief: string }) {
  const { object } = await generateObject({
    model: ppio("deepseek/deepseek-v3-turbo"),
    schema: projectSchemaOutput,
    system: schemaGenerationPrompt,
    prompt: brief,
    temperature: 0.2,
  });

  return object;
}
```

Why this matters: `generateObject` validates the model output against the Zod schema automatically. If the output does not match, it retries. You never need to write `JSON.parse`, `extractJsonObject`, and `validateSchema` yourself. The AI SDK also gives you streaming, token counting, and provider switching for free.

File structure to follow:

```txt
src/
  ai/
    provider.ts
    prompt/
      schema-generation.ts
    generate-schema.ts
```

### 1.2 Separate Prompts From Logic

Current problem: The system prompt is a 30-line string embedded inside the function that calls the API. This makes it hard to iterate on the prompt, review it, or version it.

What to do: Put each prompt in its own file. Export it as a plain string constant.

```ts
// src/ai/prompt/schema-generation.ts
export const schemaGenerationPrompt = `You are Atpio's form strategist. Given a research brief, choose the best embedded data-gathering format: questions, field types, options, validation, pages, and order.

Do not merely mirror the brief. Infer what data would be most useful and easy for users to answer.

Rules:
- Use 3-6 fields for normal briefs, at most 8.
- Every field must include a stable snake_case "id", a user-facing "label", "type", and "required".
- Allowed types: short_text, long_text, single_select, multi_select, rating, boolean.
- Choice fields must include concise "options".
- Text fields should include "placeholder" and validation when useful.
- Rating fields should use min=1 and max=5.
- Split into pages only when it improves the flow.`;
```

Why this matters: Prompts change frequently. When a prompt lives in its own file, you can edit it without touching any logic. You can also compare versions in git diffs cleanly.

### 1.3 Add Input Validation on API Routes

Current problem: API routes trust incoming request bodies without checking their shape. A malformed request can cause runtime crashes or store garbage data.

What to do: Define a Zod schema for each route's input. Validate before processing.

```ts
// src/app/api/projects/generate-schema/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSchema } from "@/ai/generate-schema";

const requestSchema = z.object({
  brief: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await generateSchema({ brief: parsed.data.brief });
  return NextResponse.json(result);
}
```

Why this matters: Without validation, anything the client sends becomes part of your system. This is both a security issue, because of injection and unexpected types, and a reliability issue, because of crashes from undefined fields. Validate at the boundary, trust internally.

### 1.4 Replace JSON File Store With a Database

Current problem: `src/lib/store.ts` reads and writes a single JSON file. Two concurrent requests can overwrite each other's data. This also means deployment to serverless platforms like Vercel will not work because serverless functions do not share a filesystem.

What to do: Use Prisma with PostgreSQL. Define your schema as a migration.

```prisma
// prisma/schema.prisma
model Project {
  id            String   @id
  name          String
  brief         String
  schema        Json
  gadget        Json
  status        String   @default("draft")
  responseCount Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  responses Response[]
}

model Response {
  id        String   @id
  projectId String
  answers   Json
  sourceUrl String?
  userAgent String?
  metadata  Json?
  createdAt DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id])
}
```

```ts
// src/prisma/prisma.ts
import { PrismaClient } from "@/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Then your store operations become:

```ts
// src/lib/store.ts
import { prisma } from "@/prisma/prisma";

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { responses: true } } },
  });
}

export async function addResponse({
  projectId,
  answers,
  sourceUrl,
  userAgent,
  metadata,
}: {
  projectId: string;
  answers: Record<string, unknown>;
  sourceUrl?: string;
  userAgent?: string;
  metadata?: Record<string, string>;
}) {
  return prisma.response.create({
    data: {
      id: `response_${Date.now()}`,
      projectId,
      answers,
      sourceUrl,
      userAgent,
      metadata,
    },
  });
}
```

Why this matters: A JSON file is fine for a local prototype, but it cannot handle concurrent users, has no query capabilities, and does not survive serverless deployments. Prisma gives you type-safe database access, migrations, and production-ready persistence.

### 1.5 Add Authentication

Current problem: Every route is publicly accessible. Anyone who discovers the URL can create projects, read all responses, and delete data.

What to do: Add NextAuth.js for the admin dashboard. Keep the response submission route public because it is the embed endpoint, but protect project management routes.

```ts
// src/lib/request/withAuth.ts
import { auth } from "@/auth";

export function withAuth<T>(
  handler: (session: Session, ...args: unknown[]) => Promise<T>,
) {
  return async (...args: unknown[]) => {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    return handler(session, ...args);
  };
}
```

For the public embed route, keep it open but add rate limiting and validate that the project ID exists before accepting data.

### 1.6 Restrict CORS

Current problem: `Access-Control-Allow-Origin: *` means any website can call your API.

What to do: Only allow `*` on routes that the embed widget needs, such as the responses endpoint and schema endpoint. Admin routes should not have CORS headers at all. For production, restrict embed routes to registered domains stored in the project's configuration.

## Priority 2 - Engineering Quality

### 2.1 Add Structured Logging

Current problem: There is no logging. When something fails in production, you have no way to debug it.

What to do: Add `pino`. Log at API boundaries and around external calls such as LLM calls and database operations.

```ts
// src/lib/logger.ts
import pino from "pino";

export const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
```

```ts
// Usage in the schema generation function
import { logger } from "@/lib/logger";

export async function generateSchema({ brief }: { brief: string }) {
  logger.info({ msg: "Generating schema", briefLength: brief.length });

  try {
    const result = await generateObject({
      // ...
    });
    logger.info({
      msg: "Schema generated",
      fieldCount: result.object.schema.fields.length,
    });
    return result.object;
  } catch (error) {
    logger.error({ msg: "Schema generation failed", error });
    throw error;
  }
}
```

Rule: Logger accepts a single parameter, either a string or an object with a `msg` field. Never pass two parameters.

### 2.2 Split Large Components

Current problem: `project-detail-editor.tsx` is 742 lines. It is hard to understand, hard to modify, and hard for your agent to work with because it has to read the entire file to change one behavior.

What to do: Extract logical sections into their own files. A good rule: if you can describe a section's job in one sentence, it is a component.

```txt
src/components/project-detail/
  project-detail-editor.tsx
  gadget-settings-panel.tsx
  schema-builder.tsx
  field-editor.tsx
  advanced-json-editor.tsx
```

Each file should be under 200 lines. If it is longer, there is probably another split hiding inside.

### 2.3 Use Server Actions for Mutations

Current problem: Client components call `fetch("/api/projects", { method: "POST" })` directly. This means you maintain both the client-side fetch logic and the API route handler.

What to do: Use Next.js server actions for write operations. They eliminate the need for separate API routes for mutations.

```ts
// src/app/projects/actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/prisma/prisma";

const saveProjectInput = z.object({
  brief: z.string().min(1),
  name: z.string().optional(),
  schema: z.object({
    // ...
  }),
});

export async function saveProject(input: z.infer<typeof saveProjectInput>) {
  const parsed = saveProjectInput.parse(input);
  // create project in database
  return { success: true, data: project };
}
```

```ts
// In the client component
import { saveProject } from "./actions";

async function handleSave() {
  const result = await saveProject({ brief, name, schema });
  // handle result
}
```

Why this matters: Server actions run on the server, so they can access the database directly without going through an HTTP round-trip. They are also type-safe when you use TypeScript.

Keep API routes for public endpoints that external systems call, such as the response submission route and the `gadget.js` script. These cannot be server actions because they are not called from your React app.

### 2.4 Add Rate Limiting on Public Endpoints

The response submission endpoint (`/api/projects/[projectId]/responses`) is open to the internet. Without rate limiting, anyone can spam thousands of fake responses.

Add a simple in-memory rate limiter for the MVP, then replace it with Redis or Upstash for production.

```ts
// src/lib/rate-limit.ts
const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const entry = requests.get(key);

  if (!entry || now > entry.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}
```

### 2.5 Remove Hardcoded URLs

Current problem: `http://127.0.0.1:3000` appears in the embed code output and in multiple components. This breaks in any non-local environment.

What to do: Use an environment variable for the app's public URL.

```dotenv
# .env.local
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

```ts
// In code
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
```

For the `gadget.js` embed code shown to users, derive it from the current deployment URL. Do not hardcode it.

## Priority 3 - Good Habits

### 3.1 Function Parameters Use Object Form

When a function takes more than one parameter, use a destructured object. This makes call sites self-documenting and makes it safe to add optional parameters later.

```ts
// Bad: what does "true" mean at the call site?
function generateSchema(brief: string, fallback: boolean) {
  // ...
}

generateSchema("collect feedback", true);

// Good: clear at the call site
function generateSchema({
  brief,
  useFallback,
}: {
  brief: string;
  useFallback?: boolean;
}) {
  // ...
}

generateSchema({ brief: "collect feedback", useFallback: true });
```

### 3.2 Never Swallow Errors Silently

```ts
// Bad: failure is invisible
} catch {
  return { schema: generateSchemaFromBrief(brief), source: "local" };
}

// Good: failure is visible in logs, then you fall back
} catch (error) {
  logger.error({
    msg: "LLM schema generation failed, using local fallback",
    error,
  });
  return { schema: generateSchemaFromBrief(brief), source: "local" };
}
```

### 3.3 Use TypeScript Strict Mode

Make sure `tsconfig.json` has `"strict": true`. This catches null and undefined bugs at compile time instead of in production.

### 3.4 Add Tests for Core Logic

At minimum, test the schema validation and generation functions. These are pure functions, with input in and output out, so they are easy to test.

```ts
// src/lib/__tests__/schema-generator.test.ts
import { describe, expect, it } from "vitest";
import { generateSchemaFromBrief } from "../schema-generator";

describe("generateSchemaFromBrief", () => {
  it("generates AI-specific schema for AI-related briefs", () => {
    const result = generateSchemaFromBrief("help me choose an AI model");
    expect(result.title).toBe("AI Selection Feedback");
    expect(result.fields.length).toBeGreaterThan(0);
  });

  it("returns generic feedback form for unrecognized briefs", () => {
    const result = generateSchemaFromBrief("general product feedback");
    expect(result.title).toBe("Product Feedback");
    expect(result.fields.some((field) => field.id === "main_feedback")).toBe(
      true,
    );
  });
});
```

### 3.5 Add a CLAUDE.md File

When your agent works on this project, it reads `CLAUDE.md` for conventions. Create one that lists:

- How to run the project.
- Import paths, such as `@/prisma/prisma`, not `@prisma/client`.
- Type rules, such as no `any` and no dynamic imports.
- File organization conventions.
- Logger usage rules.

This ensures your agent writes code that matches the project's patterns every time, without you having to repeat instructions.

## Summary of File Structure After Changes

```txt
src/
  ai/
    provider.ts
    prompt/
      schema-generation.ts
    generate-schema.ts
  app/
    api/
      projects/
        [projectId]/
          responses/route.ts
        generate-schema/route.ts
    projects/
      actions.ts
      ...
    ...
  components/
    project-detail/
      project-detail-editor.tsx
      gadget-settings-panel.tsx
      schema-builder.tsx
      field-editor.tsx
      advanced-json-editor.tsx
    dynamic-form.tsx
    project-builder.tsx
  lib/
    logger.ts
    rate-limit.ts
    store.ts
    types.ts
  prisma/
    prisma.ts
    schema.prisma
  auth.ts
```

Notes:

- `responses/route.ts` stays public and should remain an API route.
- `generate-schema/route.ts` stays public and should remain an API route.
- `store.ts` should eventually be replaced with Prisma calls.

## Working With Your Agent

When you ask your agent to implement these changes, work through them in order. Each priority level builds on the previous one. Within a priority level, the items are mostly independent, so you can tackle them in any order.

For each item, tell your agent:

- What you want to change.
- Where to look for reference patterns.
- To search the reference codebase for similar code before writing new patterns.

A good prompt looks like:

> Implement the AI SDK integration as described in section 1.1 of the development checklist. Search the reference codebase for how `generateObject` and provider configuration are used, and follow those patterns.
