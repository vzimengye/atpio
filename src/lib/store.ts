import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { sampleProject } from "@/lib/mock-data";
import type {
  AppStore,
  AuditEvent,
  DataProject,
  GadgetSettings,
  ProjectResponse,
} from "./types";

const storePath = path.join(process.cwd(), "data", "app-store.json");

const initialStore: AppStore = {
  projects: [sampleProject],
  responses: [],
  auditEvents: [],
};

const defaultGadget: GadgetSettings = {
  position: "bottom-right",
  theme: "light",
  buttonLabel: "Feedback",
  successMessage: "Thanks. Your feedback was saved.",
};

function withProjectDefaults(project: DataProject): DataProject {
  return {
    ...project,
    gadget: {
      ...defaultGadget,
      ...(project.gadget ?? {}),
    },
  };
}

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
  const parsed = JSON.parse(raw) as Partial<AppStore>;

  return {
    projects: (parsed.projects ?? initialStore.projects).map(withProjectDefaults),
    responses: parsed.responses ?? [],
    auditEvents: parsed.auditEvents ?? [],
  };
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
  const projectWithDefaults = withProjectDefaults(project);
  const existingIndex = store.projects.findIndex((item) => item.id === project.id);

  if (existingIndex >= 0) {
    store.projects[existingIndex] = projectWithDefaults;
  } else {
    store.projects.unshift(projectWithDefaults);
  }

  await writeStore(store);
  await addAuditEvent({
    action: "project.saved",
    actor: "admin",
    projectId: project.id,
    metadata: { status: project.status },
  });
  return projectWithDefaults;
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
  await addAuditEvent({
    action: "response.created",
    actor: "public",
    projectId: response.projectId,
  });
  return response;
}

export async function listResponses(projectId: string): Promise<ProjectResponse[]> {
  const store = await readStore();
  return store.responses.filter((response) => response.projectId === projectId);
}

export async function addAuditEvent(
  event: Omit<AuditEvent, "id" | "createdAt">,
): Promise<AuditEvent> {
  const store = await readStore();
  const auditEvent: AuditEvent = {
    ...event,
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  store.auditEvents.unshift(auditEvent);
  await writeStore(store);
  return auditEvent;
}

export async function listAuditEvents(projectId?: string): Promise<AuditEvent[]> {
  const store = await readStore();
  return projectId
    ? store.auditEvents.filter((event) => event.projectId === projectId)
    : store.auditEvents;
}

