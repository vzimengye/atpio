# Mock Product

This is a separate host product used to test Atpio integration. It can run
locally on port 4000 or as its own Vercel static project.

Run Atpio in one terminal:

```bash
npm run dev
```

Run this mock product in a second terminal:

```bash
npm run mock-product
```

Open:

```text
http://127.0.0.1:4000
```

The page loads Atpio from:

```html
<script
  src="http://127.0.0.1:3000/gadget.js"
  data-project-id="project_onboarding_feedback">
</script>
```

That verifies the intended local experiment:

```text
Mock product on localhost:4000
        |
        | calls script API
        v
Atpio on localhost:3000/gadget.js
        |
        | opens iframe
        v
Atpio form on localhost:3000/embed/project_onboarding_feedback
```

## Deploy This Mock Product to Vercel

Create a second Vercel project from the same GitHub repo:

```text
Repository: vzimengye/atpio
Root Directory: mock-product
Framework Preset: Other
Build Command: npm run build
Output Directory: leave blank
Install Command: npm install
```

The deployed mock product defaults to loading Atpio from:

```text
https://atpio.vercel.app
```

No Atpio backend code runs inside this mock project. It only loads:

```text
https://atpio.vercel.app/gadget.js
```

and injects the latest saved Atpio project into an iframe.
