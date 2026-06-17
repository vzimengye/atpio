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
    formStyle: getPatternStyle({
      accentColor,
      backgroundColor,
      borderColor,
      brandColor,
      decorativeIntensity: gadget?.decorativeIntensity ?? "subtle",
      pattern: gadget?.backgroundPattern ?? "none",
    }),
    fontFamily: gadget?.fontFamily ?? "Inter, Arial, sans-serif",
    headerStyle: getHeaderStyle({
      accentColor,
      borderColor,
      isDark,
      surfaceStyle,
    }),
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
  const motifOpacity =
    decorativeIntensity === "bold"
      ? 0.42
      : decorativeIntensity === "medium"
        ? 0.3
        : 0.18;
  const accent = withAlpha(accentColor, opacity);
  const brand = withAlpha(brandColor, opacity * 0.8);

  if (pattern === "dots") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(circle at 12% 18%, ${accent}, transparent 26%), url("${svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><circle cx="18" cy="22" r="2.2" fill="${accentColor}" fill-opacity="${motifOpacity}"/><circle cx="56" cy="14" r="1.4" fill="${brandColor}" fill-opacity="${motifOpacity * 0.72}"/><circle cx="78" cy="50" r="2.8" fill="${accentColor}" fill-opacity="${motifOpacity * 0.8}"/><circle cx="30" cy="74" r="1.7" fill="${brandColor}" fill-opacity="${motifOpacity * 0.65}"/></svg>`,
      )}")`,
      backgroundSize: "auto, 96px 96px",
    };
  }

  if (pattern === "grid") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 88% 12%, ${accent}, transparent 32%), url("${svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><path d="M0 28H112M0 56H112M0 84H112M28 0V112M56 0V112M84 0V112" stroke="${borderColor}" stroke-opacity="${motifOpacity * 0.7}" stroke-width="1"/><path d="M12 12h20v20h-20zM72 72h28v28h-28z" fill="none" stroke="${accentColor}" stroke-opacity="${motifOpacity}" stroke-width="1.2"/></svg>`,
      )}")`,
      backgroundSize: "auto, 112px 112px",
    };
  }

  if (pattern === "waves") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 12% 18%, ${accent}, transparent 34%), radial-gradient(ellipse at 88% 10%, ${brand}, transparent 32%), url("${svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="96" viewBox="0 0 160 96"><path d="M-10 28c28-24 52 24 80 0s52 24 80 0 52 24 80 0" fill="none" stroke="${accentColor}" stroke-opacity="${motifOpacity}" stroke-width="2.4"/><path d="M-10 58c28-24 52 24 80 0s52 24 80 0 52 24 80 0" fill="none" stroke="${brandColor}" stroke-opacity="${motifOpacity * 0.55}" stroke-width="1.6"/></svg>`,
      )}")`,
      backgroundSize: "auto, auto, 160px 96px",
    };
  }

  if (pattern === "botanical") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 82% 12%, ${accent}, transparent 30%), url("${svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="132" height="116" viewBox="0 0 132 116"><path d="M28 92C36 50 54 30 90 18" fill="none" stroke="${brandColor}" stroke-opacity="${motifOpacity}" stroke-width="2" stroke-linecap="round"/><path d="M48 62c-18-20-34-14-40 2 16 10 30 8 40-2ZM66 44c-8-24-24-26-38-16 8 18 22 24 38 16ZM82 30c4-24 20-30 36-24-2 20-14 30-36 24Z" fill="${accentColor}" fill-opacity="${motifOpacity}" stroke="${brandColor}" stroke-opacity="${motifOpacity * 0.7}" stroke-width="1"/></svg>`,
      )}")`,
      backgroundSize: "auto, 132px 116px",
    };
  }

  if (pattern === "sparkles") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 75% 8%, ${accent}, transparent 34%), url("${svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="118" height="118" viewBox="0 0 118 118"><path d="M26 10l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12ZM86 56l6 18 18 6-18 6-6 18-6-18-18-6 18-6 6-18Z" fill="${accentColor}" fill-opacity="${motifOpacity}"/><circle cx="74" cy="24" r="2.5" fill="${brandColor}" fill-opacity="${motifOpacity * 0.8}"/><circle cx="28" cy="88" r="2" fill="${accentColor}" fill-opacity="${motifOpacity * 0.75}"/></svg>`,
      )}")`,
      backgroundSize: "auto, 118px 118px",
    };
  }

  if (pattern === "circuit") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(ellipse at 20% 0%, ${accent}, transparent 30%), url("${svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="120" viewBox="0 0 150 120"><path d="M20 24h42v24h36v28h34M44 96h36V72h30M22 58h30M96 22v26" fill="none" stroke="${accentColor}" stroke-opacity="${motifOpacity}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="24" r="4" fill="${brandColor}" fill-opacity="${motifOpacity}"/><circle cx="98" cy="48" r="4" fill="${accentColor}" fill-opacity="${motifOpacity}"/><circle cx="132" cy="76" r="4" fill="${brandColor}" fill-opacity="${motifOpacity}"/></svg>`,
      )}")`,
      backgroundSize: "auto, 150px 120px",
    };
  }

  if (pattern === "paper") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(circle at 20% 20%, ${accent}, transparent 28%), url("${svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="130" height="130" viewBox="0 0 130 130"><path d="M0 22h130M0 64h130M0 106h130" stroke="${borderColor}" stroke-opacity="${motifOpacity * 0.6}" stroke-width="1"/><path d="M20 30c18-8 28 8 44 0s28 8 46 0M12 86c18-8 30 8 48 0s34 8 54 0" fill="none" stroke="${brandColor}" stroke-opacity="${motifOpacity * 0.35}" stroke-width="1.2"/></svg>`,
      )}")`,
      backgroundSize: "auto, 130px 130px",
    };
  }

  if (pattern === "bubbles") {
    return {
      backgroundColor,
      backgroundImage: `radial-gradient(circle at 18% 20%, ${accent} 0 16px, transparent 17px), radial-gradient(circle at 82% 16%, ${brand} 0 22px, transparent 23px), url("${svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="128" viewBox="0 0 112 128"><path d="M28 8C18 24 12 34 12 48c0 14 10 24 24 24s24-10 24-24C60 34 48 22 28 8Z" fill="${accentColor}" fill-opacity="${motifOpacity}" stroke="${brandColor}" stroke-opacity="${motifOpacity * 0.6}" stroke-width="1.5"/><path d="M78 58c-8 13-12 22-12 32 0 12 9 20 20 20s20-8 20-20c0-10-10-20-28-32Z" fill="${brandColor}" fill-opacity="${motifOpacity * 0.55}" stroke="${accentColor}" stroke-opacity="${motifOpacity * 0.8}" stroke-width="1.5"/></svg>`,
      )}")`,
      backgroundSize: "auto, auto, 112px 128px",
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

function svgDataUri(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22")}`;
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
