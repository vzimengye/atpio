import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "skills",
    "mock-product-integration",
    "SKILL.md",
  );
  const content = await fs.readFile(filePath, "utf-8");

  return new Response(content, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Disposition":
        'attachment; filename="atpio-mock-product-integration-skill.md"',
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
