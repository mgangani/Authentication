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
          "Send the access token in the Authorization header as `Bearer <token>`.",
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
          role: {
            type: "string",
            enum: ["admin", "manager", "employee"],
            example: "employee",
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
      ValidationErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Validation failed",
          },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: {
                  type: "string",
                  example: "email",
                },
                message: {
                  type: "string",
                  example: "Invalid email",
                },
              },
            },
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
            $ref: "#/components/schemas/PublicUser",
          },
        },
      },
      RefreshTokenRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: {
            type: "string",
            example:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.refresh.token",
          },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "User created successfully",
          },
          user: {
            $ref: "#/components/schemas/PublicUser",
          },
        },
      },
      UsersListResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Users fetched successfully",
          },
          users: {
            type: "array",
            items: {
              $ref: "#/components/schemas/PublicUser",
            },
          },
        },
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./docs/swagger/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
