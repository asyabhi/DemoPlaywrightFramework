import fs from 'fs';
import path from 'path';

// File Paths
const DATA_FILE_PATH = path.resolve(__dirname, '../testData/createdTestData.json');
const LOCK_FILE_PATH = path.resolve(__dirname, '../testData/createdTestData.lock');

/**
 * @file testDataManager.ts
 * @description This file contains the data manager which stores and retrieves the test data.
 */
interface TestDataStore {
  /**
   * @description A store of Super Business Units
   * @type {string[]}
   */
  superBusinessUnits?: string[];
  /**
   * @description A store of Branches
   * @type {string[]}
   */
  branches?: string[];
  /**
   * @description A store of Business Units
   * @type {string[]}
   */
  businessUnits?: string[];
  /**
   * @description A store of Roles
   * @type {string[]}
   */
  roles?: string[];
  /**
   * @description A store of Users
   * @type {string[]}
   */
  users?: string[];
  /**
   * @description A store of Vendor Codes
   * @type {string[]}
   */
  vendorCodes?: string[];
  /**
   * @description A generic store for any other test data
   * @type {{[key: string]: string[] | undefined }}
   */
  [key: string]: string[] | undefined;
}

/**
 * Simple async delay utility.
 * @param ms Milliseconds to wait.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Acquire a file-system based lock using a dedicated directory.
 * Retries with a small delay to prevent simultaneous writes from colliding.
 * @param retries Number of attempts before failing.
 * @param delay Delay in milliseconds between attempts.
 */
const acquireLock = async (retries = 10, delay = 100): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      fs.mkdirSync(LOCK_FILE_PATH);
      return;
    } catch (err: any) {
      if (err.code === 'EEXIST') {
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Could not acquire lock after ${retries} attempts.`);
};

/**
 * Release the lock directory if it exists. Logs instead of throwing on failure
 * because cleanup issues should not halt the caller.
 */
const releaseLock = () => {
  try {
    fs.rmdirSync(LOCK_FILE_PATH);
  } catch (e) {
    console.error('Failed to release lock', e);
  }
};

/**
 * Append a value to the specified section of the persisted test data store.
 * Uses a coarse file-system lock to serialize concurrent writes.
 * @param section The named test data section to append to.
 * @param value The value to persist.
 */
export const saveTestData = async (section: keyof TestDataStore, value: string) => {
  await acquireLock();

  try {
    let currentData: TestDataStore = {};

    // 1. Read existing data
    if (fs.existsSync(DATA_FILE_PATH)) {
      const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      if (rawData.trim()) {
        currentData = JSON.parse(rawData);
      }
    }

    // 2. Initialize array if it doesn't exist
    if (!currentData[section]) {
      currentData[section] = [];
    }

    // 3. Append new value
    currentData[section]!.push(value);

    // 4. Write back to file
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(currentData, null, 2));
    console.log(`[TestDataManager] Appended '${value}' to '${section}'`);
  } finally {
    releaseLock();
  }
};

/**
 * Retrieve the most recently appended value for a given section.
 * @param section The test data section to read from.
 * @returns The latest value stored under the provided section.
 */
export const getTestData = (section: keyof TestDataStore): string => {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    throw new Error(`Test data file not found at ${DATA_FILE_PATH}`);
  }

  const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
  const data: TestDataStore = JSON.parse(rawData);
  const entries = data[section];

  if (!entries || entries.length === 0) {
    throw new Error(`No data found for section: ${section}`);
  }

  // Return the LAST item in the array (Most Recent)
  return entries[entries.length - 1];
};
