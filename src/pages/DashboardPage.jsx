import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

      const { data: goalsData } = await supabase.from('goals').select('*').eq('user_id', currentUser.id).neq('status', 'archived').order('created_at', { ascending: false });
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
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStartTimer = () => {
    if (!selectedGoalId) { alert("Please select a target goal first."); return; }
    setTimerActive(true);
    setSessionStartTime(new Date().toISOString());
  };

  const handleStopTimer = async () => {
    setTimerActive(false);
    const durationMinutes = Math.floor(secondsElapsed / 60);
    const endTime = new Date().toISOString();

    if (durationMinutes < 1) {
      alert("Session too short to log (minimum 1 minute). Stay focused!");
      setSecondsElapsed(0);
      return;
    }

    const { data, error } = await supabase.from('sessions').insert([{
      user_id: user.id, goal_id: selectedGoalId, category: 'deep work',
      duration_minutes: durationMinutes, start_time: sessionStartTime, end_time: endTime
    }]).select();

    if (error) {
      console.error(error); alert("Failed to log: " + error.message);
    } else if (data) {
      setSessions([...sessions, data[0]]);
      setSecondsElapsed(0);
      setSessionStartTime(null);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setFormError(""); setFormLoading(true);

    if (profile?.tier === 'free' && goals.length >= 3) {
      setFormError("Free limit reached: Maximum 3 active goals.");
      setFormLoading(false); return;
    }

    const { data, error } = await supabase.from('goals').insert([{
      user_id: user.id, title: newGoal.title, why_statement: newGoal.why_statement, deadline: newGoal.deadline || null,
    }]).select();

    if (error) setFormError(error.message);
    else if (data) {
      setGoals([data[0], ...goals]);
      setShowGoalForm(false);
      setNewGoal({ title: "", why_statement: "", deadline: "" });
    }
    setFormLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setSettingsLoading(true);
    await supabase.auth.updateUser({ data: { full_name: editName } });
    await supabase.from('profiles').update({ full_name: editName }).eq('id', user.id);
    setProfile({...profile, full_name: editName});
    alert("Profile saved.");
    setSettingsLoading(false);
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (editPassword.length < 6) { alert("Min 6 characters required."); return; }
    setSettingsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: editPassword });
    if (error) alert(error.message);
    else { alert("Password updated."); setEditPassword(""); }
    setSettingsLoading(false);
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
      let bg = "rgba(255,255,255,0.05)";
      if (mins > 0) bg = "rgba(34,197,94,0.3)";
      if (mins >= 30) bg = "rgba(34,197,94,0.6)";
      if (mins >= 60) bg = "rgba(34,197,94,1)";
      days.push(
        <div key={dateStr} style={{ background: bg, borderRadius: "2px", width: "100%", paddingBottom: "100%" }} title={`${dateStr}: ${mins} mins`} />
      );
    }
    return days;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#080808" }}>
        <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase" }}>Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="db-layout" style={{ background: "#050505", color: "#fff", minHeight: "100vh", display: "flex", overflow: "hidden" }}>
      <style>{`
        .db-layout { font-family: 'Inter', system-ui, sans-serif; }
        .sidebar { width: 280px; background: #0a0a0a; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; transition: all 0.3s ease; flex-shrink: 0; position: relative; z-index: 100; }
        .sidebar__logo { padding: 32px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; }
        .sidebar__menu { flex: 1; padding: 0 16px; display: flex; flex-direction: column; gap: 4px; }
        .sidebar__item { padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px; border: 1px solid transparent; }
        .sidebar__item:hover { color: #fff; background: rgba(255,255,255,0.03); }
        .sidebar__item.active { color: #fff; background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.05); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .sidebar__item svg { width: 20px; height: 20px; color: currentColor; }
        .sidebar__footer { padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
        
        .db-main { flex: 1; min-height: 100vh; overflow-y: auto; display: flex; flex-direction: column; }
        .db-header { padding: 24px 48px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(5,5,5,0.8); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 90; }
        .db-content { padding: 48px; flex: 1; max-width: 1400px; margin: 0 auto; width: 100%; }
        
        .db-card { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 28px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .timer-val { font-size: 72px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; margin: 32px 0; text-align: center; }
        .timer-val.active { color: #22c55e; filter: drop-shadow(0 0 20px rgba(34,197,94,0.3)); }
        
        .db-btn { padding: 14px 24px; border-radius: 100px; font-size: 15px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; width: 100%; text-align: center; display: block; border: 1px solid transparent; }
        .db-btn--primary { background: #22c55e; color: #000; }
        .db-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(34,197,94,0.2); }
        .db-btn--danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.1); }
        .db-btn--danger:hover { background: #ef4444; color: #fff; }
        
        .db-input { width: 100%; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 16px; color: #fff; margin-bottom: 16px; outline: none; transition: all 0.2s; }
        .db-input:focus { border-color: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.1); }
        .label-text { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px; }

        .mobile-bar { display: none; height: 64px; background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; padding: 0 20px; justify-content: space-between; position: fixed; top: 0; left: 0; right: 0; z-index: 200; }

        @media (max-width: 1024px) {
          .sidebar { position: fixed; left: -280px; height: 100vh; }
          .sidebar.open { left: 0; }
          .db-header { padding: 16px 20px; margin-top: 64px; }
          .db-content { padding: 24px 20px; }
          .mobile-bar { display: flex; }
          .db-main { height: auto; }
          .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 99; display: none; }
          .sidebar-overlay.open { display: block; }
        }
      `}</style>

      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar__logo">
          thrive<span style={{ color: '#22c55e' }}>10K</span>
        </div>
        <nav className="sidebar__menu">
          <div className={`sidebar__item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            Overview
          </div>
          <div className={`sidebar__item ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => { setActiveTab('goals'); setIsSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Target Stack
          </div>
          <div className={`sidebar__item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </div>
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__item" style={{ color: '#ef4444' }} onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign Out
          </div>
        </div>
      </aside>

      {/* MOBILE BAR */}
      <div className="mobile-bar">
        <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x21="21" y1="12"/><line x1="3" y1="6" x2="21" y1="6"/><line x1="3" y1="18" x2="21" y1="18"/></svg>
        </button>
        <div style={{ fontWeight: 800 }}>thrive10K</div>
        <div style={{ width: 24 }} />
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="db-main">
        <header className="db-header">
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
              {activeTab === 'overview' ? `Welcome back, ${profile?.full_name || 'Protocol User'}` : activeTab === 'goals' ? 'Your Targets' : 'Protocol Settings'}
            </h1>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0 0" }}>Level 1 unlocked</p>
          </div>
        </header>

        <section className="db-content">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="ov" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "31px" }}>
                  <div className="db-card">
                    <span className="label-text">Flow State Session</span>
                    <select className="db-input" value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)} disabled={timerActive}>
                      <option value="" disabled>-- Link to a Target --</option>
                      {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                    <div className={`timer-val ${timerActive ? 'active' : ''}`}>{formatTime(secondsElapsed)}</div>
                    {!timerActive ? (
                      <button className="db-btn db-btn--primary" onClick={handleStartTimer}>Start Deep Work</button>
                    ) : (
                      <button className="db-btn db-btn--danger" onClick={handleStopTimer}>End Session</button>
                    )}
                  </div>
                  <div className="db-card">
                    <span className="label-text">Metric Tracking</span>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div>
                        <div style={{ fontSize: "24px", fontWeight: 800 }}>{sessions.length}</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Total Runs</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "24px", fontWeight: 800, color: "#22c55e" }}>{(sessions.reduce((a,b)=>a+b.duration_minutes,0)/60).toFixed(1)}h</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Total Output</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                   <div className="db-card">
                    <span className="label-text">Consistency Index (60 Days)</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "4px", marginTop: "16px" }}>
                      {renderHeatmap()}
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "16px", textAlign: "right" }}>Work frequency visualizer</p>
                   </div>

                   <div className="db-card">
                     <span className="label-text">Top Active Targets</span>
                     <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                       {goals.slice(0, 3).map(g => (
                         <div key={g.id} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                             <span style={{ fontSize: "14px", fontWeight: 600 }}>{g.title}</span>
                             <span style={{ fontSize: "12px", color: "#22c55e" }}>{getGoalHours(g.id)}h</span>
                           </div>
                           <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                             <div style={{ height: "100%", width: `${getGoalProgress(g.id)}%`, background: "#22c55e", transition: "width 0.8s" }} />
                           </div>
                         </div>
                       ))}
                       {goals.length === 0 && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "12px" }}>No active targets.</p>}
                     </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* TARGETS TAB */}
            {activeTab === 'goals' && (
              <motion.div key="gl" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <h2 style={{ fontSize: "24px", margin: 0 }}>Target Management</h2>
                  {!showGoalForm && (
                     <button onClick={() => setShowGoalForm(true)} className="db-btn db-btn--primary" style={{ width: "auto" }}>+ Define New Target</button>
                  )}
                </div>

                {showGoalForm && (
                  <div className="db-card" style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                       <span className="label-text">New Mission Setup</span>
                       <button onClick={() => setShowGoalForm(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
                    </div>
                    {formError && <div style={{ color: "#ef4444", fontSize: "13px", background: "rgba(239,68,68,0.1)", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>{formError}</div>}
                    <form onSubmit={handleCreateGoal}>
                      <span className="label-text">Title</span>
                      <input className="db-input" placeholder="e.g. Master Go Lang" value={newGoal.title} onChange={e=>setNewGoal({...newGoal, title: e.target.value})} required />
                      <span className="label-text">The Motivation (Why?)</span>
                      <textarea className="db-input" rows="2" placeholder="Tell the protocol why this matters..." value={newGoal.why_statement} onChange={e=>setNewGoal({...newGoal, why_statement: e.target.value})} required style={{ resize: 'none' }} />
                      <span className="label-text">Target Deadline (Optional)</span>
                      <input className="db-input" type="date" value={newGoal.deadline} onChange={e=>setNewGoal({...newGoal, deadline: e.target.value})} />
                      <button type="submit" className="db-btn db-btn--primary" disabled={formLoading}>{formLoading ? "Deploying..." : "Lock into Stack"}</button>
                    </form>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                  {goals.map(g => (
                    <div key={g.id} className="db-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h3 style={{ fontSize: "18px", margin: 0 }}>{g.title}</h3>
                        {g.deadline && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>DUE {new Date(g.deadline).toLocaleDateString()}</span>}
                      </div>
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontStyle: "italic", margin: 0 }}>"{g.why_statement}"</p>
                      <div style={{ marginTop: "auto", paddingTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                           <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Output: {getGoalHours(g.id)}h</span>
                           <span style={{ fontSize: "11px", color: "#22c55e" }}>{getGoalProgress(g.id).toFixed(0)}%</span>
                        </div>
                        <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                           <div style={{ height: "100%", width: `${getGoalProgress(g.id)}%`, background: "#22c55e" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div key="st" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp} style={{ maxWidth: "600px" }}>
                <h2 style={{ fontSize: "24px", marginBottom: "32px" }}>Protocol Identity</h2>
                
                <div className="db-card" style={{ marginBottom: "24px" }}>
                   <span className="label-text">Profile Information</span>
                   <form onSubmit={handleUpdateProfile}>
                     <span className="label-text">Display Name</span>
                     <input className="db-input" value={editName} onChange={e=>setEditName(e.target.value)} required />
                     <span className="label-text">Secure Email</span>
                     <input className="db-input" value={user.email} disabled style={{ opacity: 0.4 }} />
                     <button type="submit" className="db-btn db-btn--primary" disabled={settingsLoading}>{settingsLoading ? "Saving..." : "Update Protocol Profile"}</button>
                   </form>
                </div>

                <div className="db-card" style={{ marginBottom: "24px" }}>
                   <span className="label-text">Security Protocol</span>
                   <form onSubmit={handleUpdatePassword}>
                     <span className="label-text">Modify Password</span>
                     <input className="db-input" type="password" placeholder="Minimum 6 characters" value={editPassword} onChange={e=>setEditPassword(e.target.value)} required />
                     <button type="submit" className="db-btn db-btn--primary" disabled={settingsLoading}>Update Encryption Password</button>
                   </form>
                </div>

                <div className="db-card">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span className="label-text">Access License</span>
                      <p style={{ margin: "4px 0 0 0", fontWeight: 700, fontSize: "18px" }}>{profile?.tier?.toUpperCase() || 'FREE'} PLAN</p>
                    </div>
                    {profile?.tier === 'free' && <Link to="/pricing" style={{ color: "#22c55e", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>Upgrade Now →</Link>}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
