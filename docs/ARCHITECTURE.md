# Architecture

## System Overview

```mermaid
flowchart TD
    Browser[Browser: React SPA]
    Vite[Vite Dev Server :5173<br/>proxies /api and /uploads]
    Express[Express API :5000]
    Mongo[(MongoDB<br/>students collection)]
    Disk[(Local disk /uploads<br/>or S3/Cloudinary)]

    Browser -->|HTTP| Vite
    Vite -->|proxy /api| Express
    Express -->|Mongoose| Mongo
    Express -->|Multer| Disk
```

In production (Docker/cloud), the React app is built to static files and served by nginx (or Vercel/Netlify), which proxies `/api` and `/uploads` requests to the Express backend directly — the Vite dev-server proxy is only used in local development.

## Request Lifecycle (Express Middleware Chain)

```mermaid
flowchart LR
    A([Incoming Request]) --> B[helmet - security headers]
    B --> C[cors]
    C --> D[express.json body parser]
    D --> E[rate limiter]
    E --> F[requestId middleware]
    F --> G[requestLogger middleware]
    G --> H{Route match?}
    H -->|/api/students| I[validator middleware]
    I --> J[controller - asyncHandler wrapped]
    J --> K[(MongoDB via Mongoose)]
    K --> L[response.js - standard envelope]
    H -->|no match| M[notFoundHandler - 404]
    J -->|throws/rejects| N[errorHandler - centralised]
```

## Sequence Diagram — Create Student

```mermaid
sequenceDiagram
    participant C as React Frontend
    participant E as Express API
    participant V as validator.js
    participant M as MongoDB (Student model)

    C->>E: POST /api/students (JSON body)
    E->>V: validateCreateStudent middleware
    V-->>E: sanitized body OR 422 errors
    alt validation failed
        E-->>C: 422 Validation Error
    else validation passed
        E->>M: findOne({ email })
        M-->>E: existing doc or null
        alt email already exists
            E-->>C: 409 Conflict
        else email is unique
            E->>M: Student.create(payload)
            M-->>E: created document
            E-->>C: 201 Created + student data
        end
    end
```

## Data Model

```mermaid
classDiagram
    class Student {
        +ObjectId studentId
        +String name
        +String email (unique)
        +String phone
        +String course
        +Number semester
        +String department
        +String address
        +String dateOfBirth
        +String gender
        +String profileImage
        +Date createdAt
        +Date updatedAt
    }
```

## Why MongoDB/Mongoose Here

- **Schema-level validation** (`models/Student.js`) acts as the authoritative last line of defence, on top of the `middleware/validator.js` pre-check — so data integrity holds even if a future code path bypasses the middleware.
- **Unique index on `email`** enforces the "no duplicate email" rule atomically at the database layer, closing the tiny race-condition window that a pure application-level check alone would leave open.
- **Indexes** on `course+createdAt`, `semester+createdAt`, and `createdAt` keep the `GET /api/students` filter/sort queries efficient without needing to scan the whole collection as the dataset grows.
- **ObjectId as studentId** — Mongo's built-in unique identifier, no extra UUID generation/library needed.

## Deployment Diagram

```mermaid
flowchart TD
    Dev[Developer] -->|git push| Repo[GitHub Repo]
    Repo --> Render[Render: Express backend]
    Repo --> Vercel[Vercel: React frontend build]
    Render --> Atlas[(MongoDB Atlas)]
    Vercel -->|API calls| Render
```
