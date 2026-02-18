import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  successResponse,
  errorResponse,
  type User,
  type History,
  type HistoryCreateRequest,
  type HistoryUpdateRequest,
  type HistoryTotalResponse,
  type BaseResponse,
  type NetworkClient,
  type Optional,
} from './index';

describe('starter_types', () => {
  describe('successResponse', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T10:30:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create a success response with data', () => {
      const data = { id: '123', name: 'Test' };
      const response = successResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: '123', name: 'Test' });
      expect(response.timestamp).toBe('2025-01-15T10:30:00.000Z');
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
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T10:30:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create an error response with message', () => {
      const response = errorResponse('Something went wrong');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Something went wrong');
      expect(response.timestamp).toBe('2025-01-15T10:30:00.000Z');
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
});
