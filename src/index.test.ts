import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  successResponse,
  errorResponse,
  isSuccessResponse,
  isErrorResponse,
  type User,
  type History,
  type HistoryCreateRequest,
  type HistoryUpdateRequest,
  type HistoryTotalResponse,
  type BaseResponse,
  type NetworkClient,
  type Optional,
  type ISODateString,
} from './index';

describe('starter_types', () => {
  describe('successResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: '123', name: 'Test' };
      const response = successResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: '123', name: 'Test' });
      expect(typeof response.timestamp).toBe('string');
    });

    it('should create a success response with string data', () => {
      const response = successResponse('test string');

      expect(response.success).toBe(true);
      expect(response.data).toBe('test string');
    });

    it('should create a success response with array data', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = successResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should create a success response with null data', () => {
      const response = successResponse(null);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });

    it('should not have an error property', () => {
      const response = successResponse('ok');

      expect(response.success).toBe(true);
      expect(response).not.toHaveProperty('error');
    });
  });

  describe('errorResponse', () => {
    it('should create an error response with message', () => {
      const response = errorResponse('Something went wrong');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Something went wrong');
      expect(typeof response.timestamp).toBe('string');
    });

    it('should create an error response with empty string', () => {
      const response = errorResponse('');

      expect(response.success).toBe(false);
      expect(response.error).toBe('');
    });

    it('should not have a data property', () => {
      const response = errorResponse('error');

      expect(response.success).toBe(false);
      expect(response).not.toHaveProperty('data');
    });
  });

  describe('Type structure validation', () => {
    it('User type should accept valid user objects', () => {
      const user: User = {
        firebase_uid: 'uid123',
        email: 'test@example.com',
        display_name: 'Test User',
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: '2025-01-15T10:30:00.000Z',
      };

      expect(user.firebase_uid).toBe('uid123');
      expect(user.email).toBe('test@example.com');
    });

    it('User type should accept null fields', () => {
      const user: User = {
        firebase_uid: 'uid123',
        email: null,
        display_name: null,
        created_at: null,
        updated_at: null,
      };

      expect(user.email).toBeNull();
      expect(user.display_name).toBeNull();
    });

    it('History type should accept valid history objects', () => {
      const history: History = {
        id: 'hist-uuid-1',
        user_id: 'uid123',
        datetime: '2025-01-15T10:30:00.000Z',
        value: 42.5,
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: null,
      };

      expect(history.id).toBe('hist-uuid-1');
      expect(history.value).toBe(42.5);
    });

    it('HistoryCreateRequest should have required fields', () => {
      const request: HistoryCreateRequest = {
        datetime: '2025-01-15T10:30:00.000Z',
        value: 100,
      };

      expect(request.datetime).toBeDefined();
      expect(request.value).toBe(100);
    });

    it('HistoryUpdateRequest should allow partial fields', () => {
      const request1: HistoryUpdateRequest = { value: 50 };
      const request2: HistoryUpdateRequest = { datetime: '2025-01-15T12:00:00.000Z' };
      const request3: HistoryUpdateRequest = {};

      expect(request1.value).toBe(50);
      expect(request1.datetime).toBeUndefined();
      expect(request2.datetime).toBeDefined();
      expect(request3).toEqual({});
    });

    it('HistoryTotalResponse should have total field', () => {
      const response: HistoryTotalResponse = { total: 1234.56 };

      expect(response.total).toBe(1234.56);
    });
  });

  describe('BaseResponse type compatibility', () => {
    it('successResponse should produce valid BaseResponse<T>', () => {
      const response: BaseResponse<History[]> = successResponse([]);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
    });

    it('errorResponse should produce valid BaseResponse<never>', () => {
      const response: BaseResponse<never> = errorResponse('not found');

      expect(response.success).toBe(false);
      expect(response.error).toBe('not found');
    });
  });

  describe('Re-exported types', () => {
    it('Optional type should work', () => {
      const val1: Optional<string> = 'hello';
      const val2: Optional<string> = null;
      const val3: Optional<string> = undefined;

      expect(val1).toBe('hello');
      expect(val2).toBeNull();
      expect(val3).toBeUndefined();
    });
  });

  describe('successResponse edge cases', () => {
    it('should create a success response with undefined data', () => {
      const response = successResponse(undefined);

      expect(response.success).toBe(true);
      expect(response.data).toBeUndefined();
    });

    it('should generate valid ISO 8601 timestamp format', () => {
      const response = successResponse({ test: 'data' });

      // Verify ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(response.timestamp).toMatch(iso8601Regex);
    });
  });

  describe('errorResponse edge cases', () => {
    it('should have both success: false and no data property simultaneously', () => {
      const response = errorResponse('Something failed');

      expect(response.success).toBe(false);
      expect(response).not.toHaveProperty('data');
      expect(Object.keys(response).sort()).toEqual(['error', 'success', 'timestamp']);
    });

    it('should generate valid ISO 8601 timestamp format', () => {
      const response = errorResponse('test error');

      // Verify ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(response.timestamp).toMatch(iso8601Regex);
    });
  });

  describe('ApiResponse type compatibility', () => {
    it('successResponse should work with ApiResponse type annotation', () => {
      const response: BaseResponse<History> = successResponse({
        id: '123',
        user_id: 'user1',
        datetime: '2025-01-15T10:30:00.000Z',
        value: 100,
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: null,
      });

      expect(response.success).toBe(true);
      expect(response.data.id).toBe('123');
    });
  });

  describe('Type guards: isSuccessResponse', () => {
    it('should return true for success responses', () => {
      const response = successResponse({ id: '1', name: 'test' });

      expect(isSuccessResponse(response)).toBe(true);
    });

    it('should return false for error responses', () => {
      const response = errorResponse('error');

      expect(isSuccessResponse(response)).toBe(false);
    });

    it('should narrow type in conditional blocks', () => {
      const response: BaseResponse<{ message: string }> = successResponse({
        message: 'success',
      });

      if (isSuccessResponse(response)) {
        // TypeScript should recognize response.data here
        expect(response.data.message).toBe('success');
      }
    });

    it('should work with different data types', () => {
      const stringResponse = successResponse('test');
      const arrayResponse = successResponse([1, 2, 3]);
      const nullResponse = successResponse(null);

      expect(isSuccessResponse(stringResponse)).toBe(true);
      expect(isSuccessResponse(arrayResponse)).toBe(true);
      expect(isSuccessResponse(nullResponse)).toBe(true);
    });
  });

  describe('Type guards: isErrorResponse', () => {
    it('should return true for error responses', () => {
      const response = errorResponse('Something went wrong');

      expect(isErrorResponse(response)).toBe(true);
    });

    it('should return false for success responses', () => {
      const response = successResponse({ id: '1' });

      expect(isErrorResponse(response)).toBe(false);
    });

    it('should narrow type in conditional blocks', () => {
      const response: BaseResponse<never> = errorResponse('failed');

      if (isErrorResponse(response)) {
        // TypeScript should recognize response.error here
        expect(response.error).toBe('failed');
      }
    });

    it('should work with various error messages', () => {
      const normalError = errorResponse('Invalid input');
      const emptyError = errorResponse('');
      const longError = errorResponse(
        'This is a very long error message that provides detailed context about what went wrong'
      );

      expect(isErrorResponse(normalError)).toBe(true);
      expect(isErrorResponse(emptyError)).toBe(true);
      expect(isErrorResponse(longError)).toBe(true);
    });
  });

  describe('Type guard combinations', () => {
    it('should allow symmetric deconstruction of responses', () => {
      const successResp = successResponse({ value: 42 });
      const errorResp = errorResponse('failed');

      if (isSuccessResponse(successResp)) {
        expect(successResp.data.value).toBe(42);
      } else if (isErrorResponse(successResp)) {
        expect.fail('Should not reach here');
      }

      if (isErrorResponse(errorResp)) {
        expect(errorResp.error).toBe('failed');
      } else if (isSuccessResponse(errorResp)) {
        expect.fail('Should not reach here');
      }
    });

    it('should work with switch statements for response handling', () => {
      const responses: Array<BaseResponse<number | null>> = [
        successResponse(100),
        errorResponse('timeout'),
        successResponse(null),
      ];

      const results = responses.map((response) => {
        if (isSuccessResponse(response)) {
          return `Data: ${response.data}`;
        } else if (isErrorResponse(response)) {
          return `Error: ${response.error}`;
        }
        return 'Unknown';
      });

      expect(results).toEqual(['Data: 100', 'Error: timeout', 'Data: null']);
    });
  });

  describe('ISODateString type alias', () => {
    it('should accept ISO 8601 formatted strings', () => {
      const isoDate: ISODateString = '2025-01-15T10:30:00.000Z' as ISODateString;

      expect(isoDate).toBe('2025-01-15T10:30:00.000Z');
    });

    it('should be usable in History datetime field', () => {
      const history: History = {
        id: '123',
        user_id: 'user1',
        datetime: '2025-01-15T10:30:00.000Z',
        value: 100,
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: null,
      };

      expect(history.datetime).toBe('2025-01-15T10:30:00.000Z');
    });
  });
});
