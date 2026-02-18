// Re-export common types from @sudobility/types
export type {
  ApiResponse,
  BaseResponse,
  NetworkClient,
  Optional,
} from '@sudobility/types';
import type { BaseResponse } from '@sudobility/types';

// =============================================================================
// User
// =============================================================================

export interface User {
  firebase_uid: string;
  email: string | null;
  display_name: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// =============================================================================
// History
// =============================================================================

export interface History {
  id: string;
  user_id: string;
  datetime: string;
  value: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface HistoryCreateRequest {
  datetime: string;
  value: number;
}

export interface HistoryUpdateRequest {
  datetime?: string;
  value?: number;
}

// =============================================================================
// API Responses
// =============================================================================

export interface HistoryTotalResponse {
  total: number;
}

// =============================================================================
// Response Helpers
// =============================================================================

export function successResponse<T>(data: T): BaseResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

export function errorResponse(error: string): BaseResponse<never> {
  return { success: false, error, timestamp: new Date().toISOString() };
}
