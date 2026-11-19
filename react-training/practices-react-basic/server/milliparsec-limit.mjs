import { json as parseJson } from 'milliparsec'

export * from 'milliparsec'

export const JSON_BODY_LIMIT_BYTES = 2 * 1024 * 1024

export const json = (options = {}) => parseJson({ payloadLimit: JSON_BODY_LIMIT_BYTES, ...options })
