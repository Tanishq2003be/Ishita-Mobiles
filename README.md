# Samsung Mobile Studio Full Stack

React + TypeScript + Tailwind frontend and Node.js + Express backend. Includes generated phone visuals, persistent JSON reviews, comparison, and an admin page for adding/deleting mobiles with image upload.

## Install without administrator access

Open normal Command Prompt in this folder:

```cmd
npm install
npm run install:all
npm run dev
```

Open `http://127.0.0.1:5173`. Admin page: `http://127.0.0.1:5173/admin`. API: `http://127.0.0.1:4000/api/health`.

If npm network access is blocked, retry on an allowed network. No administrator command is required.

## Storage

Phones and reviews are stored in `server/data/*.json`. Uploaded images are stored in `server/uploads`. For deployment, replace JSON files with PostgreSQL or MongoDB and add real authentication to the admin page.
