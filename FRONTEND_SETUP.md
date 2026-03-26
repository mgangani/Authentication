# Frontend Developer Setup Guide

## Overview

This backend runs on port `5000`.

Base API URL:

- `http://localhost:5000/api/users`

Swagger docs:

- `http://localhost:5000/api-docs`

## Prerequisites

Before starting, make sure you have:

- Docker installed
- Docker Compose installed
- The backend `.env` values from the backend team

## Step 1: Create a Working Folder

Create a folder for the backend setup and move into it:

```bash
mkdir auth-practice-backend
cd auth-practice-backend
```

If the backend team shared the source code, place the project files in this folder.

## Step 2: Prepare the Environment File

Create a `.env` file in the project root:

```bash
touch .env
```

Add these values:

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

- `MONGODB_URI` must point to a working MongoDB instance.
- `JWT_SECRET` is required for both access token and refresh token signing.
- `SENDGRID_API_KEY` is only needed if you want to test forgot-password email delivery.
- `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are used only for initial admin bootstrap on an empty database.

## Step 3: Pull the Docker Image

If you were given a prebuilt image, pull it first:

```bash
docker pull meetgangani11/auth-app:latest
```

## Step 4: Start the Backend

If you are using the prebuilt image, run:

```bash
docker run -p 5000:5000 --env-file .env meetgangani11/auth-app:latest
```

If you are using the source code in this repository, run:

```bash
docker compose up --build
```

The backend will start on:

- `http://localhost:5000`

## Step 5: Understand First Startup Behavior

On the first startup with an empty database, the server automatically creates the initial admin user using:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Important:

- This happens only when the database has `0` users.
- If users already exist, the bootstrap admin is not created again.
- If the database is empty and any `ADMIN_*` value is missing, startup fails.

## Step 6: Confirm the Backend Is Running

Open the Swagger docs in the browser:

- `http://localhost:5000/api-docs`

If Swagger loads, the backend is running correctly.

## Step 7: Log In

Use the bootstrap admin credentials to log in.

Endpoint:

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

Successful login returns:

- `accessToken`
- `refreshToken`
- `user`

## Step 8: Use the Access Token for Protected APIs

Protected routes require the access token in the `Authorization` header:

```http
Authorization: Bearer <accessToken>
```

Example:

```bash
curl http://localhost:5000/api/users/profile \
  --header "Authorization: Bearer <accessToken>"
```

## Step 9: Refresh Tokens When the Access Token Expires

There is no automatic refresh in the backend middleware.

When the access token expires, call:

- `POST http://localhost:5000/api/users/refresh-token`

Request body:

```json
{
  "refreshToken": "<current-refresh-token>"
}
```

Example:

```bash
curl --request POST http://localhost:5000/api/users/refresh-token \
  --header "Content-Type: application/json" \
  --data '{
    "refreshToken": "<current-refresh-token>"
  }'
```

Successful refresh returns:

- new `accessToken`
- new `refreshToken`
- `user`

Important:

- Always replace the old stored tokens with the newly returned tokens.
- If refresh fails with `401`, send the user back to login.

## Common API Endpoints

- `POST /api/users/login` - log in
- `POST /api/users/refresh-token` - get a new access token and refresh token
- `POST /api/users/logout` - log out
- `GET /api/users/profile` - get current user profile
- `GET /api/users` - get all users
- `POST /api/users/signup` - create a user
- `PUT /api/users/:id` - update a user
- `POST /api/users/forgot-password` - request password reset
- `POST /api/users/reset-password/:token` - reset password

## Suggested Frontend Integration Order

1. Create the backend setup folder.
2. Add the project files or use the shared image.
3. Create the `.env` file.
4. Pull the Docker image if you are using the image-based flow.
5. Start the backend.
6. Open Swagger and confirm the server is running.
7. Log in with the bootstrap admin.
8. Store `accessToken` and `refreshToken` in the frontend.
9. Send `Authorization: Bearer <accessToken>` for protected routes.
10. If a protected request fails because the access token expired, call `/refresh-token`.
11. Replace the stored tokens after every successful refresh.
12. On logout, clear the stored tokens in the frontend.

## Troubleshooting

If the backend does not start:

- check that `.env` exists in the project root
- check that `MONGODB_URI` is valid and reachable
- check that port `5000` is free
- check that the required `ADMIN_*` values are present for first startup on an empty database

If login fails:

- verify the admin user was created on first startup
- verify the email and password are correct
- verify the database is connected properly

If protected routes fail:

- verify the `Authorization: Bearer <accessToken>` header is being sent
- verify the access token is not expired
- verify the user has permission for that route

If refresh fails:

- verify the correct `refreshToken` is being sent
- verify you are storing the latest refresh token returned by `/refresh-token`
- verify the refresh token has not expired

## Final Frontend Notes

The frontend is responsible for token handling now.

That means the frontend must:

- store the login tokens
- attach the access token to protected requests
- call `/refresh-token` when needed
- replace old tokens after refresh
- clear tokens on logout
