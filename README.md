
# Haulage Truck Management System

A full-stack Haulage Truck Management System built for the **Marytechenock Solutions Technical Assessment**.  
The system simulates real-world logistics operations by managing trucks, drivers, and delivery jobs while enforcing practical business rules.

## Overview

This project was built using a **monolith architecture** with:

- **Backend:** Django + Django REST Framework
- **Frontend:** React (Vite) + Tailwind CSS + shadcn/ui
- **Database:** SQLite
- **Containerization:** Docker + Docker Compose

The application supports management of:

- Trucks
- Drivers
- Delivery Jobs

It also enforces key logistics business rules such as truck availability, single active job per driver, and job-driven truck status updates.


## Tech Stack

### Backend
- Django
- Django REST Framework
- SQLite

### Frontend
- React
- Vite
- Tailwind CSS
- shadcn/ui

### DevOps
- Docker
- Docker Compose

### Architecture
- Monolith Architecture


## Core Features

### 1. Truck Management
- Register trucks
- Update trucks
- View trucks
- Delete trucks

**Truck Fields**
- Truck ID
- Registration Number
- Capacity
- Status


### 2. Driver Management
- Create drivers
- Update drivers
- View drivers
- Delete drivers

**Driver Fields**
- Driver ID
- Name
- License Number
- Phone Number


### 3. Job / Delivery Management
- Create delivery jobs
- Assign truck and driver
- Update job status
- View jobs
- Delete jobs

**Job Fields**
- Job ID
- Pickup Location
- Delivery Location
- Cargo Description
- Status
- Assigned Truck
- Assigned Driver


## Business Rules

The following business rules were implemented:

- Trucks cannot be assigned if they are already **in transit**
- Trucks cannot be assigned if they are under **maintenance**
- Drivers cannot have **multiple active jobs**
- Job status affects truck availability
- A job cannot be assigned unless both a **truck** and **driver** are selected
- Only **pending** jobs can be deleted


## API Endpoints

### Trucks
```bash
GET    /api/trucks/
POST   /api/trucks/
GET    /api/trucks/{id}/
PUT    /api/trucks/{id}/
DELETE /api/trucks/{id}/
````

### Drivers

```bash
GET    /api/drivers/
POST   /api/drivers/
GET    /api/drivers/{id}/
PUT    /api/drivers/{id}/
DELETE /api/drivers/{id}/
```

### Jobs

```bash
GET    /api/jobs/
POST   /api/jobs/
GET    /api/jobs/{id}/
PATCH  /api/jobs/{id}/
DELETE /api/jobs/{id}/
```


## Frontend Notes

The frontend currently supports:

* Truck management
* Driver management
* Job management
* Assignment flows
* Validation and manual testing of business logic

### Important Note on Bonus Features

**Authentication** and **pagination** were added on the backend, but not yet integrated into the frontend.

To enable them on the backend:

* Go to **settings**
* Uncomment / unhighlight the relevant authentication and pagination configuration

Once enabled:

* The backend API will support authentication and pagination
* The frontend will require further integration to connect with the authentication API and paginated endpoints


## Bonus Features Status

### Implemented on Backend

* Authentication
* Pagination

### Not Yet Implemented

* Logging
* Unit Tests

### Frontend Status

* Authentication not yet connected
* Pagination not yet integrated


## Testing

The project was tested using:

* **API Testing**
* **Manual Testing through the frontend**

This was used to verify:

* CRUD operations
* Assignment workflow
* Business rule enforcement
* Status updates
* Validation behavior


## Folder Structure

```bash
HellMary/
│
├── .env.development
├── .gitignore
├── README.md
│
├── backend/
│
├── docker/
│
└── frontend/
```


## Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/hellmary.git
cd hellmary
```

### 2. Run with Docker

```bash
docker-compose up --build
```

### 3. Access the project

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:8000/api/`
* Django Admin: `http://localhost:8000/admin/`


## Database

This project uses **SQLite** for simplicity and faster local setup during the technical assessment.

Although PostgreSQL was preferred in the assessment brief, SQLite was used to keep development and testing lightweight and efficient.


## Design Approach

This project follows a **monolith architecture**, where backend logic, business rules, and API management are handled within a single Django application structure, while the frontend consumes the exposed REST APIs.

This approach was suitable for:

* Faster development
* Easier local testing
* Simpler project structure for assessment delivery


## Future Improvements

Possible future improvements include:

* Integrate frontend authentication with JWT login flow
* Add frontend pagination support for large datasets
* Add backend logging for better monitoring and debugging
* Add unit tests for business rules and API endpoints
* Add role-based access control
* Add dashboard analytics for fleet usage and delivery performance
* Add search and filtering across trucks, drivers, and jobs
* Add form-level loading and error states across all pages
* Improve assignment UI with busy/available indicators
* Migrate from SQLite to PostgreSQL for production readiness
* Add deployment configuration for cloud hosting
* Add audit trails for status changes and assignments


## Submission Notes

Deliverables included:

* GitHub repository
* Docker setup
* API implementation
* CRUD functionality
* Business rule enforcement
* README documentation

## Author

**Tawanda**
Fullstack Developer with interest in building real-world systems that combine clean APIs, strong business logic, and practical user interfaces.

## Final Note

This project demonstrates:

* REST API development
* Frontend-backend integration
* Business rule implementation
* Dockerized setup
* Manual and API-based testing
* Structured monolith system design

