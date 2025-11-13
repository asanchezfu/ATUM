# AGENTS.md — Atum Agent Task (Contest)

## Project
Atum – AI-Powered Code Generation & Evaluation  
Backend: FastAPI (Python).  
There is an existing backend and a frontend that must be wired together.

## Your Task (for this contest)
1. Add a new FastAPI endpoint:

   - Path: `POST /generate-tests`
   - Request JSON:
     ```json
     {
       "code": "string",
       "language": "python|javascript|java|...",
       "framework": "pytest|unittest|jest|..."
     }
     ```
   - Response JSON (example):
     ```json
     {
       "ok": true,
       "tests": "<unit test code string>",
       "language": "<language>",
       "framework": "<framework>",
       "notes": ["optional notes or TODOs"]
     }
     ```

   The project already has versioned routers, follow the same structure (router file, prefix, tags, response model).

2. Adapt the existing frontend so that:
   - The existing endpoint `POST /generate` connects.
   - The user can paste code and pick language + framework.
   - It calls `POST /generate-tests`.
   - It renders the returned tests in a `<pre>` or similar block.

## Definition of Done
- Backend:
  - `/generate-tests` is implemented.
  - Endpoint registered in the main FastAPI app.
  - Logic can be a stub that uses simple heuristics or calls existing LLM utilities, but it must:
    - Validate inputs.
    - Return a non-empty `tests` string when given valid input.
- Frontend:
  - UI flow: user input → request → display tests.
  - UI flow: user input → request → display generated code.
  - Uses the same base URL / API style as existing endpoints.

## Success vs Failure
- SUCCESS:
  - All code compiles / app starts.
  - Manual test: send a sample request to `/generate-tests` and see tests in UI.
  - You commit your changes to a new branch and open a PR.

- FAILURE:
  - If blocked after reasonable attempts (e.g., missing info, weird errors, timeouts),
    overwrite `POC_ERROR_REPORT.md` with:
    - What you tried
    - Commands you ran
    - Logs / stack traces
    - Suspected root cause
    - What you would try next

## Constraints
- Only modify:
  - `app/**` (FastAPI backend)
  - `frontend/**`
  - `docs/**`, `README.md`
  - `.github/**` and `.cursor/**` or `.claude/**` files if needed
  - `POC_ERROR_REPORT.md`
- Do not:
  - Touch deployment/infra/secrets.
  - Change unrelated business logic.
  - Introduce heavy dependencies unless necessary; prefer using existing patterns.