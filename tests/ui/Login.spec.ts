import { test } from '../../fixtures/configurator.fixture';
import { errorMessages } from '../../src/testData/configurator.json';
import logger from '../../src/utils/logging/loggerManager';

test.describe(`Login - Login Flow @regression`, () => {
  test.beforeEach(async ({ environmentResolver, loginPage }) => {
    const resolvedUrl = await environmentResolver.getPortalBaseUrl();
    await loginPage.navigateToUrl(resolvedUrl);
  });

  test.afterEach(async ({ page }) => {
    if (page && !page.isClosed()) {
      await page.close();
    }
  });

  test('Verify user can login successfully with valid credentials @sanity @regression', async ({
    loginPage,
    examplePage,
  }) => {
    await loginPage.isInvalidCredentialsErrorMessageNotVisible();
    await examplePage.isSearchBoxVisible();

    logger.info('User logged in successfully with valid credentials');
  });

  test('Verify login fail with invalid credentials @sanity @regression', async ({
    loginPage,
    environmentResolver,
    browserSessionManager,
  }) => {
    const { username } = await environmentResolver.getPortalCredentials();

    await browserSessionManager.performLogin(username, 'SomeInvalidPassword@xjd8..', false);
    await loginPage.isInvalidCredentialsErrorMessageVisible();
    logger.info('Login appropriately failed with invalid password');
  });

  test('Verify login fail with non-existing user @sanity @regression', async ({
    loginPage,
    browserSessionManager,
  }) => {
    await browserSessionManager.performLogin(
      'InvalidUsername@example.com',
      'SomeInvalidPassword@xjd8..',
      false,
    );

    await loginPage.isInvalidCredentialsErrorMessageVisible();
    await loginPage.validateErrorMessageIsCorrect(
      'invalidCredentials',
      errorMessages.invalidCredentials,
    );

    logger.info('Login failed with non-existing user and displayed correct error message');
  });
});
