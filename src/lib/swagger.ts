import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express Prisma Clerk API",
      version: "1.0.0",
      description:
        "A production-ready API template using Express.js, Prisma ORM, and Clerk authentication",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Clerk JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Internal user ID",
            },
            clerkId: {
              type: "string",
              description: "Clerk user ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            firstName: {
              type: "string",
              nullable: true,
              description: "User first name",
            },
            lastName: {
              type: "string",
              nullable: true,
              description: "User last name",
            },
            imageUrl: {
              type: "string",
              nullable: true,
              description: "User profile image URL",
            },
            plan: {
              type: "string",
              enum: ["free", "pro", "enterprise"],
              description: "User subscription plan",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User last update timestamp",
            },
          },
        },
        UpdateUser: {
          type: "object",
          properties: {
            firstName: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "User first name",
            },
            lastName: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "User last name",
            },
            plan: {
              type: "string",
              enum: ["free", "pro", "enterprise"],
              description: "User subscription plan",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                  },
                  message: {
                    type: "string",
                  },
                },
              },
              description: "Validation error details",
            },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description: "Health status",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Response timestamp",
            },
            database: {
              type: "string",
              description: "Database connection status",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/index.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
