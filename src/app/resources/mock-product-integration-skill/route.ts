const skillMarkdown = `# Atpio Mock Product Integration

Use this guide when you want to install an Atpio feedback gadget in your own website or product.

## Recommended: workspace embed

This mode follows the active project selected inside the Atpio account.

\`\`\`html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-atpio-workspace-key="YOUR_WORKSPACE_KEY"
  data-atpio-position="bottom-right"
  data-atpio-label="Share feedback"
></script>
\`\`\`

How it works:

1. Create or sign in to an Atpio account.
2. Create a feedback project.
3. Mark the project active for embeds in Atpio.
4. Add the script above to your product.
5. Public users submit feedback without signing in.

If no active project is selected, Atpio loads the newest project in that workspace.

## Fixed project embed

Use this when the host product should always load one specific Atpio project.

\`\`\`html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-project-id="YOUR_PROJECT_ID"
  data-atpio-position="bottom-right"
  data-atpio-label="Share feedback"
></script>
\`\`\`

## Optional metadata

Attach host-product context to every submitted response:

\`\`\`html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-atpio-workspace-key="YOUR_WORKSPACE_KEY"
  data-atpio-meta-page="pricing"
  data-atpio-meta-user-segment="trial"
  data-atpio-meta-experiment-id="onboarding-v2"
></script>
\`\`\`

## Events

\`\`\`js
window.addEventListener("atpio:open", function (event) {
  console.log("Atpio opened", event.detail);
});

window.addEventListener("atpio:close", function (event) {
  console.log("Atpio closed", event.detail);
});

window.addEventListener("atpio:success", function (event) {
  console.log("Atpio submitted", event.detail);
});
\`\`\`

## Local test

1. Start Atpio on \`http://127.0.0.1:3000\`.
2. Start the mock product on \`http://127.0.0.1:4000\`.
3. Open the mock product with \`?workspaceKey=YOUR_WORKSPACE_KEY\`.
4. Confirm the feedback button opens the Atpio iframe.
5. Submit feedback and confirm the response appears in Atpio.
`;

export async function GET() {
  return new Response(skillMarkdown, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Disposition":
        'attachment; filename="atpio-mock-product-integration-skill.md"',
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
