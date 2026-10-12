export function Sidebar() {
  return (
    <aside className="aside">
      <a className="manager-logo" href="/" aria-label="User Manager home">
        User Manager
      </a>
      <nav aria-label="Main navigation">
        <a className="manager-menu-item" href="#user-management" aria-current="page">
          User management
        </a>
      </nav>
    </aside>
  )
}
