# demo-app

A simple Express.js app used to demonstrate an industry-standard CI/CD pipeline.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Home — returns app info |
| GET | `/health` | Health check |
| GET | `/api/greet/:name` | Greet by name |

## Local setup

```bash
npm install
npm start        # runs on http://localhost:3000
npm test         # runs Jest tests with coverage
npm run lint     # ESLint check
```
