import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { sampleProject } from "@/lib/mock-data";
import { getDatabaseUrl } from "@/prisma/database-url";
import { getPrisma } from "@/prisma/prisma";
import type {
  AppUser,
  AppStore,
  AuditEvent,
  DataProject,
  GadgetSettings,
  ProjectResponse,
} from "./types";
import { hashPassword, verifyPassword } from "./password";

const storePath = path.join(process.cwd(), "data", "app-store.json");
const shouldUseDatabase = Boolean(getDatabaseUrl());

const initialStore: AppStore = {
  users: [],
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
    users: parsed.users ?? [],
    projects: (parsed.projects ?? initialStore.projects).map(withProjectDefaults),
    responses: parsed.responses ?? [],
    auditEvents: parsed.auditEvents ?? [],
  };
}

function belongsToOwner(project: DataProject, ownerEmail?: string) {
  return !ownerEmail || project.ownerEmail === ownerEmail;
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function makePublicKey() {
  return `wk_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
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

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AppUser> {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || undefined;
  const passwordHash = await hashPassword(input.password);
  const publicKey = makePublicKey();

  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const user = await prisma.user.create({
      data: {
        id: makeId("user"),
        email,
        name,
        passwordHash,
        publicKey,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      passwordHash: user.passwordHash,
      publicKey: user.publicKey,
      activeProjectId: user.activeProjectId ?? undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  const store = await readStore();
  if (store.users.some((user) => user.email.toLowerCase() === email)) {
    throw new Error("User already exists.");
  }

  const now = new Date().toISOString();
  const user: AppUser = {
    id: makeId("user"),
    email,
    name,
    passwordHash,
    publicKey,
    createdAt: now,
    updatedAt: now,
  };

  store.users.unshift(user);
  await writeStore(store);
  return user;
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<Pick<AppUser, "id" | "email" | "name" | "publicKey"> | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      publicKey: user.publicKey,
    };
  }

  const store = await readStore();
  const user = store.users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    publicKey: user.publicKey,
  };
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      passwordHash: user.passwordHash,
      publicKey: user.publicKey,
      activeProjectId: user.activeProjectId ?? undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  const store = await readStore();
  return store.users.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
}

export async function getUserByPublicKey(publicKey: string): Promise<AppUser | null> {
  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { publicKey },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      passwordHash: user.passwordHash,
      publicKey: user.publicKey,
      activeProjectId: user.activeProjectId ?? undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  const store = await readStore();
  return store.users.find((user) => user.publicKey === publicKey) ?? null;
}

export async function setActiveProjectForUser(
  ownerEmail: string,
  projectId: string,
): Promise<AppUser | null> {
  const project = await getProject(projectId, ownerEmail);
  if (!project) return null;

  if (shouldUseDatabase) {
    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { email: ownerEmail.trim().toLowerCase() },
      data: { activeProjectId: projectId },
    });

    await addAuditEvent({
      action: "workspace.active_project_set",
      actor: "user",
      projectId,
      metadata: { ownerEmail: user.email },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      passwordHash: user.passwordHash,
      publicKey: user.publicKey,
      activeProjectId: user.activeProjectId ?? undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  const store = await readStore();
  const user = store.users.find(
    (item) => item.email.toLowerCase() === ownerEmail.trim().toLowerCase(),
  );
  if (!user) return null;

  user.activeProjectId = projectId;
  user.updatedAt = new Date().toISOString();
  await writeStore(store);
  await addAuditEvent({
    action: "workspace.active_project_set",
    actor: "user",
    projectId,
    metadata: { ownerEmail: user.email },
  });
  return user;
}

export async function getActiveProjectForPublicKey(
  publicKey: string,
): Promise<DataProject | null> {
  const user = await getUserByPublicKey(publicKey);
  if (!user) return null;

  if (user.activeProjectId) {
    const activeProject = await getProject(user.activeProjectId, user.email);
    if (activeProject) return activeProject;
  }

  const projects = await listProjects(user.email);
  return projects[0] ?? null;
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
        id: makeId("audit"),
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
    id: makeId("audit"),
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

