import { execSync } from "node:child_process";
import path from "node:path";

const commandExtension = process.platform === "win32" ? ".cmd" : "";

function bin(command) {
  return path.join("node_modules", ".bin", `${command}${commandExtension}`);
}

function run(command, args) {
  const quotedCommand = `"${command}"`;
  execSync([quotedCommand, ...args].join(" "), {
    shell: true,
    stdio: "inherit",
  });
}

function databaseUrl() {
  return [
    process.env.DATABASE_URL,
    process.env.DATABASE_POSTGRES_PRISMA_URL,
    process.env.DATABASE_POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ].find((value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed !== "\"\"" && trimmed !== "''";
  });
}

if (databaseUrl()) {
  run(bin("prisma"), ["generate"]);
  run(bin("prisma"), ["migrate", "deploy"]);
}

run(bin("next"), ["build"]);
