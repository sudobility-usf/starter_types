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
  type ApiResponse,
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

  describe('successResponse numeric and boolean edge cases', () => {
    it('should handle zero as data', () => {
      const response = successResponse(0);

      expect(response.success).toBe(true);
      expect(response.data).toBe(0);
    });

    it('should handle negative numbers as data', () => {
      const response = successResponse(-42);

      expect(response.success).toBe(true);
      expect(response.data).toBe(-42);
    });

    it('should handle NaN as data', () => {
      const response = successResponse(NaN);

      expect(response.success).toBe(true);
      expect(response.data).toBeNaN();
    });

    it('should handle Infinity as data', () => {
      const response = successResponse(Infinity);

      expect(response.success).toBe(true);
      expect(response.data).toBe(Infinity);
    });

    it('should handle negative Infinity as data', () => {
      const response = successResponse(-Infinity);

      expect(response.success).toBe(true);
      expect(response.data).toBe(-Infinity);
    });

    it('should handle boolean true as data', () => {
      const response = successResponse(true);

      expect(response.success).toBe(true);
      expect(response.data).toBe(true);
    });

    it('should handle boolean false as data', () => {
      const response = successResponse(false);

      expect(response.success).toBe(true);
      expect(response.data).toBe(false);
    });

    it('should handle empty string as data', () => {
      const response = successResponse('');

      expect(response.success).toBe(true);
      expect(response.data).toBe('');
    });
  });

  describe('successResponse data reference identity', () => {
    it('should preserve object reference', () => {
      const data = { id: '1', nested: { value: 42 } };
      const response = successResponse(data);

      expect(response.data).toBe(data);
    });

    it('should preserve array reference', () => {
      const data = [1, 2, 3];
      const response = successResponse(data);

      expect(response.data).toBe(data);
    });

    it('should preserve deeply nested structures', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              items: [{ a: 1 }, { b: 2 }],
            },
          },
        },
      };
      const response = successResponse(data);

      expect(response.data).toBe(data);
      expect(response.data!.level1.level2.level3.items[0].a).toBe(1);
    });
  });

  describe('successResponse timestamp correctness', () => {
    it('should produce a timestamp close to current time', () => {
      const before = Date.now();
      const response = successResponse('data');
      const after = Date.now();

      const responseTime = new Date(response.timestamp).getTime();
      expect(responseTime).toBeGreaterThanOrEqual(before);
      expect(responseTime).toBeLessThanOrEqual(after);
    });

    it('should produce non-decreasing timestamps across calls', () => {
      const r1 = successResponse('first');
      const r2 = successResponse('second');
      const r3 = successResponse('third');

      const t1 = new Date(r1.timestamp).getTime();
      const t2 = new Date(r2.timestamp).getTime();
      const t3 = new Date(r3.timestamp).getTime();

      expect(t2).toBeGreaterThanOrEqual(t1);
      expect(t3).toBeGreaterThanOrEqual(t2);
    });
  });

  describe('errorResponse timestamp correctness', () => {
    it('should produce a timestamp close to current time', () => {
      const before = Date.now();
      const response = errorResponse('err');
      const after = Date.now();

      const responseTime = new Date(response.timestamp).getTime();
      expect(responseTime).toBeGreaterThanOrEqual(before);
      expect(responseTime).toBeLessThanOrEqual(after);
    });
  });

  describe('errorResponse special characters', () => {
    it('should handle unicode characters in error message', () => {
      const response = errorResponse('Error: 日本語エラー');

      expect(response.error).toBe('Error: 日本語エラー');
    });

    it('should handle newlines in error message', () => {
      const response = errorResponse('Line 1\nLine 2\nLine 3');

      expect(response.error).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle special characters in error message', () => {
      const response = errorResponse('Error: <script>alert("xss")</script>');

      expect(response.error).toBe('Error: <script>alert("xss")</script>');
    });

    it('should handle emoji in error message', () => {
      const response = errorResponse('Failed 💥');

      expect(response.error).toBe('Failed 💥');
    });
  });

  describe('successResponse response key structure', () => {
    it('should contain exactly success, data, and timestamp keys', () => {
      const response = successResponse('test');

      expect(Object.keys(response).sort()).toEqual(['data', 'success', 'timestamp']);
    });
  });

  describe('Type guards with manually constructed responses', () => {
    it('isSuccessResponse should return true for manually constructed success', () => {
      const response: BaseResponse<string> = {
        success: true,
        data: 'manual',
        timestamp: '2025-01-15T10:30:00.000Z',
      };

      expect(isSuccessResponse(response)).toBe(true);
    });

    it('isSuccessResponse should return false for manually constructed error', () => {
      const response: BaseResponse<string> = {
        success: false,
        error: 'manual error',
        timestamp: '2025-01-15T10:30:00.000Z',
      };

      expect(isSuccessResponse(response)).toBe(false);
    });

    it('isErrorResponse should return true for manually constructed error', () => {
      const response: BaseResponse<unknown> = {
        success: false,
        error: 'manual error',
        timestamp: '2025-01-15T10:30:00.000Z',
      };

      expect(isErrorResponse(response)).toBe(true);
    });

    it('isErrorResponse should return false for manually constructed success', () => {
      const response: BaseResponse<unknown> = {
        success: true,
        data: 42,
        timestamp: '2025-01-15T10:30:00.000Z',
      };

      expect(isErrorResponse(response)).toBe(false);
    });

    it('type guards should be mutually exclusive on manual responses', () => {
      const success: BaseResponse<number> = {
        success: true,
        data: 1,
        timestamp: new Date().toISOString(),
      };
      const error: BaseResponse<number> = {
        success: false,
        error: 'fail',
        timestamp: new Date().toISOString(),
      };

      expect(isSuccessResponse(success)).toBe(true);
      expect(isErrorResponse(success)).toBe(false);
      expect(isErrorResponse(error)).toBe(true);
      expect(isSuccessResponse(error)).toBe(false);
    });
  });

  describe('HistoryTotalResponse edge values', () => {
    it('should accept zero total', () => {
      const response: HistoryTotalResponse = { total: 0 };

      expect(response.total).toBe(0);
    });

    it('should accept negative total', () => {
      const response: HistoryTotalResponse = { total: -100 };

      expect(response.total).toBe(-100);
    });

    it('should accept very large total', () => {
      const response: HistoryTotalResponse = { total: Number.MAX_SAFE_INTEGER };

      expect(response.total).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should accept fractional total', () => {
      const response: HistoryTotalResponse = { total: 0.001 };

      expect(response.total).toBeCloseTo(0.001);
    });
  });

  describe('History with nullable field combinations', () => {
    it('should accept all nullable fields set to non-null', () => {
      const history: History = {
        id: '1',
        user_id: 'u1',
        datetime: '2025-06-01T00:00:00.000Z',
        value: 10,
        created_at: '2025-06-01T00:00:00.000Z',
        updated_at: '2025-06-02T00:00:00.000Z',
      };

      expect(history.created_at).not.toBeNull();
      expect(history.updated_at).not.toBeNull();
    });

    it('should accept all nullable fields set to null', () => {
      const history: History = {
        id: '2',
        user_id: 'u2',
        datetime: '2025-06-01T00:00:00.000Z',
        value: 0,
        created_at: null,
        updated_at: null,
      };

      expect(history.created_at).toBeNull();
      expect(history.updated_at).toBeNull();
    });

    it('should accept mixed nullable fields', () => {
      const history: History = {
        id: '3',
        user_id: 'u3',
        datetime: '2025-06-01T00:00:00.000Z',
        value: 5,
        created_at: '2025-06-01T00:00:00.000Z',
        updated_at: null,
      };

      expect(history.created_at).not.toBeNull();
      expect(history.updated_at).toBeNull();
    });
  });

  describe('HistoryUpdateRequest combinations', () => {
    it('should accept both fields provided', () => {
      const request: HistoryUpdateRequest = {
        datetime: '2025-06-01T00:00:00.000Z',
        value: 200,
      };

      expect(request.datetime).toBeDefined();
      expect(request.value).toBe(200);
    });
  });

  describe('HistoryCreateRequest with edge values', () => {
    it('should accept zero value', () => {
      const request: HistoryCreateRequest = {
        datetime: '2025-01-01T00:00:00.000Z',
        value: 0,
      };

      expect(request.value).toBe(0);
    });

    it('should accept very large value', () => {
      const request: HistoryCreateRequest = {
        datetime: '2025-01-01T00:00:00.000Z',
        value: 999999999.99,
      };

      expect(request.value).toBe(999999999.99);
    });
  });

  describe('User type edge cases', () => {
    it('should accept empty string for email and display_name', () => {
      const user: User = {
        firebase_uid: 'uid',
        email: '',
        display_name: '',
        created_at: null,
        updated_at: null,
      };

      expect(user.email).toBe('');
      expect(user.display_name).toBe('');
    });
  });

  describe('ApiResponse re-export', () => {
    it('should be usable as a type alias', () => {
      const response: ApiResponse = {
        success: true,
        data: { key: 'value' },
        timestamp: new Date().toISOString(),
      };

      expect(response.success).toBe(true);
    });
  });

  describe('NetworkClient interface conformance', () => {
    it('should accept a valid mock implementation', () => {
      const mockResponse = {
        success: true as const,
        data: 'result',
        timestamp: new Date().toISOString(),
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      };

      const client: NetworkClient = {
        request: vi.fn().mockResolvedValue(mockResponse),
        get: vi.fn().mockResolvedValue(mockResponse),
        post: vi.fn().mockResolvedValue(mockResponse),
        put: vi.fn().mockResolvedValue(mockResponse),
        delete: vi.fn().mockResolvedValue(mockResponse),
      };

      expect(client.get).toBeDefined();
      expect(client.post).toBeDefined();
      expect(client.put).toBeDefined();
      expect(client.delete).toBeDefined();
      expect(client.request).toBeDefined();
    });

    it('should return correct types from mock methods', async () => {
      const mockResponse = {
        success: true as const,
        data: { id: '1' },
        timestamp: new Date().toISOString(),
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      const client: NetworkClient = {
        request: vi.fn().mockResolvedValue(mockResponse),
        get: vi.fn().mockResolvedValue(mockResponse),
        post: vi.fn().mockResolvedValue(mockResponse),
        put: vi.fn().mockResolvedValue(mockResponse),
        delete: vi.fn().mockResolvedValue(mockResponse),
      };

      const result = await client.get('/api/test');
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data).toEqual({ id: '1' });
    });
  });

  describe('Optional type edge cases', () => {
    it('should accept complex nested Optional types', () => {
      const val: Optional<Optional<string>> = null;

      expect(val).toBeNull();
    });

    it('should accept Optional with object type', () => {
      const val1: Optional<{ name: string }> = { name: 'test' };
      const val2: Optional<{ name: string }> = null;
      const val3: Optional<{ name: string }> = undefined;

      expect(val1).toEqual({ name: 'test' });
      expect(val2).toBeNull();
      expect(val3).toBeUndefined();
    });

    it('should accept Optional with array type', () => {
      const val1: Optional<number[]> = [1, 2, 3];
      const val2: Optional<number[]> = null;

      expect(val1).toEqual([1, 2, 3]);
      expect(val2).toBeNull();
    });
  });

  describe('Response helpers used with domain types', () => {
    it('should wrap a User in successResponse', () => {
      const user: User = {
        firebase_uid: 'uid-abc',
        email: 'test@example.com',
        display_name: 'Test',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: null,
      };
      const response = successResponse(user);

      expect(response.success).toBe(true);
      expect(response.data!.firebase_uid).toBe('uid-abc');
    });

    it('should wrap a History array in successResponse', () => {
      const histories: History[] = [
        {
          id: '1',
          user_id: 'u1',
          datetime: '2025-01-01T00:00:00.000Z',
          value: 10,
          created_at: null,
          updated_at: null,
        },
        {
          id: '2',
          user_id: 'u1',
          datetime: '2025-01-02T00:00:00.000Z',
          value: 20,
          created_at: null,
          updated_at: null,
        },
      ];
      const response = successResponse(histories);

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
      expect(response.data![0].value).toBe(10);
      expect(response.data![1].value).toBe(20);
    });

    it('should wrap HistoryTotalResponse in successResponse', () => {
      const total: HistoryTotalResponse = { total: 500 };
      const response = successResponse(total);

      expect(response.success).toBe(true);
      expect(response.data!.total).toBe(500);
    });

    it('should type-guard a BaseResponse<History[]>', () => {
      const response: BaseResponse<History[]> = successResponse([
        {
          id: '1',
          user_id: 'u1',
          datetime: '2025-01-01T00:00:00.000Z',
          value: 5,
          created_at: null,
          updated_at: null,
        },
      ]);

      if (isSuccessResponse(response)) {
        expect(response.data[0].id).toBe('1');
      } else {
        expect.fail('Expected success response');
      }
    });

    it('should type-guard an error response for History endpoint', () => {
      const response: BaseResponse<History[]> = errorResponse('Not authorized');

      if (isErrorResponse(response)) {
        expect(response.error).toBe('Not authorized');
      } else {
        expect.fail('Expected error response');
      }
    });
  });

  describe('ISODateString branding', () => {
    it('should preserve string operations on branded type', () => {
      const date = '2025-06-15T12:00:00.000Z' as ISODateString;

      expect(date.startsWith('2025')).toBe(true);
      expect(date.endsWith('Z')).toBe(true);
      expect(date.includes('T')).toBe(true);
      expect(date.length).toBe(24);
    });
  });
});
