# HamiFormer

Project website for HamiFormer.

## Local development

Requires Node.js 22 and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Deployment

Place this directory's contents at the root of the `HamiFormer.github.io` repository on the `main` branch. Include `.github/workflows/deploy.yml` and `.gitignore`.

In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. Pushing to `main` then builds and deploys the website to https://hamiformer.github.io/.

Paper links display a TODO tooltip and remain inactive. No paper PDF is included.

Animations use lossless WebP. Fonts are bundled locally during the build.
