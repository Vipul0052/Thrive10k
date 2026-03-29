import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Clock,
  ListTodo,
  Calendar,
  Flag,
  Map,
  BarChart,
  Trophy,
  Users,
  User,
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen, onLogout, goals = [], profile, streak = 0 }) {
  const location = useLocation();

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  }, [location.pathname, setIsOpen]);

  const NavItem = ({ icon: Icon, label, to, dotColor }) => {
    const isActive = location.pathname === to || (to === "/dashboard" && location.pathname === "/dashboard");
    return (
      <Link
        to={to}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 12px",
          margin: "2px 0",
          borderRadius: "6px",
          background: isActive ? "rgba(0,0,0,0.04)" : "transparent",
          color: isActive ? "var(--color-ink)" : "var(--color-ink-soft)",
          fontWeight: isActive ? 600 : 500,
          textDecoration: "none",
          transition: "background 150ms ease",
          fontSize: "13px",
        }}
        className={isActive ? "sidebar-nav-active" : "sidebar-nav-item"}
      >
        {dotColor ? (
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: dotColor, marginLeft: "4px" }} />
        ) : (
          <Icon size={15} color={isActive ? "var(--color-ink)" : "var(--color-ink-muted)"} />
        )}
        <span>{label}</span>
      </Link>
    );
  };

  const SectionLabel = ({ children }) => (
    <div
      style={{
        fontSize: "11px",
        textTransform: "uppercase",
        color: "var(--color-ink-muted)",
        letterSpacing: "0.05em",
        fontWeight: 600,
        margin: "24px 12px 8px",
      }}
    >
      {children}
    </div>
  );

  return (
    <>
      <style>{`
        .sidebar {
          width: 240px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
          transition: transform 0.3s ease;
        }
        .sidebar-nav-item:hover {
          background: rgba(0,0,0,0.04) !important;
        }
        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.2);
          z-index: 99;
          backdrop-filter: blur(2px);
        }
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .sidebar-overlay.open {
            display: block;
          }
        }
      `}</style>
      
      <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(false)} />

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Toggle Off Mobile */}
        <button 
          onClick={() => setIsOpen(false)}
          style={{ position: "absolute", right: "16px", top: "24px", display: "none" }}
          className="sidebar-close-btn"
        >
          <X size={20} color="var(--color-ink-muted)" />
        </button>

        <style>{`
          @media (max-width: 768px) {
            .sidebar-close-btn { display: block !important; }
          }
        `}</style>

        {/* Logo */}
        <div style={{ padding: "24px 20px" }}>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "flex-start", textDecoration: "none", color: "var(--color-ink)" }}>
            <span className="serif" style={{ fontSize: "20px", lineHeight: 1 }}>thrive</span>
            <span style={{ fontSize: "10px", fontWeight: "bold", marginLeft: "2px", lineHeight: 1 }}>10K</span>
          </Link>
        </div>

        {/* Nav Content */}
        <div style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
          <SectionLabel>Workspace</SectionLabel>
          <NavItem icon={LayoutGrid} label="Dashboard" to="/dashboard" />
          <NavItem icon={Clock} label="Log Hours" to="/dashboard/log-hours" />
          <NavItem icon={ListTodo} label="Today's Plan" to="/dashboard/plan" />
          <NavItem icon={Calendar} label="Calendar" to="/dashboard/calendar" />

          <SectionLabel>Goals</SectionLabel>
          {goals.length === 0 ? (
            <div style={{ padding: "0 12px", fontSize: "12px", color: "var(--color-ink-muted)" }}>No goals active</div>
          ) : (
            goals.map((g, i) => {
              const colors = ["#0d9488", "#9333ea", "#f43f5e", "#eab308", "#3b82f6"];
              return <NavItem key={g.id} label={g.title} to={`/dashboard/goals/${g.id}`} dotColor={colors[i % colors.length]} />
            })
          )}

          <SectionLabel>Long-term</SectionLabel>
          <NavItem icon={Flag} label="Milestones" to="/dashboard/milestones" />
          <NavItem icon={Map} label="10K Map" to="/dashboard/map" />
          <NavItem icon={BarChart} label="Insights" to="/dashboard/insights" />


          <SectionLabel>Community</SectionLabel>
          <NavItem icon={Trophy} label="Leaderboard" to="/dashboard/leaderboard" />
          <NavItem icon={Users} label="Accountability Room" to="/dashboard/accountability" />
          <NavItem icon={User} label="Public Profile" to="/dashboard/profile" />
        </div>

        {/* Footer / Pinned */}
        <div style={{ padding: "16px", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Streak Card */}
          <div
            style={{
              background: streak > 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(0,0,0,0.03)",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "8px",
              border: streak > 0 ? "1px solid rgba(245, 158, 11, 0.2)" : "1px solid var(--color-border)",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, color: streak > 0 ? "#d97706" : "var(--color-ink-muted)", marginBottom: "2px" }}>
              🔥 {streak} day streak
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-ink-muted)" }}>{streak > 0 ? "Keep it burning" : "Start your streak"}</div>
          </div>


          {/* User Card */}
          <Link
            to="/dashboard/settings"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "6px",
              textDecoration: "none",
              transition: "background 150ms ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.04)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "8px",
                  background: "var(--gradient-dark-cta)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (profile?.full_name?.charAt(0) || "U")}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-ink)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.full_name || "User"}</div>
            </div>
            <Settings size={15} color="var(--color-ink-muted)" />
          </Link>
        </div>
      </div>
    </>
  );
}
