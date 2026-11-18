const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? '' : DATE_FORMAT.format(date)
}
