"use client";

import { ProjectSummaryPanel } from "@/components/project-detail/project-summary-panel";
import { SchemaBuilder } from "@/components/project-detail/schema-builder";
import { useProjectEditor } from "@/components/project-detail/use-project-editor";
import type { UiLanguage } from "@/lib/i18n";
import type { DataProject, ProjectResponse } from "@/lib/types";

type ProjectDetailEditorProps = {
  activeProjectId?: string;
  initialProject: DataProject;
  responses: ProjectResponse[];
  uiLanguage?: UiLanguage;
  workspaceKey?: string;
};

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "") || "field"
  );
}

export function ProjectDetailEditor({
  activeProjectId,
  initialProject,
  responses,
  uiLanguage = "en",
  workspaceKey,
}: ProjectDetailEditorProps) {
  const editor = useProjectEditor(initialProject, workspaceKey);

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 xl:grid-cols-[0.95fr_1.05fr] xl:px-8">
      <ProjectSummaryPanel
        embedCode={editor.embedCode}
        isActiveProject={(activeProjectId ?? initialProject.id) === initialProject.id}
        project={editor.project}
        responseCount={responses.length}
        uiLanguage={uiLanguage}
        workspaceEmbedCode={editor.workspaceEmbedCode}
        onProjectChange={editor.updateProject}
        onUpdateGadget={editor.updateGadget}
      />

      <SchemaBuilder
        schema={editor.project.schema}
        schemaText={editor.schemaText}
        slugify={slugify}
        status={editor.status}
        uiLanguage={uiLanguage}
        onAddField={editor.addField}
        onAddPage={editor.addPage}
        onApplySchemaText={editor.applySchemaText}
        onDuplicateField={editor.duplicateField}
        onMoveField={editor.moveField}
        onRemoveField={editor.removeField}
        onRemovePage={editor.removePage}
        onSave={editor.saveChanges}
        onSchemaTextChange={editor.updateSchemaText}
        onUpdateField={editor.updateField}
        onUpdatePage={editor.updatePage}
        onUpdateSchema={editor.updateSchema}
        onUpdateValidation={editor.updateValidation}
      />
    </div>
  );
}
