# TrustPulse — Store Rating Platform

A full-stack web application designed for discovering, rating, and managing local stores from 1 to 5 stars, featuring a single unified authentication system with Role-Based Access Control (**System Administrator**, **Store Owner**, and **Normal User**).

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Responsive UI, Tailwind CSS, Lucide React icons, real-time client validation |
| **Backend** | Node.js + Express.js | Modular REST API, JWT authentication, bcryptjs password hashing |
| **Database** | MySQL | Relational schema, foreign keys, cascade constraints, indexed queries |

---

## 📋 Features by Role

### 1. System Administrator
* **Executive Metrics Dashboard:** Real-time counts of total registered users, registered stores, and submitted ratings.
* **Store Management:** Add new stores with strict validation and optional Store Owner assignment.
* **User Management:** Add new users (Admin, Normal User, or Store Owner) with strict validation.
* **Search & Multi-Field Filtering:** Filter store and user listings by Name, Email, Address, and Role.
* **User Inspection Modal:** View comprehensive user details; **if the user is a Store Owner, their store's overall rating and review count are dynamically displayed**.
* **Two-Way Column Sorting:** Ascending and descending sorting on all store and user columns.

### 2. Normal User (Customer)
* **Public Registration & Login:** Create an account with real-time validation and automatic sign-in.
* **Store Discovery:** Browse all registered stores with store names, addresses, and overall average ratings.
* **Live Search:** Instant search by Store Name or Street Address.
* **Interactive Star Rating:** Submit new ratings (1 to 5 stars) with tactile hover feedback (*Poor*, *Fair*, *Average*, *Good*, *Excellent!*).
* **Rating Modification:** Seamlessly update previously submitted ratings.
* **Profile Management:** Update password at any time.
* **Two-Way Column Sorting:** Ascending and descending sorting across all store listings.

### 3. Store Owner
* **Business Profile:** View registered store profile and overall calculated rating.
* **Rating Distribution Breakdown:** Google Reviews / Trustpilot-style 5-star to 1-star visual progress bars.
* **Customer Review Log:** Dedicated table of customers who rated their store, showing customer names, email addresses, star ratings submitted, and review dates.
* **Two-Way Column Sorting:** Sort customer ratings by customer name, email, rating score, or date.
* **Profile Management:** Update password at any time.

---

## 🔒 Form Validations & Constraints

All input validation rules are strictly enforced on **both the frontend and backend**:

| Field | Validation Rule |
| :--- | :--- |
| **Name** | Minimum 20 characters, Maximum 60 characters |
| **Address** | Maximum 400 characters, non-empty |
| **Password** | 8 to 16 characters, at least one uppercase letter (`A-Z`), at least one special character (`!@#$%...`) |
| **Email** | Standard RFC-compliant email address format |
| **Rating** | Integer between 1 and 5 (inclusive) |

---

## 📁 Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/          # MySQL database connection pool
│   │   ├── controllers/     # Route handlers (Auth, Admin, Store, Rating, Owner)
│   │   ├── middleware/      # JWT auth guard, Role-based access control
│   │   ├── routes/          # Express route definitions
│   │   ├── utils/           # Validation rules & helpers
│   │   ├── initDb.js        # Automated database migration & seed runner
│   │   └── server.js        # Express app entry point
│   ├── .env.example         # Environment variable template
│   ├── schema.sql           # Database DDL schema & demo seed script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Modal, RatingStars, SortableTable, ChangePassword
│   │   ├── context/         # AuthContext (JWT session state)
│   │   ├── pages/           # LoginPage, RegisterPage, AdminDashboard, UserDashboard, OwnerDashboard
│   │   ├── api.js           # Fetch API client wrapper
│   │   ├── App.jsx          # Route management & role-based view rendering
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **MySQL Server:** v8.0 or higher (or v9.0+)

---

### Step 1: Clone & Configure

```bash
git clone <your-repository-url>
cd store-rating-app
```

#### Backend Environment Setup
Navigate to the `backend` directory and create your `.env` from the provided `.env.example`:
```bash
cd backend
cp .env.example .env      # On Linux / macOS
copy .env.example .env    # On Windows PowerShell / CMD
```
Open `.env` and set your local MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db
DB_PORT=3306
JWT_SECRET=super_secret_jwt_key_store_rating_platform_2026
```

---

### Step 2: Initialize Database & Demo Seeds

Run the automated database setup script from the `backend/` folder:
```bash
cd backend
npm install
npm run db:init
```

> **Note:** `npm run db:init` creates the `store_rating_db` database, generates the normalized tables (`users`, `stores`, `ratings`), and pre-seeds initial demo accounts and stores.

---

### Step 3: Start the Backend Server

In the `backend/` directory:
```bash
npm run dev
```
*The backend API will start on **http://localhost:5000**.*

---

### Step 4: Start the Frontend Client

Open a new terminal window, navigate to the `frontend/` directory, and run:
```bash
cd frontend
npm install
npm run dev
```
*The frontend client will launch at **http://localhost:3000**.*

---

## 👥 Pre-Seeded Demo Accounts for Testing

All seeded demo accounts share the password: **`Password123!`**

| Role | Email | Password | Assigned Store / Profile |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `Password123!` | Master console, system metrics, store & user management |
| **Store Owner** | `vikram.patil@storeowner.com` | `Password123!` | Owner of *Dorabjee Gourmet Supermarket* (Baner, Pune) |
| **Store Owner** | `siddharth.joshi@storeowner.com` | `Password123!` | Owner of *Vijay Sales Electronics Hub* (Baner, Pune) |
| **Normal User** | `aditya.kulkarni@usermail.com` | `Password123!` | Customer account with submitted ratings |
| **Normal User** | `priyanka.deshpande@usermail.com` | `Password123!` | Customer account with submitted ratings |

*(You can also use the **Sign Up** page to register any new Normal User account with custom details).*

> **💡 Evaluator Convenience Feature (One-Click Demo Login):**  
> To make evaluating each role's dashboard seamless without tedious manual copy-pasting of credentials, the **Login page** includes an interactive **"Demo Credentials Quick-Fill"** section. Clicking any role button (*System Administrator*, *Store Owner*, or *Normal User*) automatically populates the form with valid seed credentials for immediate 1-click sign-in.

---

## 🗄️ Database Schema Design

* **`users`:** Stores credentials (`password` hashed using `bcryptjs` with salt rounds = 10), user profiles (`name`, `email`, `address`), and role (`ADMIN`, `NORMAL_USER`, `STORE_OWNER`).
* **`stores`:** Stores registered shop details (`name`, `email`, `address`) linked to an optional `owner_id` referencing `users(id)`.
* **`ratings`:** Stores user submissions (`user_id`, `store_id`, `rating`). A `UNIQUE KEY (user_id, store_id)` composite constraint guarantees that each user has exactly one rating per store, powering the upsert (submit or modify) architecture.

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new Normal User |
| `POST` | `/api/auth/login` | Public | Single unified login (returns JWT token & user profile) |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session user |
| `PUT` | `/api/auth/change-password` | Authenticated | Update account password |
| `GET` | `/api/admin/stats` | Admin | Total counts of users, stores, and submitted ratings |
| `GET` | `/api/admin/users` | Admin | List users with filtering (`name`, `email`, `address`, `role`) and sorting |
| `POST` | `/api/admin/users` | Admin | Create a new user account |
| `GET` | `/api/admin/users/:id` | Admin | View user details (includes store rating if Store Owner) |
| `GET` | `/api/admin/stores` | Admin | List stores with filtering and sorting |
| `POST` | `/api/admin/stores` | Admin | Register a new store |
| `GET` | `/api/stores` | Authenticated | List all stores with live search and current user's rating |
| `POST` | `/api/ratings` | Normal User | Submit or update store rating (1 to 5 stars) |
| `GET` | `/api/owner/dashboard` | Store Owner | View store profile, average rating score, and customer ratings table |
