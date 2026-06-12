export type FieldType =
  | "short_text"
  | "long_text"
  | "single_select"
  | "multi_select"
  | "rating"
  | "boolean";

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[];
  pageId?: string;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
};

export type FormPage = {
  id: string;
  title: string;
  description?: string;
};

export type ProjectSchema = {
  title: string;
  description: string;
  pages?: FormPage[];
  fields: FormField[];
};

export type GadgetSettings = {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme: "light" | "dark";
  buttonLabel: string;
  successMessage: string;
  brandColor: string;
  accentColor: string;
  buttonShape: "pill" | "rounded" | "square";
  fontFamily: string;
  allowedDomains?: string[];
};

export type DataProject = {
  id: string;
  name: string;
  brief: string;
  schema: ProjectSchema;
  gadget: GadgetSettings;
  responseCount: number;
  status: "draft" | "collecting" | "ready";
  updatedAt: string;
  ownerEmail?: string;
};

export type ProjectResponse = {
  id: string;
  projectId: string;
  answers: Record<string, string | string[] | boolean>;
  sourceUrl?: string;
  userAgent?: string;
  metadata?: Record<string, string>;
  createdAt: string;
};

export type AppStore = {
  users: AppUser[];
  projects: DataProject[];
  responses: ProjectResponse[];
  auditEvents: AuditEvent[];
};

export type AppUser = {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  publicKey: string;
  activeProjectId?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuditEvent = {
  id: string;
  action: string;
  projectId?: string;
  actor: "admin" | "public" | "system" | "user";
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
};
