import { SearchCombobox } from './SearchCombobox'

interface HeaderSearchProps {
  className?: string
}

export function HeaderSearch({ className }: HeaderSearchProps): JSX.Element {
  return <SearchCombobox variant="dropdown" className={className} />
}
