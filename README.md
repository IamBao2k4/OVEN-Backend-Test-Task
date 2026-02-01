# OVEN Backend Test Task

A NestJS-based backend application implementing webhook management with authentication, rate limiting, and comprehensive testing.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Features

### Core Functionality
- **Webhook Management**: Create, retrieve, and list webhook events with pagination
- **Authentication & Authorization**: JWT-based authentication with refresh token support
- **Rate Limiting**: Configurable throttling to prevent API abuse
- **Request Timeout Handling**: Global timeout interceptor for all requests
- **CORS Configuration**: Flexible cross-origin resource sharing setup
- **Input Validation**: Global validation pipes using class-validator
- **Security**: Password hashing with bcrypt, secure token management

### Architecture
- **Layered Architecture**: Clean separation of concerns
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Global Pipes**: Centralized validation and transformation
- **Interceptors**: Request timeout handling
- **Guards**: JWT authentication guards
- **DTOs**: Request/response validation

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest (unit & e2e tests)
- **Rate Limiting**: @nestjs/throttler
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/IamBao2k4/OVEN-Backend-Test-Task
cd OVEN-Backend-Test-Task
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the `.env` file I attached in mail.


### Configuration Parameters

- **PORT**: Server port (default: 3000)
- **PREFIX_API**: Global API prefix (default: /api/v1)
- **JWT_SECRET**: Secret key for JWT signing (generate using crypto)
- **JWT_EXPIRATION**: Access token expiration time
- **REFRESH_TOKEN_EXPIRES_IN**: Refresh token expiration time
- **DATABASE_URL**: PostgreSQL connection string
- **THROTTLE_TTL**: Rate limit window in milliseconds
- **THROTTLE_LIMIT**: Maximum requests per window
- **REQUEST_TIMEOUT**: Global request timeout in milliseconds

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

The server will start at `http://localhost:3000` (or your configured PORT).

## API Documentation
API documentation is available via Swagger at:
```
http://localhost:3000/api-docs
```

## Testing

### Unit Tests
```bash
npm run test
```

### Unit Tests with Coverage
```bash
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

### Watch Mode
```bash
npm run test:watch
```

### Test Coverage

The project includes comprehensive test coverage for:
- **Auth Service** ([test/auth.service.spec.ts](test/auth.service.spec.ts))
- **Webhook Service** ([test/webhook.service.spec.ts](test/webhook.service.spec.ts))
- **JWT Auth Guard** ([test/jwt-auth.guard.spec.ts](test/jwt-auth.guard.spec.ts))
- **Timeout Interceptor** ([test/timeout.interceptor.spec.ts](test/timeout.interceptor.spec.ts))
- **Token Utilities** ([test/token.spec.ts](test/token.spec.ts))

### Postman Collections

The `postman/` directory contains three comprehensive test collections:

1. **integration_flow.postman_collection.json**: End-to-end integration tests
2. **security_tests.postman_collection.json**: Security validation tests
3. **validation_tests.postman_collection.json**: Input validation tests

Import these into Postman to test the API endpoints.

## Project Structure

```
OVEN-Backend-Test-Task/
├── src/
│   ├── common/
│   │   └── interceptors/    # Timeout interceptor
│   ├── config/              # Application configuration
│   ├── controllers/         # HTTP request handlers
│   │   ├── auth.controller.ts
│   │   └── webhook.controller.ts
│   ├── decorators/          # Custom decorators
│   ├── dto/                 # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   ├── common.dto.ts
│   │   └── webhook.dto.ts
│   ├── guards/              # Authentication guards
│   │   ├── auth.guard.ts
│   │   └── jwt-auth.guard.ts
│   ├── helper/              # Utility functions
│   │   └── token.ts
│   ├── models/              # Type definitions
│   │   ├── auth.type.ts
│   │   ├── common.type.ts
│   │   ├── types.ts
│   │   └── webhook.type.ts
│   ├── modules/             # Feature modules
│   │   ├── auth.module.ts
│   │   ├── storage.module.ts
│   │   ├── throttler.module.ts
│   │   └── webhook.module.ts
│   ├── repositories/        # Data access layer
│   │   ├── refreshToken.repository.ts
│   │   ├── user.repository.ts
│   │   └── webhook.repository.ts
│   ├── services/            # Business logic services
│   │   ├── auth.service.ts
│   │   ├── prisma.service.ts
│   │   └── webhook.service.ts
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── test/                    # Test files
├── postman/                 # Postman collections
├── .env                     # Environment variables
└── package.json
```

## Changes & Improvements

Based on the task requirements, the following improvements were implemented:

### 1. Global Validation Pipes 
- Implemented `ValidationPipe` in [src/main.ts](src/main.ts:22-24)
- Uses `class-validator` for DTO validation
- Automatic transformation enabled

### 2. Layered Architecture 
- Separated concerns into modules, services, and controllers
- Clean architecture with dedicated layers:
  - **Controllers**: Handle HTTP requests
  - **Services**: Business logic
  - **Modules**: Feature organization

### 3. Authentication System 
- JWT-based authentication with access and refresh tokens
- Secure password hashing using bcrypt
- Token refresh mechanism
- Logout functionality
- Auth guards for protected routes

### 4. Storage Integration 
- PostgreSQL database with Prisma ORM
- Type-safe database queries
- Migration support
- Three main models: User, Webhook, RefreshToken

### 5. Rate Limiting (Throttler) 
- Implemented using `@nestjs/throttler`
- Configurable limits via environment variables
- Applied globally to all routes
- Prevents API abuse

### 6. Request Timeout Handling 
- Custom `TimeoutInterceptor` in [src/common/interceptors/timeout.interceptor.ts](src/common/interceptors/timeout.interceptor.ts)
- Global timeout configuration (default: 10 seconds)
- Automatic timeout for long-running requests

### 7. CORS Configuration 
- Flexible CORS setup in [src/main.ts](src/main.ts:13-20)
- Configurable via environment variables:
  - Origin whitelist
  - Allowed methods
  - Credentials support
  - Custom headers
  - Max age caching

### 8. Enhanced DTOs 
- Added comprehensive validation decorators
- Request/response typing
- Pagination support
- Filter validation

### 9. Pagination 
- Implemented for webhook listing
- Query parameters: `page`, `limit`
- Response includes metadata: total, totalPages, currentPage

### 10. Logging & Decorators 
- Log decorator for debugging
- UUID validation decorators
- Custom parameter decorators

### 11. Testing Infrastructure 
- Unit tests with Jest
- E2E tests configuration
- Postman collections for integration testing
- Test coverage reporting

### 12. Environment Configuration 
- Centralized config management
- Type-safe configuration
- Separate configs for app, CORS, database, etc.

### 13. Documentation 
- Comprehensive README
- API endpoint documentation
- Setup instructions
- Configuration guide