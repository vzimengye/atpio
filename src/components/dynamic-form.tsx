"use client";

import { type CSSProperties, FormEvent, useMemo, useState } from "react";
import type { UiLanguage } from "@/lib/i18n";
import type {
  FormField,
  FormPage,
  GadgetSettings,
  ProjectSchema,
} from "@/lib/types";

type DynamicFormProps = {
  projectId: string;
  schema: ProjectSchema;
  compact?: boolean;
  gadget?: GadgetSettings;
  metadata?: Record<string, string>;
  previewMode?: boolean;
  successMessage?: string;
  uiLanguage?: UiLanguage;
};

type FormState = Record<string, string | string[] | boolean>;

type ExperienceTheme = {
  accentColor: string;
  borderColor: string;
  chipStyle: CSSProperties;
  fieldGap: string;
  formStyle: CSSProperties;
  fontFamily: string;
  headerStyle: CSSProperties;
  inputStyle: CSSProperties;
  mutedBackground: string;
  padding: string;
  primaryButtonStyle: CSSProperties;
  secondaryButtonStyle: CSSProperties;
  selectedChipStyle: CSSProperties;
  shadow: string;
  successBackground: string;
  surfaceColor: string;
  textColor: string;
};

export function DynamicForm({
  projectId,
  schema,
  compact,
  gadget,
  metadata,
  previewMode = false,
  successMessage = "This response is saved and ready for the project dashboard.",
  uiLanguage = "en",
}: DynamicFormProps) {
  const t = formCopy[uiLanguage];
  const theme = useMemo(() => getExperienceTheme(gadget), [gadget]);
  const pages = useMemo(() => getPages(schema), [schema]);
  const initialState = useMemo(
    () =>
      Object.fromEntries(
        schema.fields.map((field) => [
          field.id,
          field.type === "multi_select" ? [] : "",
        ]),
      ) as FormState,
    [schema.fields],
  );
  const [answers, setAnswers] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">(
    "idle",
  );
  const [pageIndex, setPageIndex] = useState(0);
  const activePage = pages[pageIndex];
  const activeFields = schema.fields.filter((field) =>
    activePage ? (field.pageId ?? "default") === activePage.id : true,
  );
  const isLastPage = pageIndex === pages.length - 1;

  function updateAnswer(fieldId: string, value: string | string[] | boolean) {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  }

  function toggleMultiSelect(fieldId: string, option: string) {
    const current = answers[fieldId];
    const values = Array.isArray(current) ? current : [];
    updateAnswer(
      fieldId,
      values.includes(option)
        ? values.filter((value) => value !== option)
        : [...values, option],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLastPage) {
      setPageIndex((current) => Math.min(current + 1, pages.length - 1));
      return;
    }

    if (previewMode) {
      setPageIndex(0);
      return;
    }

    setStatus("submitting");
    try {
      await fetch(`/api/projects/${projectId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, metadata }),
      });
      setStatus("submitted");
      window.parent?.postMessage(
        { type: "atpio:submitted", projectId, metadata },
        "*",
      );
    } catch {
      setStatus("idle");
    }
  }

  function advancePreview() {
    if (!isLastPage) {
      setPageIndex((current) => Math.min(current + 1, pages.length - 1));
    }
  }

  if (status === "submitted") {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{
          background: theme.successBackground,
          borderColor: theme.accentColor,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
        }}
      >
        <h2 className="text-lg font-semibold">{t.thanks}</h2>
        <p className="mt-2 text-sm leading-6 opacity-80">{successMessage}</p>
      </div>
    );
  }

  return (
    <form
      className="relative"
      style={{
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        ...theme.formStyle,
      }}
      onSubmit={handleSubmit}
    >
      {status === "submitting" ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white px-8 py-7 text-center shadow-xl">
            <span
              aria-hidden="true"
              className="size-10 animate-spin rounded-full border-4 border-emerald-700 border-r-transparent"
            />
            <div>
              <p className="text-base font-semibold text-slate-950">
                {t.submittingTitle}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {t.submittingText}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <div
        className="rounded-2xl border"
        style={{
          background: theme.surfaceColor,
          borderColor: theme.borderColor,
          boxShadow: theme.shadow,
          padding: theme.padding,
          ...theme.headerStyle,
        }}
      >
        <h1 className={compact ? "text-xl font-semibold" : "text-2xl font-semibold"}>
          {schema.title}
        </h1>
        <p className="mt-2 text-sm leading-6 opacity-75">
          {schema.description}
        </p>
        {pages.length > 1 && activePage ? (
          <div
            className="mt-4 rounded-xl border p-3"
            style={{
              background: theme.mutedBackground,
              borderColor: theme.borderColor,
            }}
          >
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: theme.accentColor }}
            >
              {t.step} {pageIndex + 1} {t.of} {pages.length}
            </p>
            <h2 className="mt-1 text-base font-semibold">{activePage.title}</h2>
            {activePage.description ? (
              <p className="mt-1 text-sm leading-6 opacity-75">
                {activePage.description}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid" style={{ gap: theme.fieldGap }}>
        {activeFields.map((field) => (
          <FieldInput
            key={field.id}
            answers={answers}
            field={field}
            theme={theme}
            onToggleMultiSelect={toggleMultiSelect}
            onUpdateAnswer={updateAnswer}
            previewMode={previewMode}
            uiLanguage={uiLanguage}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {pageIndex > 0 ? (
          <button
            className="inline-flex h-10 items-center justify-center border px-4 text-sm font-medium"
            style={theme.secondaryButtonStyle}
            type="button"
            onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
          >
            {t.back}
          </button>
        ) : null}
        {previewMode && !isLastPage ? (
          <button
            className="inline-flex h-10 items-center justify-center px-4 text-sm font-medium"
            style={theme.primaryButtonStyle}
            onClick={advancePreview}
            type="button"
          >
            {t.next}
          </button>
        ) : null}
        {!previewMode ? (
          <button
            className="inline-flex h-10 items-center justify-center px-4 text-sm font-medium"
            style={theme.primaryButtonStyle}
            disabled={status === "submitting"}
            type="submit"
          >
            {status === "submitting"
              ? t.submitting
              : isLastPage
                ? t.submit
                : t.next}
          </button>
        ) : null}
      </div>
    </form>
  );
}

function getPages(schema: ProjectSchema): FormPage[] {
  if (schema.pages?.length) {
    return schema.pages;
  }

  return [{ id: "default", title: schema.title, description: schema.description }];
}

const formCopy = {
  en: {
    back: "Back",
    next: "Next",
    of: "of",
    selectOne: "Select one",
    step: "Step",
    submit: "Submit feedback",
    submitting: "Submitting...",
    submittingText: "Saving your response.",
    submittingTitle: "Submitting feedback",
    thanks: "Thanks for the feedback.",
  },
  zh: {
    back: "返回",
    next: "下一步",
    of: "/",
    selectOne: "请选择",
    step: "第",
    submit: "提交反馈",
    submitting: "提交中...",
    submittingText: "正在保存你的反馈。",
    submittingTitle: "正在提交反馈",
    thanks: "感谢你的反馈。",
  },
} satisfies Record<UiLanguage, Record<string, string>>;

function getExperienceTheme(gadget?: GadgetSettings): ExperienceTheme {
  const isDark = gadget?.theme === "dark";
  const accentColor = gadget?.accentColor ?? "#10b981";
  const brandColor = gadget?.brandColor ?? (isDark ? "#f7f1e8" : "#020617");
  const textColor = gadget?.textColor ?? (isDark ? "#f8fafc" : "#020617");
  const backgroundColor = gadget?.backgroundColor ?? (isDark ? "#020617" : "#ffffff");
  const borderColor = gadget?.borderColor ?? (isDark ? "#334155" : "#dbe3ef");
  const radius =
    gadget?.buttonShape === "square"
      ? "6px"
      : gadget?.buttonShape === "rounded"
        ? "12px"
        : "999px";
  const inputRadius = gadget?.buttonShape === "square" ? "6px" : "12px";
  const density = gadget?.density ?? "comfortable";
  const padding =
    density === "compact" ? "18px" : density === "spacious" ? "30px" : "24px";
  const fieldGap =
    density === "compact" ? "14px" : density === "spacious" ? "24px" : "18px";
  const shadow =
    gadget?.shadow === "none"
      ? "none"
      : gadget?.shadow === "strong"
        ? "0 26px 70px rgba(15, 23, 42, 0.22)"
        : "0 16px 45px rgba(15, 23, 42, 0.10)";
  const inputBackground =
    gadget?.inputStyle === "filled" ? (isDark ? "#0f172a" : "#f8fafc") : backgroundColor;
  const inputBorder =
    gadget?.inputStyle === "underline" ? `transparent transparent ${borderColor}` : borderColor;
  const surfaceStyle = gadget?.surfaceStyle ?? "solid";
  const visualPreset = gadget?.visualPreset ?? "clean-saas";
  const primaryButtonStyle: CSSProperties = {
    background:
      gadget?.buttonStyle === "outline"
        ? "transparent"
        : gadget?.buttonStyle === "soft"
          ? `${accentColor}1A`
          : brandColor,
    border: `1px solid ${
      gadget?.buttonStyle === "filled" ? brandColor : accentColor
    }`,
    borderRadius: radius,
    color:
      gadget?.buttonStyle === "filled"
        ? getReadableTextColor(brandColor)
        : textColor,
  };

  return {
    accentColor,
    borderColor,
    chipStyle: {
      background: "transparent",
      borderColor,
      borderRadius: inputRadius,
      color: textColor,
    },
    fieldGap,
    formStyle: {
      ...getPatternStyle({
        accentColor,
        backgroundColor,
        borderColor,
        brandColor,
        decorativeIntensity: gadget?.decorativeIntensity ?? "subtle",
        pattern: gadget?.backgroundPattern ?? "none",
      }),
      ...getPresetBackgroundStyle({
        accentColor,
        backgroundColor,
        brandColor,
        visualPreset,
      }),
    },
    fontFamily: gadget?.fontFamily ?? "Inter, Arial, sans-serif",
    headerStyle: {
      ...getHeaderStyle({
        accentColor,
        borderColor,
        isDark,
        surfaceStyle,
      }),
      ...getPresetHeaderStyle({ accentColor, brandColor, visualPreset }),
    },
    inputStyle: {
      background: inputBackground,
      borderColor: inputBorder,
      borderRadius: inputRadius,
      color: textColor,
    },
    mutedBackground: isDark ? "#0f172a" : "#f8fafc",
    padding,
    primaryButtonStyle,
    secondaryButtonStyle: {
      background: "transparent",
      borderColor,
      borderRadius: radius,
      color: textColor,
    },
    selectedChipStyle: {
      background: `${accentColor}1A`,
      borderColor: accentColor,
      borderRadius: inputRadius,
      color: textColor,
    },
    shadow,
    successBackground: `${accentColor}14`,
    surfaceColor: getSurfaceColor({ backgroundColor, isDark, surfaceStyle }),
    textColor,
  };
}

function getSurfaceColor({
  backgroundColor,
  isDark,
  surfaceStyle,
}: {
  backgroundColor: string;
  isDark: boolean;
  surfaceStyle: GadgetSettings["surfaceStyle"];
}) {
  if (surfaceStyle === "glass") {
    return withAlpha(isDark ? "#020617" : "#ffffff", 0.78);
  }

  if (surfaceStyle === "paper") {
    return isDark ? "#111827" : "#fffdf8";
  }

  if (surfaceStyle === "neon") {
    return isDark ? "#020617" : "#fbfdff";
  }

  if (surfaceStyle === "editorial") {
    return isDark ? "#0f172a" : "#fffaf2";
  }

  return backgroundColor;
}

function getHeaderStyle({
  accentColor,
  borderColor,
  isDark,
  surfaceStyle,
}: {
  accentColor: string;
  borderColor: string;
  isDark: boolean;
  surfaceStyle: GadgetSettings["surfaceStyle"];
}): CSSProperties {
  if (surfaceStyle === "glass") {
    return {
      backdropFilter: "blur(18px)",
      borderColor: withAlpha(borderColor, 0.75),
    };
  }

  if (surfaceStyle === "paper") {
    return {
      backgroundImage:
        "linear-gradient(135deg, rgba(255,255,255,0.36) 25%, transparent 25%), linear-gradient(315deg, rgba(15,23,42,0.03) 25%, transparent 25%)",
      backgroundSize: "18px 18px",
    };
  }

  if (surfaceStyle === "neon") {
    return {
      borderColor: accentColor,
      boxShadow: `0 0 0 1px ${withAlpha(accentColor, 0.35)}, 0 24px 70px ${withAlpha(accentColor, isDark ? 0.25 : 0.16)}`,
    };
  }

  if (surfaceStyle === "editorial") {
    return {
      borderRadius: "10px",
      borderColor: withAlpha(borderColor, 0.9),
    };
  }

  return {};
}

function getPresetBackgroundStyle({
  accentColor,
  backgroundColor,
  brandColor,
  visualPreset,
}: {
  accentColor: string;
  backgroundColor: string;
  brandColor: string;
  visualPreset: NonNullable<GadgetSettings["visualPreset"]>;
}): CSSProperties {
  if (visualPreset === "rainy-glass") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 18% 0%, ${withAlpha(accentColor, 0.2)}, transparent 38%), radial-gradient(ellipse at 90% 18%, ${withAlpha(brandColor, 0.1)}, transparent 34%), linear-gradient(180deg, ${withAlpha("#ffffff", 0.42)}, transparent 44%)`,
    };
  }

  if (visualPreset === "editorial-paper") {
    return {
      backgroundColor,
      backgroundImage: `linear-gradient(135deg, ${withAlpha(brandColor, 0.05)}, transparent 34%), radial-gradient(circle at 82% 12%, ${withAlpha(accentColor, 0.1)}, transparent 30%)`,
    };
  }

  if (visualPreset === "soft-botanical") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 12% 18%, ${withAlpha(accentColor, 0.16)}, transparent 32%), radial-gradient(ellipse at 88% 84%, ${withAlpha(brandColor, 0.08)}, transparent 36%)`,
    };
  }

  if (visualPreset === "neo-tech") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 16% 0%, ${withAlpha(accentColor, 0.22)}, transparent 36%), radial-gradient(ellipse at 90% 12%, ${withAlpha(brandColor, 0.12)}, transparent 34%)`,
    };
  }

  if (visualPreset === "luxury-beauty") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 78% 0%, ${withAlpha(accentColor, 0.2)}, transparent 36%), radial-gradient(ellipse at 14% 86%, ${withAlpha(brandColor, 0.1)}, transparent 34%)`,
    };
  }

  if (visualPreset === "finance-minimal") {
    return {
      backgroundColor,
      backgroundImage: `linear-gradient(180deg, ${withAlpha(accentColor, 0.06)}, transparent 48%)`,
    };
  }

  if (visualPreset === "warm-consumer") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 12% 4%, ${withAlpha(accentColor, 0.16)}, transparent 34%), radial-gradient(ellipse at 88% 10%, ${withAlpha(brandColor, 0.08)}, transparent 32%)`,
    };
  }

  return {
    backgroundColor,
    backgroundImage: `linear-gradient(180deg, ${withAlpha(accentColor, 0.06)}, transparent 42%)`,
  };
}

function getPresetHeaderStyle({
  accentColor,
  brandColor,
  visualPreset,
}: {
  accentColor: string;
  brandColor: string;
  visualPreset: NonNullable<GadgetSettings["visualPreset"]>;
}): CSSProperties {
  if (visualPreset === "rainy-glass") {
    return {
      boxShadow: `0 24px 70px ${withAlpha(accentColor, 0.16)}`,
    };
  }

  if (visualPreset === "editorial-paper") {
    return {
      borderRadius: "10px",
      boxShadow: `0 18px 54px ${withAlpha(brandColor, 0.08)}`,
    };
  }

  if (visualPreset === "neo-tech") {
    return {
      boxShadow: `0 0 0 1px ${withAlpha(accentColor, 0.32)}, 0 24px 70px ${withAlpha(accentColor, 0.18)}`,
    };
  }

  if (visualPreset === "luxury-beauty") {
    return {
      boxShadow: `0 24px 80px ${withAlpha(accentColor, 0.18)}`,
    };
  }

  return {};
}

function getPatternStyle({
  accentColor,
  backgroundColor,
  borderColor,
  brandColor,
  decorativeIntensity,
  pattern,
}: {
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  brandColor: string;
  decorativeIntensity: GadgetSettings["decorativeIntensity"];
  pattern: GadgetSettings["backgroundPattern"];
}): CSSProperties {
  if (!pattern || pattern === "none" || decorativeIntensity === "none") {
    return {};
  }

  const opacity =
    decorativeIntensity === "bold"
      ? 0.26
      : decorativeIntensity === "medium"
        ? 0.17
        : 0.1;
  const accent = withAlpha(accentColor, opacity);
  const brand = withAlpha(brandColor, opacity * 0.8);
  const line = withAlpha(borderColor, opacity);

  if (pattern === "dots") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(circle at 12% 18%, ${accent}, transparent 30%), radial-gradient(circle at 88% 8%, ${brand}, transparent 32%)`,
    };
  }

  if (pattern === "grid") {
    return {
      backgroundColor,
      backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px), radial-gradient(ellipse at 88% 12%, ${accent}, transparent 34%)`,
      backgroundSize: "42px 42px, 42px 42px, auto",
    };
  }

  if (pattern === "waves") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 12% 18%, ${accent}, transparent 34%), radial-gradient(ellipse at 88% 10%, ${brand}, transparent 32%), linear-gradient(135deg, transparent 0 45%, ${line} 45% 46%, transparent 46% 100%)`,
    };
  }

  if (pattern === "botanical") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 82% 12%, ${accent}, transparent 32%), radial-gradient(ellipse at 10% 90%, ${brand}, transparent 34%)`,
    };
  }

  if (pattern === "sparkles") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 75% 8%, ${accent}, transparent 34%), radial-gradient(circle at 20% 88%, ${brand}, transparent 28%)`,
    };
  }

  if (pattern === "circuit") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 20% 0%, ${accent}, transparent 30%), linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
      backgroundSize: "auto, 36px 36px, 36px 36px",
    };
  }

  if (pattern === "paper") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(circle at 20% 20%, ${accent}, transparent 28%), repeating-linear-gradient(0deg, transparent 0 18px, ${line} 19px)`,
    };
  }

  if (pattern === "bubbles") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(circle at 18% 20%, ${accent} 0 14px, transparent 16px), radial-gradient(circle at 82% 16%, ${brand} 0 20px, transparent 22px), radial-gradient(ellipse at 50% 105%, ${accent}, transparent 42%)`,
    };
  }

  return {};
}

function getReadableTextColor(backgroundColor: string) {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return "#ffffff";

  const luminance = (0.299 * rgb.red + 0.587 * rgb.green + 0.114 * rgb.blue) / 255;
  return luminance > 0.58 ? "#020617" : "#ffffff";
}

function withAlpha(color: string, alpha: number) {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${alpha})`;
}

function hexToRgb(color: string) {
  const hex = color.trim().replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((character) => character + character)
          .join("")
      : hex;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  return {
    red: parseInt(normalized.slice(0, 2), 16),
    green: parseInt(normalized.slice(2, 4), 16),
    blue: parseInt(normalized.slice(4, 6), 16),
  };
}

function FieldInput({
  answers,
  field,
  theme,
  onToggleMultiSelect,
  onUpdateAnswer,
  previewMode,
  uiLanguage,
}: {
  answers: FormState;
  field: FormField;
  theme: ExperienceTheme;
  onToggleMultiSelect: (fieldId: string, option: string) => void;
  onUpdateAnswer: (fieldId: string, value: string | string[] | boolean) => void;
  previewMode: boolean;
  uiLanguage: UiLanguage;
}) {
  const t = formCopy[uiLanguage];

  return (
    <label className="block">
      <span className="text-sm font-medium" style={{ color: theme.textColor }}>
        {field.label}
        {field.required ? " *" : ""}
      </span>

      {field.type === "short_text" ? (
        <input
          className="mt-2 h-10 w-full border px-3 text-sm outline-none"
          style={theme.inputStyle}
          maxLength={field.validation?.maxLength}
          minLength={field.validation?.minLength}
          placeholder={field.placeholder}
          required={previewMode ? false : field.required}
          value={String(answers[field.id] ?? "")}
          onChange={(event) => onUpdateAnswer(field.id, event.target.value)}
        />
      ) : null}

      {field.type === "long_text" ? (
        <textarea
          className="mt-2 min-h-28 w-full border px-3 py-2 text-sm outline-none"
          style={theme.inputStyle}
          maxLength={field.validation?.maxLength}
          minLength={field.validation?.minLength}
          placeholder={field.placeholder}
          required={previewMode ? false : field.required}
          value={String(answers[field.id] ?? "")}
          onChange={(event) => onUpdateAnswer(field.id, event.target.value)}
        />
      ) : null}

      {field.type === "single_select" ? (
        <select
          className="mt-2 h-10 w-full border px-3 text-sm outline-none"
          style={theme.inputStyle}
          required={previewMode ? false : field.required}
          value={String(answers[field.id] ?? "")}
          onChange={(event) => onUpdateAnswer(field.id, event.target.value)}
        >
          <option value="">{t.selectOne}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "multi_select" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {field.options?.map((option) => {
            const value = answers[field.id];
            const selected = Array.isArray(value) && value.includes(option);

            return (
              <button
                key={option}
                className="border px-3 py-2 text-sm"
                style={selected ? theme.selectedChipStyle : theme.chipStyle}
                type="button"
                onClick={() => onToggleMultiSelect(field.id, option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}

      {field.type === "rating" ? (
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              className={
                String(answers[field.id]) === String(rating)
                  ? "h-10 w-10 text-sm font-medium"
                  : "h-10 w-10 border text-sm font-medium"
              }
              style={
                String(answers[field.id]) === String(rating)
                  ? theme.primaryButtonStyle
                  : theme.secondaryButtonStyle
              }
              type="button"
              onClick={() => onUpdateAnswer(field.id, String(rating))}
            >
              {rating}
            </button>
          ))}
        </div>
      ) : null}

      {field.type === "boolean" ? (
        <input
          className="mt-3 h-4 w-4"
          style={{ accentColor: theme.accentColor }}
          type="checkbox"
          checked={Boolean(answers[field.id])}
          onChange={(event) => onUpdateAnswer(field.id, event.target.checked)}
        />
      ) : null}
    </label>
  );
}
