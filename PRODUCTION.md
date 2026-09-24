## Production feature notes

- JWT auth is available through `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`.
- AI generation uses OpenAI when `OPENAI_API_KEY` is configured and falls back to a deterministic local generator otherwise.
- `/builder` provides a browser-based block canvas with add, select, reorder, edit, and save actions.
- `/api/billing/checkout` is a local demo checkout. Connect Stripe or Omise before accepting real payments.
- Run `docker compose -f deployment/docker-compose.yml up --build` to start the complete local stack.
