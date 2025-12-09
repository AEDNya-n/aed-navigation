# Copilot Instructions for `aed-navigation`

1. **Mission + Scope**
   - Single-page Vite + TypeScript client meant to help users locate nearby AED facilities.
   - Current code is default Vite counter; use `docs/sequence.md` to understand the intended data flow when implementing new features (CSV fetch → filter → geolocation → map render → next candidate cycling).

2. **Entry Points + Assets**
   - `index.html` only mounts `#app` and loads `/src/main.ts` via `<script type="module">`; keep all UI work inside `src/` and use ES module imports (`allowImportingTsExtensions` is enabled, so you can import `.ts` explicitly).
   - `src/main.ts` currently wires the counter demo; replace this file when introducing real UI logic.
   - `src/counter.ts` holds the example component; remove it once feature development starts.
   - Global styles live in `src/style.css`; Vite hot-reloads CSS when imported at the top of `main.ts`.

3. **Data + Flow Expectations**
   - The product will request facility CSV data from the backend, filter client-side, obtain the browser geolocation, and present the top 5 nearest options; use the Mermaid sequence in `docs/sequence.md` as the contract for new functionality.
   - Plan for iterative navigation: a "Next" action cycles through remaining facilities without reloading data.
   - CSV ingestion + map rendering strategy is undecided—document choices (e.g., Papaparse, Leaflet) in PRs when you introduce them.

4. **TypeScript + Build Rules**
   - Strict TS is enforced (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`, etc. in `tsconfig.json`); resolve unused symbols immediately rather than `eslint-disable` workarounds.
   - Target `ES2022` in the browser; prefer modern APIs (fetch, async/await) and avoid polyfills unless absolutely needed.
   - Keep modules side-effect free where possible; bundler mode expects explicit exports/imports.

5. **Developer Workflow**
   - Install deps once with `npm install`.
   - `npm run dev` → Vite dev server with HMR; default port 5173.
   - `npm run build` → `tsc` type-check then `vite build` output; fix type errors before bundling.
   - `npm run preview` → serve the production bundle locally; useful when testing Vite plugins or static asset references.

6. **Project Conventions**
   - Keep documentation under `docs/`; extend `docs/sequence.md` when high-level flows change.
   - Favor functional composition over classes for UI helpers; Vite tree-shaking benefits from flat modules.
   - Reference assets via the Vite-aware paths (e.g., `/vite.svg`, imported `.svg` files) rather than relative URLs from `public/`.
   - Commit messages and PRs should state which sequence-step they implement to maintain clarity on progress toward the navigation experience.

Provide feedback if any workflow or architectural detail remains unclear so we can expand this guide.
