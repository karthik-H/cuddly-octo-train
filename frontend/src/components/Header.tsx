import { Link, useLocation } from "react-router-dom";

export function Header() {
  const loc = useLocation();
  const path = loc.pathname;

  return (
    <header className="header">
      <Link to="/" className="header__brand">
        Event Manager
      </Link>
      <nav className="header__nav">
        <Link
          to="/"
          className={`header__link ${path === "/" ? "header__link--active" : ""}`}
        >
          All Events
        </Link>
        <Link
          to="/events/new"
          className={`header__link ${path === "/events/new" ? "header__link--active" : ""}`}
        >
          New Event
        </Link>
      </nav>
    </header>
  );
}
