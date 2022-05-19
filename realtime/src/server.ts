import initRealtime from "./app"

initRealtime()
  .then(io => io.listen(Number(process.env.PORT) || 3011))
  .catch(console.error)