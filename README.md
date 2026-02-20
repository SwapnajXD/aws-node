# 🚀 aws-node — Production-Ready URL Shortener

**PostgreSQL + Redis + Node.js (Express) + React (Vite) + Docker + ngrok**

A fully containerized, scalable **URL Shortener** application built with modern full-stack tooling.

---

## ✨ Features

- 🔗 Custom branded short URLs  
- 🗄 PostgreSQL persistent storage  
- ⚡ Redis caching for ultra-fast redirects  
- 🖥 Node.js + Express backend  
- 🎨 React + Vite frontend (served via Nginx)  
- 🐳 Docker Compose for simple local setup  
- 🌍 Optional ngrok integration for public/shareable links  
- 🔐 Slug conflict protection & blocked extension security  

---

## 📁 Project Structure

```
aws_node/
├── docker-compose.yml
├── client/      # React + Vite frontend (served via Nginx)
└── server/      # Express API + PostgreSQL + Redis
```

---

# 🛠 Prerequisites

- Docker  
- Docker Compose  
- ngrok (optional — only needed for public links)  

Download ngrok manually:

👉 https://ngrok.com/download

---

# ▶️ Run Locally (Development Mode)

Generates local links like:

```
http://localhost:8080/<slug>
```

### 1️⃣ Start the application

From the project root:

```bash
docker compose up --build
```

### 2️⃣ Access Services

| Service   | URL                    |
|------------|-----------------------|
| Frontend   | http://localhost:8080 |
| API        | http://localhost:5000 |

### 3️⃣ Test It

1. Open `http://localhost:8080`
2. Paste a long URL
3. Generate a short link
4. Click it — redirect works 🎉

---

# 🌍 Run With ngrok (Public Shareable Links)

This enables public URLs like:

```
https://your-domain.ngrok-free.dev/r/<slug>
```

Only the **API (port 5000)** needs to be exposed via ngrok.

---

## Step 1 — Start Docker

```bash
docker compose up
```

---

## Step 2 — Start ngrok (Expose Backend Only)

In a new terminal:

```bash
ngrok http 5000
```

You will receive a public HTTPS URL:

```
https://example-subdomain.ngrok-free.dev
```

⚠️ On the free plan, this URL changes every time ngrok restarts.

---

## Step 3 — Update Frontend Build Variables

Open `docker-compose.yml` and update:

```yaml
services:
  web:
    build:
      args:
        VITE_PUBLIC_BASE_URL: "https://<your-ngrok-domain>/r"
        VITE_API_URL: "https://<your-ngrok-domain>"
```

Example:

```yaml
VITE_PUBLIC_BASE_URL: "https://example-subdomain.ngrok-free.dev/r"
VITE_API_URL: "https://example-subdomain.ngrok-free.dev"
```

---

## Step 4 — Rebuild Frontend Only

Vite requires a rebuild when environment variables change.

```bash
docker compose build web
docker compose up
```

Now generated links will be publicly accessible:

```
https://example-subdomain.ngrok-free.dev/r/my-link-Ab12Cd
```

✔ Shareable  
✔ Accessible from anywhere  
✔ Backend remains local  

---

# 🔁 When ngrok Domain Changes

Each time ngrok restarts:

1. Copy new domain  
2. Update in `docker-compose.yml`:
   - `VITE_PUBLIC_BASE_URL`
   - `VITE_API_URL`
3. Rebuild frontend:

```bash
docker compose build web
docker compose up
```

The backend does NOT need rebuilding.

---

# 🧪 API Endpoints

### POST `/api/shorten`

Create a new short URL.

Request:

```json
{
  "longUrl": "https://example.com",
  "phrase": "my-link"
}
```

Response:

```json
{
  "slug": "my-link-Ab12Cd"
}
```

---

### GET `/api/resolve/:slug`

Returns the original long URL (no redirect).

---

### GET `/r/:slug`

Public redirect endpoint used for shareable links.

Example:

```
https://<ngrok-domain>/r/my-link-Ab12Cd
```

Redirects to the stored long URL.

---

# 🏗 Tech Stack

| Layer      | Technology            |
|------------|-----------------------|
| Frontend   | React + Vite + Nginx  |
| Backend    | Node.js + Express     |
| Database   | PostgreSQL            |
| Cache      | Redis                 |
| DevOps     | Docker Compose        |
| Public URL | ngrok (optional)      |

---

# ⚠️ Important Notes

- Frontend must be rebuilt if `VITE_PUBLIC_BASE_URL` changes.
- API does NOT require rebuild when ngrok changes.
- Public redirect path is always:

```
/r/<slug>
```

---

# 🧹 Optional Cleanup

If legacy root files exist:

```bash
rm -f server.js Dockerfile package.json package-lock.json
```

Keep structure clean:

```
client/
server/
```

---

# 🎉 Ready to Go

Your URL shortener now supports:

✔ Fast local development  
✔ Public shareable URLs  
✔ Redis-powered performance  
✔ Dockerized architecture  
✔ Clean production-ready structure  
