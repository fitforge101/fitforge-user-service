🔗 **Central Documentation:** [https://github.com/fitforge101/fitforge-app-docs](https://github.com/fitforge101/fitforge-app-docs)

# User Service

## Overview
The `user-service` is responsible for storing and managing detailed user profiles. This includes physical metrics, biographical information, and primary fitness goals. It enforces strict authorization to ensure users can only modify their own profiles.

## Features
*   Creation and updating of user profiles (metrics, goals, bio).
*   Retrieval of profile data.
*   Strict JWT-based authorization (Self-only access).

## Tech Stack
*   Node.js
*   Express.js
*   MongoDB (Mongoose)

## API Endpoints
*   `GET /users/:userId` - Retrieve profile
*   `POST /users` - Create profile
*   `PUT /users/:userId` - Update profile
*   `GET /health` - Healthcheck

## Example Request/Response

**GET `/users/:userId`**
*Response:*
```json
{
  "_id": "xxxxxxxxx",
  "userId": "xxxxxxxxxxx",
  "name": "Jane Doe",
  "age": 28,
  "weightKg": 65,
  "heightCm": 170,
  "fitnessGoal": "build_muscle",
  "bio": "Fitness enthusiast."
}
```

## Setup Instructions
1.  **Install Dependencies:**
    ```bash
    npm ci
    ```
2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## Environment Variables
*   `PORT` (Default: `5002`)
*   `MONGO_URI` (Default: `mongodb://mongo:27017/user_db`)
*   `JWT_SECRET` (Must match auth-service)

## Folder Structure
```text
.
├── Dockerfile
├── package.json
└── src/
    ├── app.js
    ├── index.js
    ├── middleware/
    │   └── verifyToken.js
    ├── models/
    │   └── Profile.js
    └── routes/
        └── user.js
```

## Deployment
Packaged via the included `Dockerfile` and deployed to Kubernetes clusters using the official FitForge Helm charts.
