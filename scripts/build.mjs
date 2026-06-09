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

if (process.env.DATABASE_URL) {
  run(bin("prisma"), ["generate"]);
  run(bin("prisma"), ["migrate", "deploy"]);
}

run(bin("next"), ["build"]);
