# API Documentation

**Base URL (local dev):** `http://localhost:5000/api`

Every response follows this envelope:

```json
{
  "status": "success | error",
  "message": "human readable message",
  "data": { "...": "..." },
  "timestamp": "2026-08-01T10:15:00.000Z",
  "requestId": "b3f1c2a0-..."
}
```

---

## 1. Create Student
`POST /students`

**Body**
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@example.com",
  "phone": "+919876543210",
  "course": "B.Tech CSE",
  "semester": 5,
  "department": "Computer Science",
  "address": "Lucknow, Uttar Pradesh",
  "dateOfBirth": "2003-08-14",
  "gender": "male"
}
```

**201 Created** → student object in `data` (includes `studentId`, `createdAt`, `updatedAt`).

| Code | Reason |
|---|---|
| 409 | Email already registered |
| 422 | Validation failed (`data.errors`) |

```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Aarav Sharma","email":"aarav.sharma@example.com","phone":"+919876543210","course":"B.Tech CSE","semester":5,"department":"Computer Science"}'
```

---

## 2. List Students
`GET /students`

| Query Param | Description |
|---|---|
| `page` | Page number (default 1) |
| `limit` | Page size (default 10, max 100) |
| `search` | Substring match on `name` |
| `course`, `semester`, `department`, `gender` | Exact-match filters |
| `sortBy` | `name` \| `createdAt` \| `semester` (default `name`) |
| `sortOrder` | `asc` \| `desc` |

**200 OK**
```json
{
  "status": "success",
  "message": "Students retrieved successfully.",
  "data": {
    "items": [ { "studentId": "...", "name": "..." } ],
    "count": 10,
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true
  }
}
```

```bash
curl "http://localhost:5000/api/students?search=Aarav&sortBy=createdAt&sortOrder=desc"
```

---

## 3. Get Student By Id
`GET /students/:studentId`

`studentId` is the MongoDB ObjectId returned on creation.

| Code | Reason |
|---|---|
| 400 | Malformed ObjectId |
| 404 | Student not found |

```bash
curl http://localhost:5000/api/students/64f0a1b2c3d4e5f6a7b8c9d0
```

---

## 4. Update Student
`PUT /students/:studentId`

**Body** (any subset of updatable fields)
```json
{ "semester": 6, "address": "Gomti Nagar, Lucknow" }
```

| Code | Reason |
|---|---|
| 404 | Student not found |
| 409 | New email already used by another student |
| 422 | Validation failed |

```bash
curl -X PUT http://localhost:5000/api/students/64f0a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{"semester":6}'
```

---

## 5. Delete Student
`DELETE /students/:studentId`

```bash
curl -X DELETE http://localhost:5000/api/students/64f0a1b2c3d4e5f6a7b8c9d0
```

---

## 6. Upload Profile Image
`POST /students/:studentId/profile-image` — `multipart/form-data`, field name **`profileImage`**.

```bash
curl -X POST http://localhost:5000/api/students/64f0a1b2c3d4e5f6a7b8c9d0/profile-image \
  -F "profileImage=@./photo.jpg"
```

Returns the updated student object with `profileImage` set to `/uploads/<filename>`.

---

## HTTP Status Code Summary

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / malformed input |
| 404 | Not Found |
| 409 | Conflict (duplicate email) |
| 422 | Validation failed |
| 429 | Too many requests (rate limited) |
| 500 | Internal Server Error |
