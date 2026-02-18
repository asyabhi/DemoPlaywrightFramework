/**
 * This file contains the interface definitions for the
 * configurator application's UI data models.
 *
 * @package models
 * @subpackage ui
 */

type Status = 'Active' | 'Inactive';
export interface SuperBusinessUnit {
  /**
   * The unique identifier for the Super Business Unit.
   * @type {string}
   * @memberof SuperBusinessUnit
   */
  id?: string;
  /**
   * The name of the Super Business Unit.
   * @type {string}
   * @memberof SuperBusinessUnit
   */
  name: string;
  /**
   * The name of the contact person for the Super Business Unit.
   * @type {string}
   * @memberof SuperBusinessUnit
   */
  contactName: string;
  /**
   * The surname of the contact person for the Super Business Unit.
   * @type {string}
   * @memberof SuperBusinessUnit
   */
  contactSurname: string;
  /**
   * The cellphone number of the contact person for the Super Business Unit.
   * @type {string}
   * @memberof SuperBusinessUnit
   */
  cellphoneNumber: string;
  emailAddress: string;
  /**
   * The status of the Super Business Unit. Either 'Active' or 'Inactive'.
   * @type {('Active'|'Inactive')}
   * @memberof SuperBusinessUnit
   */
  status?: Status;
}

/**
 * Represents a Business Unit.
 * @interface BusinessUnit
 */
export interface BusinessUnit {
  /**
   * The unique identifier for the Business Unit.
   * @type {string}
   * @memberof BusinessUnit
   */
  id?: string;
  /**
   * The unique identifier for the Super Business Unit that the Business Unit belongs to.
   * @type {string}
   * @memberof BusinessUnit
   */
  superBusinessUnitId?: string;
  /**
   * The name of the Business Unit.
   * @type {string}
   * @memberof BusinessUnit
   */
  name: string;
  /**
   * The region in which the Business Unit operates.
   * @type {string}
   * @memberof BusinessUnit
   */
  region: string;
  /**
   * The external affiliation of the Business Unit.
   * @type {string}
   * @memberof BusinessUnit
   */
  externalAffiliation: string;
  /**
   * The name of the contact person for the Business Unit.
   * @type {string}
   * @memberof BusinessUnit
   */
  contactName: string;
  /**
   * The surname of the contact person for the Business Unit.
   * @type {string}
   * @memberof BusinessUnit
   */
  contactSurname: string;
  /**
   * The cellphone number of the contact person for the Business Unit.
   * @type {string}
   * @memberof BusinessUnit
   */
  contactNumber: string;
  /**
   * The email address of the contact person for the Business Unit.
   * @type {string}
   * @memberof BusinessUnit
   */
  emailAddress: string;
  /**
   * The status of the Business Unit. Either 'Active' or 'Inactive'.
   * @type {('Active'|'Inactive')}
   * @memberof BusinessUnit
   */
  status?: 'Active' | 'Inactive';
  /**
   * The reason for deactivating the Business Unit.
   * @type {string}
   * @memberof BusinessUnit
   */
  deactivationReason?: string;
}

/**
 * Represents a branch.
 * @interface Branch
 */
export interface Branch {
  /**
   * The unique identifier for the branch.
   * @type {string}
   * @memberof Branch
   */
  id?: string;
  /**
   * The unique identifier for the business unit that the branch belongs to.
   * @type {string}
   * @memberof Branch
   */
  businessUnitId?: string;
  /**
   * The name of the branch.
   * @type {string}
   * @memberof Branch
   */
  name: string;
  /**
   * The region in which the branch operates.
   * @type {string}
   * @memberof Branch
   */
  region: string;
  /**
   * The bank codes associated with the branch.
   * @type {BranchBankCodes}
   * @memberof Branch
   */
  bankCodes?: BranchBankCodes;
  /**
   * The status of the branch. Either 'Active' or 'Inactive'.
   * @type {('Active'|'Inactive')}
   * @memberof Branch
   */
  status?: 'Active' | 'Inactive';
}

/**
 * Represents the bank codes associated with a branch.
 * @interface BranchBankCodes
 */
export interface BranchBankCodes {
  /**
   * The ABSA bank code.
   * @type {string}
   * @memberof BranchBankCodes
   */
  absa?: string;
  /**
   * The FNB MoRetail bank code.
   * @type {string}
   * @memberof BranchBankCodes
   */
  fnbMORetail?: string;
  /**
   * The FNB Development bank code.
   * @type {string}
   * @memberof BranchBankCodes
   */
  fnbDevelopment?: string;
  /**
   * The HIP bank code.
   * @type {string}
   * @memberof BranchBankCodes
   */
  hip?: string;
  /**
   * The Nedbank bank code.
   * @type {string}
   * @memberof BranchBankCodes
   */
  nedbank?: string;
  /**
   * The SAHL bank code.
   * @type {string}
   * @memberof BranchBankCodes
   */
  sahl?: string;
  /**
   * The SBSA bank code.
   * @type {string}
   * @memberof BranchBankCodes
   */
  sbsa?: string;
  /**
   * The SBSA channel code.
   * @type {string}
   * @memberof BranchBankCodes
   */
  sbsaChannel?: string;
}

/**
 * Represents a vendor code.
 * @interface VendorCode
 */
export interface VendorCode {
  /**
   * The unique identifier of the vendor code.
   * @type {string}
   * @memberof VendorCode
   */
  id?: string;
  /**
   * The code associated with the vendor code.
   * @type {string}
   * @memberof VendorCode
   */
  code: string;
  /**
   * The description associated with the vendor code.
   * @type {string}
   * @memberof VendorCode
   */
  description: string;
  /**
   * The name of the bank associated with the vendor code.
   * @type {string}
   * @memberof VendorCode
   */
  bankName: string;
  /**
   * The description of the retail code associated with the vendor code.
   * @type {string}
   * @memberof VendorCode
   */
  retailCodeDescription?: string;
  /**
   * The description of the channel associated with the vendor code.
   * @type {string}
   * @memberof VendorCode
   */
  channelDescription?: string;
  /**
   * The status of the vendor code.
   * @type {'Active'| 'Inactive'}
   * @memberof VendorCode
   */
  status?: 'Active' | 'Inactive';
}

/**
 * Represents a User.
 * @interface User
 */
export interface User {
  /**
   * The id associated with the user.
   * @type {string}
   * @memberof User
   */
  id?: string;
  /**
   * The id associated with the business unit of the user.
   * @type {string}
   * @memberof User
   */
  businessUnitId?: string;
  /**
   * The name associated with the user.
   * @type {string}
   * @memberof User
   */
  userName: string;
  /**
   * The surname associated with the user.
   * @type {string}
   * @memberof User
   */
  userSurname: string;
  /**
   * The cellphone number associated with the user.
   * @type {string}
   * @memberof User
   */
  cellphoneNumber: string;
  /**
   * The email address associated with the user.
   * @type {string}
   * @memberof User
   */
  emailAddress: string;
  /**
   * The id associated with the role of the user.
   * @type {string}
   * @memberof User
   */
  roleId?: string;
  /**
   * The product associated with the user.
   * @type {string}
   * @memberof User
   */
  product: string;
  /**
   * The linked branches associated with the user.
   * @type {string[]}
   * @memberof User
   */
  linkedBranches?: string[];
  /**
   * The status of the user.
   * @type {'Active'| 'Inactive'}
   * @memberof User
   */
  status?: 'Active' | 'Inactive';
}

/**
 * Represents a Role.
 * @interface Role
 */
export interface Role {
  /**
   * The unique identifier of the role.
   * @type {string}
   * @memberof Role
   */
  id?: string;
  /**
   * The description associated with the role.
   * @type {string}
   * @memberof Role
   */
  description: string;
  /**
   * The permissions associated with the role.
   * @type {string[]}
   * @memberof Role
   */
  permissions: string[];
  /**
   * The status of the role.
   * @type {'Active'| 'Inactive'}
   * @memberof Role
   */
  status?: 'Active' | 'Inactive';
}
