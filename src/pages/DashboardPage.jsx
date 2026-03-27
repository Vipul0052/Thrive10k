import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    fetchUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <div className="container" style={{padding: "150px 0", minHeight: "100vh"}}>Loading...</div>;

  if (!user) return null; // Prevents flashing before redirect

  return (
    <section className="container" style={{padding: "150px 0", minHeight: "100vh"}}>
      <h1 className="page-hero__heading">Welcome back, <span className="serif gradient-text">{user?.user_metadata?.full_name || user?.email}</span></h1>
      <p style={{marginTop: "20px", fontSize: "18px", color: "var(--color-ink-soft)"}}>
        This is your level 0 dashboard. More tracking and heatmap features coming soon!
      </p>
      
      <div style={{marginTop: "40px", padding: "24px", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", maxWidth: "600px"}}>
        <h3 style={{marginBottom: "16px", fontSize: "20px", color: "var(--color-ink)"}}>Account Details</h3>
        <p style={{marginBottom: "8px", color: "var(--color-ink-soft)"}}><strong>Email:</strong> {user?.email}</p>
        <p style={{marginBottom: "8px", color: "var(--color-ink-soft)"}}><strong>ID:</strong> {user?.id}</p>
        <p style={{marginBottom: "8px", color: "var(--color-ink-soft)"}}><strong>Joined:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
      </div>

      <button onClick={handleLogout} className="auth-form__submit" style={{marginTop: "40px", maxWidth: "200px"}}>
        Log out
      </button>
    </section>
  );
}
