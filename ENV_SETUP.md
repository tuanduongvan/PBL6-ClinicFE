# Environment Setup for Frontend

## Fix Network Error - API Connection

The frontend is currently trying to connect to a Cloudflare tunnel URL. To fix the network error, you need to configure the API base URL to point to your local Docker backend.

## Solution

### Option 1: Create `.env.local` file (Recommended)

Create a file named `.env.local` in the root of the frontend project:

```bash
cd /home/toanledinh/Documents/Workspace/PBL6/Front_End/PBL6-ClinicFE
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api" > .env.local
```

### Option 2: Update `axios-config.ts` directly

If you prefer, you can temporarily update the default URL in `services/api/axios-config.ts`:

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  // ... rest of config
});
```

### Option 3: Set environment variable when running

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api npm run dev
```

## Verify Backend is Running

```bash
# Check Docker containers
cd /home/toanledinh/Documents/Workspace/PBL6/Back_End/PBL6_BookingCare
docker compose ps

# Test API endpoint
curl http://localhost:8000/api/specialities/
```

## Restart Frontend

After creating `.env.local`, restart your Next.js dev server:

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure the backend has CORS enabled (it should be enabled by default in Docker setup).

### Connection Refused
- Make sure Docker containers are running: `docker compose ps`
- Check if port 8000 is available: `netstat -tuln | grep 8000`
- Restart backend: `docker compose restart web`

### Still Getting Network Error
1. Check browser console for exact error message
2. Verify API URL in Network tab of browser DevTools
3. Test API directly: `curl http://localhost:8000/api/specialities/`

