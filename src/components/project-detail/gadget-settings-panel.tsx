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
        <SelectInput
          label={t.position}
          value={gadget.position}
          options={[
            ["bottom-right", t.bottomRight],
            ["bottom-left", t.bottomLeft],
            ["top-right", t.topRight],
            ["top-left", t.topLeft],
          ]}
          onChange={(value) =>
            onUpdate("position", value as GadgetSettings["position"])
          }
        />
        <SelectInput
          label={t.theme}
          value={gadget.theme}
          options={[
            ["light", t.light],
            ["dark", t.dark],
          ]}
          onChange={(value) => onUpdate("theme", value as GadgetSettings["theme"])}
        />
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
        <SelectInput
          label={t.backgroundPattern}
          value={gadget.backgroundPattern ?? "none"}
          options={[
            ["none", t.none],
            ["dots", t.dots],
            ["grid", t.grid],
            ["waves", t.waves],
            ["botanical", t.botanical],
            ["sparkles", t.sparkles],
            ["circuit", t.circuit],
            ["paper", t.paperTexture],
            ["bubbles", t.bubbles],
          ]}
          onChange={(value) =>
            onUpdate(
              "backgroundPattern",
              value as GadgetSettings["backgroundPattern"],
            )
          }
        />
        <SelectInput
          label={t.surfaceStyle}
          value={gadget.surfaceStyle ?? "solid"}
          options={[
            ["solid", t.solid],
            ["glass", t.glass],
            ["paper", t.paper],
            ["neon", t.neon],
            ["editorial", t.editorial],
          ]}
          onChange={(value) =>
            onUpdate("surfaceStyle", value as GadgetSettings["surfaceStyle"])
          }
        />
        <SelectInput
          label={t.decorativeIntensity}
          value={gadget.decorativeIntensity ?? "subtle"}
          options={[
            ["none", t.none],
            ["subtle", t.subtle],
            ["medium", t.medium],
            ["bold", t.bold],
          ]}
          onChange={(value) =>
            onUpdate(
              "decorativeIntensity",
              value as GadgetSettings["decorativeIntensity"],
            )
          }
        />
        <SelectInput
          label={t.buttonShape}
          value={gadget.buttonShape}
          options={[
            ["pill", t.pill],
            ["rounded", t.rounded],
            ["square", t.square],
          ]}
          onChange={(value) =>
            onUpdate("buttonShape", value as GadgetSettings["buttonShape"])
          }
        />
        <TextInput
          label={t.fontFamily}
          value={gadget.fontFamily}
          onChange={(value) => onUpdate("fontFamily", value)}
        />
        <SelectInput
          label={t.buttonStyle}
          value={gadget.buttonStyle ?? "filled"}
          options={[
            ["filled", t.filled],
            ["outline", t.outline],
            ["soft", t.soft],
          ]}
          onChange={(value) =>
            onUpdate("buttonStyle", value as GadgetSettings["buttonStyle"])
          }
        />
        <SelectInput
          label={t.inputStyle}
          value={gadget.inputStyle ?? "outlined"}
          options={[
            ["outlined", t.outlined],
            ["filled", t.filled],
            ["underline", t.underline],
          ]}
          onChange={(value) =>
            onUpdate("inputStyle", value as GadgetSettings["inputStyle"])
          }
        />
        <SelectInput
          label={t.density}
          value={gadget.density ?? "comfortable"}
          options={[
            ["compact", t.compact],
            ["comfortable", t.comfortable],
            ["spacious", t.spacious],
          ]}
          onChange={(value) =>
            onUpdate("density", value as GadgetSettings["density"])
          }
        />
        <SelectInput
          label={t.shadow}
          value={gadget.shadow ?? "soft"}
          options={[
            ["none", t.none],
            ["soft", t.soft],
            ["strong", t.strong],
          ]}
          onChange={(value) => onUpdate("shadow", value as GadgetSettings["shadow"])}
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
    backgroundColor: "Background color",
    backgroundPattern: "Background pattern",
    bold: "Bold",
    botanical: "Botanical",
    bottomLeft: "Bottom left",
    bottomRight: "Bottom right",
    borderColor: "Border color",
    brandColor: "Brand color",
    bubbles: "Bubbles",
    buttonLabel: "Button label",
    buttonShape: "Button shape",
    buttonStyle: "Button style",
    circuit: "Circuit",
    comfortable: "Comfortable",
    compact: "Compact",
    dark: "Dark",
    decorativeIntensity: "Decoration level",
    density: "Density",
    dots: "Dots",
    editorial: "Editorial",
    filled: "Filled",
    fontFamily: "Font family",
    glass: "Glass",
    grid: "Grid",
    inputStyle: "Input style",
    light: "Light",
    medium: "Medium",
    neon: "Neon",
    none: "None",
    outline: "Outline",
    outlined: "Outlined",
    paper: "Paper",
    paperTexture: "Paper texture",
    pill: "Pill",
    position: "Position",
    rounded: "Rounded",
    shadow: "Shadow",
    soft: "Soft",
    solid: "Solid",
    sparkles: "Sparkles",
    spacious: "Spacious",
    square: "Square",
    strong: "Strong",
    subtle: "Subtle",
    successMessage: "Success message",
    surfaceStyle: "Card texture",
    textColor: "Text color",
    theme: "Theme",
    title: "Embedded form settings",
    topLeft: "Top left",
    topRight: "Top right",
    underline: "Underline",
    waves: "Waves",
  },
  zh: {
    accentColor: "强调色",
    allowedDomains: "允许嵌入的域名",
    allowedDomainsHint:
      "例如：app.example.com。填写父域名后，它的子域名也会被允许。",
    allowedDomainsPlaceholder:
      "每行一个域名。留空表示本地测试时允许任何域名。",
    backgroundColor: "背景色",
    backgroundPattern: "背景图案",
    bold: "明显",
    botanical: "植物",
    bottomLeft: "左下角",
    bottomRight: "右下角",
    borderColor: "边框色",
    brandColor: "品牌色",
    bubbles: "泡泡",
    buttonLabel: "按钮文案",
    buttonShape: "按钮形状",
    buttonStyle: "按钮样式",
    circuit: "科技线",
    comfortable: "舒适",
    compact: "紧凑",
    dark: "深色",
    decorativeIntensity: "装饰强度",
    density: "密度",
    dots: "点阵",
    editorial: "杂志感",
    filled: "填充",
    fontFamily: "字体",
    glass: "玻璃",
    grid: "网格",
    inputStyle: "输入框样式",
    light: "浅色",
    medium: "中等",
    neon: "霓虹",
    none: "无",
    outline: "描边",
    outlined: "描边",
    paper: "纸感",
    paperTexture: "纸张纹理",
    pill: "胶囊",
    position: "位置",
    rounded: "圆角",
    shadow: "阴影",
    soft: "柔和",
    solid: "实色",
    sparkles: "星光",
    spacious: "宽松",
    square: "直角",
    strong: "明显",
    subtle: "轻微",
    successMessage: "提交成功文案",
    surfaceStyle: "卡片质感",
    textColor: "文字色",
    theme: "主题",
    title: "嵌入式问卷设置",
    topLeft: "左上角",
    topRight: "右上角",
    underline: "下划线",
    waves: "波浪",
  },
} satisfies Record<UiLanguage, Record<string, string>>;

function SelectInput({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
  value: string;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <select
        className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
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
