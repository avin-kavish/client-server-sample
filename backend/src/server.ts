import app from "./app"

const start = async () => {
  try {
    await app.listen(3010, '0.0.0.0')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
