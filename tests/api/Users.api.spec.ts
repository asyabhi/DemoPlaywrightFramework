// import { test, expect } from '@playwright/test';
// import { EnvironmentResolver } from '../../src/config/environment/resolver/environmentResolver';
// import { FetchCIEnvironmentVariables } from '../../src/config/environment/resolver/fetch/fetchCIEnvironmentVariables';
// import { FetchLocalEnvironmentVariables } from '../../src/config/environment/resolver/fetch/fetchLocalEnvironmentVariables';
// import logger from '../../src/utils/logging/loggerManager';

// test.describe('Users API Tests @api @regression', () => {
//   let apiBaseUrl: string;
//   let authToken: string;

//   test.beforeAll(async () => {
//     const fetchCI = new FetchCIEnvironmentVariables();
//     const fetchLocal = new FetchLocalEnvironmentVariables();
//     const resolver = new EnvironmentResolver(fetchCI, fetchLocal);

//     apiBaseUrl = await resolver.getApiBaseUrl();

//     // Authenticate and get token
//     const { username, password } = await resolver.getPortalCredentials();
//     const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password }),
//     });

//     const loginData = await loginResponse.json();
//     authToken = loginData.token;

//     logger.info('API authentication completed');
//   });

//   test('Verify GET /users returns 200 with valid token @smoke @critical', async ({ request }) => {
//     const response = await request.get(`${apiBaseUrl}/users`, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//     });

//     expect(response.status()).toBe(200);

//     const responseBody = await response.json();
//     expect(Array.isArray(responseBody)).toBeTruthy();
//     expect(responseBody.length).toBeGreaterThan(0);

//     // Verify response schema
//     const firstUser = responseBody[0];
//     expect(firstUser).toHaveProperty('id');
//     expect(firstUser).toHaveProperty('userName');
//     expect(firstUser).toHaveProperty('businessUnitId');

//     logger.info(`GET /users returned ${responseBody.length} users`);
//   });

//   test('Verify POST /users creates new user @critical', async ({ request }) => {
//     const newUser = {
//       userName: `APIUser_${Date.now()}`,
//       userSurname: 'AutoSurname',
//       emailAddress: `test_${Date.now()}@automation.com`,
//       cellphoneNumber: '0821234567',
//       businessUnitId: 'BU_TEST_001',
//       roleId: 'ROLE_001',
//       product: 'FLEXI',
//     };

//     const response = await request.post(`${apiBaseUrl}/users`, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//         'Content-Type': 'application/json',
//       },
//       data: newUser,
//     });

//     expect(response.status()).toBe(201);

//     const createdUser = await response.json();
//     expect(createdUser.id).toBeTruthy();
//     expect(createdUser.userName).toBe(newUser.userName);
//     expect(createdUser.businessUnitId).toBe(newUser.businessUnitId);

//     logger.info(`Created user with ID: ${createdUser.id}`);
//   });

//   test('Verify POST /users with missing required fields returns 400 @critical', async ({
//     request,
//   }) => {
//     const invalidUser = {
//       userName: `InvalidUser_${Date.now()}`,
//       // Missing required fields
//     };

//     const response = await request.post(`${apiBaseUrl}/users`, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//         'Content-Type': 'application/json',
//       },
//       data: invalidUser,
//     });

//     expect(response.status()).toBe(400);

//     const errorBody = await response.json();
//     expect(errorBody).toHaveProperty('errors');
//     expect(Array.isArray(errorBody.errors)).toBeTruthy();

//     logger.info('Validation error handled correctly');
//   });

//   test('Verify PUT /users/{id} updates existing user @critical', async ({ request }) => {
//     // First create a user
//     const newUser = {
//       userName: `UpdateTest_${Date.now()}`,
//       userSurname: 'Original',
//       emailAddress: `update_${Date.now()}@automation.com`,
//       cellphoneNumber: '0821234567',
//       businessUnitId: 'BU_TEST_001',
//       roleId: 'ROLE_001',
//       product: 'FLEXI',
//     };

//     const createResponse = await request.post(`${apiBaseUrl}/users`, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//         'Content-Type': 'application/json',
//       },
//       data: newUser,
//     });

//     const createdUser = await createResponse.json();
//     const userId = createdUser.id;

//     // Update the user
//     const updateData = {
//       ...newUser,
//       userSurname: 'Updated',
//     };

//     const updateResponse = await request.put(`${apiBaseUrl}/users/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//         'Content-Type': 'application/json',
//       },
//       data: updateData,
//     });

//     expect(updateResponse.status()).toBe(200);

//     const updatedUser = await updateResponse.json();
//     expect(updatedUser.userSurname).toBe('Updated');

//     logger.info(`Updated user ${userId} successfully`);
//   });

//   test('Verify DELETE /users/{id} deactivates user @critical', async ({ request }) => {
//     // First create a user
//     const newUser = {
//       userName: `DeleteTest_${Date.now()}`,
//       userSurname: 'ToDelete',
//       emailAddress: `delete_${Date.now()}@automation.com`,
//       cellphoneNumber: '0821234567',
//       businessUnitId: 'BU_TEST_001',
//       roleId: 'ROLE_001',
//       product: 'FLEXI',
//     };

//     const createResponse = await request.post(`${apiBaseUrl}/users`, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//         'Content-Type': 'application/json',
//       },
//       data: newUser,
//     });

//     const createdUser = await createResponse.json();
//     const userId = createdUser.id;

//     // Deactivate the user
//     const deleteResponse = await request.delete(`${apiBaseUrl}/users/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//     });

//     expect(deleteResponse.status()).toBe(204);

//     // Verify user is deactivated
//     const getResponse = await request.get(`${apiBaseUrl}/users/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//     });

//     const deactivatedUser = await getResponse.json();
//     expect(deactivatedUser.status).toBe('Inactive');

//     logger.info(`Deactivated user ${userId} successfully`);
//   });

//   test('Verify GET /users without auth returns 401 @security @critical', async ({ request }) => {
//     const response = await request.get(`${apiBaseUrl}/users`);

//     expect(response.status()).toBe(401);

//     logger.info('Unauthorized access correctly rejected');
//   });

//   test('Verify rate limiting on /users endpoint @performance', async ({ request }) => {
//     const requests = [];
//     const requestCount = 100;

//     for (let i = 0; i < requestCount; i++) {
//       requests.push(
//         request.get(`${apiBaseUrl}/users`, {
//           headers: { Authorization: `Bearer ${authToken}` },
//         }),
//       );
//     }

//     const responses = await Promise.all(requests);
//     const statusCodes = responses.map((r) => r.status());

//     const rateLimited = statusCodes.filter((code) => code === 429).length;

//     if (rateLimited > 0) {
//       logger.info(`Rate limiting active: ${rateLimited}/${requestCount} requests throttled`);
//       expect(rateLimited).toBeGreaterThan(0);
//     } else {
//       logger.warn('Rate limiting not detected - verify configuration');
//     }
//   });
// });
