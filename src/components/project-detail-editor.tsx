"use client";

import { ProjectSummaryPanel } from "@/components/project-detail/project-summary-panel";
import { SchemaBuilder } from "@/components/project-detail/schema-builder";
import { useProjectEditor } from "@/components/project-detail/use-project-editor";
import type { DataProject, ProjectResponse } from "@/lib/types";

type ProjectDetailEditorProps = {
  initialProject: DataProject;
  responses: ProjectResponse[];
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
  initialProject,
  responses,
}: ProjectDetailEditorProps) {
  const editor = useProjectEditor(initialProject);

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 xl:grid-cols-[0.95fr_1.05fr] xl:px-8">
      <ProjectSummaryPanel
        embedCode={editor.embedCode}
        project={editor.project}
        responseCount={responses.length}
        onProjectChange={editor.updateProject}
        onUpdateGadget={editor.updateGadget}
      />

      <SchemaBuilder
        schema={editor.project.schema}
        schemaText={editor.schemaText}
        slugify={slugify}
        status={editor.status}
        onAddField={editor.addField}
        onAddPage={editor.addPage}
        onApplySchemaText={editor.applySchemaText}
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
