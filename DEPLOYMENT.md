# Deployment choices

## Recommended: Render

Use the root `render.yaml` blueprint. It creates a PostgreSQL database, API service, and client service. After deployment, add your custom domains in Render:

- Builder: `www.cristal-build.com`
- Community: `www.cristal.com` (only if you own/control this domain)
- API: `api.cristal-build.com`

Update `NEXT_PUBLIC_API_URL` and `CLIENT_URL` to the final API and frontend URLs after Render assigns them.

## Frontend on Vercel

Import the repository, set the root directory to `client`, and set `NEXT_PUBLIC_API_URL` to the deployed API URL. Add custom domains in Vercel. A domain such as `cristal-build.com` must be registered and controlled by you; DNS cannot be configured from this repository.

## Important

`cristal=build.com` is not a valid domain because `=` is not allowed in DNS hostnames. Use `cristal-build.com` or another registered domain instead. `cristal.com` is also only usable if you own or administer it.
