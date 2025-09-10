# Deployment Notes

- Root build: `npm run build` (executes build in `project/` and outputs to root `dist/`).
- Netlify config: `netlify.toml` publishes `dist/` from repo root.
- If Netlify UI overrides exist, set:
  - Base directory: (empty)
  - Build command: `npm run build`
  - Publish directory: `dist`