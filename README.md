## Architecture

The backend consists of two node.js services, a postgres db and kafka.

- `backend` - exposes CRUD endpoints for comments and upvotes objects. emits
  events to a kafka broker when these models change.
- `realtime` - listens to a kafka broker and pushes changes in comments and
  upvotes objects via websockets to subscribed clients. written as a generic api
  that supports subscribing to any model that is added to the application.

The frontend is a single page app written using React.

## Running the application

This application is packaged using docker compose.

1. Run all the containers.

```sh
docker compose up # dev build
docker compose -f docker-compose.yml docker-compose.prod.yml up # prod build
```

2. Open `psql` session in the postgres container

```sh
docker exec -it <container-id> psql -U postgres 
```

TIP: you can use `docker ps` to get the container id

3. Run the following commands to initialise the database

```sh
create user ghost_user with password '123456';
create database ghost_test;
alter database ghost_test owner to ghost_user;
```

4. Run schema migrations defined in the backend

```sh
docker exec -it <container-id> yarn prisma migrate deploy
```

5. Navigate to `localhost:3010/seed`. This will seed the db with some sample
   data.

6. Run web app

```sh
cd web-app
yarn start
```

7. Navigate to `localhost:3000`
