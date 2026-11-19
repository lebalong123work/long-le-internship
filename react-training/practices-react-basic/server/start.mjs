import { register } from 'node:module'

register('./json-body-limit-hooks.mjs', import.meta.url)

await import('json-server/lib/bin.js')
