# GRAD.md – Graduate Tasks Summary (SmartFarm Express API)

---

## (a) Pagination & Advanced Filtering (+5 pts)

- Implemented on `/api/readings` to support:
  - `page`, `limit`, `type`, `minValue`, `maxValue`, `from`, and `to`
- Applied filters before pagination and validated all query parameters.
- Handled invalid types, out-of-range limits, bad dates, and page overflows with clean 400 errors.
- Verified using Postman; results exported and screenshots saved under:

  - `screenshots/grad_pagination/`

  **Key Evidence:**
  `grad_pagination_page1.png`, `grad_pagination_combined_filters.png`,  
  `grad_pagination_invalid_limit.png`, `grad_pagination_out_of_range.png`

---

## (b) Centralized Error Middleware & Timing Report (+5 pts)

- Added global middleware to attach `requestId` and `start time` to every request.
- Logged structured error data with timing and returned uniform JSON responses.
- Hidden stack traces in production, included in development only.
- Verified through simulated `/api/fail` route and invalid query tests.

  **Key Evidence:**
  `grad_error_400.png`, `grad_error_404.png`, `grad_error_500.png`, `grad_error_terminal_log.png`

---

## Outcome

Both graduate-level enhancements are **fully implemented, tested, and documented**.  
The SmartFarm API now demonstrates:

- Efficient data querying with pagination and filters
- Consistent, production-style error handling with logs
- Complete Postman test exports and visual evidence included.

---
