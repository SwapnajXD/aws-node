Here is the complete **README.md** formatted **exactly as a Markdown file** — **copy & paste directly** into your repo.

***

```markdown
# 🚀 aws-node — Full‑Stack URL Shortener  
### PostgreSQL + Redis + Node.js (Express) + React (Vite) + Docker + ngrok

A fully containerized, production‑ready **URL Shortener** application featuring:

- 🔗 Custom branded short URLs with optional phrases  
- 🗄️ PostgreSQL storage  
- ⚡ Redis caching for ultra‑fast slug resolution  
- 🖥️ Node.js / Express backend  
- 🎨 React + Vite frontend (served with Nginx in production)  
- 🐳 Docker Compose for easy development  
- 🌍 ngrok support for public demos with real‑looking URLs  
- 🔥 Automatic slug conflict handling & blocked extension security  

Built for **simplicity, performance, and portability**.

---

## 📁 Project Structure

```

aws\_node/
├── docker-compose.yml
├── client/              # React + Vite SPA (Nginx in production)
└── server/              # Node.js API + PostgreSQL + Redis

```

---

## 🧠 How It Works

1. User enters a **Long URL** + optional phrase  
2. Backend:
   - Validates URL  
   - Blocks dangerous file extensions  
   - Generates slug (`phrase + nanoid`)  
   - Saves slug → Postgres  
   - Caches slug → Redis  
3. Frontend displays short link:

```

\<PUBLIC\_BASE\_URL>/<slug>

````

4. Visiting a short link:
   - Frontend calls backend
   - Redis or Postgres resolves long URL
   - User is redirected 🎯

---

# 🛠️ Installation

## ✔ Requirements
- Docker  
- Docker Compose  
- (Optional) ngrok  

---

# ▶️ Running Locally (Docker)

From the project root:

```bash
docker compose up --build
````

### Access the app:

| Service  | URL                     |
| -------- | ----------------------- |
| Frontend | <http://localhost:8080> |
| Backend  | <http://localhost:5000> |

### Test:

1.  Open **<http://localhost:8080>**
2.  Enter any valid URL
3.  Click or copy the generated short link
4.  You will be redirected 🎉

***

# 🌍 Public Demo Using ngrok (Pretty Short Links!)

Use ngrok to expose your local frontend and backend to the internet.

## 1) Run Docker:

```bash
docker compose up --build
```

## 2) Open **two terminals** and start ngrok tunnels:

### Frontend tunnel:

```bash
ngrok http 8080
```

### Backend tunnel:

```bash
ngrok http 5000
```

You’ll get public HTTPS URLs like:

    Frontend: https://fe-123456.ngrok.app
    Backend:  https://api-abcdef.ngrok.app

## 3) Rebuild the frontend with ngrok URLs:

```bash
VITE_PUBLIC_BASE_URL=https://fe-123456.ngrok.app \
VITE_API_URL=https://api-abcdef.ngrok.app \
docker compose build web && docker compose up
```

Now, new short links look like:

    https://fe-123456.ngrok.app/my-awesome-slug-A1b2C3

Fully shareable — works for anyone worldwide 🌎.

***

# 🧪 API Endpoints

## POST `/api/shorten`

Payload:

```json
{
  "longUrl": "https://example.com",
  "phrase": "my-link"
}
```

Response:

```json
{
  "slug": "my-link-xYz123"
}
```

***

## GET `/api/resolve/:slug`

Response:

```json
{
  "longUrl": "https://example.com",
  "cached": true
}
```

***

# 🏗️ Tech Stack

| Layer      | Technology           |
| ---------- | -------------------- |
| Frontend   | React + Vite + Nginx |
| Backend    | Node.js + Express    |
| Database   | PostgreSQL           |
| Cache      | Redis                |
| DevOps     | Docker Compose       |
| Public URL | ngrok tunnels        |

***

# 🧹 Cleanup / Notes

If you previously had stray Node.js files in the project root, keep your structure clean:

    client/ for frontend
    server/ for backend

Remove old junk if needed:

```bash
rm -f server.js Dockerfile package.json package-lock.json
```

***

# ❤️ Contributing

Open issues, PRs, and improvements are welcome!

***

# 📜 License

MIT — use freely & build awesome things.

***

# 🎉 You’re Ready!

Your project is now:

*   Clean
*   Dockerized
*   ngrok‑ready
*   Easy to deploy
*   Easy to demo

If you want, I can also:

💠 Add CI/CD (GitHub Actions)  
💠 Add Makefile for one‑command dev  
💠 Add analytics dashboard (click counts, countries, stats)  
💠 Prepare AWS deployment

Just tell me! 🚀

```

---

If you'd like, I can also generate a **GitHub‑optimized** version with shields/badges and anchor links.
```
