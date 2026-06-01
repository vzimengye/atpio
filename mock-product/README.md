# Mock Product

This is a separate local host product used to test Atpio integration.

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

