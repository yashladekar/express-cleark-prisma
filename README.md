# Express Prisma Clerk API Template

A production-ready API template using Express.js, Prisma ORM, and Clerk authentication with automatic user synchronization between Clerk and Prisma database.

## Features

### Core
- ✅ Express.js 5 with TypeScript
- ✅ Prisma ORM with PostgreSQL
- ✅ Clerk authentication with automatic user sync via webhooks

### Security
- ✅ Helmet security headers
- ✅ Rate limiting with express-rate-limit
- ✅ Input validation with Zod
- ✅ Environment variable validation
- ✅ Request body size limits
- ✅ CORS configuration

### Production-Ready
- ✅ Request ID tracking for distributed tracing
- ✅ HTTP request logging with Morgan
- ✅ Winston structured logging
- ✅ Response compression with gzip
- ✅ Health check endpoints
- ✅ Graceful shutdown handling
- ✅ Global error handling with proper error responses
- ✅ 404 handler for undefined routes

### Documentation
- ✅ Swagger/OpenAPI documentation at `/api/docs`
- ✅ Comprehensive README

## Project Structure

```
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── controllers/            # Route controllers (empty - for future use)
│   ├── lib/
│   │   ├── env.ts              # Environment validation
│   │   ├── logger.ts           # Winston logger configuration
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── swagger.ts          # Swagger/OpenAPI configuration
│   ├── middleware/
│   │   ├── errorHandler.ts     # Global error handler & 404 handler
│   │   ├── rateLimiter.ts      # Rate limiting middleware
│   │   ├── requestId.ts        # Request ID tracking
│   │   └── validate.ts         # Zod validation middleware
│   ├── routes/
│   │   ├── clerk.webhook.ts    # Clerk webhook handler
│   │   └── user.ts             # User routes
│   ├── types/
│   │   └── express.d.ts        # Express type extensions
│   └── index.ts                # Application entry point
├── .env.example                # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account with API keys

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd express-prisma-clerk-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

5. Generate Prisma client and push schema to database:
```bash
npm run db:generate
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

## API Documentation

Interactive API documentation is available at `/api/docs` when the server is running.

## Clerk Webhook Setup

To enable automatic user synchronization between Clerk and your database:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Webhooks** in the sidebar
3. Click **Add Endpoint**
4. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
5. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copy the **Signing Secret** and add it to your `.env` as `CLERK_WEBHOOK_SECRET`

### Testing Webhooks Locally

For local development, use a tunneling service like [ngrok](https://ngrok.com/):

```bash
ngrok http 3001
```

Use the generated URL as your webhook endpoint in Clerk Dashboard.

## API Endpoints

### Health Checks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/ready` | Readiness check with database connection |

### User Routes (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current authenticated user |
| PATCH | `/api/users/me` | Update current user profile |

### Webhook Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/clerk` | Clerk webhook handler |

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/docs` | Swagger/OpenAPI documentation |

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes | - |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes | - |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | Yes | - |
| `PORT` | Server port | No | 3001 |
| `NODE_ENV` | Environment (development/production/test) | No | development |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:3000 |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Security Features

### Helmet
Adds various HTTP headers to protect against common vulnerabilities:
- Content Security Policy
- XSS Protection
- Clickjacking Protection
- HSTS (in production)

### Rate Limiting

The API includes three rate limiters:

- **General Limiter**: 100 requests per 15 minutes (applied to all routes)
- **Auth Limiter**: 10 requests per 15 minutes (for authentication-heavy endpoints)
- **API Limiter**: 30 requests per minute (for heavy API endpoints)

### Input Validation
All request bodies are validated using Zod schemas before processing.

### Environment Validation
All required environment variables are validated at startup to prevent runtime errors.

## Error Handling

The API includes a global error handler that:
- Logs errors with Winston
- Returns appropriate HTTP status codes
- Includes request ID for tracing
- Includes stack traces in development mode only
- Returns consistent error response format

### Error Response Format
```json
{
  "error": "Error message",
  "statusCode": 500,
  "requestId": "uuid",
  "code": "ERROR_CODE"
}
```

## Request Tracking

Every request is assigned a unique request ID (UUID v4):
- Can be passed via `x-request-id` header
- Returned in response headers as `x-request-id`
- Logged with every request for distributed tracing

## Graceful Shutdown

The server handles `SIGTERM` and `SIGINT` signals for graceful shutdown:
- Closes HTTP server to stop accepting new connections
- Disconnects from database
- Forces shutdown after 30 seconds if connections don't close

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set `NODE_ENV=production` in your environment

3. Start the server:
```bash
npm start
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `DATABASE_URL` with connection pooling
- [ ] Set `FRONTEND_URL` to your actual frontend domain
- [ ] Configure Clerk production keys
- [ ] Set up proper monitoring and alerting
- [ ] Configure reverse proxy (nginx, etc.)
- [ ] Enable HTTPS/SSL

## Reference

This template is inspired by production patterns from [RedLead](https://github.com/Atharva-Kanherkar/RedLead).

## License

MIT