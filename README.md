# Test Automation Framework (Template)

## Overview

This is a **reusable test automation framework template** built with **Playwright** and **TypeScript**. It is designed for **scalability**, **security**, and **maintainability**, and is suitable for **UI**, **API**, and **database** test automation.

Use this template by cloning or copying it into a new project, then:

1. Configure environment variables (see [Environment Configurations](#environment-configurations)).
2. Update login and page object selectors for your application.
3. Add your test data and test cases.
4. Optionally customize CI (e.g. Azure Pipelines) and reporting.

### Features

- **Persistent authentication** – Reusable storage state to avoid repeated logins.
- **Environment-agnostic config** – Dev, UAT, and prod via `ENV` and `.env` files.
- **CI-aware** – Timeouts, sharding, and reporter behavior adapt to CI (e.g. Azure DevOps, GitHub Actions).
- **Modular structure** – Base page, page objects, fixtures, centralized logging and error handling.
- **Tagged runs** – e.g. `@sanity`, `@regression` via `PLAYWRIGHT_GREP`.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Configurations](#environment-configurations)
- [Project Setup for a New Application](#project-setup-for-a-new-application)
- [Running Tests](#running-tests)
- [Configuration Reference](#configuration-reference)
- [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

- **Node.js** (LTS, e.g. 20.x or 22.x)
- **npm** or **yarn**

### Install

```bash
npm install
npx playwright install
```

---

## Environment Configurations

Environment variables are managed under the `envs` directory.

1. Copy the template:
   - Copy `envs/.env.uat.template` to `envs/.env.uat` (and optionally `.env.dev`, `.env.prod`).
2. Fill in placeholders in the copied file(s):
   - `PORTAL_BASE_URL` – Application under test URL.
   - `PORTAL_USERNAME` / `PORTAL_PASSWORD` – Credentials for UI login.
   - `API_BASE_URL` – Base URL for API tests (if used).
   - Database and other variables as needed.

**Do not commit real credentials.** Add `envs/.env*` (except `*.template`) to `.gitignore` if not already.

### Encryption (optional)

The template supports encrypting sensitive env values (e.g. with Argon2). To use it:

- Configure your encryption flow (see `tests/encryption` if present).
- Run the encryption test to generate/update encrypted values and store the secret key in `.env` as required by your setup.

---

## Project Setup for a New Application

1. **Update login flow**
   - Edit `src/ui/pages/loginPage.ts`: adjust selectors (username, password, submit, error messages) to match your app.
   - Rename or keep `logintoAdminConfigurator`; ensure `BrowserSessionManager.performLogin()` uses the correct method.

2. **Post-login verification**
   - Edit `src/ui/pages/examplePage.ts`: replace the placeholder locator with an element that is visible only after successful login (e.g. dashboard heading or menu).
   - Use this page in `tests/ui/authSession.setup.ts` so the setup project saves auth state only after a successful login.

3. **Test data**
   - Update `src/testData/configurator.json` (or rename to `testData.json`) with your error messages and test data.
   - Reference this file in your specs where needed.

4. **Add page objects and tests**
   - Add new page classes under `src/ui/pages/` extending `BasePage`.
   - Register them in `fixtures/configurator.fixture.ts` (or your main fixture).
   - Add specs under `tests/ui/`, `tests/api/`, etc.

5. **CI**
   - Update `azure-pipelines.yml` (or your CI config): variable group name, pipeline name, and notification emails.
   - Ensure CI provides the same env vars as in your `.env.*` template (often with a `CI_` prefix; see `FetchCIEnvironmentVariables`).

---

## Running Tests

| Command               | Description                    |
|----------------------|--------------------------------|
| `npm run test:ui:dev`  | UI tests (dev env)             |
| `npm run test:ui:uat`  | UI tests (UAT env)             |
| `npm run test:api:dev` | API tests (dev)                |
| `npm run test:api:uat` | API tests (UAT)                |
| `npm run test:all:uat` | All tests (UAT)                |
| `npm run test:failed:uat` | Re-run last failed (UAT)   |
| `npm run ui`           | Playwright UI mode             |
| `npm run report`       | Open HTML report               |

Example with tag:

```bash
npx cross-env ENV=uat PLAYWRIGHT_GREP=@sanity npm run test:ui:uat
```

---

## Configuration Reference

- **Timeouts** – `src/config/timeouts/timeout.config.ts` (CI multiplier applied automatically).
- **Environment detection** – `src/config/environment/detector/detector.ts` (CI, ENV, sharding).
- **Auth storage** – `src/utils/auth/` (paths under `.auth/`, e.g. `local-login.json`, `ci-login.json`).
- **Playwright** – `playwright.config.ts` (projects, reporters, storage state path).

---

## Best Practices

- Run `npm install` after clone and when switching branches.
- Use the auth setup project so most tests reuse stored session state.
- Keep selectors and test data in page objects and JSON; avoid hardcoding in specs.
- Do not commit `.env` files with real credentials; use templates and CI variable groups/secrets.

---

## Further Reading

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Auth](https://playwright.dev/docs/auth)
- [Playwright Config](https://playwright.dev/docs/test-configuration)
