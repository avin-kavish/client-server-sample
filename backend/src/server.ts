import app from "./app"

const start = async () => {
  try {
    await app.listen(3010)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
