## Development

The application is best executed using the docker compose file at the root
directory.

Requires an instance of kafka and postgres to run.

1. Provide environment variables
```sh
POSTGRES_URL=
KAFKA=
```

2. Run the application
```sh
yarn dev
```

## Production

```sh
yarn build
yarn start
```

