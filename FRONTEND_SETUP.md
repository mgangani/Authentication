# Frontend Developer Setup Guide

## Overview

This backend runs on port `5000` and exposes the auth and user APIs under:

- `http://localhost:5000/api/users`

Swagger documentation is available at:

- `http://localhost:5000/api-docs`

## Prerequisites

Make sure you have:

- Docker installed
- Docker Compose installed
- Access to the backend `.env` values from the backend team

## Required Environment Variables

Create a `.env` file in the project root with these keys:

```env
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
SENDGRID_API_KEY=<your-sendgrid-api-key>
ADMIN_NAME=<initial-admin-name>
ADMIN_EMAIL=<initial-admin-email>
ADMIN_PASSWORD=<initial-admin-password>
```

Notes:

- `SENDGRID_API_KEY` is required only if you want to test the forgot-password email flow.
- `MONGODB_URI` must point to a working MongoDB database before the app can start.
- When the database has no users, the server creates the first admin automatically on startup using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

## If You Are Given a Prebuilt Docker Image

If the backend team shares a published image instead of the source build flow, use:

```bash
For: pull the docker image
docker pull docker pull meetgangani11/auth-app:latest

For: Run the image
docker run -p 5000:5000 --env-file .env meetgangani11/auth-app
```

## First-Time Setup

On a fresh database, the backend creates the initial admin user automatically during startup.

Set these env vars before starting the server:

```env
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123
```

Important:

- This bootstrap runs only when there are `0` users in the database.
- If users already exist, the server does not create another admin automatically.
- If the database is empty and any of the `ADMIN_*` values are missing, the server startup fails until they are provided.

## Login After Admin Creation

After the server boots and creates the admin, log in with:

- `POST http://localhost:5000/api/users/login`

Request body:

```json
{
  "email": "admin@example.com",
  "password": "StrongPassword123"
}
```

Example:

```bash
curl --request POST http://localhost:5000/api/users/login \
  --header "Content-Type: application/json" \
  --data '{
    "email": "admin@example.com",
    "password": "StrongPassword123"
  }'
```

The login response returns:

- `accessToken`
- `refreshToken`
- `user`

Use the `accessToken` in the `Authorization` header for protected routes:

```bash
Authorization: Bearer <accessToken>
```

When the access token expires, call `POST /api/users/refresh-token` with the current `refreshToken` to receive a new access token and refresh token pair.

## Common API Endpoints For Frontend Work

- `POST /api/users/login` - login
- `POST /api/users/refresh-token` - rotate access and refresh tokens
- `GET /api/users/profile` - get current logged-in user
- `GET /api/users` - get all users
- `POST /api/users/signup` - create a user
- `PUT /api/users/:id` - update a user
- `POST /api/users/forgot-password` - request password reset
- `POST /api/users/reset-password/:token` - reset password 

## Suggested Frontend First Flow

Use this order during integration:

1. Start the backend with Docker.
2. Open `http://localhost:5000/api-docs` and confirm the server is running.
3. Ensure the `ADMIN_*` env vars are set before the first startup on an empty database.
4. Call `POST /api/users/login` with the admin credentials.
5. Send the returned `accessToken` as a Bearer token to test protected APIs like profile and users list.
6. When needed, call `POST /api/users/refresh-token` with the stored `refreshToken`.

## Troubleshooting

If the backend does not start:

- check that `.env` exists in the project root
- check that `MONGODB_URI` is valid and reachable
- check that port `5000` is free

If login or protected routes fail:

- verify the initial admin env vars are set correctly
- verify the initial admin was created successfully during server startup
- verify you are using the correct email and password
- verify the `Authorization: Bearer <accessToken>` header is being sent correctly from the frontend
- verify you are storing and sending the latest refresh token after each refresh call
