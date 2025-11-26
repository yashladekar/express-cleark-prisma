# Express Prisma Clerk API Template

A production-ready API template using Express.js, Prisma ORM, and Clerk authentication with automatic user synchronization between Clerk and Prisma database.

## Features

- ✅ Express.js with TypeScript
- ✅ Prisma ORM with PostgreSQL
- ✅ Clerk authentication with automatic user sync via webhooks
- ✅ Rate limiting with express-rate-limit
- ✅ Winston logging
- ✅ Health check endpoints
- ✅ Production-ready error handling
- ✅ Graceful shutdown handling

## Project Structure

```
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   └── (empty - for future controllers)
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── logger.ts
│   ├── middleware/
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── clerk.webhook.ts
│   │   └── user.ts
│   ├── types/
│   │   └── express.d.ts
│   └── index.ts
├── .env.example
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

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | Yes |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS (default: http://localhost:3000) | No |

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

## Rate Limiting

The API includes two rate limiters:

- **General Limiter**: 100 requests per 15 minutes (applied to all routes)
- **Auth Limiter**: 10 requests per 15 minutes (for authentication-heavy endpoints)

## Error Handling

The API includes a global error handler that:
- Logs errors with Winston
- Returns appropriate HTTP status codes
- Includes stack traces in development mode only

## Graceful Shutdown

The server handles `SIGTERM` and `SIGINT` signals for graceful shutdown:
- Closes HTTP server to stop accepting new connections
- Disconnects from database
- Forces shutdown after 30 seconds if connections don't close

## Reference

This template is inspired by production patterns from [RedLead](https://github.com/Atharva-Kanherkar/RedLead).

## License

MIT