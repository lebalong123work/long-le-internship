import logoManager from "@/assets/images/managers/logo-manager.svg";

export function Sidebar() {
  return (
    <aside className="aside">
      <div className="aside_action">
        <div className="aside_head">
          <img className="aside_logo" src={logoManager} alt="User Manager" />
        </div>
        <nav className="aside_list" aria-label="Main navigation">
          <a
            href="#user-management"
            className="nav_item active"
            aria-current="page"
          >
            User management
          </a>
        </nav>
      </div>
    </aside>
  );
}
