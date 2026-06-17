export const publicAppUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:3000";

export const publicMockProductUrl =
  process.env.NEXT_PUBLIC_MOCK_PRODUCT_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:4000";

export function buildDemoProductUrl(
  params: Record<string, string | undefined> = {},
) {
  const url = new URL(publicMockProductUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
}
