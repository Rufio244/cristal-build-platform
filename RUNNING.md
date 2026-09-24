# Cristal Builder — runnable setup

## Start everything

```bash
docker compose -f deployment/docker-compose.yml up --build
```

Open `http://localhost:3000`.

- API health: `http://localhost:5000/api/health`
- Demo email: `demo@cristal.page`
- Demo password: `demo123`

The server waits for PostgreSQL through Compose health checks, applies Prisma migrations, and seeds the demo account automatically. The AI endpoint works in local fallback mode without a provider key; set `OPENAI_API_KEY` in the server environment to enable OpenAI generation.

## Reset

```bash
docker compose -f deployment/docker-compose.yml down -v
docker compose -f deployment/docker-compose.yml up --build
```
