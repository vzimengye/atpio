import type { GadgetSettings } from "@/lib/types";

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

export function withGadgetDefaults(
  gadget?: Partial<GadgetSettings>,
): GadgetSettings {
  return {
    ...defaultGadgetSettings,
    ...(gadget ?? {}),
  };
}
