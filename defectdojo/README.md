# DefectDojo Deployment Instructions

DefectDojo is an enterprise-grade vulnerability management tool. Because of its complex architecture (requiring PostgreSQL, Redis, Celery Workers, Celery Beat, and Nginx), it is highly recommended to use the official Docker Compose setup rather than building a custom one.

## How to deploy DefectDojo on this server:

1. SSH into your Ubuntu server.
2. Navigate to your desired installation directory (e.g., `/opt/`).
3. Clone the official repository:
   ```bash
   git clone https://github.com/DefectDojo/django-DefectDojo
   cd django-DefectDojo
   ```
4. Build and start the platform:
   ```bash
   # For a standard deployment:
   docker compose build
   docker compose up -d
   ```
5. Get your initial Admin credentials:
   ```bash
   docker compose logs initializer | grep "Admin password:"
   ```
6. Access DefectDojo at `http://<your-server-ip>:8080`.
7. **Generate API Key:** Log in as `admin`, click on your user profile in the top right, select "API v2 Key", and copy the token.
8. **Add to GitHub Secrets:** Go to your YTECH-App GitHub repository -> Settings -> Secrets and Variables -> Actions. Add two new repository secrets:
   - `DEFECTDOJO_URL`: `http://<your-server-ip>:8080` (or your domain)
   - `DEFECTDOJO_API_KEY`: `<your-copied-api-key>`

Once this is set up, your updated CI/CD pipelines will automatically push all security reports into DefectDojo!
