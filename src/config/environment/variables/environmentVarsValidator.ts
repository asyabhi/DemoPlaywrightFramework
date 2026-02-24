export default class EnvironmentVarsValidator {
  /**
   * Gets the required variables as an array
   */
  public static getRequiredVariablesArray(): string[] {
    return this.getRequiredVariables().split(',');
  }

  /**
   * Public method to get required variables as comma-separated string
   * This method is called by EnvironmentVariables class to set process.env.REQUIRED_ENV_VARS
   */
  public static REQUIRED_VARIABLES(): string {
    return this.getRequiredVariables();
  }

  /**
   * Returns comma-separated list of all required environment variables
   */
  private static getRequiredVariables(): string {
    return ['API_BASE_URL', 'PORTAL_USERNAME', 'PORTAL_PASSWORD'].join(',');
  }
}
