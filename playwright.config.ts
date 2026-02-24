import { defineConfig, devices } from '@playwright/test';
import { OrtoniReportConfig } from 'ortoni-report';
import EnvironmentDetector from './src/config/environment/detector/detector';
import { TIMEOUTS } from './src/config/timeouts/timeout.config';
import BrowserInitFlag from './src/config/browserInitFlag';
import { AuthStorageConstants } from './src/utils/auth/constants/authStorage.constants';
import * as os from 'os';
import * as path from 'path';

const isCI = EnvironmentDetector.isCI();
const shouldSkipBrowserInit = BrowserInitFlag.shouldSkipBrowserInit();
const isShardingEnabled = EnvironmentDetector.isShardingEnabled();

const parsePositiveInteger = (value: string | undefined, fallback?: number): number => {
  const parsedValue = Number.parseInt(value ?? '', 10);
  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Expected a positive integer value but received: ${value ?? 'undefined'}`);
};

const shardIndex = parsePositiveInteger(process.env.SHARD_INDEX, 1);
const shardTotal = parsePositiveInteger(process.env.SHARD_TOTAL, 1);
const workerCount =
  process.env.PLAYWRIGHT_WORKERS !== undefined
    ? parsePositiveInteger(process.env.PLAYWRIGHT_WORKERS)
    : isCI
      ? Math.max(1, os.cpus().length - 1)
      : Math.max(1, Math.floor(os.cpus().length / 2));

const authFileName = EnvironmentDetector.isCI()
  ? AuthStorageConstants.CI_AUTH_FILE
  : AuthStorageConstants.LOCAL_AUTH_FILE;
const storageStatePath = path.join(AuthStorageConstants.DIRECTORY, authFileName);

const reportConfig: OrtoniReportConfig = {
  open: process.env.ORTONI_OPEN === 'always' && !isCI ? 'always' : 'never',
  folderPath: 'ortoni-report',
  filename: 'index.html',
  logo: undefined,
  title: 'Test Automation Report',
  projectName: process.env.PROJECT_NAME || 'Test Automation',
  testType: process.env.TEST_TYPE || 'Regression | Sanity',
  authorName: process.env.AUTHOR_NAME || '',
  base64Image: false,
  stdIO: false,
  meta: {
    project: process.env.npm_package_name || 'test-automation-framework',
    description: 'Test automation runs for UI, API, and integration tests',
    platform: process.env.TEST_PLATFORM || 'Windows',
    environment: process.env.ENV || 'uat',
  },
};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// Debug log to verify worker count calculation

export default defineConfig({
  timeout: TIMEOUTS.test,
  expect: {
    timeout: TIMEOUTS.expect,
  },
  testDir: './tests',
  globalSetup: './src/config/environment/global/globalEnvironmentSetup.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!isCI,
  /* Retry on CI only */
  shard: isShardingEnabled
    ? {
        current: shardIndex,
        total: shardTotal,
      }
    : undefined,

  workers: workerCount,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'results.xml' }],
    ['ortoni-report', reportConfig],
    ['dot'],
    ['playwright-trx-reporter', { outputFile: 'results.trx' }],
  ],
  grep:
    typeof process.env.PLAYWRIGHT_GREP === 'string'
      ? new RegExp(process.env.PLAYWRIGHT_GREP)
      : process.env.PLAYWRIGHT_GREP || /.*/,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    screenshot: isCI ? 'on' : 'on',
    trace: isCI ? 'retain-on-failure' : 'on',
    video: isCI ? 'on' : 'on',
    headless: isCI ? true : false,

    // Add these browser launch options for Azure DevOps
    launchOptions: {
      args: isCI
        ? [
            // ESSENTIAL (Must have for CI stability)
            '--no-sandbox', // Prevents permission failures in container
            '--disable-dev-shm-usage', // Prevents memory crashes in Docker
            '--disable-gpu', // Prevents GPU crashes in headless CI

            // PERFORMANCE (Recommended for consistent test execution)
            '--disable-background-timer-throttling', // Ensures consistent timing
            '--disable-backgrounding-occluded-windows', // Maintains performance in headless
            '--disable-renderer-backgrounding', // Keeps rendering at full speed

            // STABILITY (Additional reliability)
            '--disable-extensions', // Removes extension interference
            '--disable-plugins', // Prevents plugin issues
            '--no-first-run', // Skips first-run setup
            '--disable-default-apps', // Removes default app prompts
            '--disable-translate', // Prevents translation popups
          ]
        : [],
    },
  },

  /* Configure projects for major browsers */
  projects: [
    /*
     * Project configuration with conditional browser setup:
     *
     * 1. When shouldSkipBrowserInit is FALSE (normal mode):
     *    - We include the "setup" project that handles browser initialization
     *    - The "setup" project runs tests matching the *.setup.ts pattern
     *    - The "chromium" project depends on "setup" to ensure proper sequencing
     *    - This ensures authentication is properly established before tests run
     *
     * 2. When shouldSkipBrowserInit is TRUE (performance optimization):
     *    - We completely skip the "setup" project (empty array is spread)
     *    - The "chromium" project has no dependencies (empty dependencies array)
     *    - This optimization is useful for operations that don't need browser context
     *      like crypto or database-only operations
     *
     * In both cases, the "chromium" project uses the authentication state from
     * the file path specified in authStorageFilePath.
     */
    ...(!shouldSkipBrowserInit
      ? [
          {
            name: 'setup',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /.*\.setup\.ts/,
          },
        ]
      : []),
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: storageStatePath,
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: shouldSkipBrowserInit ? [] : ['setup'],
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], storageState: storageStatePath },
    //   dependencies: shouldSkipBrowserInit ? [] : ['setup'],
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'], storageState: storageStatePath },
    //   dependencies: shouldSkipBrowserInit ? [] : ['setup'],
    // },
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !isCI,
  // },
});
