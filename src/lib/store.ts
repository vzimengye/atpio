import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { sampleProject } from "@/lib/mock-data";
import { getPrisma } from "@/prisma/prisma";
import type {
  AppStore,
  AuditEvent,
  DataProject,
  GadgetSettings,
  ProjectResponse,
} from "./types";

const storePath = path.join(process.cwd(), "data", "app-store.json");
const shouldUseDatabase = Boolean(process.env.DATABASE_URL);

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
  brandColor: "#020617",
  accentColor: "#10b981",
  buttonShape: "pill",
  fontFamily: "Inter, Arial, sans-serif",
  allowedDomains: [],
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

function belongsToOwner(project: DataProject, ownerEmail?: string) {
  return !ownerEmail || !project.ownerEmail || project.ownerEmail === ownerEmail;
}

export async function writeStore(store: AppStore) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf-8");
}

export async function listProjects(ownerEmail?: string): Promise<DataProject[]> {
  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const projects = await prisma.project.findMany({
      where: ownerEmail ? { ownerEmail } : undefined,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { responses: true } } },
    });

    return projects.map((project) =>
      withProjectDefaults({
        id: project.id,
        name: project.name,
        brief: project.brief,
        schema: project.schema as DataProject["schema"],
        gadget: project.gadget as DataProject["gadget"],
        responseCount: project._count.responses,
        status: project.status as DataProject["status"],
        updatedAt: project.updatedAt.toISOString().slice(0, 10),
        ownerEmail: project.ownerEmail ?? undefined,
      }),
    );
  }

  const store = await readStore();
  return store.projects
    .filter((project) => belongsToOwner(project, ownerEmail))
    .map((project) => ({
      ...project,
      responseCount: store.responses.filter(
        (response) => response.projectId === project.id,
      ).length,
    }));
}

export async function getProject(
  projectId: string,
  ownerEmail?: string,
): Promise<DataProject | null> {
  const projects = await listProjects(ownerEmail);
  return projects.find((project) => project.id === projectId) ?? null;
}

export async function saveProject(project: DataProject): Promise<DataProject> {
  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const projectWithDefaults = withProjectDefaults(project);
    const saved = await prisma.project.upsert({
      where: { id: project.id },
      create: {
        id: projectWithDefaults.id,
        name: projectWithDefaults.name,
        brief: projectWithDefaults.brief,
        schema: projectWithDefaults.schema,
        gadget: projectWithDefaults.gadget,
        ownerEmail: projectWithDefaults.ownerEmail,
        status: projectWithDefaults.status,
        responseCount: projectWithDefaults.responseCount,
      },
      update: {
        name: projectWithDefaults.name,
        brief: projectWithDefaults.brief,
        schema: projectWithDefaults.schema,
        gadget: projectWithDefaults.gadget,
        ownerEmail: projectWithDefaults.ownerEmail,
        status: projectWithDefaults.status,
      },
      include: { _count: { select: { responses: true } } },
    });

    await addAuditEvent({
      action: "project.saved",
      actor: "admin",
      projectId: project.id,
      metadata: { status: project.status },
    });

    return withProjectDefaults({
      id: saved.id,
      name: saved.name,
      brief: saved.brief,
      schema: saved.schema as DataProject["schema"],
      gadget: saved.gadget as DataProject["gadget"],
      responseCount: saved._count.responses,
      status: saved.status as DataProject["status"],
      updatedAt: saved.updatedAt.toISOString().slice(0, 10),
      ownerEmail: saved.ownerEmail ?? undefined,
    });
  }

  const store = await readStore();
  const projectWithDefaults = withProjectDefaults(project);
  const existingIndex = store.projects.findIndex((item) => item.id === project.id);

  if (existingIndex >= 0) {
    store.projects.splice(existingIndex, 1);
    store.projects.unshift(projectWithDefaults);
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
  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const saved = await prisma.response.create({
      data: {
        id: response.id,
        projectId: response.projectId,
        answers: response.answers,
        sourceUrl: response.sourceUrl,
        userAgent: response.userAgent,
        metadata: response.metadata,
      },
    });

    await prisma.project.update({
      where: { id: response.projectId },
      data: {
        status: "collecting",
        responseCount: { increment: 1 },
      },
    });

    await addAuditEvent({
      action: "response.created",
      actor: "public",
      projectId: response.projectId,
    });

    return {
      id: saved.id,
      projectId: saved.projectId,
      answers: saved.answers as ProjectResponse["answers"],
      sourceUrl: saved.sourceUrl ?? undefined,
      userAgent: saved.userAgent ?? undefined,
      metadata: saved.metadata as ProjectResponse["metadata"],
      createdAt: saved.createdAt.toISOString(),
    };
  }

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
  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const responses = await prisma.response.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return responses.map((response) => ({
      id: response.id,
      projectId: response.projectId,
      answers: response.answers as ProjectResponse["answers"],
      sourceUrl: response.sourceUrl ?? undefined,
      userAgent: response.userAgent ?? undefined,
      metadata: response.metadata as ProjectResponse["metadata"],
      createdAt: response.createdAt.toISOString(),
    }));
  }

  const store = await readStore();
  return store.responses.filter((response) => response.projectId === projectId);
}

export async function addAuditEvent(
  event: Omit<AuditEvent, "id" | "createdAt">,
): Promise<AuditEvent> {
  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const auditEvent = await prisma.auditEvent.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        action: event.action,
        actor: event.actor,
        projectId: event.projectId,
        metadata: event.metadata,
      },
    });

    return {
      id: auditEvent.id,
      action: auditEvent.action,
      actor: auditEvent.actor as AuditEvent["actor"],
      projectId: auditEvent.projectId ?? undefined,
      metadata: auditEvent.metadata as AuditEvent["metadata"],
      createdAt: auditEvent.createdAt.toISOString(),
    };
  }

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
  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const auditEvents = await prisma.auditEvent.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return auditEvents.map((event) => ({
      id: event.id,
      action: event.action,
      actor: event.actor as AuditEvent["actor"],
      projectId: event.projectId ?? undefined,
      metadata: event.metadata as AuditEvent["metadata"],
      createdAt: event.createdAt.toISOString(),
    }));
  }

  const store = await readStore();
  return projectId
    ? store.auditEvents.filter((event) => event.projectId === projectId)
    : store.auditEvents;
}

export async function exportProjectData(projectId: string, ownerEmail?: string) {
  const project = await getProject(projectId, ownerEmail);

  if (!project) return null;

  return {
    exportedAt: new Date().toISOString(),
    project,
    responses: await listResponses(projectId),
    auditEvents: await listAuditEvents(projectId),
  };
}

