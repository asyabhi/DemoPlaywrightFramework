// // Import specific types rather than the entire module
// import {
//   IncomeAndExpenditure,
//   InterceptorResponse,
//   OneTimePinResponse,
// } from '../../../models/ui/preQualifications/preQualificationUI.interface';

// // Internal type constraint for data that can be stored
// type StorableDataType = Record<string, string | number | null>;

// /**
//  * Create and export the PreQualification data store
//  */
// export const PreQualificationDataStore = {
//   incomeAndExpenditureData: new Map<string, IncomeAndExpenditure & StorableDataType>(),
//   interceptorData: new Map<string, InterceptorResponse & StorableDataType>(),
//   oneTimePinData: new Map<string, OneTimePinResponse & StorableDataType>(),
// };
