import { Frame, Locator, Page, expect, Response } from '@playwright/test';
import type { Cookie, Download } from '@playwright/test';
import SanitizationConfig from '../../utils/sanitization/sanitizationConfig';
import EnvironmentDetector from '../../config/environment/detector/detector';
import AsyncFileManager from '../../utils/fileSystem/fileSystemManager';
import { getTimeoutWithMultiplier } from '../../config/timeouts/timeout.config';
import * as fs from 'fs';
import ErrorHandler from '../../utils/errors/errorHandler';
import logger from '../../utils/logging/loggerManager';
import { RetryHandler } from '../../config/retry/retryConfig';

export default class BasePage {
  public readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async performAction<T>(
    action: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string,
  ): Promise<T> {
    try {
      const result = await action();
      if (successMessage) logger.info(successMessage);
      return result;
    } catch (error) {
      ErrorHandler.captureError(error, 'performAction', errorMessage);
      throw error;
    }
  }

  /**
   * Navigation
   */
  public navigateToUrl(url: string): Promise<Response | null> {
    return this.performAction(
      () => this.page.goto(url),
      `Navigated to ${url}`,
      `Failed to navigate to ${url}`,
    );
  }

  /**
   * Refresh the current page
   */
  public refreshPage(): Promise<Response | null> {
    return this.performAction(
      () => this.page.reload(),
      'Page refreshed successfully',
      'Failed to refresh page',
    );
  }

  /**
   * Verify current URL
   */
  public verifyPageUrl(
    expectedUrl: string,
    options: { exact?: boolean; contains?: boolean } = { exact: true },
  ): Promise<void> {
    return this.performAction(
      async () => {
        const currentUrl = this.getCurrentUrl();

        if (options.contains) {
          expect(currentUrl).toContain(expectedUrl);
        } else if (options.exact) {
          expect(currentUrl).toBe(expectedUrl);
        }
      },
      `URL verification passed: ${expectedUrl}`,
      `URL verification failed for: ${expectedUrl}`,
    );
  }

  /**
   * Verify page title
   */
  public verifyPageTitle(
    expectedTitle: string,
    options: { exact?: boolean; contains?: boolean } = { exact: true },
  ): Promise<void> {
    return this.performAction(
      async () => {
        const currentTitle = await this.getPageTitle();

        if (options.contains) {
          expect(currentTitle).toContain(expectedTitle);
        } else if (options.exact) {
          expect(currentTitle).toBe(expectedTitle);
        }
      },
      `Title verification passed: ${expectedTitle}`,
      `Title verification failed for: ${expectedTitle}`,
    );
  }

  public getCurrentUrl(): string {
    try {
      return this.page.url();
    } catch (error) {
      ErrorHandler.captureError(error, 'getCurrentUrl', 'Failed to get current URL');
      throw error;
    }
  }

  /**
   * Get current page title
   */
  public getPageTitle(): Promise<string> {
    return this.performAction(
      () => this.page.title(),
      'Retrieved page title',
      'Failed to get page title',
    );
  }

  /**
   * Get frame by name
   * @param frameName The name of the frame to retrieve
   * @returns The frame or null if not found
   */
  async getFrameByName(frameName: string): Promise<Frame | null> {
    return this.performAction(
      () => Promise.resolve(this.page.frame({ name: frameName })),
      `Retrieved frame: ${frameName}`,
      `Failed to get frame: ${frameName}`,
    );
  }

  /**
   * Element Interaction
   * Fills an input element with the specified value.
   * @param element The element locator.
   * @param value The value to enter in the element.
   * @param elementName The name of the element (optional), used for logging purposes.
   * If the element name contains any of the sensitive keys defined in the SanitizationConfig,
   * the entered value will be masked in the log message.
   * @param options Optional parameters for the fill action.
   * @param options.force A boolean indicating whether to force the fill action.
   */
  async fillElement(
    element: Locator,
    value: string,
    elementName?: string,
    options?: { force?: boolean },
  ) {
    // Get the current sanitization config
    const sanitizationConfig = SanitizationConfig.getDefaultParams();

    // Check if the element name contains any sensitive key
    const isSensitiveField =
      elementName &&
      sanitizationConfig.sensitiveKeys.some((key: string) =>
        elementName.toLowerCase().includes(key.toLowerCase()),
      );

    // Prepare the log message, masking value if sensitive
    const logValue = isSensitiveField ? sanitizationConfig.maskValue : value;
    const logMessage = `${elementName} filled successfully with value: ${logValue}`;

    await this.performAction(
      () => element.fill(value, { force: options?.force || false }),
      logMessage,
      `Error entering text in ${elementName}`,
    );
  }

  /**
   * Enter Text Sequentially
   * @param element The element locator.
   * @param text The text to enter sequentially.
   * @param elementName The name of the element (optional).
   */
  async enterTextSequentially(element: Locator, text: string, elementName?: string) {
    await this.performAction(
      async () => {
        await element.pressSequentially(text, { delay: 100 });
      },
      `Text '${text}' entered sequentially in ${elementName}`,
      `Error entering text sequentially in ${elementName}`,
    );
  }

  /**
   * Press Digits in Keyboard
   * @param element The element locator.
   * @param digits The string of digits to press.
   * @param elementName The name of the element.
   */
  async pressDigitsInKeyboard(element: Locator, keys: string, elementName: string) {
    await this.performAction(
      async () => {
        await this.focusElement(element, elementName);
        await this.pressKeyboardKeys(keys);
        await this.blurElement(element, elementName);
      },
      `Digits pressed sequentially in ${elementName}`,
      `Error pressing digits in ${elementName}`,
    );
  }

  /**
   * Clicks on an element.
   * @param element The element locator.
   * @param elementName The name of the element (optional), used for logging purposes.
   * @param options Optional parameters for the click action.
   * @param options.force A boolean indicating whether to force the click action.
   */
  async clickElement(
    element: Locator,
    elementName?: string,
    options?: { force?: boolean },
    timeout?: number,
  ) {
    await this.performAction(
      () => element.click({ force: options?.force || false, timeout: timeout }),
      `Clicked on ${elementName}`,
      `Error clicking on ${elementName}`,
    );
  }

  /**
   * Clear Element
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async clearElement(element: Locator, elementName?: string) {
    await this.performAction(
      () => element.clear(),
      `Cleared ${elementName}`,
      `Error clearing ${elementName}`,
    );
  }

  /**
   * Select Dropdown Option
   * @param element The element locator.
   * @param optionValue The value of the option.
   * @param elementName The name of the element (optional).
   */
  async selectDropdownOption(element: Locator, optionValue: string, elementName?: string) {
    const cleanOptionValue = optionValue.replace(/^["']|["']$/g, '');

    return this.performAction(
      () => element.selectOption(cleanOptionValue),
      `${elementName} option selected successfully with value: ${cleanOptionValue}`,
      `Error selecting option in ${elementName}`,
    );
  }

  /**
   * Focus on an element
   * @param element The element locator
   * @param elementName The name of the element (optional)
   */
  async focusElement(element: Locator, elementName?: string): Promise<void> {
    return this.performAction(
      () => element.focus(),
      `Focused on ${elementName}`,
      `Failed to focus on ${elementName}`,
    );
  }

  /**
   * Blur (unfocus) an element
   * @param element The element locator
   * @param elementName The name of the element (optional)
   */
  async blurElement(element: Locator, elementName?: string): Promise<void> {
    return this.performAction(
      () => element.blur(),
      `Blurred ${elementName}`,
      `Failed to blur ${elementName}`,
    );
  }

  /**
   * Hovers over an element
   * @param element The element locator
   * @param elementName The name of the element (optional)
   */
  async hoverElement(element: Locator, elementName?: string): Promise<void> {
    await this.performAction(
      async () => {
        await element.hover();
      },
      `Hovered on ${elementName}`,
      `Failed to hover on ${elementName}`,
    );
  }

  /**
   * Hover and Click on Element
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async hoverAndClickElement(element: Locator, elementName?: string): Promise<void> {
    await this.performAction(
      async () => {
        await this.hoverElement(element, elementName);
        await this.clickElement(element, elementName);
      },
      `Hovered and clicked on ${elementName}`,
      `Failed to hover and click on ${elementName}`,
    );
  }

  /**
   * Handle JavaScript alert/confirm/prompt dialogs
   * @param action Action to take: 'accept' or 'dismiss'
   * @param promptText Text to enter for prompt dialogs (optional, only used for prompt type)
   */
  async handleDialog(action: 'accept' | 'dismiss', promptText?: string): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      try {
        if (action === 'accept') {
          if (dialog.type() === 'prompt' && promptText !== undefined) {
            await dialog.accept(promptText);
          } else {
            await dialog.accept();
          }
        } else {
          await dialog.dismiss();
        }
        logger.info(
          `Dialog ${action}ed: ${dialog.type()}${promptText ? ` with text: "${promptText}"` : ''}`,
        );
      } catch (error) {
        ErrorHandler.captureError(error, 'handleDialog', `Failed to handle dialog`);
        throw error;
      }
    });
  }

  /**
   * Check a checkbox element
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async checkElement(element: Locator, elementName?: string): Promise<void> {
    await this.performAction(
      () => element.check({ force: true }),
      `${elementName} checked successfully`,
      `Failed to check ${elementName}`,
    );
  }

  /**
   * Press Keyboard Keys
   * @param keys The key or key combination to press.
   * @param description Description of the key action (optional).
   */
  async pressKeyboardKeys(keys: string, description?: string): Promise<void> {
    await this.performAction(
      () => this.page.keyboard.press(keys),
      `Pressed keyboard keys: ${keys} ${description ? `(${description})` : ''}`,
      `Failed to press keyboard keys: ${keys}`,
    );
  }

  /**
   * Double-click on an element
   * @param element The element locator
   * @param elementName The name of the element (optional)
   * @param options Optional parameters for the double-click action
   */
  async doubleClickElement(
    element: Locator,
    elementName?: string,
    options?: { force?: boolean },
  ): Promise<void> {
    await this.performAction(
      () => element.dblclick({ force: options?.force || false }),
      `Double-clicked on ${elementName}`,
      `Failed to double-click on ${elementName}`,
    );
  }

  /**
   * Right-click (context menu) on an element
   * @param element The element locator
   * @param elementName The name of the element (optional)
   * @param options Optional parameters for the right-click action
   */
  async rightClickElement(
    element: Locator,
    elementName?: string,
    options?: { force?: boolean },
  ): Promise<void> {
    await this.performAction(
      () => element.click({ button: 'right', force: options?.force || false }),
      `Right-clicked on ${elementName}`,
      `Failed to right-click on ${elementName}`,
    );
  }

  /**
   * Uncheck a checkbox element
   * @param element The element locator
   * @param elementName The name of the element (optional)
   */
  async uncheckElement(element: Locator, elementName?: string): Promise<void> {
    await this.performAction(
      () => element.uncheck({ force: true }),
      `${elementName} unchecked successfully`,
      `Failed to uncheck ${elementName}`,
    );
  }

  /**
   * Switch to a different browser tab/window
   * @param index Index of the tab to switch to (0-based)
   */
  async switchToTab(index: number): Promise<void> {
    await this.performAction(
      async () => {
        const pages = this.page.context().pages();
        if (index >= pages.length) {
          throw new Error(`Tab index ${index} does not exist. Total tabs: ${pages.length}`);
        }
        await pages[index].bringToFront();
      },
      `Switched to tab index ${index}`,
      `Failed to switch to tab index ${index}`,
    );
  }

  /**
   * Close current tab
   */
  async closeCurrentTab(): Promise<void> {
    await this.performAction(
      () => this.page.close(),
      'Current tab closed',
      'Failed to close current tab',
    );
  }

  /**
   * Uploads a file using either file chooser or input element
   * @param element The element locator
   * @param filePath The path to the file to be uploaded
   * @param method The upload method: 'fileChooser' or 'input'
   * @param elementName The name of the element (optional)
   */
  async uploadFile(
    element: Locator,
    filePath: string,
    method: 'fileChooser' | 'input',
    elementName?: string,
  ) {
    return this.performAction(
      async () => {
        if (method === 'fileChooser') {
          // Wait for fileChooser to be triggered
          const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.clickElement(element, elementName),
          ]);
          await fileChooser.setFiles(filePath);
          await this.waitForPageReady();
        } else {
          await element.setInputFiles(filePath);
        }
      },
      `File '${elementName}' uploaded successfully via ${method}: ${filePath}`,
      `Failed to upload file via ${method}`,
    );
  }

  /**
   * Drag and Drop Element
   * @param sourceElement The element to drag from
   * @param targetElement The element to drop to
   * @param sourceElementName The name of the source element (optional)
   * @param targetElementName The name of the target element (optional)
   * @param options Optional parameters for the drag and drop action
   * @param options.force A boolean indicating whether to force the action
   * @param options.sourcePosition Optional position within the source element
   * @param options.targetPosition Optional position within the target element
   */
  async dragAndDropElement(
    sourceElement: Locator,
    targetElement: Locator,
    sourceElementName?: string,
    targetElementName?: string,
    options?: {
      force?: boolean;
      sourcePosition?: { x: number; y: number };
      targetPosition?: { x: number; y: number };
    },
  ): Promise<void> {
    await this.performAction(
      async () => {
        await sourceElement.dragTo(targetElement, {
          force: options?.force || false,
          sourcePosition: options?.sourcePosition,
          targetPosition: options?.targetPosition,
        });
      },
      `Dragged ${sourceElementName || 'element'} to ${targetElementName || 'target'}`,
      `Failed to drag ${sourceElementName || 'element'} to ${targetElementName || 'target'}`,
    );
  }

  /**
   * Interact with Element in Frame
   * @param frameName The name attribute of the frame.
   * @param selector The selector of the element in the frame.
   * @param action The action to perform: 'click', 'fill', or 'check'.
   * @param value The value to fill (for 'fill' action only).
   * @param elementName The name of the element (optional).
   */
  async interactWithElementInFrame(
    frameName: string,
    selector: string,
    action: 'click' | 'fill' | 'check',
    value?: string,
    elementName?: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        const frame = await this.getFrameByName(frameName);
        if (!frame) throw new Error(`Frame '${frameName}' not found`);

        const element = frame.locator(selector);
        switch (action) {
          case 'click':
            await this.clickElement(element, elementName);
            break;
          case 'fill':
            if (value) await this.fillElement(element, value, elementName);
            break;
          case 'check':
            await this.checkElement(element, elementName);
            break;
        }
      },
      `Performed ${action} on ${elementName} in frame ${frameName}`,
      `Failed to perform ${action} on ${elementName} in frame ${frameName}`,
    );
  }

  /**
   * Get Element Property
   * @param element The element locator.
   * @param propertyType The type of property to retrieve: 'attribute', 'dimensions', 'text', 'completeText', 'inputValue'.
   * @param options Additional options depending on propertyType (e.g., attributeName for 'attribute' type).
   * @param elementName The name of the element (optional).
   * @returns The requested property value.
   */
  async getElementProperty<T>(
    element: Locator,
    propertyType: 'attribute' | 'dimensions' | 'visibleText' | 'textContent' | 'inputValue',
    options?: { attributeName?: string },
    elementName?: string,
  ): Promise<T> {
    return this.performAction(
      async () => {
        switch (propertyType) {
          case 'attribute':
            if (!options?.attributeName) {
              throw new Error("attributeName is required for 'attribute' property type");
            }
            return element.getAttribute(options.attributeName) as unknown as T;

          case 'dimensions': {
            const boundingBox = await element.boundingBox();
            if (!boundingBox) throw new Error('Failed to get element bounding box');
            return {
              width: boundingBox.width,
              height: boundingBox.height,
            } as unknown as T;
          }

          case 'visibleText':
            return element.innerText() as unknown as T;

          case 'textContent':
            return element.textContent() as unknown as T;

          case 'inputValue':
            return element.inputValue() as unknown as T;

          default:
            logger.error(`Unsupported property type: ${propertyType}`);
            throw new Error(`Unsupported property type: ${propertyType}`);
        }
      },
      `Retrieved ${propertyType} from ${elementName}`,
      `Failed to get ${propertyType} from ${elementName}`,
    );
  }

  async verifyElementState(
    element: Locator,
    state: 'enabled' | 'disabled' | 'visible' | 'hidden',
    elementName?: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        switch (state) {
          case 'enabled':
            await expect(element).toBeEnabled();
            break;
          case 'disabled':
            await expect(element).toBeDisabled();
            break;
          case 'visible':
            await expect(element).toBeVisible();
            break;
          case 'hidden':
            await expect(element).not.toBeVisible();
            break;
        }
        logger.info(`Element ${elementName} state is ${state}`);
      },
      `Element ${elementName} state is ${state}`,
      `Failed waiting for element ${elementName} to be ${state}`,
    );
  }

  /**
   * Waits for an element to reach a specified state.
   * @param element The element locator.
   * @param state The desired state: 'attached', 'detached', 'visible', or 'hidden'.
   * @param elementName The name of the element (optional), used for logging purposes.
   */

  async waitForElementState(
    element: Locator,
    state: 'attached' | 'detached' | 'visible' | 'hidden',
    elementName?: string,
  ) {
    await this.performAction(
      async () => {
        await element.waitFor({ state, timeout: 2000 });
      },
      `Element ${elementName} state is ${state}`,
      `Failed waiting for element ${elementName} to be ${state}`,
    );
  }

  /**
   * Wait for a selector to reach the specified state
   * @param selector CSS or XPath selector string
   * @param state The desired state: 'attached', 'detached', 'visible', or 'hidden'
   * @param elementName The name of the element (optional)
   * @param timeout Timeout in milliseconds (optional)
   */
  async waitForSelectorState(
    selector: string,
    state: 'attached' | 'detached' | 'visible' | 'hidden',
    elementName?: string,
    timeout?: number,
  ): Promise<void> {
    await this.performAction(
      async () => {
        await this.page.waitForSelector(selector, {
          state,
          timeout,
        });
      },
      `Selector ${elementName || selector} state is ${state}`,
      `Failed waiting for selector ${elementName || selector} to be ${state}`,
    );
  }

  /**
   * Wait for element to contain specific text
   * @param element The element locator
   * @param text The text to wait for
   * @param elementName The name of the element (optional)
   * @param timeout Timeout in milliseconds
   */
  async waitForElementText(
    element: Locator,
    text: string,
    elementName?: string,
    timeout?: number,
  ): Promise<void> {
    await this.performAction(
      () => expect(element).toContainText(text, { timeout }),
      `Element ${elementName} contains text: "${text}"`,
      `Failed waiting for ${elementName} to contain text: "${text}"`,
    );
  }

  /**
   * Check if element is currently visible without waiting
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   * @returns Boolean indicating visibility
   */
  async isElementVisible(element: Locator, elementName?: string): Promise<boolean> {
    return this.performAction(
      () => element.isVisible(),
      `Checked visibility of ${elementName}`,
      `Failed to check visibility of ${elementName}`,
    );
  }

  /**
   * Verification
   * @param element The element locator.
   * @param expectedText The expected text.
   * @param elementName The name of the element (optional).
   */
  async verifyElementText(element: Locator, expectedText: string, elementName?: string) {
    const actualText = await this.getElementProperty<string>(
      element,
      'visibleText',
      undefined,
      elementName,
    );

    return this.performAction(
      async () => {
        expect(actualText.trim()).toBe(expectedText.trim());
        return true;
      },
      `Verified text for ${elementName}. Expected: "${expectedText}", Actual: "${actualText}"`,
      `Text verification failed for ${elementName}. Expected: "${expectedText}", Actual: "${actualText}"`,
    );
  }

  /**
   * Element State Verification
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async verifyElementEditable(element: Locator, elementName?: string): Promise<boolean> {
    return this.performAction(
      async () => {
        const [isEnabled, readOnly, disabled] = await Promise.all([
          element.isEnabled(),
          element.getAttribute('readonly'),
          element.getAttribute('disabled'),
        ]);

        expect(isEnabled).toBe(true);
        expect(readOnly).toBeNull();
        expect(disabled).toBeNull();

        return true;
      },
      `Verified that ${elementName} is editable`,
      `Element ${elementName} is not editable`,
    );
  }

  /**
   * Verifies that a file exists at the specified path after download.
   * @param filePath The path to the downloaded file.
   */
  async verifyDownloadedFile(filePath: string): Promise<void> {
    return this.performAction(
      async () => {
        const result = await AsyncFileManager.checkAccess(filePath, fs.constants.F_OK, {
          throwOnError: false,
        });

        if (!result.success) {
          throw new Error(`File not found at path: ${filePath}`);
        }
      },
      `File successfully downloaded to: ${filePath}`,
      `File verification failed for: ${filePath}`,
    );
  }

  /**
   * Scroll element into view
   * @param element The element locator
   * @param elementName The name of the element (optional)
   */
  async scrollIntoView(element: Locator, elementName?: string): Promise<void> {
    await this.performAction(
      () => element.scrollIntoViewIfNeeded(),
      `Scrolled ${elementName} into view`,
      `Failed to scroll ${elementName} into view`,
    );
  }

  /**
   * Scroll page to specific coordinates
   * @param x X coordinate
   * @param y Y coordinate
   */
  async scrollToCoordinates(x: number, y: number): Promise<void> {
    await this.performAction(
      () => this.page.evaluate(({ x, y }) => window.scrollTo(x, y), { x, y }),
      `Scrolled to coordinates (${x}, ${y})`,
      `Failed to scroll to coordinates (${x}, ${y})`,
    );
  }

  /**
   * Get count of elements matching locator
   * @param element The element locator
   * @param elementName The name of the element (optional)
   * @returns Number of matching elements
   */
  async getElementCount(element: Locator, elementName?: string): Promise<number> {
    return this.performAction(
      () => element.count(),
      `Retrieved count for ${elementName}`,
      `Failed to get count for ${elementName}`,
    );
  }

  /**
   * Wait for URL to match pattern
   * @param pattern URL pattern (string or regex)
   * @param timeout Timeout in milliseconds
   */
  async waitForURL(pattern: string | RegExp, timeout?: number): Promise<void> {
    await this.performAction(
      () => this.page.waitForURL(pattern, { timeout }),
      `URL matches pattern: ${pattern}`,
      `Failed waiting for URL to match: ${pattern}`,
    );
  }

  /**
   * Get all cookies from current page
   * @returns Array of cookie objects
   */
  async getAllCookies(): Promise<Cookie[]> {
    return this.performAction(
      () => this.page.context().cookies(),
      'Retrieved all cookies',
      'Failed to retrieve cookies',
    );
  }

  /**
   * Add cookie to current page
   * @param cookie Cookie object with name, value, domain, etc.
   */
  async addCookie(cookie: {
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }): Promise<void> {
    await this.performAction(
      () => this.page.context().addCookies([cookie]),
      `Added cookie: ${cookie.name}`,
      `Failed to add cookie: ${cookie.name}`,
    );
  }

  /**
   * Clear all cookies
   */
  async clearAllCookies(): Promise<void> {
    await this.performAction(
      () => this.page.context().clearCookies(),
      'All cookies cleared',
      'Failed to clear cookies',
    );
  }

  /**
   * Get element's computed CSS style
   * @param element The element locator
   * @param property CSS property name
   * @param elementName The name of the element (optional)
   * @returns The computed style value
   */
  async getElementStyle(element: Locator, property: string, elementName?: string): Promise<string> {
    return this.performAction(
      () => element.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property),
      `Retrieved ${property} style from ${elementName}`,
      `Failed to get ${property} style from ${elementName}`,
    );
  }

  /**
   * Verify element has specific CSS class
   * @param element The element locator
   * @param className CSS class name to verify
   * @param elementName The name of the element (optional)
   */
  async verifyElementHasClass(
    element: Locator,
    className: string,
    elementName?: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        await expect(element).toHaveClass(new RegExp(className));
      },
      `Verified ${elementName} has class: ${className}`,
      `Element ${elementName} does not have class: ${className}`,
    );
  }

  /**
   * Wait for and handle file download
   * @param triggerAction Function that triggers the download
   * @param downloadPath Path where file should be saved (optional)
   * @returns Promise that resolves with download object
   */
  async handleDownload(
    triggerAction: () => Promise<void>,
    downloadPath?: string,
  ): Promise<Download> {
    return this.performAction(
      async () => {
        const [download] = await Promise.all([this.page.waitForEvent('download'), triggerAction()]);

        if (downloadPath) {
          await download.saveAs(downloadPath);
        }

        return download;
      },
      `File download handled${downloadPath ? ` and saved to: ${downloadPath}` : ''}`,
      'Failed to handle file download',
    );
  }

  /**
   * Get element's bounding box
   * @param element The element locator
   * @param elementName The name of the element (optional)
   * @returns Bounding box with x, y, width, height
   */
  async getElementBoundingBox(
    element: Locator,
    elementName?: string,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return this.performAction(
      () => element.boundingBox(),
      `Retrieved bounding box for ${elementName}`,
      `Failed to get bounding box for ${elementName}`,
    );
  }

  /**
   * Take a screenshot of the current page.
   * @returns A promise that resolves with a Buffer containing the screenshot.
   */
  async takeScreenshot(screenshotName: string = 'unnamed'): Promise<Buffer> {
    return this.performAction(
      () => this.page.screenshot(),
      `Screenshot of ${screenshotName} taken`,
      `Error taking screenshot "${screenshotName}"`,
    );
  }

  /**
   * Creates a random string with configurable options
   * @param length The length of the random string to create
   * @param options Configuration options for string generation
   * @returns A random string
   *
   * @example
   * // Basic usage (alphanumeric)
   * const basic = utils.createRandomString(10);
   *
   * @example
   * // With specific character sets
   * const passwordSafe = utils.createRandomString(12, {
   *   includeUppercase: true,
   *   includeLowercase: true,
   *   includeNumbers: true,
   *   includeSpecial: false
   * });
   *
   * @example
   * // With prefix/suffix for test data
   * const testEmail = utils.createRandomString(8, {
   *   includeLowercase: true,
   *   includeNumbers: true,
   *   suffix: '@example.com'
   * });
   *
   * @example
   * // For password generation
   * const strongPassword = utils.createRandomString(16, {
   *   includeUppercase: true,
   *   includeLowercase: true,
   *   includeNumbers: true,
   *   includeSpecial: true
   * });
   */
  public createRandomString(
    length: number,
    options?: {
      includeUppercase?: boolean;
      includeLowercase?: boolean;
      includeNumbers?: boolean;
      includeSpecial?: boolean;
      prefix?: string;
      suffix?: string;
    },
  ): string {
    // Set defaults if options aren't provided
    const config = {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecial: false,
      prefix: '',
      suffix: '',
      ...options,
    };

    let chars = '';
    if (config.includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (config.includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (config.includeNumbers) chars += '0123456789';
    if (config.includeSpecial) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';

    // If no character sets are selected, default to alphanumeric
    if (chars === '') {
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }

    // Generate the random string
    const randomPart = Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');

    // Add prefix and suffix if provided
    return `${config.prefix}${randomPart}${config.suffix}`;
  }

  /**
   * Wait until the DOM content is loaded.
   */
  async waitForDOMReady(): Promise<void> {
    await this.performAction(
      () => this.page.waitForLoadState('domcontentloaded'),
      'DOM content loaded',
      'Failed to wait for DOM content to load',
    );
  }

  /**
   * Wait until the network is idle (no network requests for 500ms).
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.performAction(
      () => this.page.waitForLoadState('networkidle'),
      'Network is idle',
      'Failed to wait for network to be idle',
    );
  }

  /**
   * Wait until the page is fully loaded (load event fired).
   */
  async waitForPageLoad(): Promise<void> {
    await this.performAction(
      () => this.page.waitForLoadState('load'),
      'Page fully loaded',
      'Failed to wait for page load',
    );
  }

  /**
   * Wait until both DOM and network are ready (most comprehensive wait).
   */
  async waitForPageReady(): Promise<void> {
    await this.performAction(
      () =>
        Promise.all([
          this.page.waitForLoadState('domcontentloaded'),
          this.page.waitForLoadState('networkidle'),
        ]),
      'Page is fully ready (DOM + Network)',
      'Failed to wait for page readiness',
    );
  }

  /**
   * Wait for a specified amount of time.
   * @param milliseconds The amount of time to wait in milliseconds. Uses environment-aware timeout if not provided.
   */
  async wait(milliseconds = getTimeoutWithMultiplier(2000)): Promise<void> {
    const isCI = EnvironmentDetector.isCI();
    const environmentInfo = ` (${isCI ? 'CI' : 'local'} environment)`;

    await this.performAction(
      () => new Promise((resolve) => setTimeout(resolve, milliseconds)),
      `Waited for ${milliseconds}ms${environmentInfo}`,
      `Failed to wait for ${milliseconds}ms${environmentInfo}`,
    );
  }
  /**
   * Wait for specific response by URL pattern.
   * @param urlPattern URL pattern to match (string or regex)
   * @param timeout Maximum time to wait in milliseconds
   */
  async waitForResponse(urlPattern: string | RegExp, timeout?: number): Promise<Response> {
    return this.performAction(
      () => this.page.waitForResponse(urlPattern, { timeout }),
      `Response received for: ${urlPattern}`,
      `Timeout waiting for response: ${urlPattern}`,
    );
  }

  /**
   * Performs a UI action and waits for a specific API response to complete.
   * Includes logging for success and failure states.
   *
   * @param urlFragment - A unique part of the API URL to listen for.
   * @param action - An async function containing the steps (e.g., clicking, typing).
   * @param statusCode - (Optional) Expected HTTP status (default: 200).
   * @param successMessage - (Optional) Log message on success.
   * @param errorMessage - (Optional) Log message on failure.
   */
  performActionAndWaitForApi = async (
    urlFragment: string,
    action: () => Promise<void>,
    statusCode = 200,
    successMessage = `Successfully intercepted API call: ${urlFragment}`,
    errorMessage = `Failed to intercept API call: ${urlFragment}`,
  ): Promise<Response> => {
    logger.info(`Action started: Waiting for API '${urlFragment}'...`);
    try {
      return await RetryHandler.withRetry(
        async () => {
          // 1. Set up the listener
          const responsePromise = this.page.waitForResponse(
            (response) => response.url().includes(urlFragment) && response.status() === statusCode,
          );
          // 2. Perform the action
          await action();
          // 3. Wait for the response
          const response = await responsePromise;
          // 4. Log Success
          logger.info(successMessage);
          return response;
        },
        {
          maxAttempts: 5,
          delayMs: 2000,
          exponentialBackoff: true,
          onRetry: (attempt, error) => {
            logger.error(`Attempt ${attempt} failed: ${error}`);
          },
        },
      );
    } catch (error) {
      // 5. Log Failure and Re-throw
      logger.error(`${errorMessage} | Error: ${error}`);
      throw error;
    }
  };

  /**
   * Waits for a table to load completely, including waiting for the network to be idle and the page to be ready.
   * If an API URL is provided, waits for the API call to complete before verifying that the table is visible.
   * Throws an error if waiting for the table to load fails.
   *
   * @param {Locator} tableElement - Locator for the table element
   * @param {Locator} actionableElement - Locator for the element that triggers the table load
   * @param {string} [apiUrl] - URL of the API call to wait for
   */
  async waitForTableToLoad(
    tableElement: Locator,
    actionableElement: Locator,
    tableName?: string,
    actionableElementName?: string,
    apiUrl?: string,
  ): Promise<void> {
    try {
      if (apiUrl) {
        await this.performActionAndWaitForApi(apiUrl, async () => {
          await this.clickElement(actionableElement, `${actionableElementName} Element`);
        });
      }
      await this.verifyElementState(tableElement, 'visible', `${tableName} Table`);

      await this.waitForPageReady();
      logger.info(`${tableName} Table loaded successfully`);
    } catch (error) {
      ErrorHandler.captureError(error, 'waitForTableLoad', 'Failed to wait for table to load');
      throw error;
    }
  }

  /**
   * Waits for a network response while performing an action (like clicking or typing).
   * @param urlFragment - Part of the URL to wait for (e.g., 'VendorCodes')
   * @param triggerAction - An async function that triggers the network call (e.g., clicking search)
   * @param statusCode - Expected status code (default 200)
   */
  async triggerAndWaitForRequestPayload(
    urlPart: string,
    searchTerm: string,
    triggerAction: () => Promise<void>,
  ) {
    const responsePromise = this.page.waitForEvent('response', {
      predicate: (response) => {
        // 1. Check URL first
        const isUrlMatch = response.url().includes(urlPart);
        if (!isUrlMatch) return false;

        // 2. Check if the REQUEST body contains our search term
        // This ensures we catch the SPECIFIC search request, not a generic background fetch
        const requestBody = response.request().postData();
        return requestBody ? requestBody.includes(searchTerm) : false;
      },
      timeout: 10000,
    });

    await triggerAction();
    return await responsePromise;
  }

  /**
   * Performs a search on a table with the given search term.
   * Refreshes the page first, then fills the search box with the given search term.
   * Waits for the search result text to become visible.
   * @param {Locator} searchElement - The search box element to fill.
   * @param {string} searchTerm - The term to search for in the table.
   * @throws {Error} If performing the search fails.
   * @returns {Promise<void>} A promise that resolves when the search has been performed successfully.
   */
  async performTableSearch(searchElement: Locator, searchTerm: string): Promise<void> {
    try {
      await this.refreshPage();
      await this.fillElement(searchElement, searchTerm, 'Search Box');
      await this.waitForSelectorState(
        `td:has-text("${searchTerm}")`,
        'visible',
        'Search Result Text',
      );
    } catch (error) {
      ErrorHandler.captureError(error, 'performTableSearch', 'Failed to perform table search');
      throw error;
    }
  }
}
