# Run automatically with Docker

```bash
docker compose -f deployment/docker-compose.yml up --build
```

The database is migrated and demo data is seeded automatically. Open `http://localhost:3000`.

Demo login: `demo@cristal.page` / `demo123`.

To stop and remove the database volume:

```bash
docker compose -f deployment/docker-compose.yml down -v
```

## Local development

Copy `server/.env.example` to `server/.env`, start PostgreSQL, then run:

```bash
cd server && npm install && npx prisma generate && npx prisma migrate dev --name init && npm run prisma:seed && npm run dev
```

In a second terminal:

```bash
cd client && npm install && cp .env.example .env.local && npm run dev
```
