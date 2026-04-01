# Docker Setup: Apex Classes Backend

This project uses Docker Compose to orchestrate the backend application and its PostgreSQL database.

## 🚀 Quick Start (Local Environment)

1.  **Configure Environment Variables**:
    Ensure your `backend/.env` contains the sensitive keys (Razorpay, Appwrite). The `DATABASE_URL` for Docker is already pre-configured in the `docker-compose.yml`.

2.  **Build and Start**:
    ```bash
    docker compose up --build -d
    ```

3.  **Check Logs**:
    ```bash
    docker compose logs -f backend
    ```

4.  **Stop Services**:
    ```bash
    docker compose down
    ```

## 📂 Configuration Details

### Backend Container (`node:20-alpine`)
-   Accessible at `http://localhost:5000`.
-   Automatically waits for the database to be healthy before starting.

### Database Container (`postgres:15-alpine`)
-   **User**: `postgres`
-   **Password**: `postgres`
-   **DB Name**: `apex_db`
-   **Host (Internally)**: `db`
-   **Port (Externally)**: `5432`

## ⚠️ Notes
-   **No Auto-Schema**: As per configuration, the `schema.sql` does **not** run automatically. You will need to manually initialize your tables on the first run using:
    ```bash
    cat backend/src/db/schema.sql | docker exec -i apex-postgres psql -U postgres -d apex_db
    ```
-   **Volume Persistance**: Data is persisted in a Docker volume named `postgres_data`.
