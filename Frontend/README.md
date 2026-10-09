# FinXGuard Frontend

Modern, high-performance real-time credit card fraud detection dashboard built with React, Vite, and Tailwind CSS.

## Features
- **Real-Time Fraud Prevention Dashboard**: Displays PostgreSQL-backed transaction metrics, live risk distribution, and activity trends.
- **Transaction Submission**: Live payments pipeline submission via Redpanda/Kafka, evaluated by ML and Redis rules engine.
- **Security Alerts**: Instant notifications for REVIEW and BLOCKED transactions.
- **Admin Portal**: Detection monitoring with explainable ML reasons, system configuration parameters, and Smile Logistic Regression model metadata.
- **Role-Based Authentication**: Secure session authentication supporting USER and ADMIN roles with route protection.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Backend services running on `http://localhost:8080` (Backend API) and `http://localhost:8081` (Producer API)

### Installation
```bash
cd D:\FinXGuard\Frontend
npm.cmd install
```

### Running Development Server
```bash
npm.cmd run dev
```
Open `http://localhost:5173` in your browser.

### Building for Production
```bash
npm.cmd run build
```
