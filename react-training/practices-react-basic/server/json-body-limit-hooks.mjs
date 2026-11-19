const LIMITED_PARSER_URL = new URL('./milliparsec-limit.mjs', import.meta.url).href
const JSON_SERVER_DIR = '/node_modules/json-server/'

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'milliparsec' && context.parentURL?.includes(JSON_SERVER_DIR)) {
    return { url: LIMITED_PARSER_URL, shortCircuit: true }
  }
  return nextResolve(specifier, context)
}
