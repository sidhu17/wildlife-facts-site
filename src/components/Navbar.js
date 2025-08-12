import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <h1 className="brand">Wildlife Facts</h1>
        <div className="nav-sub">Facts, care tips, dangers & categories</div>
      </div>
    </header>
  );
}