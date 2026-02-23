// Re-export common types from @sudobility/types
export type {
  ApiResponse,
  BaseResponse,
  NetworkClient,
  Optional,
} from '@sudobility/types';
import type { BaseResponse } from '@sudobility/types';

// =============================================================================
// Type Aliases
// =============================================================================

/**
 * ISO 8601 formatted datetime string.
 *
 * @example "2025-01-15T10:30:00.000Z"
 */
export type ISODateString = string & { readonly __brand: 'ISODateString' };

// =============================================================================
// User
// =============================================================================

/**
 * User account information.
 *
 * @example
 * ```typescript
 * const user: User = {
 *   firebase_uid: 'uid123',
 *   email: 'user@example.com',
 *   display_name: 'John Doe',
 *   created_at: '2025-01-15T10:30:00.000Z',
 *   updated_at: '2025-01-15T10:30:00.000Z',
 * };
 * ```
 */
export interface User {
  /** Firebase Authentication UID */
  firebase_uid: string;
  /** User email address, nullable */
  email: string | null;
  /** User display name, nullable */
  display_name: string | null;
  /** ISO 8601 timestamp of account creation, nullable */
  created_at: string | null;
  /** ISO 8601 timestamp of last update, nullable */
  updated_at: string | null;
}

// =============================================================================
// History
// =============================================================================

/**
 * Core domain entity representing a historical data point.
 *
 * @example
 * ```typescript
 * const history: History = {
 *   id: 'hist-uuid-1',
 *   user_id: 'uid123',
 *   datetime: '2025-01-15T10:30:00.000Z',
 *   value: 42.5,
 *   created_at: '2025-01-15T10:30:00.000Z',
 *   updated_at: null,
 * };
 * ```
 */
export interface History {
  /** Unique identifier for this history record */
  id: string;
  /** Foreign key reference to the owning user */
  user_id: string;
  /** ISO 8601 formatted datetime when the event occurred */
  datetime: string;
  /** Numeric value associated with this history record, must be positive */
  value: number;
  /** ISO 8601 timestamp when the record was created, nullable */
  created_at: string | null;
  /** ISO 8601 timestamp of the last update, nullable */
  updated_at: string | null;
}

/**
 * Request body for creating a new history record.
 *
 * @example
 * ```typescript
 * const createRequest: HistoryCreateRequest = {
 *   datetime: '2025-01-15T10:30:00.000Z',
 *   value: 100,
 * };
 * ```
 */
export interface HistoryCreateRequest {
  /** ISO 8601 formatted datetime when the event occurred */
  datetime: string;
  /** Numeric value associated with the record, must be positive */
  value: number;
}

/**
 * Request body for updating an existing history record.
 * All fields are optional; omitted fields are not updated.
 *
 * @example
 * ```typescript
 * const updateRequest: HistoryUpdateRequest = {
 *   value: 150,
 * };
 * ```
 */
export interface HistoryUpdateRequest {
  /** ISO 8601 formatted datetime, optional for updates */
  datetime?: string;
  /** Numeric value, optional for updates, must be positive if provided */
  value?: number;
}

// =============================================================================
// API Responses
// =============================================================================

/**
 * Response containing the total sum of all history records for a user.
 *
 * @example
 * ```typescript
 * const totalResponse: HistoryTotalResponse = {
 *   total: 12345.67,
 * };
 * ```
 */
export interface HistoryTotalResponse {
  /** Sum of all values for the queried history records */
  total: number;
}

// =============================================================================
// Response Helpers
// =============================================================================

/**
 * Constructs a successful API response.
 *
 * Creates a {@link BaseResponse} with `success: true`, the provided data payload,
 * and a timestamp set to the current time in ISO 8601 format.
 *
 * @typeParam T - The type of the response payload
 * @param data - The response payload (can be any type, including `undefined` or `null`)
 * @returns A {@link BaseResponse} with `success: true` and `data` property set
 *
 * @example
 * ```typescript
 * // Successful single record
 * const response1 = successResponse({ id: '123', name: 'test' });
 *
 * // Array of records
 * const response2 = successResponse([
 *   { id: '1', value: 100 },
 *   { id: '2', value: 200 },
 * ]);
 *
 * // Null or undefined data (valid, though potentially unusual)
 * const response3 = successResponse(null);
 * ```
 *
 * @internal
 * Timestamp is always included in the response envelope and formatted as ISO 8601.
 */
export function successResponse<T>(data: T): BaseResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

/**
 * Constructs an error API response.
 *
 * Creates a {@link BaseResponse} with `success: false`, the provided error message,
 * and a timestamp set to the current time in ISO 8601 format.
 *
 * **Note:** This function accepts empty strings as valid error messages. While this
 * is allowed by the runtime and type system, it is generally recommended to provide
 * meaningful, non-empty error descriptions for better debugging and client-side handling.
 *
 * @param error - A descriptive error message (may be empty, though not recommended)
 * @returns A {@link BaseResponse} with `success: false` and `error` property set
 *
 * @example
 * ```typescript
 * // Standard error
 * const response1 = errorResponse('User not found');
 *
 * // Error with context
 * const response2 = errorResponse('Invalid datetime format: expected ISO 8601');
 *
 * // Empty string (allowed but not recommended)
 * const response3 = errorResponse('');
 * ```
 *
 * @internal
 * Timestamp is always included in the response envelope and formatted as ISO 8601.
 */
export function errorResponse(error: string): BaseResponse<never> {
  return { success: false, error, timestamp: new Date().toISOString() };
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to narrow a {@link BaseResponse} to a successful response.
 *
 * Checks if a response has `success: true`, allowing TypeScript to narrow
 * the type to access the `data` property safely.
 *
 * @typeParam T - The expected type of the response data
 * @param response - The response to check
 * @returns `true` if the response is successful, `false` otherwise
 *
 * @example
 * ```typescript
 * async function fetchHistory(): Promise<BaseResponse<History[]>> {
 *   const response = await client.get('/history');
 *   if (isSuccessResponse<History[]>(response)) {
 *     // TypeScript now knows response.data is History[]
 *     const histories = response.data;
 *     return histories;
 *   }
 *   console.error('Failed:', response.error);
 * }
 * ```
 */
export function isSuccessResponse<T>(
  response: BaseResponse<T>
): response is BaseResponse<T> & { success: true; data: T } {
  return response.success === true;
}

/**
 * Type guard to narrow a {@link BaseResponse} to an error response.
 *
 * Checks if a response has `success: false`, allowing TypeScript to narrow
 * the type to access the `error` property safely.
 *
 * @param response - The response to check
 * @returns `true` if the response is an error, `false` otherwise
 *
 * @example
 * ```typescript
 * async function updateHistory(id: string, value: number): Promise<void> {
 *   const response = await client.patch(`/history/${id}`, { value });
 *   if (isErrorResponse(response)) {
 *     // TypeScript now knows response.error is string
 *     throw new Error(response.error);
 *   }
 *   // Success case
 * }
 * ```
 */
export function isErrorResponse(
  response: BaseResponse<unknown>
): response is BaseResponse<never> & { success: false; error: string } {
  return response.success === false;
}
