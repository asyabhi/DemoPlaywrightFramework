export interface CIEnvironmentConfig {
  urls: ServiceUrls;
  users: UserCredentialsSet;
  database: DatabaseConfig;
}

export interface ServiceUrls {
  apiBaseUrl: string;
  portalBaseUrl: string;
}

export interface UserCredentialsSet {
  portal: Credentials;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface DatabaseConfig {
  azureEndpoint: string;
  server: string;
  name: string;
  port: number;
}
