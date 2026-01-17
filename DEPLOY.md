# Deployment Guide

This guide covers how to deploy the Demo Credit API to a cloud platform. We recommend **Heroku** or **Render** as they are the industry standards for Node.js apps.

**Target URL Format:** `https://<candidate-name>-lendsqr-be-test.<cloud-platform-domain>`

## Prerequisites

1.  **Git Repository**: Ensure your code is pushed to a GitHub repository.
2.  **Cloud Account**: Create an account on [Heroku](https://signup.heroku.com/) or [Render](https://render.com/).
3.  **CLI Tools** (Optional but recommended): Install Heroku CLI if using Heroku.

---

## Option 1: Deploy on Heroku (Recommended)

Heroku is the easiest way to deploy Node.js apps with MySQL add-ons (like JawsDB or ClearDB).

### Step 1: Prepare App
1.  Make sure `package.json` has `start` script: `"start": "node dist/src/server.js"`.
2.  Make sure `knexfile.js` is configured to use `process.env.DATABASE_URL` (Already done).

### Step 2: Create App with Specific Name
Replace `<candidate-name>` with your actual name (e.g., `john-doe`).
```bash
heroku apps:create --region eu <candidate-name>-lendsqr-be-test
```
*If the name is taken, you may need to append a number, but try to stick to the requested format.*

### Step 3: Add Database
Heroku doesn't give free MySQL by default anymore, but you can use an add-on or an external DB.
**Using JawsDB (Free Tier):**
```bash
heroku addons:create jawsdb:kite
```
This automatically sets the `DATABASE_URL` environment variable.

### Step 4: Configure Environment Variables
Set the custom variables needed for the app:
```bash
heroku config:set NODE_ENV=production
heroku config:set ADJUTOR_APP_ID=efa7f2df-6b46-403a-ab48-bc71479fcb66
heroku config:set ADJUTOR_API_KEY=your_production_api_key
heroku config:set ADJUTOR_BASE_URL=https://adjutor.lendsqr.com/v2
heroku config:set JWT_SECRET=your_secure_production_secret
```

### Step 5: Deploy
Push your code to Heroku:
```bash
git push heroku main
```

### Step 6: Run Migrations
Once deployed, run the migrations on the production database:
```bash
heroku run npm run migrate
```

**Your API is now live at:** `https://<candidate-name>-lendsqr-be-test.herokuapp.com`

---

## Option 2: Deploy on Render

Render provides a generous free tier for Web Services.

1.  **New Web Service**: Connect your GitHub repo.
2.  **Name**: Enter `<candidate-name>-lendsqr-be-test` (This defines the subdomain).
3.  **Build Command**: `npm install && npm run build`
4.  **Start Command**: `npm start`
5.  **Environment Variables**:
    *   Add all variables from your `.env` file (`ADJUTOR_APP_ID`, etc.).
    *   **Database**: This app uses MySQL. Render does not provide a free managed MySQL database. **You must provide a `DATABASE_URL` from an external provider** (e.g., PlanetScale, Aiven, or a remote MySQL server).
    *   Set `DATABASE_URL` = `mysql://user:pass@host:port/dbname`
6.  **Deploy**: Click Create Web Service.

---

## Verification
Visit your URL: `https://<candidate-name>-lendsqr-be-test.herokuapp.com/` (or `.onrender.com`)
You should see: `Demo Credit API (Lendsqr MVP) is running.`
