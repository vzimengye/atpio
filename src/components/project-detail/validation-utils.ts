import type { FormField } from "@/lib/types";

export function cleanValidation(
  current: FormField["validation"],
  key: keyof NonNullable<FormField["validation"]>,
  value: number | undefined,
) {
  const validation = { ...(current ?? {}), [key]: value };
  Object.keys(validation).forEach((validationKey) => {
    const typedKey = validationKey as keyof typeof validation;
    if (validation[typedKey] === undefined || Number.isNaN(validation[typedKey])) {
      delete validation[typedKey];
    }
  });
  return Object.keys(validation).length > 0 ? validation : undefined;
}
