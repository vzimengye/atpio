import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(root, "index.html"), "utf8");

export default function handler(_request, response) {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.statusCode = 200;
  response.end(html);
}
