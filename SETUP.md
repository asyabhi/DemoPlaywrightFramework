# Template Setup Checklist

Use this checklist when using this framework for a new project.

## 1. Environment

- [ ] Copy `envs/.env.uat.template` to `envs/.env.uat` (and `.env.dev` if needed).
- [ ] Set `PORTAL_BASE_URL` to your application URL.
- [ ] Set `PORTAL_USERNAME` and `PORTAL_PASSWORD` (or use encryption flow).
- [ ] Set `API_BASE_URL` if running API tests.

## 2. Login & post-login

- [ ] In `src/ui/pages/loginPage.ts`, update selectors to match your login page (username, password, submit, error messages).
- [ ] In `src/ui/pages/examplePage.ts`, set `postLoginIndicator` to an element visible only after successful login.

## 3. Test data

- [ ] Update `src/testData/configurator.json`: at least `errorMessages.invalidCredentials` and `errorMessages.incorrectEmail` to match your app’s messages.

## 4. CI (optional)

- [ ] In `azure-pipelines.yml`, set `variables.group` to your variable group name.
- [ ] Configure SMTP and `toAddress` for email notifications.
- [ ] Ensure your variable group provides: `PORTAL_BASE_URL`, `API_BASE_URL`, `PORTAL_USERNAME`, `PORTAL_PASSWORD` (or CI_* equivalents as expected by `FetchCIEnvironmentVariables`).

## 5. Reporting (optional)

- [ ] In `playwright.config.ts`, set `reportConfig.logo` to your logo path if desired.
- [ ] Set env vars `PROJECT_NAME`, `AUTHOR_NAME`, `TEST_TYPE` if you use them in reports.

## 6. Add tests

- [ ] Add new page objects under `src/ui/pages/` extending `BasePage`.
- [ ] Register new pages in `fixtures/configurator.fixture.ts`.
- [ ] Add specs under `tests/ui/`, `tests/api/`, etc.

After setup, run:

```bash
npm install
npx playwright install
npm run test:ui:uat
```
