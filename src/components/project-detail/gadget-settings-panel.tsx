"use client";

import type { UiLanguage } from "@/lib/i18n";
import type { GadgetSettings } from "@/lib/types";

type GadgetSettingsPanelProps = {
  gadget: GadgetSettings;
  uiLanguage: UiLanguage;
  onUpdate: <K extends keyof GadgetSettings>(
    key: K,
    value: GadgetSettings[K],
  ) => void;
};

export function GadgetSettingsPanel({
  gadget,
  uiLanguage,
  onUpdate,
}: GadgetSettingsPanelProps) {
  const t = copy[uiLanguage];

  return (
    <div className="mt-6 rounded-xl bg-stone-50 p-4">
      <h2 className="text-sm font-semibold text-slate-950">{t.title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.position}</span>
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
            <option value="bottom-right">{t.bottomRight}</option>
            <option value="bottom-left">{t.bottomLeft}</option>
            <option value="top-right">{t.topRight}</option>
            <option value="top-left">{t.topLeft}</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.theme}</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={gadget.theme}
            onChange={(event) =>
              onUpdate("theme", event.target.value as GadgetSettings["theme"])
            }
          >
            <option value="light">{t.light}</option>
            <option value="dark">{t.dark}</option>
          </select>
        </label>
        <TextInput
          label={t.buttonLabel}
          value={gadget.buttonLabel}
          onChange={(value) => onUpdate("buttonLabel", value)}
        />
        <TextInput
          label={t.successMessage}
          value={gadget.successMessage}
          onChange={(value) => onUpdate("successMessage", value)}
        />
        <ColorInput
          label={t.brandColor}
          value={gadget.brandColor}
          onChange={(value) => onUpdate("brandColor", value)}
        />
        <ColorInput
          label={t.accentColor}
          value={gadget.accentColor}
          onChange={(value) => onUpdate("accentColor", value)}
        />
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.buttonShape}</span>
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
            <option value="pill">{t.pill}</option>
            <option value="rounded">{t.rounded}</option>
            <option value="square">{t.square}</option>
          </select>
        </label>
        <TextInput
          label={t.fontFamily}
          value={gadget.fontFamily}
          onChange={(value) => onUpdate("fontFamily", value)}
        />
        <label className="text-sm sm:col-span-2">
          <span className="font-medium text-slate-800">{t.allowedDomains}</span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2"
            placeholder={t.allowedDomainsPlaceholder}
            value={(gadget.allowedDomains ?? []).join("\n")}
            onChange={(event) =>
              onUpdate(
                "allowedDomains",
                event.target.value
                  .split("\n")
                  .map((domain) => domain.trim())
                  .filter(Boolean),
              )
            }
          />
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {t.allowedDomainsHint}
          </p>
        </label>
      </div>
    </div>
  );
}

const copy = {
  en: {
    accentColor: "Accent color",
    allowedDomains: "Allowed domains",
    allowedDomainsHint:
      "Example: app.example.com. Subdomains are allowed when the parent domain is listed.",
    allowedDomainsPlaceholder:
      "One domain per line. Leave blank to allow any domain during local testing.",
    bottomLeft: "Bottom left",
    bottomRight: "Bottom right",
    brandColor: "Brand color",
    buttonLabel: "Button label",
    buttonShape: "Button shape",
    dark: "Dark",
    fontFamily: "Font family",
    light: "Light",
    pill: "Pill",
    position: "Position",
    rounded: "Rounded",
    square: "Square",
    successMessage: "Success message",
    theme: "Theme",
    title: "Gadget settings",
    topLeft: "Top left",
    topRight: "Top right",
  },
  zh: {
    accentColor: "强调色",
    allowedDomains: "允许的域名",
    allowedDomainsHint:
      "例如：app.example.com。填写父域名后，子域名也会被允许。",
    allowedDomainsPlaceholder:
      "每行一个域名。留空表示本地测试时允许任何域名。",
    bottomLeft: "左下角",
    bottomRight: "右下角",
    brandColor: "品牌色",
    buttonLabel: "按钮文案",
    buttonShape: "按钮形状",
    dark: "深色",
    fontFamily: "字体",
    light: "浅色",
    pill: "胶囊",
    position: "位置",
    rounded: "圆角",
    square: "直角",
    successMessage: "提交成功文案",
    theme: "主题",
    title: "Gadget 设置",
    topLeft: "左上角",
    topRight: "右上角",
  },
} satisfies Record<UiLanguage, Record<string, string>>;

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
