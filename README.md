# Real Divers

**Real Divers** is a platform designed for managing diving courses, events, blog posts, and user accounts. The project comprises a **React.js** frontend (using React Router, Bootstrap, i18n, among others) and a **Spring Boot** (Java 17+) backend.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Technologies](#technologies)
3. [Running the Application Locally](#running-the-application-locally)
4. [Running via Docker Compose](#running-via-docker-compose)
5. [Architecture - Key Modules](#architecture---key-modules)

---

## 1. Key Features <a name="key-features"></a>
- User registration, login, and management (roles: `ADMIN`, `EMPLOYEE`, `CLIENT`).
- Admin panel:
  - Manage users (activation, blocking, resetting passwords).
  - Manage courses, add materials (videos, PDFs, images).
  - Manage events (registration, approval).
  - Manage files (upload HTML pages, images).
- Public section:
  - Blog with posts and images.
  - Event calendar.
  - Users can sign up for events.
  - Browse course offerings.
- Role-based security:
  - **Admin** – full access, system management.
  - **Employee** – adding/editing events, courses, blog posts.
  - **Client** – enroll in courses, events, and access personal data.
- **JWT-based security** – token-based authentication and authorization.
- **REST API** – for frontend communication and external clients.
- Password reset and account activation via email links.

---

## 2. Technologies <a name="technologies"></a>

### Frontend
- **React.js** (v17+)
- **React Router** (v6+)
- **Bootstrap 5** / **React-Bootstrap**
- **i18next** (for multilingual support)
- **axios** (API calls)
- **grapesjs**, **react-page**, and other page editing plugins
- **Node.js** (v18+), **npm** or **yarn** (package management)

### Backend
- **Java 17+**  
- **Spring Boot 3+** (Spring Data JPA, Spring Security, etc.)
- **Maven** (dependency management)  
- **PostgreSQL** (database)
- **JWT** (authentication and authorization)
- **Hibernate** (ORM)

### DevOps / Others
- **Docker** & **Docker Compose** (for containerization)
- **Nginx** (serving the React build in production)
- **Git** (version control)

---

## 3. Running the Application Locally <a name="running-the-application-locally"></a>

### Backend (Spring Boot)

1. Navigate to `backend_divers`.
2. Update `application.properties` with the correct **PostgreSQL** (or other DB) credentials.
3. Run:
   ```bash
   mvn spring-boot:run
   ```
   or
   ```bash
   mvn clean install && java -jar target/divers-1.0-SNAPSHOT.jar
   ```
   By default, the server will start on port `8080`.

### Frontend (React)

1. Navigate to `frontend_divers`.
2. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   (or `yarn start`)

   The app will run at port `3000` by default.

**After running**:
- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend: [http://localhost:8080](http://localhost:8080)

---

## 4. Running via Docker Compose <a name="running-via-docker-compose"></a>

To run the **entire stack** (Postgres, backend, frontend) at once:

1. Make sure **Docker** and **Docker Compose** are installed.
2. Configure your `.env` file (or environment variables) with something like:
   ```bash
   SPRING_DATASOURCE_URL=jdbc:postgresql://bazadanych:5432/postgres_db
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=postgres
   SPRING_DATASOURCE_JWT_SECRET=secretJWT
   POSTGRES_DB=postgres_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   ```
3. From the main folder (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose build
   docker-compose up
   ```
   - **Backend** will be available at `localhost:8080`.
   - **Frontend** will be available at `localhost:3000`.
   - **Postgres** will run at `localhost:5432`.

---

## 5. Architecture - Key Modules <a name="architecture---key-modules"></a>

### Backend
- **`users.api.UserController`** – Manages users (registration, password reset, roles).
- **`roles.api.RoleController`** – Manages user roles.
- **`events.api.EventController`** – CRUD for events, user registration for events.
- **`page_content.api.PageContentController`** & **`FilesController`** – Manage page content and file uploads (images, HTML pages).
- **`course.api.CourseController`** – Manage courses (add/edit courses, user assignment).
- **`course.api.CourseMaterialController`** – Manage course materials (upload files/videos).
- **`security`** – Spring Security, JWT filters and configuration.

### Frontend
- **`src/pages`** – Main pages, e.g., `Home`, `Blog`, `Courses`, `Events`, `Login`, `Register`.
- **`src/components`** – Reusable UI components (e.g., navbar, footer).
- **`src/service`** – API calls and business logic (e.g., `SecurityService`, `UserService`).
- **React Router** – Route definitions.
- **`Dockerfile`** – Multi-stage build (build + serving with Nginx).

---




---

## To run docker app locally???:

### `docker build -t your-image-name .`
### `docker run -p 8080:8080 -e PORT=8080 your-image-name`


## Aby zrobic deploy na chmurę googla:

### `docker build -t europe-central2-docker.pkg.dev/truedivers/truedivers-repository/backend_diving1 ./backend_diving/`

### `docker build -t europe-central2-docker.pkg.dev/truedivers/truedivers-repository/frontend_diving1 ./frontend_diving/`




## `docker push europe-central2-docker.pkg.dev/truedivers/truedivers-repository/backend_diving1`

## `docker push europe-central2-docker.pkg.dev/truedivers/truedivers-repository/frontend_diving1`
_________ OLD________________
