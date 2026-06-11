# Palette Match v0.1 Backend Deployment

## Runtime

Palette Match uses FastAPI with the asynchronous Uvicorn server and MongoDB
through Motor.

- Application entrypoint: `backend/server.py`
- FastAPI object: `server:app`
- Local command from `backend/`:
  `uvicorn server:app --host 0.0.0.0 --port 8000 --reload`
- Production command from `backend/`:
  `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Health endpoint: `GET /api/`

## Recommended Hosting

Use a Render Web Service on the Starter plan for v0.1, with MongoDB Atlas as
the database and Vercel for the frontend.

This is the smallest deployment that preserves the existing long-running
FastAPI process, MongoDB connection pool, startup index creation, secure
session cookies, and AI requests. The committed `render.yaml` defines the
service. The paid Starter plan avoids free-instance sleep during beta use.

Python is pinned to `3.11.11`. Do not rely on Render's default Python version:
the current dependencies were stabilized against the Python 3.11 generation.

## Backend Environment Variables

| Variable | Required | Secret | Value |
| --- | --- | --- | --- |
| `MONGO_URL` | Yes | Yes | MongoDB Atlas connection string |
| `DB_NAME` | Yes | No | `palette_match_production` |
| `EMERGENT_LLM_KEY` | Yes for AI matching | Yes | Emergent integrations API key |
| `CORS_ORIGINS` | Yes | No | Comma-separated exact frontend origins |
| `CORS_ORIGIN_REGEX` | No | No | Narrow regex for dynamic Vercel previews |
| `ALLOW_DEMO_SEED` | Yes | No | `false` in production |
| `PYTHON_VERSION` | Render only | No | `3.11.11` |
| `PORT` | Provided by Render | No | Do not set manually |

The current authentication provider supplies opaque session tokens. There is
no application-managed `SESSION_SECRET`, `JWT_SECRET`, or OAuth client secret
in v0.1.

## CORS Configuration

Origins must include only the scheme and host, with no path or trailing slash.
Cookies are enabled, so never set the allowed origin to `*`.

Local backend:

```env
CORS_ORIGINS=http://localhost:3000
```

Production backend with one stable Vercel preview branch:

```env
CORS_ORIGINS=https://palette-match-git-staging-your-vercel-scope.vercel.app,https://palette-match.example.com
```

Production backend with dynamic previews:

```env
CORS_ORIGINS=https://palette-match.example.com
CORS_ORIGIN_REGEX=^https://palette-match-(?:git-[a-z0-9-]+|[a-z0-9]{9})-your-vercel-scope\.vercel\.app$
```

Replace the project name and scope slug with the exact values shown by Vercel.
Prefer the stable branch URL when possible. It remains constant as new commits
are deployed and is safer than enabling every generated preview.

Do not allow all `*.vercel.app` origins. That would let unrelated Vercel sites
make credentialed browser requests to the API.

## Deploy MongoDB Atlas

1. Create a production Atlas cluster in a region near the Render service.
2. Create a dedicated database user with a generated password.
3. Grant that user read/write access only to the production database.
4. Configure Atlas network access for Render's outbound addresses. For a
   temporary beta setup, Atlas can allow `0.0.0.0/0` only when the database
   uses strong credentials and TLS; restricting network access is preferred.
5. Copy the `mongodb+srv://` application connection string into Render as
   `MONGO_URL`. Do not commit it.
6. Check the existing database for duplicate emails and workflow IDs before
   the first start, because startup creates unique indexes.

## Deploy on Render

1. Merge the deployment files into the branch Render will deploy.
2. In Render, choose **New > Blueprint** and connect the Palette Match GitHub
   repository.
3. Select the root `render.yaml`.
4. Enter secret values when prompted:
   - `MONGO_URL`
   - `EMERGENT_LLM_KEY`
   - `CORS_ORIGINS`
   - `CORS_ORIGIN_REGEX`, or leave it empty when using exact origins only
5. Confirm `ALLOW_DEMO_SEED=false`.
6. Create the Blueprint and wait for the health check at `/api/` to pass.
7. Open `https://<render-service>.onrender.com/api/`. A successful response is:

```json
{"app":"Palette Match","status":"ok"}
```

8. Review startup logs and confirm all MongoDB indexes were created.

## Connect Vercel

The browser uses Axios with credentials enabled. It reads
`REACT_APP_BACKEND_URL`, appends `/api`, and sends requests such as:

```text
https://<render-service>.onrender.com/api/auth/me
```

In the Vercel frontend project:

1. Set the Root Directory to `frontend`.
2. Add `REACT_APP_BACKEND_URL=https://<render-service>.onrender.com`.
   Do not include `/api` or a trailing slash.
3. Add the variable to Production and Preview environments.
4. Redeploy the frontend. Create React App embeds environment values at build
   time, so changing the variable does not update an existing deployment.
5. Copy the exact production and approved preview frontend origins into the
   backend's `CORS_ORIGINS`, then redeploy the backend.
6. Ensure the Emergent OAuth provider accepts the production and preview
   frontend callback origins.

## Release Check

1. Load the Vercel frontend over HTTPS.
2. Complete sign-in and role selection.
3. Submit a collector intake and confirm AI matches appear.
4. Submit and accept a proposal.
5. Exchange messages from both roles.
6. Confirm both dashboards show the same project status.
7. Log out and verify `/api/auth/me` returns `401`.
8. Check browser developer tools for CORS or blocked-cookie errors.
