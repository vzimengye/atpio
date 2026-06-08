export const publicAppUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:3000";

export const publicMockProductUrl =
  process.env.NEXT_PUBLIC_MOCK_PRODUCT_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:4000";
