---
trigger: always_on
alwaysApply: true
---

## 1) Mission and mindset
- Deliver running, production-grade software, not prototypes.
- Prefer strong typing (TypeScript, Kotlin), real APIs or realistic mocks, robust error handling, tests, linting, and CI from day 1.
- If critical info is missing, ask focused questions; otherwise proceed with sane defaults and document them clearly.

## 2) Plan before you code
- Confirm scope, key features, data sources, auth, target platforms, deployment, and acceptance criteria.
- Produce a short task plan with milestones and a Definition of Done.
- Maintain a running CHANGELOG of decisions and changes.

## 3) Environment and toolchain
- Detect and log OS, CPU, RAM, and key tool versions before setup.
- Node: use Node 22 LTS; enforce via .nvmrc/Volta and package.json "engines".
- Android: JDK 17, latest stable Android Gradle Plugin (AGP), Gradle wrapper, Kotlin, and Compose; compileSdk/targetSdk = latest stable; Kotlin DSL; AndroidX.
- Use version managers (nvm/Volta, SDKMAN/Android SDK). Pin via tool files. Never change global system settings without permission.

## 4) Dependency and version policy
- Always prefer latest stable versions for new projects. For existing projects: update to latest minor/patch by default; major if migration is low-risk and documented.
- Node:
  - Prefer pnpm (fast, deterministic). If unspecified, choose pnpm; otherwise respect existing manager.
  - Update flow: npx npm-check-updates -u, then install and handle breaking changes; commit lockfile.
  - Verify with npm outdated and npm audit (or pnpm equivalents).
- Gradle/Android:
  - Use the Versions Plugin: ./gradlew dependencyUpdates -Drevision=release
  - Manage with version catalogs (libs.versions.toml).
  - Follow official migration notes for AGP/Kotlin/Compose.
- Enable Renovate/Dependabot for ongoing updates.

## 5) Terminal discipline and execution safety
- Run commands only from the correct directory; echo the command and its intent before executing.
- Use bash strict mode in scripts: set -Eeuo pipefail; log with tee -a logs/build.log.
- Always wait for command completion. Read full stdout/stderr. Proceed only if exit code == 0.
- Never run new commands while another is running. Avoid multiple concurrent dev servers/emulators.
- On error:
  - Identify the first failing line and root cause.
  - Apply minimal, targeted fixes. Rerun only the necessary step.
  - Do not ignore warnings that indicate potential failures (e.g., type errors).
- Avoid sudo in project contexts; avoid destructive commands (rm -rf) unless narrowly scoped and necessary.
- Verify outcomes:
  - Web: check the server port is listening and page responds.
  - Android: ensure Gradle build success; install and launch on emulator/device.

## 6) Source control hygiene
- Initialize git immediately; add comprehensive .gitignore; commit small, logical changes frequently.
- Conventional Commits for messages; feature-scoped branches and PRs.
- Never commit secrets or large binaries. Commit lockfiles for Node and the Gradle wrapper. Do not commit local SDK/NDK directories.

## 7) Code quality and consistency
- Enforce format/lint/type-check in dev and CI.
  - Web: TypeScript, ESLint, Prettier, tsc.
  - Android: ktlint or Spotless, detekt, Android Lint; treat warnings as errors in CI where feasible.
- Add pre-commit hooks (Husky/pre-commit) to run linters/tests on staged files.
- Keep a consistent, documented project structure with clear separation of concerns.

## 8) Testing and verification
- Minimum baseline:
  - Web: unit tests (Vitest/Jest + Testing Library) and one Playwright smoke E2E.
  - Android: unit tests (JUnit), Robolectric or instrumented tests for core logic, and one UI test (Espresso/Compose) that launches the main screen.
- CI must run: lint, type-check, unit tests, E2E/UI smoke, and production build.
- Add a health endpoint (web) and a launch smoke test (Android) to validate runtime.

## 9) Security and secrets
- Never hardcode credentials.
  - Web: .env + .env.example + runtime config validation (e.g., zod).
  - Android: local.properties/gradle.properties for local; CI secrets for pipelines.
- Dependency and secret scanning:
  - Web: npm audit or snyk.
  - Android: OWASP dependency-check (or equivalent) and Android Lint security checks.
- Sanitize logs; do not print secrets; validate all external inputs.

## 10) Builds, packaging, and artifacts
- Web:
  - Production build must succeed and be free of type errors (npm run build).
  - Optimize images, code-split, ensure SSR/SSG correctness if applicable.
  - Provide a start command using the production bundle; verify on a clean environment.
- Android:
  - Build debug and release variants: ./gradlew :app:assembleDebug :app:bundleRelease
  - Release: enable R8 minify and shrinkResources; set versionCode/versionName; sign AAB or APK.
  - Verify install and launch on emulator/device.
- Attach build artifacts to CI as downloadable outputs.

## 11) Accessibility, performance, and UX baselines
- Web: keyboard navigation, ARIA labels, color contrast, responsive layout, lazy-load media.
- Android: contentDescription, TalkBack checks, dynamic type, strict mode in debug, avoid heavy main-thread work.
- Add error boundaries and user-friendly error states.

## 12) Documentation and developer experience
- Maintain an up-to-date README including:
  - Stack choices, requirements, setup, scripts, env vars, run/build/release steps, troubleshooting.
- Add ADRs for major decisions; document migration steps for major version bumps.
- Include API specs/OpenAPI where relevant; generate clients when possible.

## 13) CI/CD and automation
- Web (GitHub Actions example stages): install (cache deps) → lint/type-check → tests → build → upload artifacts → optional deploy.
- Android: set up JDK 17, sdkmanager components (accept licenses), cache Gradle, lint/tests/build, sign, upload artifacts; optional Play Console deploy.
- Fail the pipeline on any error; treat type/lint warnings as errors in CI where reasonable.

## 14) Web defaults
- Next.js + TypeScript + Tailwind + ESLint + Prettier.
- State: React Query or server actions where appropriate.
- Tests: Playwright (E2E), Vitest/Jest (unit).
- Include: Home, 404, 500, /api/health; SEO meta + canonical; robots.txt/sitemap when applicable.

## 15) Android defaults
- Kotlin + Jetpack Compose + Material3 + Hilt + Coroutines + Retrofit/OkHttp + Room + Kotlinx Serialization + Navigation Compose.
- Build:
  - compileSdk/targetSdk: latest stable
  - minSdk: 24+ unless otherwise required
  - Kotlin/AGP: latest stable; Gradle wrapper latest
- Release: R8 minify, shrinkResources, basic ProGuard rules; sealed error models; resilient network handling.

## 16) Data and integrations
- Prefer real APIs; if unavailable, implement a realistic mock server with identical contracts and toggle via env.
- Use schema/migration tooling (Prisma/Drizzle for Node; Room migrations for Android).
- Validate request/response schemas (zod/kotlinx.serialization).

## 17) Error protocol
- Capture: command, exit code, error excerpt, probable cause(s).
- Propose: a ranked list of fixes with reasoning; apply the safest one first.
- If blocked by external factors (e.g., missing credentials, quota, tool not installed), pause and ask for the minimum info needed, with instructions to provide it.
- Do not continue past a red error; fix or get input.

## 18) Efficiency rules
- Prefer scaffolding over hand-rolling (create-next-app; Android Compose templates).
- Cache dependencies; parallelize independent steps; avoid unnecessary clean builds.
- Run fast feedback loops locally (lint/type-check/unit) before heavy builds or E2E.
- Keep watchers only when needed; stop them when switching tasks.

## 19) Never do this
- Do not claim success without executing and verifying runtime behavior.
- Do not leave TODOs or placeholders in delivered features.
- Do not bypass tests/lints/builds in CI.
- Do not commit secrets, keys, or private tokens.
- Do not “fix” by pinning outdated versions to bypass real issues (unless explicitly requested).

## 20) Definition of Done (checklists)

### Web DoD
- [ ] Repo initialized with git, Conventional Commits, proper .gitignore
- [ ] Node 22 LTS enforced; package manager chosen and consistent
- [ ] Latest stable deps installed; lockfile committed
- [ ] ESLint + Prettier + TypeScript configured; pre-commit hooks active
- [ ] At least 1 unit test and 1 Playwright smoke test passing
- [ ] Production build succeeds (npm run build) with zero type errors
- [ ] App serves in production mode; `/` and `/api/health` respond OK
- [ ] Accessibility basics: keyboard nav, ARIA labels on interactive elements
- [ ] `.env.example` complete; README updated with setup/run/build/deploy
- [ ] CI pipeline runs lint, type-check, tests, build, and uploads artifacts

### Android DoD
- [ ] Repo initialized; Gradle wrapper; Kotlin DSL; version catalogs
- [ ] JDK 17; latest Kotlin/AGP; compileSdk/targetSdk latest stable
- [ ] Latest stable library versions; no unresolved deprecations
- [ ] ktlint/Spotless, detekt, Android Lint configured; pre-commit hooks active
- [ ] Unit tests and 1 UI test that launches the main screen pass locally and in CI
- [ ] Debug and Release builds succeed; R8 minify and shrinkResources enabled for release
- [ ] App installs and launches on emulator/device without crashes
- [ ] Sensitive config in gradle/local.properties; no secrets committed
- [ ] README documents setup, SDKs, emulator, build, signing, and release steps
- [ ] CI builds, tests, lints, and produces signed artifacts (or unsigned if keys not provided)

## 21) Quick commands and checks

### Node/Web
```bash
nvm use 22 || volta pin node@22
pnpm dlx npm-check-updates -u && pnpm i
pnpm run lint && pnpm run type-check && pnpm test && pnpm build
pnpm dlx playwright install && pnpm run test:e2e
trigger: always_on
alwaysApply: true
---
