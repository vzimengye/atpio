"use client";

import type { GadgetSettings } from "@/lib/types";

type GadgetSettingsPanelProps = {
  gadget: GadgetSettings;
  onUpdate: <K extends keyof GadgetSettings>(
    key: K,
    value: GadgetSettings[K],
  ) => void;
};

export function GadgetSettingsPanel({
  gadget,
  onUpdate,
}: GadgetSettingsPanelProps) {
  return (
    <div className="mt-6 rounded-xl bg-stone-50 p-4">
      <h2 className="text-sm font-semibold text-slate-950">Gadget settings</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium text-slate-800">Position</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={gadget.position}
            onChange={(event) =>
              onUpdate(
                "position",
                event.target.value as GadgetSettings["position"],
              )
            }
          >
            <option value="bottom-right">Bottom right</option>
            <option value="bottom-left">Bottom left</option>
            <option value="top-right">Top right</option>
            <option value="top-left">Top left</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-800">Theme</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={gadget.theme}
            onChange={(event) =>
              onUpdate("theme", event.target.value as GadgetSettings["theme"])
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <TextInput
          label="Button label"
          value={gadget.buttonLabel}
          onChange={(value) => onUpdate("buttonLabel", value)}
        />
        <TextInput
          label="Success message"
          value={gadget.successMessage}
          onChange={(value) => onUpdate("successMessage", value)}
        />
        <ColorInput
          label="Brand color"
          value={gadget.brandColor}
          onChange={(value) => onUpdate("brandColor", value)}
        />
        <ColorInput
          label="Accent color"
          value={gadget.accentColor}
          onChange={(value) => onUpdate("accentColor", value)}
        />
        <label className="text-sm">
          <span className="font-medium text-slate-800">Button shape</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={gadget.buttonShape}
            onChange={(event) =>
              onUpdate(
                "buttonShape",
                event.target.value as GadgetSettings["buttonShape"],
              )
            }
          >
            <option value="pill">Pill</option>
            <option value="rounded">Rounded</option>
            <option value="square">Square</option>
          </select>
        </label>
        <TextInput
          label="Font family"
          value={gadget.fontFamily}
          onChange={(value) => onUpdate("fontFamily", value)}
        />
      </div>
    </div>
  );
}

function TextInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <input
        className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ColorInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <input
        className="mt-2 h-10 w-full rounded-md border border-stone-300 px-2"
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
