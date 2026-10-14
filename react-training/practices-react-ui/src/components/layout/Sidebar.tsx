import logoManager from "@/assets/images/managers/logo-manager.svg";

export function Sidebar() {
  return (
    <aside className="aside">
      <div className="aside_action">
        <div className="aside_head">
          <img className="aside_logo" src={logoManager} alt="User Manager" />
          <span>Company name</span>
        </div>
        <nav aria-label="Main navigation">
          <ul className="aside_list">
            <li>
              <a className="nav_item" href="#dashboard">Dashboard</a>
            </li>
            <li>
              <a
                href="#user-management"
                className="nav_item active"
                aria-current="page"
              >User management</a>
            </li>
            <li>
              <a className="nav_item" href="#documents">Documents</a>
            </li>
            <li>
              <a className="nav_item" href="#statistics">Statistics</a>
            </li>
            <li>
              <a className="nav_item" href="#settings">Settings</a>
            </li>
          </ul>
        </nav>
      </div>
      <a className="aside_logout" href="#logout">Logout</a>
    </aside>
  );
}
