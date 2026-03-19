# YouTube Block Distractions — Newsletter Backend

This is a tiny serverless proxy that sits between the Chrome extension
and Brevo. The API key never touches the extension code.

## Deploy in 5 minutes

### Step 1 — Push to GitHub
1. Go to github.com and log in (buhumaid3)
2. Click the + icon top right → New repository
3. Name it: yt-block-subscribe
4. Keep it Public, click Create repository
5. Upload these 3 files: api/subscribe.js, vercel.json, package.json

### Step 2 — Deploy on Vercel
1. Go to vercel.com → Sign up with GitHub (use buhumaid3)
2. Click Add New → Project
3. Find yt-block-subscribe → click Import
4. Click Deploy (don't change anything)
5. Wait ~30 seconds — you'll get a URL like:
   https://yt-block-subscribe.vercel.app

### Step 3 — Add your secret API key
1. In Vercel, go to your project → Settings → Environment Variables
2. Add these two:
   - Name: BREVO_API_KEY
     Value: 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
   - Name: BREVO_LIST_ID
     Value: 2
3. Click Save, then go to Deployments → Redeploy

### Step 4 — Send the URL back to Claude
Tell Claude your Vercel URL (e.g. https://yt-block-subscribe.vercel.app)
and the extension will be updated to use it instead of the API key.
