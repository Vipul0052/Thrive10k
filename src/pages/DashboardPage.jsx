import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", why_statement: "", deadline: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // UI state
  const [activeTab, setActiveTab ] = useState('overview');
  
  // Settings State
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      
      const currentUser = session.user;
      if (active) setUser(currentUser);

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
      if (active && profileData) {
        setProfile(profileData);
        setEditName(profileData.full_name || "");
      }

      const { data: goalsData } = await supabase.from('goals').select('*').eq('user_id', currentUser.id)
        .neq('status', 'archived').order('created_at', { ascending: false });
      if (active && goalsData) setGoals(goalsData);
      
      const { data: sessionsData } = await supabase.from('sessions').select('*').eq('user_id', currentUser.id);
      if (active && sessionsData) setSessions(sessionsData);
      
      if (active) setLoading(false);
    };

    fetchDashboardData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [navigate]);

  // Timer Interval
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => { setSecondsElapsed((prev) => prev + 1); }, 1000);
    } else { clearInterval(interval); }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStartTimer = () => {
    if (!selectedGoalId) { alert("Please select a goal first."); return; }
    setTimerActive(true);
    setSessionStartTime(new Date().toISOString());
  };

  const handleStopTimer = async () => {
    setTimerActive(false);
    const durationMinutes = Math.floor(secondsElapsed / 60);
    const endTime = new Date().toISOString();

    if (durationMinutes < 1) {
      alert("Session too short to log (minimum 1 minute).");
      setSecondsElapsed(0); return;
    }

    const { data, error } = await supabase.from('sessions').insert([{
      user_id: user.id, goal_id: selectedGoalId, category: 'deep work',
      duration_minutes: durationMinutes, start_time: sessionStartTime, end_time: endTime
    }]).select();

    if (error) { alert("Error: " + error.message); }
    else if (data) { setSessions([...sessions, data[0]]); setSecondsElapsed(0); setSessionStartTime(null); }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault(); setFormError(""); setFormLoading(true);
    if (profile?.tier === 'free' && goals.length >= 3) {
      setFormError("Free limit reached."); setFormLoading(false); return;
    }
    const { data, error } = await supabase.from('goals').insert([{
      user_id: user.id, title: newGoal.title, why_statement: newGoal.why_statement, deadline: newGoal.deadline || null
    }]).select();
    if (error) setFormError(error.message);
    else if (data) { setGoals([data[0], ...goals]); setShowGoalForm(false); setNewGoal({ title: "", why_statement: "", deadline: "" }); }
    setFormLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setSettingsLoading(true);
    await supabase.auth.updateUser({ data: { full_name: editName } });
    await supabase.from('profiles').update({ full_name: editName }).eq('id', user.id);
    setProfile({...profile, full_name: editName});
    alert("Profile saved."); setSettingsLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGoalHours = (goalId) => {
    const totalMinutes = sessions.filter(s => s.goal_id === goalId).reduce((acc, s) => acc + s.duration_minutes, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  const getGoalProgress = (goalId) => {
    const totalMinutes = sessions.filter(s => s.goal_id === goalId).reduce((acc, s) => acc + s.duration_minutes, 0);
    return Math.min((totalMinutes / 60) / 100 * 100, 100); 
  };

  const renderHeatmap = () => {
    const days = [];
    const today = new Date();
    const sessionMap = {};
    sessions.forEach(s => {
      if (!s.start_time) return;
      const dateStr = new Date(s.start_time).toISOString().split('T')[0];
      sessionMap[dateStr] = (sessionMap[dateStr] || 0) + s.duration_minutes;
    });

    for (let i = 59; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const mins = sessionMap[dateStr] || 0;
      let bg = "rgba(0,0,0,0.05)"; // Visible on white bg
      if (mins > 0) bg = "rgba(34,197,94,0.3)";
      if (mins >= 30) bg = "rgba(34,197,94,0.6)";
      if (mins >= 60) bg = "rgba(34,197,94,1)";
      days.push(
        <div key={dateStr} style={{ background: bg, borderRadius: "2px", width: "100%", paddingTop: "100%" }} title={`${dateStr}: ${mins} mins`} />
      );
    }
    return days;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <p style={{ color: "var(--color-ink-muted)", fontSize: "16px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase" }}>Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dash-padding" style={{ paddingTop: "100px", minHeight: "100vh", paddingBottom: "100px" }}>
      <style>{`
        @media (max-width: 768px) {
          .container { padding: 0 16px !important; }
          .dash-padding { padding-top: 40px !important; padding-bottom: 80px !important; }
          .dash-tabs { width: 100%; justify-content: space-between; margin-top: 24px !important; }
          .dash-tabs button { flex: 1; text-align: center; padding: 12px 0 !important; }
        }
      `}</style>
      <div className="container">
        
        {/* === HEADER === */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", borderBottom: "1px solid var(--color-border)", paddingBottom: "24px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h1 className="page-hero__heading" style={{ fontSize: "36px", margin: 0 }}>
              Welcome back, <span className="serif gradient-text">{profile?.full_name || user.email.split('@')[0]}</span>
            </h1>
            <p style={{ fontSize: "14px", color: "var(--color-ink-soft)", fontWeight: 600, marginTop: "12px" }}>Level 1 unlocked</p>
          </div>
          <div className="dash-tabs" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button 
              onClick={() => setActiveTab('overview')} 
              style={{ background: activeTab === 'overview' ? "var(--color-ink)" : "transparent", color: activeTab === 'overview' ? "#fff" : "var(--color-ink-soft)", border: "1px solid var(--color-border)", padding: "10px 24px", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              style={{ background: activeTab === 'settings' ? "var(--color-ink)" : "transparent", color: activeTab === 'settings' ? "#fff" : "var(--color-ink-soft)", border: "1px solid var(--color-border)", padding: "10px 24px", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
            >
              Settings
            </button>
            <button onClick={handleLogout} style={{ background: "transparent", color: "var(--color-ink-muted)", border: "none", padding: "10px 16px", cursor: "pointer", fontSize: "14px" }}>Sign Out</button>
          </div>
        </motion.div>

        {activeTab === 'overview' ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
          
          {/* THE STACK */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 600, display: "flex", gap: "10px", alignItems: "center" }}>The Goal Stack</h2>
              {!showGoalForm && <button onClick={() => goals.length < 3 || profile?.tier !== 'free' ? setShowGoalForm(true) : alert("Limit reached")} style={{ background: "#22c55e", color: "#000", border: "none", padding: "8px 16px", borderRadius: "100px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>+ New Goal</button>}
            </div>

            {showGoalForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "var(--radius-card)", marginBottom: "32px" }}>
                <form onSubmit={handleCreateGoal}>
                  <label className="auth-form__label">Goal Title</label>
                  <input className="auth-form__input" placeholder="e.g. Master React" value={newGoal.title} onChange={e=>setNewGoal({...newGoal, title:e.target.value})} required style={{ marginBottom: "16px" }} />
                  <label className="auth-form__label">The Why</label>
                  <textarea className="auth-form__input" rows="2" value={newGoal.why_statement} onChange={e=>setNewGoal({...newGoal, why_statement:e.target.value})} required style={{ marginBottom: "20px" }} />
                  <button type="submit" className="auth-form__submit" disabled={formLoading}>{formLoading ? "Saving..." : "Lock it in"}</button>
                  <button onClick={()=>setShowGoalForm(false)} style={{ width: "100%", background: "none", border: "none", color: "var(--color-ink-muted)", marginTop: "10px", cursor: "pointer" }}>Cancel</button>
                </form>
              </motion.div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {goals.map(g => (
                <div key={g.id} style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "20px" }}>
                  <h3 style={{ fontSize: "18px", margin: "0 0 8px 0" }}>{g.title}</h3>
                  <p style={{ color: "var(--color-ink-soft)", fontSize: "14px", margin: "0 0 16px 0" }}>"{g.why_statement}"</p>
                  <div style={{ height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${getGoalProgress(g.id)}%`, background: "#22c55e" }} />
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--color-ink-muted)", marginTop: "8px", textAlign: "right" }}>{getGoalHours(g.id)}h logged</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* LOGGER & HEATMAP */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px", textAlign: "center", marginBottom: "32px" }}>
              <select className="auth-form__input" value={selectedGoalId} onChange={e=>setSelectedGoalId(e.target.value)} disabled={timerActive} style={{ textAlign: "center", marginBottom: "24px" }}>
                <option value="" disabled>-- Select Goal --</option>
                {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
              <div style={{ fontFamily: "monospace", fontSize: "56px", fontWeight: 700, margin: "24px 0", color: timerActive ? "#22c55e" : "var(--color-ink)" }}>{formatTime(secondsElapsed)}</div>
              <button onClick={timerActive ? handleStopTimer : handleStartTimer} style={{ width: "100%", background: timerActive ? "#ef4444" : "var(--gradient-dark-cta)", color: "#fff", border: "none", padding: "16px", borderRadius: "100px", fontWeight: 700, cursor: "pointer" }}>
                {timerActive ? "Stop session" : "Start session"}
              </button>
            </div>

            <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: "20px" }}>Consistency Heatmap</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "4px" }}>{renderHeatmap()}</div>
              <p style={{ fontSize: "11px", color: "var(--color-ink-muted)", marginTop: "16px", textAlign: "right" }}>Last 60 days of output</p>
            </div>
          </motion.div>

        </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "24px" }}>Account Detail</h3>
              <form onSubmit={handleUpdateProfile}>
                <label className="auth-form__label">Full Name</label>
                <input className="auth-form__input" value={editName} onChange={e=>setEditName(e.target.value)} required style={{ marginBottom: "20px" }} />
                <button type="submit" className="auth-form__submit" disabled={settingsLoading}>Save Change</button>
              </form>
            </div>
            <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "24px" }}>Passcode</h3>
              <form onSubmit={e => { e.preventDefault(); alert("Feature coming soon."); }}>
                <input className="auth-form__input" type="password" placeholder="New password" style={{ marginBottom: "20px" }} />
                <button type="submit" className="auth-form__submit">Update Securely</button>
              </form>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
