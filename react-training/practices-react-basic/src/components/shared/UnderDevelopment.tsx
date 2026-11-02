import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface UnderDevelopmentProps {
  title: string
}

// Used by Shop, About Us and Contact in the MVP (see docs/requirements/features/shop.md).
export function UnderDevelopment({ title }: UnderDevelopmentProps): JSX.Element {
  return (
    <section>
      <h1>{title}</h1>
      <p>This page is under development</p>
      <Link to={ROUTES.HOME}>Back to Home</Link>
    </section>
  )
}
