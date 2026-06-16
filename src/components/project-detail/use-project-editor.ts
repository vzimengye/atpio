"use client";

import { useMemo, useState } from "react";
import { updateProjectAction } from "@/app/projects/actions";
import {
  buildEmbedCode,
  buildWorkspaceEmbedCode,
} from "@/components/project-detail/embed-code";
import { cleanValidation } from "@/components/project-detail/validation-utils";
import type {
  DataProject,
  FormField,
  FormPage,
  GadgetSettings,
  ProjectSchema,
} from "@/lib/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

function makeUniqueFieldId(baseId: string, fields: FormField[]) {
  const existingIds = new Set(fields.map((field) => field.id));
  let nextId = `${baseId}_copy`;
  let index = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}_copy_${index}`;
    index += 1;
  }

  return nextId;
}

export function useProjectEditor(initialProject: DataProject, workspaceKey?: string) {
  const [project, setProject] = useState(initialProject);
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(initialProject.schema, null, 2),
  );
  const [status, setStatus] = useState<SaveStatus>("idle");
  const embedCode = useMemo(() => buildEmbedCode(project), [project]);
  const workspaceEmbedCode = useMemo(
    () => buildWorkspaceEmbedCode(project, workspaceKey),
    [project, workspaceKey],
  );

  function updateProject(nextProject: DataProject) {
    setProject(nextProject);
    setStatus("idle");
  }

  function updateSchema(updater: (schema: ProjectSchema) => ProjectSchema) {
    setStatus("idle");
    setProject((current) => {
      const nextSchema = updater(current.schema);
      setSchemaText(JSON.stringify(nextSchema, null, 2));
      return { ...current, schema: nextSchema };
    });
  }

  function updatePage(pageId: string, patch: Partial<FormPage>) {
    updateSchema((schema) => ({
      ...schema,
      pages: (schema.pages ?? []).map((page) =>
        page.id === pageId ? { ...page, ...patch } : page,
      ),
      fields:
        patch.id && patch.id !== pageId
          ? schema.fields.map((field) =>
              field.pageId === pageId ? { ...field, pageId: patch.id } : field,
            )
          : schema.fields,
    }));
  }

  function addPage() {
    updateSchema((schema) => {
      const nextIndex = (schema.pages?.length ?? 0) + 1;
      return {
        ...schema,
        pages: [
          ...(schema.pages ?? []),
          { id: `page_${nextIndex}`, title: `Page ${nextIndex}` },
        ],
      };
    });
  }

  function removePage(pageId: string) {
    updateSchema((schema) => ({
      ...schema,
      pages: schema.pages?.filter((page) => page.id !== pageId),
      fields: schema.fields.map((field) =>
        field.pageId === pageId ? { ...field, pageId: undefined } : field,
      ),
    }));
  }

  function updateField(fieldId: string, patch: Partial<FormField>) {
    updateSchema((schema) => ({
      ...schema,
      fields: schema.fields.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field,
      ),
    }));
  }

  function updateValidation(
    fieldId: string,
    key: keyof NonNullable<FormField["validation"]>,
    value: number | undefined,
  ) {
    updateSchema((schema) => ({
      ...schema,
      fields: schema.fields.map((field) =>
        field.id === fieldId
          ? { ...field, validation: cleanValidation(field.validation, key, value) }
          : field,
      ),
    }));
  }

  function addField() {
    updateSchema((schema) => {
      const nextIndex = schema.fields.length + 1;
      return {
        ...schema,
        fields: [
          ...schema.fields,
          {
            id: `field_${nextIndex}`,
            type: "short_text",
            label: `Question ${nextIndex}`,
            required: false,
            pageId: schema.pages?.[0]?.id,
          },
        ],
      };
    });
  }

  function removeField(fieldId: string) {
    updateSchema((schema) => ({
      ...schema,
      fields: schema.fields.filter((field) => field.id !== fieldId),
    }));
  }

  function duplicateField(fieldId: string) {
    updateSchema((schema) => {
      const sourceIndex = schema.fields.findIndex((field) => field.id === fieldId);
      if (sourceIndex === -1) return schema;

      const source = schema.fields[sourceIndex];
      const nextField: FormField = {
        ...source,
        id: makeUniqueFieldId(source.id, schema.fields),
        label: source.label,
      };
      const fields = [...schema.fields];
      fields.splice(sourceIndex + 1, 0, nextField);

      return { ...schema, fields };
    });
  }

  function moveField(fieldId: string, direction: "up" | "down") {
    updateSchema((schema) => {
      const currentIndex = schema.fields.findIndex((field) => field.id === fieldId);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (
        currentIndex === -1 ||
        targetIndex < 0 ||
        targetIndex >= schema.fields.length
      ) {
        return schema;
      }

      const fields = [...schema.fields];
      const [field] = fields.splice(currentIndex, 1);
      fields.splice(targetIndex, 0, field);

      return { ...schema, fields };
    });
  }

  function applySchemaText() {
    try {
      const parsedSchema = JSON.parse(schemaText) as ProjectSchema;
      setProject((current) => ({ ...current, schema: parsedSchema }));
      setSchemaText(JSON.stringify(parsedSchema, null, 2));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function updateGadget<K extends keyof GadgetSettings>(
    key: K,
    value: GadgetSettings[K],
  ) {
    setProject((current) => ({
      ...current,
      gadget: { ...current.gadget, [key]: value },
    }));
    setStatus("idle");
  }

  function updateSchemaText(value: string) {
    setSchemaText(value);
    setStatus("idle");
  }

  async function saveChanges() {
    setStatus("saving");
    try {
      const result = await updateProjectAction(project.id, {
        name: project.name,
        brief: project.brief,
        schema: JSON.parse(schemaText),
        gadget: project.gadget,
      });

      if (!result.project) throw new Error(result.error);

      setProject(result.project);
      setSchemaText(JSON.stringify(result.project.schema, null, 2));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return {
    addField,
    addPage,
    applySchemaText,
    duplicateField,
    embedCode,
    moveField,
    workspaceEmbedCode,
    project,
    removeField,
    removePage,
    saveChanges,
    schemaText,
    status,
    updateField,
    updateGadget,
    updatePage,
    updateProject,
    updateSchema,
    updateSchemaText,
    updateValidation,
  };
}
