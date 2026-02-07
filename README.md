# GitoLink v2

Your personal link hub. Share everything you create in one place.

## Tech Stack

- **Backend**: Express.js with JWT authentication
- **Frontend**: Next.js 14 App Router
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Render.com

## Features

- ✅ Simple JWT authentication (no NextAuth complexity)
- ✅ Dashboard to add/edit/delete/reorder links
- ✅ Public profile pages at `/{username}`
- ✅ Click analytics tracking
- ✅ Mobile-friendly responsive design

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cd server
cp .env.example .env
# Edit .env with your database URL
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Start development servers:
```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

### Deploy to Render

1. Push this repo to GitHub
2. Connect your repo to Render
3. Render will automatically deploy using `render.yaml`

## Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/gitolink"
JWT_SECRET="your-secret-key"
CLIENT_URL="http://localhost:3000"
```

### Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/logout | Logout user |
| GET | /api/links | Get user's links |
| POST | /api/links | Create new link |
| PUT | /api/links/:id | Update link |
| DELETE | /api/links/:id | Delete link |
| POST | /api/links/reorder | Reorder links |
| GET | /api/profile/:username | Get public profile |
| POST | /api/click/:linkId | Track link click |
| GET | /api/analytics | Get analytics |

## Project Structure

```
gitolink-v2/
├── server/           # Express API
│   ├── routes/       # API routes
│   ├── middleware/   # Auth middleware
│   ├── models/       # Prisma client
│   └── prisma/       # Database schema
├── client/           # Next.js frontend
│   ├── app/          # App router pages
│   └── lib/          # API client
└── render.yaml       # Render deployment config
```

## License

MIT