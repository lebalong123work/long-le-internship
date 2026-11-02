import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function NotFound(): JSX.Element {
  return (
    <section>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to={ROUTES.HOME}>Back to Home</Link>
    </section>
  )
}
