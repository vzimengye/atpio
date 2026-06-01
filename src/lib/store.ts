import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { sampleInsightRun, sampleProject } from "@/lib/mock-data";
import type { AppStore, DataProject, InsightRun, ProjectResponse } from "./types";

const storePath = path.join(process.cwd(), "data", "app-store.json");

const initialStore: AppStore = {
  projects: [sampleProject],
  responses: [],
  insights: [sampleInsightRun],
};

async function ensureStore() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await writeStore(initialStore);
  }
}

export async function readStore(): Promise<AppStore> {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf-8");
  return JSON.parse(raw) as AppStore;
}

export async function writeStore(store: AppStore) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf-8");
}

export async function listProjects(): Promise<DataProject[]> {
  const store = await readStore();
  return store.projects.map((project) => ({
    ...project,
    responseCount: store.responses.filter(
      (response) => response.projectId === project.id,
    ).length,
  }));
}

export async function getProject(projectId: string): Promise<DataProject | null> {
  const projects = await listProjects();
  return projects.find((project) => project.id === projectId) ?? null;
}

export async function saveProject(project: DataProject): Promise<DataProject> {
  const store = await readStore();
  const existingIndex = store.projects.findIndex((item) => item.id === project.id);

  if (existingIndex >= 0) {
    store.projects[existingIndex] = project;
  } else {
    store.projects.unshift(project);
  }

  await writeStore(store);
  return project;
}

export async function addResponse(
  response: ProjectResponse,
): Promise<ProjectResponse> {
  const store = await readStore();
  store.responses.unshift(response);

  const project = store.projects.find((item) => item.id === response.projectId);
  if (project) {
    project.status = "collecting";
    project.updatedAt = response.createdAt.slice(0, 10);
  }

  await writeStore(store);
  return response;
}

export async function listResponses(projectId: string): Promise<ProjectResponse[]> {
  const store = await readStore();
  return store.responses.filter((response) => response.projectId === projectId);
}

export async function saveInsight(insight: InsightRun): Promise<InsightRun> {
  const store = await readStore();
  store.insights = [
    insight,
    ...store.insights.filter((item) => item.projectId !== insight.projectId),
  ];

  const project = store.projects.find((item) => item.id === insight.projectId);
  if (project) {
    project.status = "ready";
    project.updatedAt = new Date().toISOString().slice(0, 10);
  }

  await writeStore(store);
  return insight;
}

export async function getLatestInsight(
  projectId: string,
): Promise<InsightRun | null> {
  const store = await readStore();
  return store.insights.find((insight) => insight.projectId === projectId) ?? null;
}

