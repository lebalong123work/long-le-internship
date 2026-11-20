// Creates server/db.json (json-server working copy) from server/db.seed.json.
// Usage: node server/ensure-db.mjs                      → only if db.json is missing
//        node server/ensure-db.mjs --reset              → always overwrite db.json
//        node server/ensure-db.mjs --db <file> --reset  → same, for another copy (E2E)
import { copyFileSync, existsSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const seed = fileURLToPath(new URL('./db.seed.json', import.meta.url))
const defaultDb = fileURLToPath(new URL('./db.json', import.meta.url))

function targetDb(args) {
  const index = args.indexOf('--db')
  if (index === -1) return defaultDb
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error('[db] --db needs a file path')
  const db = resolve(process.cwd(), value)
  if (db === seed) throw new Error('[db] --db must not point to the seed file')
  return db
}

const args = process.argv.slice(2)
const db = targetDb(args)
const reset = args.includes('--reset')
const label = relative(process.cwd(), db).replaceAll('\\', '/')

if (reset || !existsSync(db)) {
  copyFileSync(seed, db)
  console.log(reset ? `[db] ${label} reset from seed` : `[db] ${label} created from seed`)
}
