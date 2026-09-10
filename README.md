# TaskFlow

TaskFlow is a full-stack project management application inspired by Trello and Jira.

The backend supports authentication, project and member management, Kanban boards, task assignment, role-based permissions, and real-time updates via WebSockets.

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma
- Zod
- JWT / jose
- WebSocket (`ws`)
- Docker

Frontend: Next.js / React — in progress.

## Features

- User registration and login
- JWT access tokens
- Refresh token rotation with HttpOnly cookies
- Project CRUD
- Project members with `OWNER`, `MANAGER`, and `MEMBER` roles
- Board columns with ordering
- Task CRUD, filtering, search, movement, and reordering
- Multiple task assignees
- Role-based authorization
- Real-time project updates with WebSockets
- WebSocket rooms, membership validation, and heartbeat cleanup
- Dockerized API and PostgreSQL

## Run Locally

Create `server/.env` based on `.env.example`.

From the `server` directory:

```bash
docker compose up --build
```

API:

```text
http://localhost:5001
```

Health check:

```text
GET /api/health
```

## Status

Backend core is complete and containerized.

Next steps:

- Next.js frontend
- Kanban drag-and-drop UI
- Frontend WebSocket integration
- Automated tests
- Deployment