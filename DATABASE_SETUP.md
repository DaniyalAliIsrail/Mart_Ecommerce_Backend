# 🗄️ Database Connection Setup — Production Ready

> **Tech Stack:** Node.js (ESM) · Express · Sequelize ORM · MySQL  
> **Environments:** Development · Test · Production

---

## 📁 File Structure

```
project-root/
├── .env                  # Environment variables (git-ignored)
├── .env.example          # Template for environment variables
├── .sequelizerc          # Sequelize CLI path configuration
├── server.js             # Express app entry point
├── config/
│   ├── config.js         # Main config (ESM — used by the app)
│   ├── config.cjs        # CJS wrapper (used by sequelize-cli)
│   └── db.js             # Database connection & sync logic
├── models/
│   └── index.js          # Sequelize initialization & model loader
├── migrations/           # Database migrations (for production)
└── seeders/              # Seed data files
```

---

## 🔧 Step 1 — Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

```env
PORT=3000
NODE_ENV=development

# Database (individual vars — used in local development)
DB_HOST=127.0.0.1
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=martecommerce_db
DB_PORT=3306
DB_CONNECTION=mysql

# Database (connection URL — used in production deployments)
# DATABASE_URL=mysql://user:password@host:3306/dbname

# Frontend URL (CORS)
ORIGIN=http://localhost:5173
```

> ⚠️ **Never commit `.env` to version control.** Only `.env.example` should be committed.

---

## 🔧 Step 2 — Config File (`config/config.js`)

This is the **main runtime config** used by the application. It defines settings for 3 environments:

```js
import dotenv from "dotenv";
dotenv.config();

const config = {
    development: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE || "martecommerce_db",
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_CONNECTION || "mysql",
        logging: false,
    },
    test: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE_TEST || "martecommerce_db_test",
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_CONNECTION || "mysql",
        logging: false,
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_CONNECTION || "mysql",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
    },
};

const env = process.env.NODE_ENV || "development";
const activeConfig = config[env];

export { config, activeConfig };
export default config;
```

### Key Points:

| Feature | Development | Production |
|---------|------------|------------|
| **Fallback values** | ✅ Has defaults (`root`, `localhost`) | ❌ No defaults (must set env vars) |
| **SSL** | ❌ Not needed locally | ✅ Required for cloud databases |
| **Connection Pool** | ❌ Not needed | ✅ `max: 10, min: 2` for performance |
| **Logging** | `false` (set `console.log` to debug) | `false` for security |

---

## 🔧 Step 3 — CJS Config Wrapper (`config/config.cjs`)

Sequelize CLI **does NOT support ESM** (`import/export`), so this file mirrors the same config in CommonJS format:

```js
require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE || "martecommerce_db",
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_CONNECTION || "mysql",
        logging: false,
    },
    test: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE_TEST || "martecommerce_db_test",
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_CONNECTION || "mysql",
        logging: false,
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_CONNECTION || "mysql",
        logging: false,
        use_env_variable: process.env.DATABASE_URL ? "DATABASE_URL" : undefined,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
    },
};
```

> 📌 **Why both files?** `config.js` → app runtime | `config.cjs` → CLI tools only

---

## 🔧 Step 4 — Sequelize CLI Config (`.sequelizerc`)

Tells sequelize-cli where to find your project files:

```js
const path = require("path");

module.exports = {
    config: path.resolve("config", "config.cjs"),
    "models-path": path.resolve("models"),
    "migrations-path": path.resolve("migrations"),
    "seeders-path": path.resolve("seeders"),
};
```

---

## 🔧 Step 5 — Model Loader (`models/index.js`)

This file initializes Sequelize and **automatically loads all model files** from the `models/` directory:

```js
import { Sequelize } from "sequelize";
import { readdirSync } from "fs";
import { basename as _basename, join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { activeConfig } from "../config/config.js";

// ESM equivalents of __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basename = _basename(__filename);

// ========================
// Initialize Sequelize
// ========================
let sequelize;

if (process.env.DATABASE_URL) {
    // Production: use DATABASE_URL connection string (Railway, Render, etc.)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: activeConfig.dialect,
        logging: activeConfig.logging,
        dialectOptions: activeConfig.dialectOptions || {},
        ...(activeConfig.pool && { pool: activeConfig.pool }),
    });
} else {
    // Local development: use individual connection params
    sequelize = new Sequelize(
        activeConfig.database,
        activeConfig.username,
        activeConfig.password,
        {
            host: activeConfig.host,
            port: activeConfig.port,
            dialect: activeConfig.dialect,
            logging: activeConfig.logging,
            ...(activeConfig.dialectOptions && {
                dialectOptions: activeConfig.dialectOptions,
            }),
            ...(activeConfig.pool && { pool: activeConfig.pool }),
        }
    );
}

const db = {};

// ========================
// Dynamically load all model files from this directory
// ========================
const modelFiles = readdirSync(__dirname).filter((file) => {
    return (
        file.indexOf(".") !== 0 &&
        file !== basename &&
        file.endsWith(".js") &&
        !file.endsWith(".test.js")
    );
});

for (const file of modelFiles) {
    const filePath = join(__dirname, file);
    const fileUrl = pathToFileURL(filePath).href;
    const { default: modelDef } = await import(fileUrl);

    if (typeof modelDef === "function") {
        const model = modelDef(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    }
}

// ========================
// Run model associations
// ========================
Object.keys(db).forEach((modelName) => {
    if (typeof db[modelName].associate === "function") {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export { sequelize };
```

### How It Works:

1. **Checks `DATABASE_URL`** — if set (cloud deployment), uses the connection string directly
2. **Falls back to individual params** — for local development (`DB_HOST`, `DB_USERNAME`, etc.)
3. **Auto-loads models** — reads all `.js` files in `models/` (except `index.js` and `.test.js`)
4. **Runs associations** — calls `.associate()` on each model if defined

---

## 🔧 Step 6 — Database Connection (`config/db.js`)

Handles database authentication and model syncing with **environment-aware behavior**:

```js
import { sequelize } from "../models/index.js";

const ENV = process.env.NODE_ENV || "development";

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully");

        if (ENV === "production") {
            // In production, use migrations instead of sync
            console.log(
                "ℹ️  Production mode — skipping auto-sync (use migrations)"
            );
        } else {
            // In development/test, sync models for convenience
            await sequelize.sync({ alter: true });
            console.log("✅ Models synchronized (dev mode)");
        }
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        if (ENV !== "production") {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

export { connectDB };
```

### Sync Strategy:

| Environment | Behavior | Why |
|-------------|----------|-----|
| **Development** | `sync({ alter: true })` | Auto-updates tables when models change — fast iteration |
| **Test** | `sync({ alter: true })` | Same as dev for convenience |
| **Production** | **No sync** | Schema changes must go through migrations for safety |

---

## 🔧 Step 7 — Server Entry Point (`server.js`)

```js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
app.use(express.json({ limit: "40mb" }));
app.use(express.urlencoded({ limit: "40mb", extended: true }));
app.use(cookieParser());
app.use(helmet());

// Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "API is running..." });
});

// Start Server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT} in ${ENV} mode`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
```

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env

# 3. Create the database in MySQL
mysql -u root -e "CREATE DATABASE IF NOT EXISTS martecommerce_db;"

# 4. Start the dev server
npm run dev
```

**Expected Output:**
```
✅ Database connected successfully
✅ Models synchronized (dev mode)
🚀 Server is running on port 3000 in development mode
```

---

## 🌐 Deployment (Production)

Set these environment variables on your hosting platform (Railway, Render, DigitalOcean, etc.):

```env
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/dbname
PORT=3000
ORIGIN=https://your-frontend-domain.com
```

Then run migrations before starting:

```bash
# Run pending migrations
npx sequelize-cli db:migrate

# Start the server
npm start
```

---

## 📋 Common Sequelize CLI Commands

```bash
# Create a new migration
npx sequelize-cli migration:generate --name create-users-table

# Run all pending migrations
npx sequelize-cli db:migrate

# Undo the last migration
npx sequelize-cli db:migrate:undo

# Create a new seed file
npx sequelize-cli seed:generate --name seed-users

# Run all seeders
npx sequelize-cli db:seed:all
```

---

## 🏗️ How to Create a New Model

Create a new file in `models/` (e.g., `models/User.js`):

```js
export default (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
        },
        {
            tableName: "users",
            timestamps: true,
        }
    );

    // Define associations here
    User.associate = (models) => {
        // User.hasMany(models.Order);
    };

    return User;
};
```

> The model will be **automatically loaded** by `models/index.js` — no manual imports needed.

---

## 🔄 Data Flow Diagram

```
.env
 ↓
config/config.js  (reads env vars → exports activeConfig)
 ↓
models/index.js   (uses activeConfig → creates Sequelize instance → loads models)
 ↓
config/db.js      (imports sequelize → authenticate + sync)
 ↓
server.js         (calls connectDB → starts Express)
```

---

## 📦 Required Dependencies

```json
{
    "dotenv": "latest",
    "express": "latest",
    "sequelize": "^6.x",
    "mysql2": "latest",
    "sequelize-cli": "^6.x"
}
```

Install with:
```bash
npm install dotenv express sequelize mysql2 sequelize-cli
```
