// Creates server/db.json (json-server working copy) from server/db.seed.json.
// Usage: node server/ensure-db.mjs          → only if db.json is missing
//        node server/ensure-db.mjs --reset  → always overwrite db.json
import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const seed = fileURLToPath(new URL('./db.seed.json', import.meta.url))
const db = fileURLToPath(new URL('./db.json', import.meta.url))
const reset = process.argv.includes('--reset')

if (reset || !existsSync(db)) {
  copyFileSync(seed, db)
  console.log(
    reset ? '[db] server/db.json reset from seed' : '[db] server/db.json created from seed'
  )
}
