interface TextSegment {
  text: string
  keepTogether: boolean
}

const WHITESPACE_RUN = /(\s+)/

export function splitHyphenatedWords(text: string): TextSegment[] {
  return text
    .split(WHITESPACE_RUN)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, keepTogether: part.includes('-') }))
}
