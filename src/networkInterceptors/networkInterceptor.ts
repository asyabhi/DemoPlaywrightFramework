// import { Page, Response } from '@playwright/test';
// import TestDataStoreManager from '../utils/dataStore/testDataStoreManager';
// import { PreQualificationDataStore } from '../utils/dataStore/maps/preQualificationMapper';
// import SanitizationConfig from '../utils/sanitization/sanitizationConfig';
// import ErrorHandler from '../utils/errors/errorHandler';
// import logger from '../utils/logging/loggerManager';

// export class NetworkInterceptor {
//   /*
//    * NetworkInterceptor is a class responsible for intercepting network responses and capturing important values.
//    *
//    * Key Features:
//    * - Captures network responses for specific JSON endpoints
//    * - Stores captured values in a shared test data context
//    * - Provides robust error handling and logging
//    *
//    * Best Practices:
//    * - Create a new instance for each test to ensure test isolation
//    * - Unique testId prevents data leakage between tests
//    *
//    * @example
//    * const interceptor = new NetworkInterceptor(page, "uniqueTestId");
//    */
//   readonly page: Page;
//   private testId: string;
//   private responseValues: preQualificationUIDataTypes.InterceptorResponse = {
//     preQualificationId: null,
//     applicantId: null,
//     coApplicantId: null,
//     authorizationHeader: null,
//   };

//   constructor(page: Page, testId: string) {
//     this.page = page;
//     this.testId = testId;
//     this.initialize();
//     logger.info(`NetworkInterceptor initialized for test: ${testId}`);
//   }

//   /**
//    * Initializes the NetworkInterceptor by adding a response event listener.
//    * Binds the handleResponse method to ensure correct context.
//    * @private
//    */
//   private initialize(): void {
//     this.page.on('response', this.handleResponse.bind(this));
//     logger.debug('Response event listener added to the page.');
//   }

//   /**
//    * Handles response events, filtering for successful JSON responses.
//    * Parses the response body and captures relevant values.
//    * @param response - The network response to process
//    * @private
//    */
//   private async handleResponse(response: Response): Promise<void> {
//     try {
//       // Early return for non-JSON 200 OK responses
//       if (
//         response.status() !== 200 ||
//         !response.headers()['content-type']?.includes('application/json')
//       ) {
//         return;
//       }

//       const responseBody: preQualificationUIDataTypes.InterceptorResponseBody =
//         await response.json();

//       logger.debug(`Processing JSON response from: ${response.url()}`);

//       this.captureValues(responseBody, response);
//       await this.storeResponseValues(this.testId);
//     } catch (error) {
//       // Only log and rethrow if it's not a parsing or filtering error
//       if (!(error instanceof Error && error.message.includes('JSON'))) {
//         ErrorHandler.captureError(
//           error,
//           'handleResponse',
//           `Failed to process response from ${response.url()}`,
//         );
//         throw error;
//       }
//     }
//   }

//   /**
//    * Captures key values from the response body and response headers.
//    * Uses defensive programming techniques to handle potential undefined values.
//    * @param responseBody - Parsed response body
//    * @param response - Original network response
//    * @private
//    */
//   private captureValues(
//     responseBody: preQualificationUIDataTypes.InterceptorResponseBody,
//     response: Response,
//   ): void {
//     try {
//       const { preQualificationId, applicants = [] } = responseBody;

//       // More robust value capture with explicit fallback
//       this.responseValues = {
//         preQualificationId: preQualificationId ?? this.responseValues.preQualificationId,
//         applicantId: applicants[0]?.applicantId ?? null,
//         coApplicantId: applicants[1]?.applicantId ?? null,
//         authorizationHeader: response.request().headers()['authorization'] ?? null,
//       };

//       // Sanitize by wrapping in an object with the key "authorization"
//       const sanitizedAuth = SanitizationConfig.sanitizeData({
//         authorization: this.responseValues.authorizationHeader,
//       });

//       const sanitizedResponse = {
//         ...this.responseValues,
//         authorizationHeader: sanitizedAuth.authorization, // Get masked value
//       };

//       logger.debug(`Captured values: ${JSON.stringify(sanitizedResponse, null, 2)}`);
//     } catch (error) {
//       ErrorHandler.captureError(
//         error,
//         'captureValues',
//         `Failed to capture values from response: ${response.url()}`,
//       );
//       throw error;
//     }
//   }

//   /**
//    * Stores a single value in the shared test data store.
//    * Provides granular logging and error handling for individual value storage.
//    * @param key - The key to store the value under
//    * @param value - The value to store
//    * @param testId - The unique test identifier
//    * @private
//    */
//   private async storeInterceptorData(
//     key: keyof preQualificationUIDataTypes.InterceptorResponse,
//     value: string | null,
//     testId: string,
//   ): Promise<void> {
//     if (!value) {
//       logger.warn(`${key} not captured and will not be stored.`);
//       return;
//     }

//     try {
//       TestDataStoreManager.setValue(PreQualificationDataStore.interceptorData, testId, key, value);
//       logger.debug(`'${key}' stored successfully for test: ${testId}`);
//     } catch (error) {
//       ErrorHandler.captureError(error, 'storeValue', `Failed to store value for key: ${key}`);
//       throw error;
//     }
//   }

//   /**
//    * Stores all captured response values in the shared test data store.
//    * Provides comprehensive error handling for batch value storage.
//    * @param testId - The unique test identifier
//    * @private
//    */
//   private async storeResponseValues(testId: string): Promise<void> {
//     try {
//       const storagePromises = Object.entries(this.responseValues).map(([key, value]) =>
//         this.storeInterceptorData(
//           key as keyof preQualificationUIDataTypes.InterceptorResponse,
//           value,
//           testId,
//         ),
//       );

//       await Promise.all(storagePromises);
//     } catch (error) {
//       ErrorHandler.captureError(
//         error,
//         'storeResponseValues',
//         'Batch storage of response values failed',
//       );
//       throw error;
//     }
//   }
// }
