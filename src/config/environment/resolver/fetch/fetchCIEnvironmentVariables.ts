import { CIEnvironmentConfig } from '../../../types/config/ci-environment.types';
import { EnvironmentUtils } from '../environmentUtils';
import { Credentials } from '../../../types/auth/credentials.types';

export class FetchCIEnvironmentVariables {
  /**
   * Stores all CI-specific environment variables used by the test framework.
   *
   * This configuration is loaded once when the class is instantiated and includes:
   * - App metadata like version, platform, and test type.
   * - Service URLs for API and portal endpoints.
   * - User credentials for both admin and portal users.
   * - Database connection details including Azure-specific configurations.
   */
  private readonly ciEnvironmentVariables: CIEnvironmentConfig = {
    urls: {
      apiBaseUrl: process.env.CI_API_BASE_URL!,
      portalBaseUrl: process.env.CI_PORTAL_BASE_URL!,
    },
    users: {
      portal: {
        username: process.env.CI_PORTAL_USERNAME!,
        password: process.env.CI_PORTAL_PASSWORD!,
      },
    },
    database: {
      azureEndpoint: process.env.CI_DATABASE_AZURE_ENDPOINT!,
      server: process.env.CI_DATABASE_SERVER!,
      name: process.env.CI_DATABASE_NAME!,
      port: parseInt(process.env.CI_DATABASE_PORT!, 10),
    },
  };

  // URLs

  public async getApiBaseUrl(): Promise<string> {
    const getVariable = EnvironmentUtils.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.urls.apiBaseUrl,
      'ciApiBaseUrl',
      'getApiBaseUrl',
      'Failed to get CI API base URL',
    );

    return getVariable;
  }

  public async getPortalBaseUrl(): Promise<string> {
    const getVariable = EnvironmentUtils.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.urls.portalBaseUrl,
      'ciPortalBaseUrl',
      'getPortalBaseUrl',
      'Failed to get CI portal base URL',
    );

    return getVariable;
  }

  // Users

  public async getPortalCredentials(): Promise<Credentials> {
    EnvironmentUtils.verifyCredentials({
      username: this.ciEnvironmentVariables.users.portal.username,
      password: this.ciEnvironmentVariables.users.portal.password,
    });
    return {
      username: this.ciEnvironmentVariables.users.portal.username,
      password: this.ciEnvironmentVariables.users.portal.password,
    };
  }

  public async getAzureEndpoint(): Promise<string> {
    const getVariable = EnvironmentUtils.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.database.azureEndpoint,
      'ciDatabaseAzureEndpoint',
      'getAzureEndpoint',
      'Failed to get CI Azure endpoint',
    );

    return getVariable;
  }

  public async getDatabaseServer(): Promise<string> {
    const getVariable = EnvironmentUtils.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.database.server,
      'ciDatabaseServer',
      'getDatabaseServer',
      'Failed to get CI database server',
    );

    return getVariable;
  }

  public async getDatabaseName(): Promise<string> {
    const getVariable = EnvironmentUtils.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.database.name,
      'ciDatabaseName',
      'getDatabaseName',
      'Failed to get CI database name',
    );

    return getVariable;
  }

  public async getDatabasePort(): Promise<number> {
    const port = await EnvironmentUtils.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.database.port,
      'ciDatabasePort',
      'getDatabasePort',
      'Failed to get CI database port',
    );

    return port;
  }
}
