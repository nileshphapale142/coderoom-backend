# Coderoom: The Backend

This is the official repository of Coderoom's backend.

Coderoom is an education platform designed for coding courses in institutions.
Coderoom allows teachers to create coding tests inside classrooms and students to 
attempt these tests in given time frame and allowed programming languages. Coderoom 
provides learboard for both individual tests and entire class. Coderoom also supports dynamic
points system.

For "How to use Coderoom?" refer to official 
[Coderoom-Frontend](https://github.com/nileshphapale142/coderoom-frontend)
repository.

## Deploy Coderoom-Backend on personal server

### Prerequisites 
- Docker
- Node (Version >= 17)
- NPM
### Steps to follow

1. Clone this repository
```bash
git clone https://www.github.com/nileshphapale142/coderoom-backend
```

2. Change working directory
```bash
cd coderoom-backend
```

2. Install Prisma (for database creation)
```bash
npm install prisma
```

3. Create .env.db.prod and .env.prod files
```bash
touch .env.db.prod
touch .env.prod
```

4. Add environment variables in .env.db.prod
```
DATABASE_URL="postgresql://<postgres-user>:<postgres-password>@localhost:5436/<database-name>?schema=public"
POSTGRES_USER="<postgres-user>"
POSTGRES_PASSWORD="<postgres-password>"
POSTGRES_DB="<database-name>"
```
Replace necessary details above.

4. Add environemt variables in .env.prod
```
DATABASE_URL="postgresql://<postgres-user>:<postgres-password>@prod-db:5432/<database-name>?schema=public"
POSTGRES_USER="<postgres-user>"
POSTGRES_PASSWORD="<postgres-password>"
POSTGRES_DB="<database-name>"
JWT_SECRET="super-secret"
JUDGE0_API_KEY="<judge0-sulu-api-key>"
JUDGE0_API_HOST="<judge0-sulu-host>"
ADMIN_USERNAME="<admin-username>"
ADMIN_PASSWORD="<admin-password>"
ADMIN_MAIL="<admin-email>"
MAIL_USERNAME="<coderoom gmail>"
MAIL_PASSWORD="<coderoom gmail app password>"
```
Replace necessary details above.

5. Make sure coderoom docker network is created
```bash
docker network create coderoom
```

6. Start Database container.
```bash
docker compose -f docker-compose.prod.yml up -d prod-db
```

7. Apply migrations to database
```bash
npm run prisma:prod:deploy
```

8. Start the Main Server container
```bash
docker compose -f docker-compose.prod.yml up -d backend-server
```