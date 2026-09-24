# Deployment with www.cristalbuild.com

The repository contains a runnable local stack and a Render blueprint. To publish it, deploy `render.yaml` from Render, then configure the custom domain `www.cristalbuild.com` in the deployed client service.

Required DNS is supplied by your hosting provider. Usually:

```text
CNAME  www  <provider-hostname>
```

The exact target must be copied from the hosting dashboard. This repository cannot register the domain or change DNS records.

For local use:

```bash
docker compose -f deployment/docker-compose.yml up --build
```

Open `http://localhost:3000`. Do not put credentials in Git. Configure `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NEXT_PUBLIC_API_URL`, and optionally `OPENAI_API_KEY` as hosting secrets.
