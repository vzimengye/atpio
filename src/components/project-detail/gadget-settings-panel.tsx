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
        <ColorInput
          label={t.backgroundColor}
          value={gadget.backgroundColor ?? "#ffffff"}
          onChange={(value) => onUpdate("backgroundColor", value)}
        />
        <ColorInput
          label={t.textColor}
          value={gadget.textColor ?? "#020617"}
          onChange={(value) => onUpdate("textColor", value)}
        />
        <ColorInput
          label={t.borderColor}
          value={gadget.borderColor ?? "#dbe3ef"}
          onChange={(value) => onUpdate("borderColor", value)}
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
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.buttonStyle}</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={gadget.buttonStyle ?? "filled"}
            onChange={(event) =>
              onUpdate(
                "buttonStyle",
                event.target.value as GadgetSettings["buttonStyle"],
              )
            }
          >
            <option value="filled">{t.filled}</option>
            <option value="outline">{t.outline}</option>
            <option value="soft">{t.soft}</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.inputStyle}</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={gadget.inputStyle ?? "outlined"}
            onChange={(event) =>
              onUpdate(
                "inputStyle",
                event.target.value as GadgetSettings["inputStyle"],
              )
            }
          >
            <option value="outlined">{t.outlined}</option>
            <option value="filled">{t.filled}</option>
            <option value="underline">{t.underline}</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.density}</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={gadget.density ?? "comfortable"}
            onChange={(event) =>
              onUpdate("density", event.target.value as GadgetSettings["density"])
            }
          >
            <option value="compact">{t.compact}</option>
            <option value="comfortable">{t.comfortable}</option>
            <option value="spacious">{t.spacious}</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.shadow}</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={gadget.shadow ?? "soft"}
            onChange={(event) =>
              onUpdate("shadow", event.target.value as GadgetSettings["shadow"])
            }
          >
            <option value="none">{t.none}</option>
            <option value="soft">{t.soft}</option>
            <option value="strong">{t.strong}</option>
          </select>
        </label>
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
    backgroundColor: "Background color",
    bottomLeft: "Bottom left",
    bottomRight: "Bottom right",
    borderColor: "Border color",
    brandColor: "Brand color",
    buttonLabel: "Button label",
    buttonShape: "Button shape",
    buttonStyle: "Button style",
    comfortable: "Comfortable",
    compact: "Compact",
    dark: "Dark",
    density: "Density",
    filled: "Filled",
    fontFamily: "Font family",
    inputStyle: "Input style",
    light: "Light",
    none: "None",
    outline: "Outline",
    outlined: "Outlined",
    pill: "Pill",
    position: "Position",
    rounded: "Rounded",
    shadow: "Shadow",
    soft: "Soft",
    spacious: "Spacious",
    square: "Square",
    strong: "Strong",
    successMessage: "Success message",
    textColor: "Text color",
    theme: "Theme",
    title: "Gadget settings",
    topLeft: "Top left",
    topRight: "Top right",
    underline: "Underline",
  },
  zh: {
    accentColor: "强调色",
    allowedDomains: "允许的域名",
    allowedDomainsHint:
      "例如：app.example.com。填写父域名后，子域名也会被允许。",
    allowedDomainsPlaceholder:
      "每行一个域名。留空表示本地测试时允许任何域名。",
    backgroundColor: "背景色",
    bottomLeft: "左下角",
    bottomRight: "右下角",
    borderColor: "边框色",
    brandColor: "品牌色",
    buttonLabel: "按钮文案",
    buttonShape: "按钮形状",
    buttonStyle: "按钮样式",
    comfortable: "舒适",
    compact: "紧凑",
    dark: "深色",
    density: "密度",
    filled: "填充",
    fontFamily: "字体",
    inputStyle: "输入框样式",
    light: "浅色",
    none: "无",
    outline: "描边",
    outlined: "描边",
    pill: "胶囊",
    position: "位置",
    rounded: "圆角",
    shadow: "阴影",
    soft: "柔和",
    spacious: "宽松",
    square: "直角",
    strong: "明显",
    successMessage: "提交成功文案",
    textColor: "文字色",
    theme: "主题",
    title: "Gadget 设置",
    topLeft: "左上角",
    topRight: "右上角",
    underline: "下划线",
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
