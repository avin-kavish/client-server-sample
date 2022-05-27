## Development

The application is best executed using the docker compose file at the root
directory.

Requires an instance of kafka to run.

1. Provide environment variables
```sh
KAFKA_BROKERS=localhost:9092
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

