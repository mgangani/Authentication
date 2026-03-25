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
```

Notes:

- `SENDGRID_API_KEY` is required only if you want to test the forgot-password email flow.
- `MONGODB_URI` must point to a working MongoDB database before the app can start.

## If You Are Given a Prebuilt Docker Image

If the backend team shares a published image instead of the source build flow, use:

```bash
For: pull the docker image
docker pull docker pull meetgangani11/auth-app:latest

For: Run the image
docker run -p 5000:5000 --env-file .env meetgangani11/auth-app
```

## First-Time Setup

On a fresh database, the first step is to create the initial admin user.

Use this endpoint:

- `POST http://localhost:5000/api/users/setup-admin`

Request body:

```json
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "StrongPassword123"
}
```

Important:

- This works only once when there are `0` users in the database.
- After the first admin is created, this endpoint will return an error if called again.

Example using `curl`:

```bash
curl --request POST http://localhost:5000/api/users/setup-admin \
  --header "Content-Type: application/json" \
  --data '{
    "name": "Super Admin",
    "email": "admin@example.com",
    "password": "StrongPassword123"
  }'
```

## Login After Admin Creation

After the admin is created, log in with:

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

The backend also sets auth cookies.

## Common API Endpoints For Frontend Work

- `POST /api/users/setup-admin` - create the first admin
- `POST /api/users/login` - login
- `POST /api/users/logout` - logout
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
3. Call `POST /api/users/setup-admin` once.
4. Call `POST /api/users/login` with the admin credentials.
5. Use the returned auth state to test protected APIs like profile and users list.

## Troubleshooting

If the backend does not start:

- check that `.env` exists in the project root
- check that `MONGODB_URI` is valid and reachable
- check that port `5000` is free

If login or protected routes fail:

- verify the initial admin was created successfully
- verify you are using the correct email and password
- verify cookies or tokens are being sent correctly from the frontend
