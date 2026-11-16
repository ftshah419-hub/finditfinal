# FINDIT — Lost & Found Management Platform

FINDIT is a comprehensive Lost & Found Management Platform built with **Node.js, Express.js, MongoDB Atlas, Mongoose, and React**.

## 1. Project Structure

```text
FINDIT/
│
├── client/                         # React frontend (Vite + Tailwind CSS)
│   └── README.md
│
├── server/                         # Express.js + MongoDB backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         # Mongoose connection & disconnect handling
│   │   │   ├── env.js              # Environment variable validation & exports
│   │   │   └── cloudinary.js       # Cloudinary SDK configuration
│   │   │
│   │   ├── models/
│   │   │   ├── User.js             # User accounts, roles, bcrypt hashing
│   │   │   ├── Item.js             # Lost/Found items, status, images, location
│   │   │   ├── Claim.js            # Ownership claims with proof & evidence
│   │   │   ├── Notification.js     # User alerts & activity notifications
│   │   │   ├── AIMatch.js          # AI suggestions (advisory only)
│   │   │   ├── Report.js           # User moderation complaints
│   │   │   ├── Category.js         # Item categories (admin-managed)
│   │   │   ├── ActivityLog.js      # Append-only audit logging
│   │   │   └── SystemSetting.js    # Platform configuration
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # Authentication endpoints (/api/v1/auth)
│   │   │   ├── userRoutes.js       # User & item endpoints (/api/v1/users)
│   │   │   └── adminRoutes.js      # Admin endpoints (/api/v1/admin)
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js   # HTTP controller for Auth
│   │   │   ├── userController.js   # HTTP controller for Users/Items/Claims
│   │   │   └── adminController.js  # HTTP controller for Admin
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js      # Registration, login, JWT issuance
│   │   │   ├── userService.js      # User profile management
│   │   │   ├── itemService.js      # Item reporting, updates, status rules
│   │   │   ├── claimService.js     # Claim submission, withdrawal rules
│   │   │   ├── searchService.js    # Public item search & filtering
│   │   │   ├── notificationService.js # Notification dispatcher
│   │   │   ├── aiMatchService.js   # Advisory AI match management
│   │   │   ├── adminService.js     # Dashboard, moderation, atomic claim approval
│   │   │   ├── reportService.js    # User complaints moderation
│   │   │   ├── categoryService.js  # Category creation & soft-deactivation
│   │   │   ├── activityLogService.js # Shared audit logging
│   │   │   └── uploadService.js    # Cloudinary stream buffer uploads
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authenticate.js     # JWT bearer token verification
│   │   │   ├── authorize.js        # Role-based access control (RBAC)
│   │   │   ├── validate.js         # Express-validator result runner
│   │   │   ├── upload.js           # Multer memory storage (5MB, 5 images max)
│   │   │   └── errorHandler.js     # Centralized error handler
│   │   │
│   │   ├── validators/
│   │   │   ├── authValidator.js    # Register & Login input rules
│   │   │   ├── itemValidator.js    # Item creation & update validation
│   │   │   └── claimValidator.js   # Claim input validation
│   │   │
│   │   ├── utils/
│   │   │   ├── ApiError.js         # Operational error class
│   │   │   ├── ApiResponse.js      # Standard success response formatter
│   │   │   └── asyncHandler.js     # Async controller/middleware wrapper
│   │   │
│   │   ├── app.js                  # Express application setup & middleware
│   │   └── server.js               # Server bootstrap & graceful shutdown
│   │
│   ├── .env                        # Local environment variables (git-ignored)
│   ├── .env.example                # Template for environment configuration
│   ├── .gitignore
│   └── package.json
│
├── .gitignore
└── README.md
```

## 2. Technology Stack

- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Web Framework:** Express.js 4.x
- **Database:** MongoDB Atlas via Mongoose ODM
- **Authentication:** JWT (`jsonwebtoken`) + Password hashing (`bcryptjs`)
- **Security:** `helmet`, `cors`, `express-rate-limit`
- **Validation:** `express-validator`
- **File Uploads:** `multer` (memory storage) + Cloudinary API SDK
- **Development:** `nodemon`

## 3. Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas connection string (or local MongoDB replica set)
- Cloudinary account (optional for initial setup; required for image uploads)

### Installation & Running the Application

#### Backend (Server)
1. Navigate to the server folder:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/findit?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:5173
   ```

3. Run verification & automated tests:
   ```bash
   npm run check:models  # Verifies all 9 Mongoose schemas & indexes
   npm run test:auth      # Runs full 36-test authentication & RBAC suite
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

#### Frontend (Client)
1. Navigate to the client folder:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The client will open on `http://localhost:5173` and automatically proxies `/api` to the Express backend at `http://localhost:5000`.

## 4. API Endpoints Overview

Base URL: `/api/v1`

### Health Check
- `GET /api/v1/health` — Service health & uptime status

### Authentication (`/api/v1/auth`)
- `POST /register` — Public user registration (always creates `USER` role)
- `POST /login` — Authenticate and receive JWT
- `GET /me` — Get current user (Authenticated)
- `POST /logout` — Client token discard acknowledgment (Authenticated)

### Users & Items (`/api/v1/users`)
- `GET /profile` — Retrieve current user profile
- `PATCH /profile` — Update current user profile
- `GET /search` — Search publicly approved items
- `GET /items` — List items reported by current user
- `POST /items` — Report a LOST or FOUND item (Starts as `PENDING`)
- `GET /items/:id` — View item details (Approved items are public)
- `PATCH /items/:id` — Edit owned item (Material edits reset to `PENDING`)
- `DELETE /items/:id` — Delete owned item
- `GET /claims` — List claims submitted by current user
- `POST /items/:id/claims` — Submit claim for an approved FOUND item
- `PATCH /claims/:id/withdraw` — Withdraw a pending claim
- `GET /notifications` — List current user notifications
- `PATCH /notifications/:id/read` — Mark notification as read
- `POST /reports` — Submit complaint/report for administrative review

### Admin (`/api/v1/admin`) — Requires `ADMIN` Role
- `GET /dashboard` — Platform overview statistics
- `GET /users` — List and search users
- `GET /users/:id` — View user details
- `PATCH /users/:id/status` — Activate/deactivate user accounts
- `GET /items` — List items for moderation
- `GET /items/:id` — View complete item details
- `PATCH /items/:id/approve` — Approve item report
- `PATCH /items/:id/reject` — Reject item report with reason
- `GET /claims` — List claims for verification
- `PATCH /claims/:id/approve` — Atomically approve claim and resolve item
- `PATCH /claims/:id/reject` — Reject claim with admin note
- `GET /reports` — List user complaints
- `PATCH /reports/:id/review` — Review/resolve complaints
- `GET /categories` — List all categories
- `POST /categories` — Create new category
- `PATCH /categories/:id` — Update or deactivate category
- `GET /ai-matches` — List AI match suggestions
- `PATCH /ai-matches/:id/review` — Review AI suggestions (Advisory only)
- `GET /activity-logs` — View audit logs
- `GET /settings` — View system settings
- `PATCH /settings` — Update system settings

## 5. Architectural Decisions & Security

- **Strict Service Layer:** Controllers only handle HTTP concerns and delegate all database queries and business logic to services.
- **Atomic Claim Approval:** Claim approval atomically sets the Item status to `RESOLVED` using a conditional update/transaction strategy so only one claimant can resolve an item. Competing pending claims are automatically rejected.
- **Admin Promotion:** Admins cannot be created via public registration. A user is registered as `USER` and manually promoted in MongoDB Atlas.
- **Soft Deactivation:** Categories referenced by items are deactivated rather than deleted.
- **AI Matching Isolation:** AI matches are strictly advisory and never automatically modify claims or item status.
- **Audit Trails:** Central `activityLogService` logs all administrative and critical state mutations without storing sensitive data (passwords, tokens, API keys).
