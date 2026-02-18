import EnvironmentConfigLoader from '../../../utils/environment/environmentConfigManager';
import { EnvironmentSecretFileManager } from '../../../cryptography/manager/environmentSecretFileManager';
import AuthStorageManager from '../../../utils/auth/storage/authStorageManager';
import ErrorHandler from '../../../utils/errors/errorHandler';
import logger from '../../../utils/logging/loggerManager';

async function validateEnvironmentVariables(): Promise<void> {
  const requiredEnvVars = ['ENV'];
  const missingVars: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}. Check your .env file configuration.`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  logger.info(`Environment validation passed. ENV=${process.env.ENV}`);
}

async function initializeEnvironment(): Promise<void> {
  try {
    // Initialize the environment secret file manager
    const environmentSecretFileManager = new EnvironmentSecretFileManager();

    // Initialize the environment config loader
    const environmentConfigLoader = new EnvironmentConfigLoader(environmentSecretFileManager);
    await environmentConfigLoader.initialize();
  } catch (error) {
    ErrorHandler.captureError(error, 'initializeEnvironment', 'Environment initialization failed');
    throw error;
  }
}

async function clearAuthState(): Promise<void> {
  try {
    await AuthStorageManager.initializeEmptyAuthStateFile();
  } catch (error) {
    ErrorHandler.captureError(error, 'clearAuthState', 'Failed to clear auth state');
    throw error;
  }
}

async function globalSetup(): Promise<void> {
  try {
    await validateEnvironmentVariables();
    await initializeEnvironment();
    await clearAuthState();
  } catch (error) {
    ErrorHandler.captureError(error, 'globalSetup', 'Global setup failed');
    throw error;
  }
}

export default globalSetup;
