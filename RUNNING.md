# Run Cristal Builder

## Automatic local startup

```bash
docker compose -f deployment/docker-compose.yml up --build
```

Open `http://localhost:3000`. The API is available at `http://localhost:5000/api/health`.

The first startup automatically waits for PostgreSQL, applies Prisma migrations, seeds the demo account, and starts the API and Next.js client.

Demo account:
- Email: `demo@cristal.page`
- Password: `demo123`

To reset the database:

```bash
docker compose -f deployment/docker-compose.yml down -v
docker compose -f deployment/docker-compose.yml up --build
```

## Public deployment

The repository includes `render.yaml` and `DEPLOYMENT.md` for deployment. A real public domain still requires ownership of `www.cristalbuild.com`, DNS access, and a hosting account. Do not commit secrets; configure `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NEXT_PUBLIC_API_URL`, and optional `OPENAI_API_KEY` in the hosting dashboard.
