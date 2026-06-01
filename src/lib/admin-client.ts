export function getAdminHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const token = window.localStorage.getItem("atpioAdminToken");
  return token ? { "x-atpio-admin-token": token } : {};
}
