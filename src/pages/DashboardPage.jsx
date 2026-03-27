import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

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

  // Settings State
  const [activeTab, setActiveTab] = useState('overview');
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Initialization
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
      interval = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Handlers
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
      alert("Session too short to log (minimum 1 minute). Stay focused next time!");
      setSecondsElapsed(0);
      return;
    }

    const { data, error } = await supabase.from('sessions').insert([{
      user_id: user.id, goal_id: selectedGoalId, category: 'deep work',
      duration_minutes: durationMinutes, start_time: sessionStartTime, end_time: endTime
    }]).select();

    if (error) {
      console.error(error); alert("Failed to log session: " + error.message);
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
    alert("Profile saved successfully.");
    setSettingsLoading(false);
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (editPassword.length < 6) { alert("Password must be 6+ characters."); return; }
    setSettingsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: editPassword });
    if (error) alert("Error: " + error.message);
    else { alert("Password updated securely."); setEditPassword(""); }
    setSettingsLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  // Utilities
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
      
      let bg = "rgba(255,255,255,0.03)";
      if (mins > 0) bg = "rgba(34,197,94,0.3)";
      if (mins >= 30) bg = "rgba(34,197,94,0.6)";
      if (mins >= 60) bg = "rgba(34,197,94,1)";

      days.push(
        <div key={dateStr} className="heatmap-cell" style={{ background: bg }} title={`${dateStr}: ${mins} mins`} />
      );
    }
    return days;
  };

  if (loading) return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#666", letterSpacing: "2px", textTransform: "uppercase", fontSize: "14px" }}>Initializing Dashboard...</p>
    </div>
  );

  return (
    <div className="dashboard-root">
      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-root { background-color: #050505; color: #fff; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
        .dash-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 48px; background: rgba(5,5,5,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); position: sticky; top: 0; z-index: 50; }
        .nav-actions { display: flex; gap: 24px; align-items: center; }
        .tab-pills { display: flex; background: rgba(255,255,255,0.03); padding: 4px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.05); }
        .tab-pills button { background: transparent; color: #888; border: none; padding: 8px 24px; border-radius: 100px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .tab-pills button.active { background: rgba(255,255,255,0.1); color: #fff; }
        .logout-btn { background: transparent; color: #888; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: color 0.2s; }
        .logout-btn:hover { color: #ef4444; }
        
        .dash-container { max-width: 1400px; margin: 0 auto; padding: 48px; }
        .dash-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: start; }
        
        .dash-card { background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); position: relative; overflow: hidden; }
        .timer-hud::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #22c55e, #10b981); }
        .timer-display { font-size: clamp(64px, 8vw, 120px); font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; margin: 32px 0; background: linear-gradient(to bottom right, #fff, #888); -webkit-background-clip: text; -webkit-text-fill-color: transparent; transition: all 0.3s ease; text-align: center; }
        .timer-display.active { background: #22c55e; -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 80px rgba(34,197,94,0.4); transform: scale(1.05); }
        
        .custom-select { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 16px; border-radius: 12px; font-size: 16px; outline: none; transition: border-color 0.2s; appearance: none; text-align: center; font-weight: 600; }
        .custom-select:focus { border-color: #22c55e; }
        .custom-select:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-primary { background: #22c55e; color: #000; border: none; padding: 16px 32px; border-radius: 100px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; width: 100%; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-danger { background: #ef4444; color: #fff; border: none; padding: 16px 32px; border-radius: 100px; font-size: 16px; font-weight: 700; cursor: pointer; width: 100%; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3); transition: all 0.2s; }
        .btn-danger:active { transform: scale(0.98); }
        
        .heatmap-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 6px; margin-top: 24px; }
        .heatmap-cell { width: 100%; aspect-ratio: 1; border-radius: 4px; transition: all 0.2s ease; cursor: crosshair; }
        .heatmap-cell:hover { transform: scale(1.4); z-index: 10; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        
        .goal-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; transition: all 0.3s; }
        .goal-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
        
        .tier-badge { font-size: 12px; font-weight: 800; padding: 6px 16px; border-radius: 100px; text-transform: uppercase; letter-spacing: 1px; }
        .tier-badge.free { background: rgba(255,255,255,0.05); color: #888; border: 1px dashed rgba(255,255,255,0.2); }
        .tier-badge.pro { background: linear-gradient(135deg, #22c55e, #10b981); color: #000; box-shadow: 0 4px 12px rgba(34,197,94,0.3); border: none; }
        
        /* Premium Layout Adjustments */
        .settings-panel { max-width: 600px; margin: 0 auto; display: flex; flexDirection: column; gap: 32px; }
        .form-label { display: block; font-size: 13px; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .form-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 16px; border-radius: 12px; font-size: 16px; transition: all 0.2s; outline: none; }
        .form-input:focus { border-color: #22c55e; background: rgba(0,0,0,0.5); }

        @media (max-width: 1024px) {
          .dash-grid { grid-template-columns: 1fr; }
          .dash-container { padding: 32px; }
        }
        @media (max-width: 768px) {
          .dash-nav { padding: 20px; flex-direction: column; gap: 20px; }
          .nav-actions { width: 100%; justify-content: space-between; }
          .dash-container { padding: 16px; }
          .dash-card { padding: 24px; border-radius: 20px; }
          .timer-display { font-size: 64px; }
          .heatmap-grid { gap: 4px; }
          .heatmap-cell { border-radius: 2px; }
        }
      `}} />

      {/* FIXED TOP NAVIGATION */}
      <nav className="dash-nav">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h2 style={{ fontSize: '24px', margin: 0, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            THRIVE<span style={{ color: '#22c55e' }}>10K</span>
          </h2>
        </Link>
        <div className="nav-actions">
          <div className="tab-pills">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</button>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      {/* DASHBOARD CONTAINER */}
      <div className="dash-container">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp} className="dash-grid">
              
              {/* LEFT COLUMN: THE WORKSPACE */}
              <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                
                {/* 1. DEEP WORK LOGGER */}
                <div className="dash-card timer-hud">
                  <h3 style={{ fontSize: "16px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "24px", fontWeight: 700 }}>Deep Flow State</h3>
                  
                  <select 
                    className="custom-select"
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    disabled={timerActive}
                  >
                    <option value="" disabled>-- Link session to a Goal --</option>
                    {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                  </select>

                  <div className={`timer-display ${timerActive ? 'active' : ''}`}>
                    {formatTime(secondsElapsed)}
                  </div>

                  {!timerActive ? (
                    <button onClick={handleStartTimer} className="btn-primary">Initiate Deep Work</button>
                  ) : (
                    <button onClick={handleStopTimer} className="btn-danger">End & Save Session</button>
                  )}
                </div>

                {/* 2. THE GOAL STACK */}
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <h3 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>The Goal Stack</h3>
                    {!showGoalForm && (
                      <button 
                        onClick={() => profile?.tier === 'free' && goals.length >= 3 ? alert("Free limit reached! Upgrade inside Settings.") : setShowGoalForm(true)}
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "8px 16px", borderRadius: "100px", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "background 0.2s" }}
                        onMouseOver={e=>e.target.style.background="rgba(255,255,255,0.1)"} onMouseOut={e=>e.target.style.background="rgba(255,255,255,0.05)"}
                      >
                        + Add Target
                      </button>
                    )}
                  </div>

                  {showGoalForm && (
                    <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                        <h4 style={{ margin: 0, fontSize: "16px", color: "#fff" }}>Define New Target</h4>
                        <button onClick={() => setShowGoalForm(false)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "20px" }}>&times;</button>
                      </div>
                      {formError && <div style={{ color: "#ef4444", fontSize: "13px", padding: "12px", background: "rgba(239,68,68,0.1)", borderRadius: "8px", marginBottom: "16px" }}>{formError}</div>}
                      <form onSubmit={handleCreateGoal}>
                        <div style={{ marginBottom: "16px" }}>
                          <label className="form-label">Goal Title *</label>
                          <input className="form-input" type="text" placeholder="e.g. Master React Native" required value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} />
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                          <label className="form-label">Core Motivation *</label>
                          <textarea className="form-input" rows="2" placeholder="Why does this matter?" required value={newGoal.why_statement} onChange={(e) => setNewGoal({...newGoal, why_statement: e.target.value})}></textarea>
                        </div>
                        <div style={{ marginBottom: "24px" }}>
                          <label className="form-label">Deadline</label>
                          <input className="form-input" type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} />
                        </div>
                        <button type="submit" className="btn-primary" disabled={formLoading} style={{ padding: "12px" }}>
                          {formLoading ? "Saving..." : "Lock into Stack"}
                        </button>
                      </form>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {goals.length === 0 && !showGoalForm ? (
                      <div style={{ padding: "40px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "16px" }}>
                        <p style={{ color: "#666", margin: 0 }}>Stack is empty. Create a target to begin.</p>
                      </div>
                    ) : (
                      goals.map((goal) => (
                        <div key={goal.id} className="goal-item">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#fff" }}>{goal.title}</h3>
                            {goal.deadline && (
                              <span style={{ fontSize: "12px", color: "#888", background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: "4px" }}>
                                Due {new Date(goal.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.5, margin: "0 0 20px 0", fontStyle: "italic" }}>
                            "{goal.why_statement}"
                          </p>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <div style={{ height: "4px", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${getGoalProgress(goal.id)}%`, background: "#22c55e", transition: "width 1s ease-out" }}></div>
                            </div>
                          </div>
                          <p style={{ fontSize: "12px", color: "#666", marginTop: "12px", margin: 0, textAlign: "right" }}>{getGoalHours(goal.id)} hours banked</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: ANALYTICS & PROFILE */}
              <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                
                {/* 3. PROFILE QUICK GLANCE */}
                <div className="dash-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800, color: "#fff" }}>
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#fff" }}>{profile?.full_name || "Welcome Back"}</h3>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <span className={`tier-badge ${profile?.tier === 'pro' ? 'pro' : 'free'}`}>
                        {profile?.tier || 'Free'} Plan
                      </span>
                      {profile?.tier === 'free' && (
                        <button onClick={() => setActiveTab('settings')} style={{ background: "none", border: "none", color: "#22c55e", fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                          Upgrade Now →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. CONSISTENCY HEATMAP */}
                <div className="dash-card">
                  <h3 style={{ fontSize: "16px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v6h6"/></svg>
                    60-Day Consistency
                  </h3>
                  
                  <div className="heatmap-grid">
                    {renderHeatmap()}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666", marginTop: "16px" }}>
                    <span>Less</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <div style={{ width: "12px", height: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "2px" }}></div>
                      <div style={{ width: "12px", height: "12px", background: "rgba(34,197,94,0.3)", borderRadius: "2px" }}></div>
                      <div style={{ width: "12px", height: "12px", background: "rgba(34,197,94,0.6)", borderRadius: "2px" }}></div>
                      <div style={{ width: "12px", height: "12px", background: "rgba(34,197,94,1)", borderRadius: "2px" }}></div>
                    </div>
                    <span>More</span>
                  </div>
                </div>

              </div>

            </motion.div>
          ) : (
            
            /* SETTINGS PANEL */
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="settings-panel">
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0" }}>App Settings</h2>
                <p style={{ color: "#888", margin: 0 }}>Manage your secure preferences and subscription tier.</p>
              </div>
              
              <div className="dash-card">
                <h3 style={{ fontSize: "18px", marginBottom: "24px", color: "#fff", fontWeight: 700 }}>Profile Identity</h3>
                <form onSubmit={handleUpdateProfile}>
                  <div style={{ marginBottom: "16px" }}>
                    <label className="form-label">Full Name</label>
                    <input className="form-input" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: "24px" }}>
                    <label className="form-label">Account Email (Immutable)</label>
                    <input className="form-input" type="email" value={user.email} disabled />
                  </div>
                  <button type="submit" className="btn-primary" disabled={settingsLoading} style={{ padding: "12px" }}>
                    {settingsLoading ? "Saving..." : "Update Profile"}
                  </button>
                </form>
              </div>

              <div className="dash-card">
                <h3 style={{ fontSize: "18px", marginBottom: "24px", color: "#fff", fontWeight: 700 }}>Security Protocol</h3>
                <form onSubmit={handleUpdatePassword}>
                  <div style={{ marginBottom: "24px" }}>
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" placeholder="Requires minimum 6 characters" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn-primary" disabled={settingsLoading} style={{ padding: "12px" }}>
                    {settingsLoading ? "Securing..." : "Update Password"}
                  </button>
                </form>
              </div>

              <div className="dash-card" style={{ border: profile?.tier === 'free' ? "1px dashed rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", color: "#fff", fontWeight: 700 }}>Billing & Licensing</h3>
                    <p style={{ color: "#888", fontSize: "14px", margin: 0, maxWidth: "300px", lineHeight: 1.5 }}>
                      {profile?.tier === 'free' ? "You are currently restricted to 3 active goals. Upgrade to Pro to unlock native scaling and infinite goal stacks." : "You possess an unhindered Elite license. All features are permanently unlocked."}
                    </p>
                  </div>
                  <span className={`tier-badge ${profile?.tier === 'pro' ? 'pro' : 'free'}`}>
                    {profile?.tier || 'Free'} Plan
                  </span>
                </div>
                
                {profile?.tier === 'free' && (
                  <Link to="/pricing" style={{ display: "block", background: "#fff", color: "#000", padding: "12px 24px", borderRadius: "100px", fontSize: "14px", fontWeight: 700, textDecoration: "none", textAlign: "center", marginTop: "24px", transition: "transform 0.2s" }} onMouseOver={e=>e.target.style.transform="scale(1.02)"} onMouseOut={e=>e.target.style.transform="scale(1)"}>
                    Upgrade to Pro Access →
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
