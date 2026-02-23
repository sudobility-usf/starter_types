# Improvement Plans for @sudobility/starter_types

## Priority 1 - High Impact

### 1. Add JSDoc Documentation to All Types and Helpers
- None of the interfaces (`User`, `History`, `HistoryCreateRequest`, `HistoryUpdateRequest`, `HistoryTotalResponse`) have JSDoc comments
- The `successResponse` and `errorResponse` helper functions lack JSDoc describing their purpose, parameters, return types, and usage examples
- As the foundational type package consumed by all other starter projects, comprehensive documentation here propagates to all consumers via IDE tooltips
- Add `@example` tags showing how each type is used in practice (e.g., request body construction, response handling)

### 2. Add Runtime Validation for Response Helpers
- `successResponse` accepts any `T` with no runtime validation -- passing `undefined` or unexpected shapes silently produces invalid responses
- `errorResponse` accepts any string including empty string, which the test suite verifies but which is arguably invalid behavior for error reporting
- Consider adding a runtime guard in `errorResponse` to reject empty-string errors, or at minimum document this edge case
- Consider adding an overload or variant that accepts `Error` objects directly for convenience

### 3. Add Stricter Type Constraints for Domain Fields
- `History.datetime` is typed as `string` with no format hint -- consumers have no guidance that ISO 8601 is expected
- `History.value` is `number` with no constraint documentation -- the API enforces positive values, but the type does not reflect this
- `HistoryCreateRequest.datetime` and `HistoryCreateRequest.value` have the same looseness
- Consider branded types or at minimum JSDoc annotations documenting the expected format constraints (ISO 8601 datetime, positive numeric value)

## Priority 2 - Medium Impact

### 3. Expand Test Coverage for Edge Cases
- No test for `successResponse(undefined)` behavior, which is a realistic misuse scenario
- No test verifying the timestamp format is valid ISO 8601
- No negative test ensuring `errorResponse` result has `success: false` and no `data` property simultaneously (the existing test checks these separately)
- Add a test verifying that re-exported `ApiResponse` type works correctly with the response helpers

### 4. Add a Changelog or Versioning Strategy Documentation
- As a published npm package depended on by 5+ downstream projects, changes to types can have breaking impact
- No documentation exists about what constitutes a breaking vs. non-breaking change for this package
- Consider adding guidelines for when to bump major vs. minor vs. patch versions, especially for type-only changes where TypeScript structural typing can mask breakage

## Priority 3 - Nice to Have

### 5. Consider Separating Request/Response Types from Domain Types
- Currently all types are in a single `index.ts` file, which works for the current small scope
- As the project grows, grouping domain models (`User`, `History`), request types (`HistoryCreateRequest`, `HistoryUpdateRequest`), and response types (`HistoryTotalResponse`) into separate files would improve discoverability
- The barrel export pattern could be maintained while giving each concern its own file

### 6. Add a Type Guard Utility for BaseResponse
- Consumers frequently check `response.success` before accessing `response.data` or `response.error`
- A type guard function like `isSuccessResponse<T>(response): response is SuccessResponse<T>` would provide better type narrowing in consuming code
- This would complement the existing `successResponse`/`errorResponse` constructors by providing a symmetric deconstruction utility
