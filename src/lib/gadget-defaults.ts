import type { GadgetSettings } from "@/lib/types";

type GadgetLanguage = "en" | "zh" | "bilingual";

const localizedDefaultText = {
  en: {
    buttonLabel: "Feedback",
    successMessage: "Thanks. Your feedback was saved.",
  },
  zh: {
    buttonLabel: "提交反馈",
    successMessage: "感谢，反馈已保存。",
  },
} as const;

export const defaultGadgetSettings: GadgetSettings = {
  position: "bottom-right",
  theme: "light",
  buttonLabel: "Feedback",
  successMessage: "Thanks. Your feedback was saved.",
  brandColor: "#020617",
  accentColor: "#10b981",
  backgroundColor: "#ffffff",
  borderColor: "#dbe3ef",
  buttonShape: "pill",
  buttonStyle: "filled",
  density: "comfortable",
  fontFamily: "Inter, Arial, sans-serif",
  inputStyle: "outlined",
  shadow: "soft",
  styleSource: "default",
  textColor: "#020617",
  allowedDomains: [],
};

export function getLocalizedGadgetDefaults(
  language: GadgetLanguage = "en",
): GadgetSettings {
  const text =
    language === "zh" || language === "bilingual"
      ? localizedDefaultText.zh
      : localizedDefaultText.en;

  return {
    ...defaultGadgetSettings,
    ...text,
  };
}

export function localizeDefaultGadgetText(
  gadget: GadgetSettings,
  language: "en" | "zh",
): GadgetSettings {
  const text = language === "zh" ? localizedDefaultText.zh : localizedDefaultText.en;
  const defaultLabels = new Set<string>([
    localizedDefaultText.en.buttonLabel,
    localizedDefaultText.zh.buttonLabel,
  ]);
  const defaultMessages = new Set<string>([
    localizedDefaultText.en.successMessage,
    localizedDefaultText.zh.successMessage,
  ]);

  return {
    ...gadget,
    buttonLabel: defaultLabels.has(gadget.buttonLabel)
      ? text.buttonLabel
      : gadget.buttonLabel,
    successMessage: defaultMessages.has(gadget.successMessage)
      ? text.successMessage
      : gadget.successMessage,
  };
}

export function withGadgetDefaults(
  gadget?: Partial<GadgetSettings>,
): GadgetSettings {
  return {
    ...defaultGadgetSettings,
    ...(gadget ?? {}),
  };
}
