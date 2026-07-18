# Shivanya Kirana ERP System

## Overview
A comprehensive ERP system for managing kirana stores with features for billing, inventory, accounting, and reporting.

## Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: React.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Containerization**: Docker

## Features
- 🧾 Billing & Invoice Management
- 📦 Inventory Management
- 👥 Customer Management
- 🏪 Supplier Management
- 💰 Accounting & Profit/Loss Reports
- 📊 Analytics & Dashboard
- 🔐 Role-based Access Control
- 📱 Responsive UI

## Installation

### Using Docker (Recommended)
```bash
docker-compose up -d
```

### Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

#### Database
```bash
psql -U postgres -f database/schema.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Billing
- `POST /api/billing/create` - Create bill
- `GET /api/billing/:id` - Get bill details
- `POST /api/billing/hold/:id` - Hold bill

### Reports
- `GET /api/reports/sales/daily` - Daily sales
- `GET /api/reports/sales/monthly` - Monthly sales
- `GET /api/reports/profit` - Profit report

## Default Credentials
- Username: `admin`
- Password: `admin123`

## License
MIT
