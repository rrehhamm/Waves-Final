# Waves-Final

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-Backend-red?style=for-the-badge&logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/Frontend-Vite-blue?style=for-the-badge&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Database-MySQL-orange?style=for-the-badge&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/API-Scribe-brightgreen?style=for-the-badge" alt="Scribe">
</p>

<p align="center">
  A full-stack web application with a Laravel backend, a separate frontend app, and a database-driven architecture.
</p>

---

## About

**Waves-Final** is a complete project for managing an e-commerce/admin-style system.  
It includes backend logic, frontend integration, database migrations, API documentation, and testing support.

---

## Features

- Product management
- Category management
- Brand management
- Banner and hero section management
- Gallery image handling
- Contact message storage
- Order and order item tracking
- Site settings management
- Admin and user models
- Image upload service
- API documentation with Scribe
- Postman collection for API testing
- Separate frontend project

---

## Tech Stack

### Backend
- Laravel
- PHP
- Eloquent ORM
- Migrations and seeders
- PHPUnit

### Frontend
- Vite
- JavaScript
- Separate frontend app in `wavesFrontend/`

### Database
- MySQL or any Laravel-supported database

### Tools
- Composer
- npm
- Postman
- VS Code

---

## Project Structure

```text
Waves-Final/
├── app/
│   ├── Helpers/
│   ├── Http/
│   ├── Models/
│   ├── Providers/
│   └── Services/
├── bootstrap/
├── config/
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── public/
├── resources/
├── routes/
├── storage/
├── tests/
├── wavesFrontend/
├── .scribe/
├── FRONTEND_INTEGRATION_GUIDE.md
├── Waves.postman_collection.json
└── README.md
```

---

## Main Modules

This project includes models and database tables for:

- Admins
- Users
- Categories
- Brands
- Products
- Banners
- Gallery Images
- Contact Messages
- Orders
- Order Items
- Hero Sections
- Site Settings

---

## Getting Started

### Prerequisites

Make sure the following are installed:

- PHP
- Composer
- Node.js
- npm
- A database server

### Clone the repository

```bash
git clone https://github.com/rrehhamm/Waves-Final.git
cd Waves-Final
```

### Install backend dependencies

```bash
composer install
```

### Copy environment file

```bash
copy .env.example .env
```

### Generate application key

```bash
php artisan key:generate
```

### Configure database

Update your `.env` file with your database credentials.

### Run migrations

```bash
php artisan migrate
```

### Seed the database

```bash
php artisan db:seed
```

### Start the backend server

```bash
php artisan serve
```

---

## Frontend Setup

The frontend is located in the `wavesFrontend/` folder.

```bash
cd wavesFrontend
npm install
npm run dev
```

For integration details, see:

- `FRONTEND_INTEGRATION_GUIDE.md`

---

## API Documentation

API documentation is available through **Scribe**.

- Documentation source: `.scribe/`
- Postman collection: `Waves.postman_collection.json`

---

## Database

Database structure is managed with Laravel migrations in:

```text
database/migrations/
```

This includes tables for core application features such as products, orders, users, admins, and more.

---

## Testing

Run tests with:

```bash
php artisan test
```

---

## Configuration Files

Important project files:

- `.env.example`
- `composer.json`
- `package.json`
- `phpunit.xml`
- `vite.config.js`
- `FRONTEND_INTEGRATION_GUIDE.md`

---

## Deployment Notes

Before deployment, make sure to:

- set production environment variables
- run database migrations
- build frontend assets
- configure storage permissions
- clear caches if needed

---

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Test locally
5. Open a pull request

---

## Contact

GitHub: [rrehhamm](https://github.com/rrehhamm)
GitHub: [z7ldz777](https://github.com/z7ldz777)
