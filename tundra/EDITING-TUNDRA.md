# Editing TUNDRA on your computer

This is a source-code snapshot of TUNDRA, exported 22 October 2026.
Source commit: 12e8e98dc3ca5548d7c5b8b9d83c62746c4845b0

## Start editing

1. Extract the ZIP and open the `tundra` folder in VS Code or another code editor.
2. Install Node.js compatible with the project's package.json (Node 22.13.0 or newer) and pnpm. The project specifies pnpm 11.25.0.
3. In a terminal inside the `tundra` folder, run:

   pnpm install --frozen-lockfile
   pnpm dev

4. Open the localhost address printed in the terminal (normally http://localhost:5173).
5. Change files and save them. The local development server refreshes the page.

## Where to edit

- app/storefront.tsx: homepage, navigation, catalogue display, bag, and marketing popup.
- app/hero-carousel.tsx: rotating homepage banners and their wording.
- app/globals.css: colours, type, spacing, responsive layouts, and animations.
- app/catalog.ts and app/catalog-data.json: catalogue descriptions and references to images.
- app/product/[id]/page.tsx: product-page layout.
- public/products/: product images.

## Check and build

   pnpm exec tsc --noEmit
   pnpm build

This is a React/TypeScript application built with Vinext, Vite, and Cloudflare Worker integrations, not a single HTML page or a drag-and-drop template. See README.md for the runtime details.

## Editing versus publishing

Edits on your computer do not automatically update the existing TUNDRA website. Keep your changes in a Git repository for version history. You can bring the changed files back to the Sites project for publication, or arrange compatible external hosting.

Moving to another host requires adapting the Cloudflare D1 database bindings and platform-specific sign-in. The existing ChatGPT sign-in headers must not be trusted on an unprotected external deployment. Account and order features will need the new host's authentication and database configuration. Keep secret values on the server.

A visual website builder requires a separate migration/rebuild; this export is the editable application source, not a builder import file.

## What is included

Tracked source files, product images, dependency lockfile, build scripts, database schema and migrations, and existing setup notes. The .openai/hosting.json file records the existing Sites project identity.

No node_modules, generated build output, Git history, local environment files, credentials, live database contents, customer records, or Wix account connection is included. This export makes no changes to the live site or its checkout state.
