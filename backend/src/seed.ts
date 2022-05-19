import 'dotenv/config'
import { seed } from "./lib/seed"

seed().then(console.log).catch(console.error)
