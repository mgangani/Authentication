import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Auth Practice API",
    version: "1.0.0",
    description:
      "API documentation for the Auth Practice backend with JWT and role-based authorization.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Authentication and password recovery endpoints",
    },
    {
      name: "Users",
      description: "User management and profile endpoints",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Paste the access token returned by the login endpoint as a Bearer token.",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description:
          "Cookie-based auth used by the backend. Useful when testing over HTTPS.",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "65f2b0c5f4f2a1b8c9324a10",
          },
          name: {
            type: "string",
            example: "Jane Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "jane@example.com",
          },
          role: {
            type: "string",
            enum: ["admin", "manager", "employee"],
            example: "employee",
          },
          refreshToken: {
            type: "string",
            nullable: true,
            example:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.refresh.token",
          },
        },
      },
      PublicUser: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "65f2b0c5f4f2a1b8c9324a10",
          },
          name: {
            type: "string",
            example: "Jane Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "jane@example.com",
          },
          role: {
            type: "string",
            enum: ["admin", "manager", "employee"],
            example: "employee",
          },
        },
      },
      SignupRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            example: "Jane Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "jane@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "StrongPassword123",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "jane@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "StrongPassword123",
          },
        },
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "jane@example.com",
          },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["password"],
        properties: {
          password: {
            type: "string",
            format: "password",
            example: "NewStrongPassword123",
          },
        },
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Jane Updated",
          },
          email: {
            type: "string",
            format: "email",
            example: "updated@example.com",
          },
          role: {
            type: "string",
            enum: ["admin", "manager", "employee"],
            example: "manager",
          },
        },
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Operation completed successfully",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Unauthorized",
          },
          error: {
            type: "string",
            example: "Detailed error message",
          },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Login successful",
          },
          accessToken: {
            type: "string",
            example:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.access.token",
          },
          refreshToken: {
            type: "string",
            example:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.refresh.token",
          },
          user: {
            $ref: "#/components/schemas/User",
          },
        },
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
