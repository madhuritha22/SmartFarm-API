# REPORT.md – SmartFarm Express API

---

## What I Learned

This assignment taught me how to design and implement a complete **RESTful API** using **Node.js and Express**.  
I learned to:

- Build structured routes for CRUD operations.
- Validate input using **Joi**.
- Implement query-based filtering and pagination.
- Handle errors gracefully through middleware.
- Test and document endpoints using **Postman**.

These skills helped me understand the real-world workflow of backend development — from request handling to debugging and API testing.

---

## Challenges Faced

| Issue                               | Resolution                                                                |
| ----------------------------------- | ------------------------------------------------------------------------- |
| Validation not triggering correctly | Reordered Joi validation logic and added return on failure.               |
| Filters not working for numbers     | Used `Number()` conversions for query params.                             |
| 500 error showing 404               | Implemented a separate `/api/fail` route and global error handler.        |
| Postman run errors                  | Corrected URLs to include `http://` prefix after renaming the collection. |

Each challenge improved my understanding of how Express processes routes and errors.

---

## What Works

- All CRUD routes for `/api/sensors` and `/api/readings`
- Validation with Joi
- Advanced Filtering & Pagination (Graduate Task a)
- Centralized Error Middleware (Graduate Task b)
- Tested and exported via Postman

---

## Incomplete or Limitations

- Data is stored in memory only (no database).
- Authentication not implemented (out of scope).

---

## Design Choices

- Used arrays to simulate DB for simplicity.
- Applied modular structure with middleware for logging and errors.
- Followed RESTful conventions for clean and testable routes.

---

## Reflection

This project strengthened my understanding of **backend architecture**, **data validation**, and **API design best practices**.  
The graduate tasks helped me learn **pagination logic, filtering mechanisms, and structured error handling** — skills directly useful in real-world API development.

---

**Files Included:**  
`index.js`, `README.md`, `REPORT.md`, `GRAD.md`, `screenshots/`, `postman_exports/`

---
