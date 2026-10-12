import { AppLayout } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/layout/Sidebar'

export default function App() {
  return (
    <AppLayout
      sidebar={<Sidebar />}
      mainContent={
        <div id="user-management">
          <h1>Management User</h1>
        </div>
      }
    />
  )
}
