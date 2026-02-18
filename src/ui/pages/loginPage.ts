import { Page, Locator, expect } from "playwright/test";
import BasePage from "../base/basePage";
import ErrorHandler from "../../utils/errors/errorHandler";

export class LoginPage extends BasePage {
  readonly page: Page;
  private readonly emailAddressTextbox: Locator;
  private readonly passwordTextbox: Locator;
  private readonly loginButton: Locator;
  private readonly incorrectEmailErrorMessage: Locator;
  private readonly invalidCredentialsErrorMessage: Locator;
  private readonly forgotPasswordLink: Locator;
  constructor(page: Page) {
    super(page);
    this.page = page;
    // Update selectors to match your application's login page
    this.emailAddressTextbox = page.locator(`input[formcontrolname="emailAddress"], input[name="username"], #username`);
    this.passwordTextbox = page.locator(`input[formcontrolname="password"], input[name="password"], #password`);
    this.loginButton = page.locator("button[type='submit'], button:has-text('Login'), input[type='submit']");
    this.incorrectEmailErrorMessage = page.locator(`mat-error[id*='mat-mdc-error'], .error-message, [data-testid='email-error']`);
    this.invalidCredentialsErrorMessage = page.locator(`#error-message, .invalid-credentials, [data-testid='login-error']`);
    this.forgotPasswordLink = page.locator(`//span[normalize-space()='Forgot Password'], a:has-text('Forgot Password')`);
  }

  /**
   * Verifies if the Email Address Textbox is visible on the page
   * @throws {Error} If the Email Address Textbox is not visible
   */
  async isEmailAddressTextboxVisible(): Promise<void> {
    try {
      await this.verifyElementState(this.emailAddressTextbox, "visible", "Email Address Textbox");
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "isEmailAddressTextboxVisible",
        "Email Address Textbox is not visible",
      );
      throw error;
    }
  }

  /**
   * Verifies if the Password Textbox is visible on the page
   * @throws {Error} If the Password Textbox is not visible
   */
  async isPasswordTextboxVisible(): Promise<void> {
    try {
      await this.verifyElementState(this.passwordTextbox, "visible", "Password Textbox");
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "isPasswordTextboxVisible",
        "Password Textbox is not visible",
      );
      throw error;
    }
  }

  /**
   * Verifies if the Login Button is visible on the page
   * @throws {Error} If the Login Button is not visible
   */
  async isLoginButtonVisible(): Promise<void> {
    try {
      await this.verifyElementState(this.loginButton, "visible", "Login Button");
    } catch (error) {
      ErrorHandler.captureError(error, "isLoginButtonVisible", "Login Button is not visible");
      throw error;
    }
  }

  /**
   * Verifies if the Forgot Password Link is visible on the page
   */
  async isForgotPasswordLinkVisible(): Promise<void> {
    try {
      await this.verifyElementState(this.forgotPasswordLink, "visible", "Forgot Password Link");
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "isForgotPasswordLinkVisible",
        "Forgot Password Link is not visible",
      );
      throw error;
    }
  }

  /**
   * Fills the username input field with the specified value.
   * @param username The value to fill in the username input field.
   * @throws {Error} If filling the username input field fails.
   */
  async fillUsername(username: string): Promise<void> {
    try {
      await this.fillElement(this.emailAddressTextbox, username, "Email Address Textbox");
    } catch (error) {
      ErrorHandler.captureError(error, "fillUsername", "Failed to fill username");
      throw error;
    }
  }

  /**
   * Fills the password input field with the specified value.
   * @param password The value to fill in the password input field.
   * @throws {Error} If filling the password input field fails.
   */
  async fillPassword(password: string): Promise<void> {
    try {
      await this.fillElement(this.passwordTextbox, password, "Password Textbox");
    } catch (error) {
      ErrorHandler.captureError(error, "fillPassword", "Failed to fill password");
      throw error;
    }
  }

  /**
   * Clicks the login button.
   * @throws {Error} If clicking the login button fails.
   */
  async clickLoginButton(): Promise<void> {
    try {
      await this.clickElement(this.loginButton, "Login Button");
    } catch (error) {
      ErrorHandler.captureError(error, "clickLoginButton", "Failed to click Login Button");
      throw error;
    }
  }

  /**
   * Verifies if the Invalid Credentials Error Message is visible on the page.
   * @throws {Error} If the Invalid Credentials Error Message is not visible.
   */
  async isInvalidCredentialsErrorMessageVisible(): Promise<void> {
    try {
      await this.verifyElementState(
        this.invalidCredentialsErrorMessage,
        "visible",
        "Invalid Credentials Error Message",
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "isInvalidCredentialsErrorMessageVisible",
        "Invalid Credentials Error Message is not visible",
      );
      throw error;
    }
  }

  /**
   * Verifies if the Invalid Credentials Error Message is not visible on the page.
   * @throws {Error} If the Invalid Credentials Error Message is still visible.
   */
  async isInvalidCredentialsErrorMessageNotVisible(): Promise<void> {
    try {
      await this.verifyElementState(
        this.invalidCredentialsErrorMessage,
        "hidden",
        "Invalid Credentials Error Message",
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "isInvalidCredentialsErrorMessageNotVisible",
        "Invalid Credentials Error Message is still visible",
      );
      throw error;
    }
  }

  /**
   * Verifies if the Incorrect Email Error Message is visible on the page.
   * @throws {Error} If the Incorrect Email Error Message is not visible.
   */
  async isIncorrectEmailErrorMessageVisible(): Promise<void> {
    try {
      await this.verifyElementState(
        this.incorrectEmailErrorMessage,
        "visible",
        "Incorrect Email Error Message",
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "isIncorrectEmailErrorMessageVisible",
        "Incorrect Email Error Message is not visible",
      );
      throw error;
    }
  }

  /**
   * Verifies if the Incorrect Email Error Message is not visible on the page.
   * @throws {Error} If the Incorrect Email Error Message is still visible.
   */
  async isIncorrectEmailErrorMessageNotVisible(): Promise<void> {
    try {
      await this.verifyElementState(
        this.incorrectEmailErrorMessage,
        "hidden",
        "Incorrect Email Error Message",
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "isIncorrectEmailErrorMessageNotVisible",
        "Incorrect Email Error Message is still visible",
      );
      throw error;
    }
  }

  /**
   * Retrieves the text content of the Incorrect Email Error Message
   * @returns a Promise resolved with the text content of the Incorrect Email Error Message
   * @throws {Error} if the Incorrect Email Error Message is not visible
   */
  async getInvalidEmailErrorMessage(): Promise<string> {
    try {
      return await this.getElementProperty<string>(
        this.incorrectEmailErrorMessage,
        "textContent",
        undefined,
        "Incorrect Email Error Message",
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "getInvalidEmailErrorMessage",
        "Failed to get Invalid Email Error Message",
      );
      throw error;
    }
  }

  /**
   * Retrieves the text content of the Invalid Credentials Error Message
   * @returns a Promise resolved with the text content of the Invalid Credentials Error Message
   * @throws {Error} if the Invalid Credentials Error Message is not visible
   */
  async getInvalidCredentialsErrorMessage(): Promise<string> {
    try {
      return await this.getElementProperty<string>(
        this.invalidCredentialsErrorMessage,
        "textContent",
        undefined,
        "Invalid Credentials Error Message",
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "getInvalidCredentialsErrorMessage",
        "Failed to get Invalid Credentials Error Message",
      );
      throw error;
    }
  }

  /**
   * Validates the text content of the error message is as expected
   * @param errorMessageType - Type of error message: "invalidCredentials" or "incorrectEmail"
   * @param expectedErrorMessage - Expected error message text content
   * @throws {Error} if the error message is not visible or does not match the expected text content
   */
  async validateErrorMessageIsCorrect(
    errorMessageType: string,
    expectedErrorMessage: string,
  ): Promise<void> {
    try {
      let actualErrorMessage = null;
      if (errorMessageType === "invalidCredentials") {
        await this.isInvalidCredentialsErrorMessageVisible();
        actualErrorMessage = await this.getInvalidCredentialsErrorMessage();
        expect(actualErrorMessage).toBe(expectedErrorMessage);
      } else if (errorMessageType === "incorrectEmail") {
        await this.isIncorrectEmailErrorMessageVisible();
        actualErrorMessage = await this.getInvalidEmailErrorMessage();
        expect(actualErrorMessage).toBe(expectedErrorMessage);
      } else {
        throw new Error(`Unknown error message type: ${errorMessageType}`);
      }
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "ValidateErrorMessageIsCorrect",
        `Failed to validate error message: ${errorMessageType}`,
      );
      throw error;
    }
  }

  /**
   * Performs login with the given credentials.
   * Update selectors in the constructor if your app uses different elements.
   */
  async login(username: string, password: string): Promise<void> {
    try {
      await this.fillUsername(username);
      await this.fillPassword(password);
      await this.clickLoginButton();
    } catch (error) {
      ErrorHandler.captureError(error, "login", "Failed to log in");
      throw error;
    }
  }

  /** Alias for backward compatibility with BrowserSessionManager */
  async logintoAdminConfigurator(username: string, password: string): Promise<void> {
    await this.login(username, password);
  }
}
