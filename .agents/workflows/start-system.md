---
description: Start the entire Shakti Home system (DB, API, Frontend) and expose via Cloudflare
---

To start the system and get the Cloudflare link, follow these steps:

1. **Start the database container (MySQL)**
// turbo
```bash
docker start shakti-mysql
```

2. **Start the backend API**
   - Location: `shakti-api/`
   - Command: `node index.js` (Run in background)
// turbo
```bash
cd shakti-api && node index.js
```

3. **Start the frontend (Vite)**
   - Location: root
   - Command: `npm run dev -- --host` (Run in background)
// turbo
```bash
npm run dev -- --host
```

4. **Start the Cloudflare tunnel**
   - Command: `npx cloudflared tunnel --url http://localhost:5173` (Run in background)
// turbo
```bash
npx cloudflared tunnel --url http://localhost:5173
```

5. **Retrieve the URL**
   - Look for the `trycloudflare.com` URL in the output of step 4.
   - Provide the URL to the user.
   - (Optional) Update the backend code if any hardcoded URLs change (if necessary).
