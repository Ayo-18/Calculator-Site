# Calculator-Site

A React calculator with **Standard** and **Scientific** modes, live result preview, and memory functions.

🔗 **Live site:** https://ayo-18.github.io/Calculator-Site/ (see [Deploy](#deploy-to-github-pages) below to turn this on)

## Features

- Standard arithmetic (+, −, ×, ÷, %)
- Scientific mode: sin, cos, tan, log, ln, x², xʸ, √, memory, and more
- **Engineering mode**: base converter, bitwise ops, logic gates, subnet calculator, hash generator, VLSM planner
- **Currency converter** (💱 icon): convert between 25+ currencies using live daily market exchange rates — opens as a quick popup, no need to leave your current mode
- **History** (🕘 icon): every calculation is saved (locally on your device) — tap one to reuse it, or clear it anytime
- Delete (⌫) and clear (AC) keys, with matching Backspace/Escape keyboard shortcuts
- Adapts to phone or desktop automatically — popups open as a bottom sheet on phones and a centered dialog on desktop
- Live preview before pressing `=`
- Side-by-side layout in Scientific mode
- Keyboard support

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3456](http://localhost:3456)

Or double-click **`START CALCULATOR.bat`** on Windows.

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and publishes the site to GitHub Pages every time you push to `main`.

**One-time setup** (only needed once per repo):

1. Go to `https://github.com/Ayo-18/Calculator-Site/settings/pages`
2. Under **Build and deployment → Source**, select **GitHub Actions**

After that, every push to `main` triggers a build and the live site updates automatically at:

```
https://ayo-18.github.io/Calculator-Site/
```

You can also trigger a deploy manually from the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

## Collaborators

Repository owner: [Ayo-18](https://github.com/Ayo-18)

> **Note:** Collaborators are managed on GitHub only (Settings → Collaborators). Cursor/AI tools are not added as repository collaborators.

## Tech stack

- React 19
- Vite 6
