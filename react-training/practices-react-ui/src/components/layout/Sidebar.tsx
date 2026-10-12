import "@/styles/index.css";

export function Sidebar() {
  return (
    <aside className="aside">
      <div className="aside__action">
        <div className="aside__head">User Manager</div>
        <nav className="aside__list" aria-label="Main navigation">
          <a href="#" className="nav__item active" aria-current="page">
            User management
          </a>
        </nav>
      </div>
    </aside>
  );
}
