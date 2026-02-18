import { test as baseTest, Page, TestInfo } from '@playwright/test';
import AuthStorageManager from '../src/utils/auth/storage/authStorageManager';
import { EnvironmentResolver } from '../src/config/environment/resolver/environmentResolver';
import { FetchCIEnvironmentVariables } from '../src/config/environment/resolver/fetch/fetchCIEnvironmentVariables';
import { FetchLocalEnvironmentVariables } from '../src/config/environment/resolver/fetch/fetchLocalEnvironmentVariables';
import FileSystemManager from '../src/utils/fileSystem/fileSystemManager';
import AuthenticationFilter from '../src/utils/auth/authenticationFilter';
import { BrowserSessionManager } from '../src/utils/auth/state/browserSessionManager';
import logger from '../src/utils/logging/loggerManager';

import { LoginPage } from '../src/ui/pages/loginPage';
import { ExamplePage } from '../src/ui/pages/examplePage';

type ConfiguratorTestFixtures = {
  shouldSaveAuthState: boolean;
  browserSessionManager: BrowserSessionManager;
  environmentResolver: EnvironmentResolver;
  fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
  fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;
  testInfo: TestInfo;
  loginPage: LoginPage;
  examplePage: ExamplePage;
};

const configuratorTests = baseTest.extend<ConfiguratorTestFixtures>({
  shouldSaveAuthState: [true, { option: true }],

  browserSessionManager: async ({ page, environmentResolver, loginPage }, use) => {
    await use(new BrowserSessionManager(page, environmentResolver, loginPage));
  },

  fetchCIEnvironmentVariables: async ({}, use) => {
    await use(new FetchCIEnvironmentVariables());
  },
  fetchLocalEnvironmentVariables: async ({}, use) => {
    await use(new FetchLocalEnvironmentVariables());
  },
  environmentResolver: async (
    { fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables },
    use,
  ) => {
    await use(new EnvironmentResolver(fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables));
  },
  testInfo: async ({}, use) => {
    await use(baseTest.info());
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  examplePage: async ({ page }, use) => {
    await use(new ExamplePage(page));
  },

  context: async ({ browser, shouldSaveAuthState }, use, testInfo) => {
    let storageState: string | undefined;

    const shouldSkipAuth = AuthenticationFilter.shouldSkipAuthSetup(testInfo, [
      'invalid credentials',
      'non-existing user',
    ]);

    if (shouldSaveAuthState && !shouldSkipAuth) {
      const storagePath = await AuthStorageManager.resolveAuthStateFilePath();
      const fileExists = await FileSystemManager.doesFileExist(storagePath);

      if (fileExists) {
        storageState = storagePath;
        logger.info(`Using auth state from: ${storagePath}`);
      } else {
        logger.warn(
          `Auth state file not found at: ${storagePath}. Please run the authentication setup first.`,
        );
        storageState = undefined;
      }
    } else {
      logger.info(`Skipping auth state for test: ${testInfo.title}`);
      storageState = undefined;
    }

    const context = await browser.newContext({
      storageState,
      recordVideo: {
        dir: 'test-results/',
        size: { width: 1920, height: 1080 },
      },
    });

    const pages: Page[] = [];
    context.on('page', (page) => pages.push(page));

    await use(context);

    await context.close();

    for (const page of pages) {
      const video = page.video();
      if (video) {
        try {
          const videoPath = await video.path();
          await testInfo.attach('video', {
            path: videoPath,
            contentType: 'video/webm',
          });
        } catch (err) {
          logger.warn(`Failed to attach video: ${err}`);
        }
      }
    }
  },
});

export const test = configuratorTests;
export const expect = baseTest.expect;
