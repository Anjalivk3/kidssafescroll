"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import "./navbar.css";

export default function Navbar() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      setLoggingOut(false);

      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/dashboard" className="navbar-logo">
          🛡️ SafeScroll
        </Link>

        <div className="navbar-links">
          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/submit">
            Submit Content
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="logout-button"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </nav>
  );
}