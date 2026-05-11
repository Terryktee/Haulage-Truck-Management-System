<div align="center">

# 🚛 HellMary — Haulage Truck Management System

**A full-stack logistics management platform for real-world fleet operations**

[![Django](https://img.shields.io/badge/Backend-Django_REST_Framework-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/DevOps-Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

</div>

---

## 📖 Overview

**HellMary** is a full-stack Haulage Truck Management System built for the **Marytechenock Solutions Technical Assessment**. It simulates real-world logistics operations by managing trucks, drivers, and delivery jobs — while enforcing practical business rules around availability, assignment, and job lifecycle.

Built using a **monolith architecture**, the system exposes a clean REST API consumed by a modern React frontend.

---

## ✨ Features at a Glance

| Module | Capabilities |
|---|---|
| 🚚 **Truck Management** | Register, update, view, and delete trucks with real-time status tracking |
| 👤 **Driver Management** | Full CRUD for drivers with license and contact details |
| 📦 **Job / Delivery Management** | Create jobs, assign trucks and drivers, track delivery status end-to-end |
| ⚙️ **Business Rule Enforcement** | Prevent invalid assignments and enforce job lifecycle constraints |
| 🔐 **Authentication** *(backend-ready)* | Token-based auth implemented; frontend integration pending |
| 📄 **Pagination** *(backend-ready)* | Configurable pagination; frontend integration pending |

---

## 🏗️ Tech Stack

```
┌──────────────────────────────────────────────────────┐
│                      Frontend                        │
│         React  •  Vite  •  Tailwind CSS  •  shadcn/ui│
├──────────────────────────────────────────────────────┤
│                      Backend                         │
│            Django  •  Django REST Framework          │
├──────────────────────────────────────────────────────┤
│                     Database                         │
│                        SQLite                        │
├──────────────────────────────────────────────────────┤
│                    Infrastructure                    │
│                 Docker  •  Docker Compose            │
└──────────────────────────────────────────────────────┘
```

---

## 🔗 API Reference

### 🚛 Trucks
```http
GET    /api/trucks/          → List all trucks
POST   /api/trucks/          → Register a new truck
GET    /api/trucks/{id}/     → Retrieve a truck
PUT    /api/trucks/{id}/     → Update a truck
DELETE /api/trucks/{id}/     → Delete a truck
```

### 👤 Drivers
```http
GET    /api/drivers/         → List all drivers
POST   /api/drivers/         → Create a driver
GET    /api/drivers/{id}/    → Retrieve a driver
PUT    /api/drivers/{id}/    → Update a driver
DELETE /api/drivers/{id}/    → Delete a driver
```

### 📦 Jobs
```http
GET    /api/jobs/            → List all jobs
POST   /api/jobs/            → Create a delivery job
GET    /api/jobs/{id}/       → Retrieve a job
PATCH  /api/jobs/{id}/       → Update job status
DELETE /api/jobs/{id}/       → Delete a job
```

---

## 📐 Data Models

<details>
<summary><strong>🚚 Truck</strong></summary>

| Field | Type | Description |
|---|---|---|
| `truck_id` | UUID / Integer | Unique identifier |
| `registration_number` | String | Vehicle registration plate |
| `capacity` | Decimal | Load capacity |
| `status` | Enum | `available` · `in_transit` · `maintenance` |

</details>

<details>
<summary><strong>👤 Driver</strong></summary>

| Field | Type | Description |
|---|---|---|
| `driver_id` | UUID / Integer | Unique identifier |
| `name` | String | Full name |
| `license_number` | String | Driver's license |
| `phone_number` | String | Contact number |

</details>

<details>
<summary><strong>📦 Job</strong></summary>

| Field | Type | Description |
|---|---|---|
| `job_id` | UUID / Integer | Unique identifier |
| `pickup_location` | String | Origin address |
| `delivery_location` | String | Destination address |
| `cargo_description` | String | Details of the cargo |
| `status` | Enum | `pending` · `in_progress` · `completed` |
| `assigned_truck` | FK | Linked truck |
| `assigned_driver` | FK | Linked driver |

</details>

---

## 🛡️ Business Rules

The following constraints are enforced at the API level:

- 🚫 **Trucks in transit** cannot be assigned to a new job
- 🚫 **Trucks under maintenance** cannot be assigned to any job
- 🚫 **Drivers with an active job** cannot be assigned to another
- ✅ **Both truck and driver** must be selected to create a job assignment
- 🗑️ **Only pending jobs** can be deleted
- 🔄 **Job status changes** automatically update truck availability

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hellmary.git
cd hellmary
```

### 2. Build and Run

```bash
cd docker
docker-compose up --build
```

### 3. Access the Application

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8000/api/ |
| 🔧 Django Admin | http://localhost:8000/admin/ |

---

## 🔐 Enabling Auth & Pagination (Backend)

Authentication and pagination are implemented on the backend but disabled by default. To enable them:

1. Open `backend/settings.py`
2. Uncomment the **authentication** and **pagination** configuration blocks
3. Restart the backend service

> ⚠️ The frontend does not yet integrate with these features. Further development is required to connect the auth flow and paginated endpoints.

---

## 📁 Project Structure

```
HellMary/
│
├── .env.development        # Environment variables
├── .gitignore
├── README.md
│
├── backend/                # Django application
│   ├── api/                # REST API (trucks, drivers, jobs)
│   ├── settings.py
│   └── ...
│
├── docker/                 # Docker configuration
│   └── docker-compose.yml
│
└── frontend/               # React + Vite application
    ├── src/
    └── ...
```

---

## ✅ Feature Status

| Feature | Backend | Frontend |
|---|---|---|
| Truck CRUD | ✅ Complete | ✅ Complete |
| Driver CRUD | ✅ Complete | ✅ Complete |
| Job Management | ✅ Complete | ✅ Complete |
| Assignment Flow | ✅ Complete | ✅ Complete |
| Business Rule Enforcement | ✅ Complete | ✅ Complete |
| Authentication | ✅ Implemented | ⏳ Not integrated |
| Pagination | ✅ Implemented | ⏳ Not integrated |
| Unit Tests | ❌ Pending | — |
| Logging | ❌ Pending | — |

---

## 🔭 Roadmap

- [ ] Integrate JWT authentication into the frontend
- [ ] Add frontend pagination for large datasets
- [ ] Write unit tests for business rules and API endpoints
- [ ] Add backend logging and monitoring
- [ ] Role-based access control (admin, driver, dispatcher)
- [ ] Dashboard analytics for fleet usage and delivery performance
- [ ] Search and filtering across trucks, drivers, and jobs
- [ ] Migrate from SQLite to PostgreSQL for production
- [ ] Audit trails for status changes and assignments
- [ ] Cloud deployment configuration

---

## 🗄️ Database

This project uses **SQLite** for simplicity and faster local setup during the technical assessment. While **PostgreSQL** was preferred in the assessment brief, SQLite keeps development and testing lightweight and dependency-free.

For production use, migrating to PostgreSQL is recommended and included in the roadmap.

---

## 👨‍💻 Author

**Tawanda**  
Fullstack Developer passionate about building real-world systems that combine clean APIs, strong business logic, and practical user interfaces.

---

## 📋 Submission Checklist

- [x] GitHub repository
- [x] Docker setup
- [x] REST API implementation
- [x] Full CRUD functionality
- [x] Business rule enforcement
- [x] README documentation
- [x] Manual and API-based testing

---

<div align="center">

*Built with ❤️ for the Marytechenock Solutions Technical Assessment*

</div>
