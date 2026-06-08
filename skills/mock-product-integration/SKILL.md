# Mock Product Integration

Use this guide when you need to connect another product page to Atpio the same way the local mock product does.

## Mental Model

Atpio runs as the collector app. The host product is any separate page that wants to show an embedded feedback gadget.

The connection has three pieces:

1. The host page loads Atpio's public script: `/gadget.js`.
2. The script reads `data-*` attributes from its own `<script>` tag.
3. The script creates a floating button and opens an iframe pointing to `/embed/{projectId}`.

In local development:

- Atpio app: `http://127.0.0.1:3000`
- Mock product: `http://127.0.0.1:4000`
- Script loaded by mock product: `http://127.0.0.1:3000/gadget.js`
- Iframe opened by script: `http://127.0.0.1:3000/embed/{projectId}`

## Minimal Host Page Snippet

Add this script tag to the host product page:

```html
<script
  src="https://YOUR_ATPIO_DOMAIN/gadget.js"
  data-project-id="project_example"
  data-atpio-position="bottom-right"
  data-atpio-theme="light"
  data-atpio-label="Share feedback"
></script>
```

Required:

- `src`: the Atpio app URL plus `/gadget.js`.
- `data-project-id`: the Atpio project to render in the iframe.

Optional:

- `data-atpio-position`: `bottom-right`, `bottom-left`, `top-right`, or `top-left`.
- `data-atpio-theme`: `light` or `dark`.
- `data-atpio-label`: button label.
- `data-atpio-brand-color`: primary button color.
- `data-atpio-accent-color`: top border / accent color.
- `data-atpio-button-shape`: `pill`, `rounded`, or `square`.
- `data-atpio-font-family`: CSS font stack.
- `data-atpio-success-callback`: global callback function name.
- `data-atpio-meta-*`: any extra metadata to attach to submitted responses.

## How the Local Mock Product Works

The local mock product lives in `mock-product/index.html`.

It does two things:

1. Fetches the latest saved project:

```js
fetch(atpioAppUrl + "/api/projects/latest?t=" + Date.now(), {
  cache: "no-store",
});
```

2. Injects the gadget script using that project ID:

```js
var script = document.createElement("script");
script.src = atpioAppUrl + "/gadget.js";
script.setAttribute("data-project-id", projectId);
script.setAttribute("data-atpio-position", "bottom-right");
script.setAttribute("data-atpio-theme", "light");
script.setAttribute("data-atpio-label", "Share feedback");
document.body.appendChild(script);
```

This makes the mock product always preview the newest saved Atpio project.

## Events and Callbacks

The gadget emits browser events on the host page:

```js
window.addEventListener("atpio:open", function (event) {
  console.log("Atpio opened", event.detail);
});

window.addEventListener("atpio:close", function (event) {
  console.log("Atpio closed", event.detail);
});

window.addEventListener("atpio:success", function (event) {
  console.log("Atpio submitted", event.detail);
});
```

You can also pass a callback function name:

```html
<script
  src="https://YOUR_ATPIO_DOMAIN/gadget.js"
  data-project-id="project_example"
  data-atpio-success-callback="onAtpioSuccess"
></script>
```

```js
window.onAtpioSuccess = function (detail) {
  console.log("Submission completed", detail);
};
```

## Metadata

Use `data-atpio-meta-*` attributes to send host product context with every response.

```html
<script
  src="https://YOUR_ATPIO_DOMAIN/gadget.js"
  data-project-id="project_example"
  data-atpio-meta-page="pricing"
  data-atpio-meta-user-segment="trial"
  data-atpio-meta-experiment-id="onboarding-v2"
></script>
```

Atpio stores these values under `metadata` on the response.

## Local Testing Steps

1. Start Atpio:

```bash
npm run dev
```

2. Start the mock product:

```bash
npm run mock-product
```

3. Open the mock product:

```text
http://127.0.0.1:4000
```

4. Save a project in Atpio.
5. Refresh the mock product.
6. Click the feedback button.
7. Confirm it opens the latest saved Atpio form.

## Production Checklist

- Set `NEXT_PUBLIC_APP_URL` to the deployed Atpio URL.
- Set `NEXT_PUBLIC_MOCK_PRODUCT_URL` only for local/demo environments.
- Register allowed host domains before tightening CORS for production.
- Keep response submission public, but validate input and rate limit it.
- Protect project management and export endpoints with authentication before exposing real customer data.
