import * as configuratorTestData from './configurator.json';
import { SuperBusinessUnit } from '../models/ui/configurator.interface';
import { BusinessUnit } from '../models/ui/configurator.interface';
import { Branch } from '../models/ui/configurator.interface';
import { User } from '../models/ui/configurator.interface';
import { Role } from '../models/ui/configurator.interface';
import { VendorCode } from '../models/ui/configurator.interface';

export class ConfiguratorDataGenerator {
  private static instance: ConfiguratorDataGenerator;
  private counter: number = 1;

  private constructor() {}

  public static getInstance(): ConfiguratorDataGenerator {
    if (!ConfiguratorDataGenerator.instance) {
      ConfiguratorDataGenerator.instance = new ConfiguratorDataGenerator();
    }
    return ConfiguratorDataGenerator.instance;
  }

  /**
   * Generate a unique identifier with prefix
   */
  generateUniqueIdentifier(prefix: string = 'TEST'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Generate a valid email address
   */
  generateValidEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    return `${prefix}.${timestamp}@testautomation.com`;
  }

  /**
   * Generate a valid phone number
   */
  generateValidPhoneNumber(): string {
    const randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
    return `082${randomNumber.toString().substring(0, 7)}`;
  }

  /**
   * Generates a random string of the given length.
   * @param length The length of the string to generate.
   * @returns A random string of the given length.
   */
  generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Generate a Super Business Unit
   */
  generateSuperBusinessUnit(overrides: Partial<SuperBusinessUnit> = {}): SuperBusinessUnit {
    const uniqueId = this.generateUniqueIdentifier('SBU');
    const randomString = this.generateRandomString(5);

    const defaultData: SuperBusinessUnit = {
      name: `Auto${uniqueId}`,
      contactName: `AutoContact${randomString}`,
      contactSurname: `AutoSurname${randomString}`,
      cellphoneNumber: this.generateValidPhoneNumber(),
      emailAddress: this.generateValidEmail(`contact${this.counter}`),
      status: 'Active',
    };

    this.counter++;
    return { ...defaultData, ...overrides };
  }

  /**
   * Generate a Business Unit
   */
  generateBusinessUnit(
    superBusinessUnitId?: string,
    overrides: Partial<BusinessUnit> = {},
  ): BusinessUnit {
    const uniqueId = this.generateUniqueIdentifier('BU');
    const regions = configuratorTestData.businessUnits.regions;
    const affiliations = configuratorTestData.businessUnits.externalAffiliations;

    const defaultData: BusinessUnit = {
      superBusinessUnitId,
      name: `Auto${uniqueId}`,
      region: regions[Math.floor(Math.random() * regions.length)],
      externalAffiliation: affiliations[Math.floor(Math.random() * affiliations.length)],
      contactName: `BUContact${this.counter}`,
      contactSurname: `BUSurname${this.counter}`,
      contactNumber: this.generateValidPhoneNumber(),
      emailAddress: this.generateValidEmail(`bucontact${this.counter}`),
      status: 'Active',
    };

    this.counter++;
    return { ...defaultData, ...overrides };
  }

  /**
   * Generate a Branch
   */
  generateBranch(businessUnitId?: string, overrides: Partial<Branch> = {}): Branch {
    const uniqueId = this.generateUniqueIdentifier('BR');
    const regions = configuratorTestData.branches.regions;

    const defaultData: Branch = {
      businessUnitId,
      name: `AutoBranch${uniqueId}`,
      region: regions[Math.floor(Math.random() * regions.length)],
      bankCodes: {
        absa: `ABSA${this.counter.toString().padStart(3, '0')}`,
        fnbMORetail: `FNB${this.counter.toString().padStart(3, '0')}`,
        fnbDevelopment: `FNBDEV${this.counter.toString().padStart(3, '0')}`,
        hip: `HIP${this.counter.toString().padStart(3, '0')}`,
        nedbank: `NED${this.counter.toString().padStart(3, '0')}`,
        sahl: `SAHL${this.counter.toString().padStart(3, '0')}`,
        sbsa: `SBSA${this.counter.toString().padStart(3, '0')}`,
        sbsaChannel: `SBSACH${this.counter.toString().padStart(3, '0')}`,
      },
      status: 'Active',
    };

    this.counter++;
    return { ...defaultData, ...overrides };
  }

  /**
   * Generate a Vendor Code
   */
  generateVendorCode(overrides: Partial<VendorCode> = {}): VendorCode {
    const uniqueId = this.generateUniqueIdentifier('VC');
    const bankNames = configuratorTestData.vendorCodes.bankNames;

    const defaultData: VendorCode = {
      code: `AutoVC${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(3, '0')}`,
      description: `AutoVendorCode${uniqueId}`,
      bankName: bankNames[Math.floor(Math.random() * bankNames.length)],
      status: 'Active',
    };

    this.counter++;
    return { ...defaultData, ...overrides };
  }

  /**
   * Generate a User
   */
  generateUser(businessUnitId?: string, roleId?: string, overrides: Partial<User> = {}): User {
    const uniqueId = this.generateUniqueIdentifier('User');
    const products = configuratorTestData.users.products;

    const defaultData: User = {
      businessUnitId,
      userName: `Auto${uniqueId}`,
      userSurname: `Surname${uniqueId}`,
      cellphoneNumber: this.generateValidPhoneNumber(),
      emailAddress: this.generateValidEmail(`testuser${this.counter}`),
      roleId,
      product: products[Math.floor(Math.random() * products.length)],
      linkedBranches: [],
      status: 'Active',
    };

    this.counter++;
    return { ...defaultData, ...overrides };
  }

  /**
   * Generate a Role
   */
  generateRole(overrides: Partial<Role> = {}): Role {
    const uniqueId = this.generateUniqueIdentifier('Role');
    const availablePermissions = configuratorTestData.roles.availablePermissions;

    // Select random permissions (at least 1, at most 5)
    const numPermissions = Math.floor(Math.random() * 5) + 1;
    const selectedPermissions: string[] = [];

    for (let i = 0; i < numPermissions; i++) {
      const permission =
        availablePermissions[Math.floor(Math.random() * availablePermissions.length)];
      if (!selectedPermissions.includes(permission)) {
        selectedPermissions.push(permission);
      }
    }

    const defaultData: Role = {
      description: `Auto${uniqueId}`,
      permissions: selectedPermissions,
      status: 'Active',
    };

    this.counter++;
    return { ...defaultData, ...overrides };
  }

  /**
   * Generate invalid data for testing validation
   */
  generateInvalidSuperBusinessUnit(invalidField: string): Partial<SuperBusinessUnit> {
    const validData = this.generateSuperBusinessUnit();

    switch (invalidField) {
      case 'name':
        return { ...validData, name: '' };
      case 'contactName':
        return { ...validData, contactName: '' };
      case 'contactSurname':
        return { ...validData, contactSurname: '' };
      case 'cellphoneNumber':
        return { ...validData, cellphoneNumber: 'invalid-phone' };
      default:
        return { ...validData, name: '' };
    }
  }

  generateInvalidBusinessUnit(invalidField: string): Partial<BusinessUnit> {
    const validData = this.generateBusinessUnit();

    switch (invalidField) {
      case 'name':
        return { ...validData, name: '' };
      case 'superBusinessUnitId':
        return { ...validData, superBusinessUnitId: '' };
      case 'contactName':
        return { ...validData, contactName: '' };
      case 'emailAddress':
        return { ...validData, emailAddress: 'invalid-email' };
      default:
        return { ...validData, name: '' };
    }
  }

  generateInvalidBranch(invalidField: string): Partial<Branch> {
    const validData = this.generateBranch();

    switch (invalidField) {
      case 'name':
        return { ...validData, name: '' };
      case 'businessUnitId':
        return { ...validData, businessUnitId: '' };
      case 'region':
        return { ...validData, region: '' };
      default:
        return { ...validData, name: '' };
    }
  }

  generateInvalidVendorCode(invalidField: string): Partial<VendorCode> {
    const validData = this.generateVendorCode();

    switch (invalidField) {
      case 'description':
        return { ...validData, description: '' };
      case 'code':
        return { ...validData, code: '' };
      case 'bankName':
        return { ...validData, bankName: '' };
      default:
        return { ...validData, description: '' };
    }
  }

  generateInvalidUser(invalidField: string): Partial<User> {
    const validData = this.generateUser();

    switch (invalidField) {
      case 'userName':
        return { ...validData, userName: '' };
      case 'userSurname':
        return { ...validData, userSurname: '' };
      case 'businessUnitId':
        return { ...validData, businessUnitId: '' };
      case 'cellphoneNumber':
        return { ...validData, cellphoneNumber: '' };
      case 'emailAddress':
        return { ...validData, emailAddress: '' };
      case 'roleId':
        return { ...validData, roleId: '' };
      case 'product':
        return { ...validData, product: '' };
      default:
        return { ...validData, userName: '' };
    }
  }

  generateInvalidRole(invalidField: string): Partial<Role> {
    const validData = this.generateRole();

    switch (invalidField) {
      case 'description':
        return { ...validData, description: '' };
      case 'permissions':
        return { ...validData, permissions: [] };
      default:
        return { ...validData, description: '' };
    }
  }

  /**
   * Get test data from JSON file
   */
  getValidSuperBusinessUnits(): SuperBusinessUnit[] {
    return configuratorTestData.superBusinessUnits.valid;
  }

  getValidBusinessUnits(): BusinessUnit[] {
    return configuratorTestData.businessUnits.valid;
  }

  getValidBranches(): Branch[] {
    return configuratorTestData.branches.valid;
  }

  getValidVendorCodes(): VendorCode[] {
    return configuratorTestData.vendorCodes.valid;
  }

  getValidUsers(): User[] {
    return configuratorTestData.users.valid;
  }

  getValidRoles(): Role[] {
    return configuratorTestData.roles.valid;
  }

  /**
   * Get validation messages
   */
  getValidationMessages() {
    return configuratorTestData.validationMessages;
  }

  /**
   * Get performance thresholds
   */
  getPerformanceThresholds() {
    return configuratorTestData.performanceThresholds;
  }

  /**
   * Get table headers for modules
   */
  getTableHeaders(module: string): string[] {
    return (configuratorTestData.tableHeaders as any)[module] || [];
  }

  /**
   * Reset counter for testing
   */
  resetCounter(): void {
    this.counter = 1;
  }
}
