import { Page, Locator } from '@playwright/test';
import BasePage from '../base/basePage';
import ErrorHandler from '../../utils/errors/errorHandler';

/**
 * Generic post-login page used to verify successful authentication.
 * Replace the locator below with an element that is visible only after login
 * (e.g. dashboard heading, main menu, or search box).
 */
export class ExamplePage extends BasePage {
  readonly page: Page;
  /** Update this locator to match your application's post-login indicator */
  private readonly postLoginIndicator: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.postLoginIndicator = this.page.locator('[data-testid="dashboard"], #dashboard, h1').first();
  }

  /**
   * Verifies that the post-login view is visible (confirms successful login).
   * Update the locator in the constructor to match your app.
   */
  async isPostLoginVisible(): Promise<void> {
    try {
      await this.verifyElementState(
        this.postLoginIndicator,
        'visible',
        'Post-login indicator (dashboard/search/heading)',
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'isPostLoginVisible',
        'Post-login indicator is not visible',
      );
      throw error;
    }
  }

  /** Alias for auth setup; update if your app uses a dedicated search box as the indicator */
  async isSearchBoxVisible(): Promise<void> {
    await this.isPostLoginVisible();
  }
}
