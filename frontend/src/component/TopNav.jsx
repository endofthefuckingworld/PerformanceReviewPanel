import { NavLink } from "react-router-dom";
import "../index.css";

export default function TopNav() {
  return (
    <nav className="topnav">
      <NavLink to="/" end className="topnav-link">
        表演審核
      </NavLink>
      <NavLink to="/performers/new" className="topnav-link">
        新增表演者
      </NavLink>
      <NavLink to="/applications/new" className="topnav-link">
        新增表演
      </NavLink>
    </nav>
  );
}