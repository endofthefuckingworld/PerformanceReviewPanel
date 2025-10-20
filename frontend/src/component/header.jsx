import React from "react";
import { NavLink } from "react-router-dom";
import "../index.css";
import logo from "/jets_icon_transparent.png";

export default function Header() {
  return (
    <header className="site-header">
      {/* 上層：品牌區 */}
      <div className="site-topbar">
        <div className="site-brand">
          <img className="logo" src={logo} alt="Jets Logo" />
          <span className="brand-text">Jets 後台審核</span>
        </div>
      </div>

      {/* 下層：分頁籤（切換頁面） */}
      <nav className="site-subnav">
        <NavLink to="/" end className="site-tab">表演審核</NavLink>
        <NavLink to="/performers/new" className="site-tab">新增表演者</NavLink>
        <NavLink to="/applications/new" className="site-tab">新增表演</NavLink>
      </nav>
    </header>
  );
}