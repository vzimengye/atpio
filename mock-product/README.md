# Demo Product

This folder is a separate host product used to test Atpio integration. It does not run any Atpio backend code. It only loads Atpio's public `gadget.js` script, just like a customer's website would.

## Local Test

Run Atpio in one terminal:

```bash
npm run dev
```

Run the demo product in a second terminal:

```bash
npm run mock-product
```

Open:

```text
http://127.0.0.1:4000
```

To test a specific Atpio account workspace, open:

```text
http://127.0.0.1:4000?workspaceKey=YOUR_WORKSPACE_KEY
```

## How It Connects

```text
Demo product on localhost:4000
        |
        | loads script
        v
Atpio on localhost:3000/gadget.js
        |
        | opens iframe
        v
Atpio form on localhost:3000/embed/[projectId]
```

## Deploy This Demo Product to Vercel

Create a second Vercel project from the same GitHub repo:

```text
Repository: vzimengye/atpio
Root Directory: mock-product
Framework Preset: Other
Build Command: npm run build
Output Directory: leave blank
Install Command: npm install
```

The deployed demo product defaults to loading Atpio from:

```text
https://atpio.vercel.app
```

For production customer sites, use the full integration guide:

```text
https://atpio.vercel.app/resources/mock-product-integration-skill
```
