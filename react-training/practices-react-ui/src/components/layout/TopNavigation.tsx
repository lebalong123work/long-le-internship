import avatar from "@/assets/images/managers/avatar.png";
import inboxIcon from "@/assets/images/managers/mail.svg";

export function TopNavigation() {
  return (
    <header className="top-navigation">
      <h1 className="top-navigation_title">Dashboard overview</h1>
      <label className="top-navigation_search-wrap">
        <span className="visually-hidden">Search all pages</span>
        <input
          className="top-navigation_search"
          type="search"
          placeholder="Search all..."
        />
      </label>
      <nav className="top-navigation_actions" aria-label="User tools">
        <a href="#help-guides">Help guides</a>
        <a className="top-navigation_inbox" href="#inbox">
          Inbox
          <span className="top-navigation_inbox-icon">
            <img src={inboxIcon} alt="" />
            <span className="top-navigation_notification" aria-label="Unread" />
          </span>
        </a>
        <button className="top-navigation_download" type="button">
          Download client
        </button>
        <span className="top-navigation_profile">
          <img src={avatar} alt="User profile" />
          <span className="top-navigation_status" aria-label="Online" />
        </span>
      </nav>
    </header>
  );
}
