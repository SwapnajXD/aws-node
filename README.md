# AWS Node Deployment Practice (Express 5 Boilerplate)

This repository serves as a foundational template for deploying Node.js applications that leverage **Express 5**'s modern routing syntax, designed to work seamlessly within containerized AWS environments.

The project structure mimics a typical backend serving a Single Page Application (SPA) frontend.

## ✨ Current Status
✅ Express 5 compatible routing (`app.get('/*')` fixed).
✅ Basic Express server configured to listen on Port 3000 or `process.env.PORT`.
✅ **Dockerfile** included for containerization.
✅ Frontend served via Express static middleware.

## 🚀 Project Idea: [URL Shortener Service]
*(Update this to match your final project idea)*

This project will be deployed to AWS using a container. The goal is to build a **URL Shortener** that includes:
1.  **Frontend:** A simple UI to input long URLs.
2.  **Backend (Express):** Generates unique short codes.
3.  **Database (DynamoDB):** Persistently stores the mapping between short and long URLs.

## 💻 Local Setup & Running

This project uses Node.js v25+ features (like `--watch`).

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/aws-node-deployment-practice.git
    cd aws-node-deployment-practice
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run Locally:**
    ```bash
    npm run dev 
    # This uses: node --watch server.js
    ```
4.  **Access:** Open your browser to `http://localhost:3000`.

## ⚙️ AWS Deployment Preparation

The project is structured to be deployed using a container.

### Files relevant for AWS:
*   **`Dockerfile`**: Defines the exact environment for AWS to build your app.
*   **`package.json`**: The `"start": "node server.js"` script is what the container will execute.

### Next Steps:
The next phase is to deploy this containerized app to a managed service on AWS, such as **AWS App Runner** or **ECS Fargate**, after integrating a database like DynamoDB.

---
### Dependencies
- **Backend:** Express 5
- **Frontend:** Vanilla HTML/CSS/JS (or other framework)
- **Future Database:** AWS DynamoDB

# aws_node — URL Shortener (PostgreSQL + Redis) — Dockerized

A full-stack URL shortener:
- Frontend: React (Vite), served by Nginx (SPA fallback)
- Backend: Node.js + Express + PostgreSQL (pg) + Redis (optional caching)
- Dev/Local: `docker compose up --build`
- ngrok-ready: bake public URLs into the frontend so generated links look real

## Quick start

```bash
# From repo root
docker compose up --build