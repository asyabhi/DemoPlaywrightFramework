import { test as authSession } from '../../fixtures/configurator.fixture';
import logger from '../../src/utils/logging/loggerManager';

authSession(
  `Authenticate @sanity @regression`,
  async ({ browserSessionManager, environmentResolver, examplePage }) => {
    const { username, password } = await environmentResolver.getPortalCredentials();

    await browserSessionManager.performLogin(username, password, true);
    await examplePage.isSearchBoxVisible();

    logger.info('Authentication session state setup completed and saved successfully');
  },
);
