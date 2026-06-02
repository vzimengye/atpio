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
};

export type ProjectSchema = {
  title: string;
  description: string;
  fields: FormField[];
};

export type DataProject = {
  id: string;
  name: string;
  brief: string;
  schema: ProjectSchema;
  responseCount: number;
  status: "draft" | "collecting" | "ready";
  updatedAt: string;
};

export type ProjectResponse = {
  id: string;
  projectId: string;
  answers: Record<string, string | string[] | boolean>;
  sourceUrl?: string;
  userAgent?: string;
  createdAt: string;
};

export type AppStore = {
  projects: DataProject[];
  responses: ProjectResponse[];
  auditEvents: AuditEvent[];
};

export type AuditEvent = {
  id: string;
  action: string;
  projectId?: string;
  actor: "admin" | "public" | "system";
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
};
