# ProjectBridge Deployment Guide

This guide explains how to deploy **ProjectBridge** using **Render** for the backend and **Vercel** for the frontend.

---

## Part 1: Deploying the Backend on Render

Render is used to host the Node.js/Express server and the Socket.IO server.

### Steps:
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Name**: `projectbridge-backend` (or your preferred name)
   - **Region**: Select the region closest to your users.
   - **Branch**: `main` (or `Development`, depending on which branch you want to deploy)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free` (or any paid tier)
5. Under **Advanced**, click **Add Environment Variable** and add the following keys from your `.env` file:

| Environment Variable | Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | *Your Supabase project URL* |
| `SUPABASE_KEY` | *Your Supabase service/anon key* |
| `JWT_SECRET` | *A secure random string for JWT signing* |
| `JWT_EXPIRE` | `30d` |
| `CLIENT_URL` | *The URL of your Vercel frontend (e.g. `https://projectbridge.vercel.app`)* |
| `SERVER_URL` | *The URL of this Render Web Service (e.g. `https://projectbridge-backend.onrender.com`)* |
| `SESSION_SECRET` | *A secure random string for session signing* |
| `CLOUDINARY_CLOUD_NAME` | *Your Cloudinary cloud name* |
| `CLOUDINARY_API_KEY` | *Your Cloudinary API key* |
| `CLOUDINARY_API_SECRET`| *Your Cloudinary API secret* |
| `RAZORPAY_KEY_ID` | *Your Razorpay key ID* |
| `RAZORPAY_KEY_SECRET` | *Your Razorpay key secret* |
| `EMAIL_HOST` | *SMTP server (e.g., `smtp.gmail.com`)* |
| `EMAIL_PORT` | `465` (or `587`) |
| `EMAIL_USER` | *Your email address* |
| `EMAIL_PASS` | *Your email app password* |
| `EMAIL_FROM` | *Your email address* |
| `EMAIL_FROM_NAME` | `ProjectBridge` |
| `GOOGLE_CLIENT_ID` | *Google OAuth client ID* |
| `GOOGLE_CLIENT_SECRET` | *Google OAuth client secret* |
| `GITHUB_CLIENT_ID` | *GitHub OAuth client ID* |
| `GITHUB_CLIENT_SECRET` | *GitHub OAuth client secret* |

#### Production Email Delivery Configuration (Choose One)
Since Render blocks outbound SMTP ports (25, 465, 587) by default, you must configure one of the following HTTP APIs for reliable email delivery:

##### Option A: Brevo (Recommended - Easiest & Free)
1. Sign up for a free account at [Brevo](https://www.brevo.com/).
2. Generate an API Key under **SMTP & API** settings.
3. Add the following environment variables in Render:
   - `BREVO_API_KEY`: *Your Brevo API key*
   - `EMAIL_FROM`: *Your verified sender email address in Brevo (can be your personal Gmail)*
   - `EMAIL_FROM_NAME`: `ProjectBridge`

##### Option B: Resend
1. Sign up at [Resend](https://resend.com/).
2. Create an API Key.
3. *Note: On the free tier, you can only send to your own registered email address unless you verify a custom domain.*
4. Add the following environment variables in Render:
   - `RESEND_API_KEY`: *Your Resend API key*
   - `EMAIL_FROM`: `onboarding@resend.dev` (or your custom domain email once verified)
   - `EMAIL_FROM_NAME`: `ProjectBridge`

##### Option C: SendGrid
1. Sign up at [SendGrid](https://sendgrid.com/).
2. Generate a Web API Key.
3. Add the following environment variables in Render:
   - `SENDGRID_API_KEY`: *Your SendGrid API key*
   - `EMAIL_FROM`: *Your verified sender email address in SendGrid*
   - `EMAIL_FROM_NAME`: `ProjectBridge`

6. Click **Deploy Web Service**. Render will build and start your server. Note your Render app URL (e.g. `https://projectbridge-backend.onrender.com`).

---

## Part 2: Deploying the Frontend on Vercel

Vercel is used to host the React/Vite frontend.

### Steps:
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Set the following configuration:
   - **Project Name**: `projectbridge`
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click *Edit* and select **`client`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Under **Environment Variables**, add the following variable:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://<your-render-app-url>/api` |

*(Replace `<your-render-app-url>` with your actual Render URL, e.g., `https://projectbridge-backend.onrender.com/api`)*

6. Click **Deploy**. Vercel will build and publish your frontend. Note your Vercel deployment URL (e.g., `https://projectbridge.vercel.app`).

---

## Part 3: Updating Environment Variables and Third-Party Settings

Once both services are deployed, you need to link them together and update third-party authentication redirect URIs.

### 1. Update Render Environment Variables
Go back to your Render Web Service dashboard -> **Environment** and update:
- `CLIENT_URL` = `https://your-app.vercel.app` (your Vercel URL)
- `SERVER_URL` = `https://your-app.onrender.com` (your Render URL)
- Click **Save Changes** (Render will redeploy with the updated variables).

### 2. Update Google OAuth Redirect URIs
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** > **Credentials**.
3. Edit your OAuth 2.0 Client ID.
4. Under **Authorized redirect URIs**, add:
   `https://your-app.onrender.com/api/auth/google/callback`
5. Save changes.

### 3. Update GitHub OAuth Callback URIs
1. Go to your GitHub account **Settings** > **Developer Settings** > **OAuth Apps**.
2. Select your ProjectBridge app.
3. Update the **Homepage URL** to: `https://your-app.vercel.app`
4. Update the **Authorization callback URL** to:
   `https://your-app.onrender.com/api/auth/github/callback`
5. Save changes.
