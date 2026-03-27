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

  // Settings State
  const [activeTab, setActiveTab] = useState('overview');
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    if (profile && !editName) setEditName(profile.full_name || "");
  }, [profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: editName }
    });
    const { error: profileError } = await supabase.from('profiles').update({ full_name: editName }).eq('id', user.id);
    
    if (authError || profileError) {
      alert("Error updating profile.");
    } else {
      setProfile({...profile, full_name: editName});
      alert("Profile updated successfully!");
    }
    setSettingsLoading(false);
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (editPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    setSettingsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: editPassword });
    if (error) alert("Error: " + error.message);
    else {
      alert("Password updated securely.");
      setEditPassword("");
    }
    setSettingsLoading(false);
  };

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      // 1. Get Auth Session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      
      const currentUser = session.user;
      if (active) setUser(currentUser);

      // 2. Fetch Profile to get payment tier
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (active && profileData) setProfile(profileData);

      // 3. Fetch Active Goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', currentUser.id)
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      if (active && goalsData) setGoals(goalsData);
      
      // 4. Fetch Sessions for Heatmap & Progress
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', currentUser.id);

      if (active && sessionsData) setSessions(sessionsData);
      
      if (active) setLoading(false);
    };

    fetchDashboardData();
    
    // Listen for sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
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
    if (!selectedGoalId) {
      alert("Please select a goal to link this session to.");
      return;
    }
    setTimerActive(true);
    setSessionStartTime(new Date().toISOString());
  };

  const handleStopTimer = async () => {
    setTimerActive(false);
    const durationMinutes = Math.floor(secondsElapsed / 60);
    const endTime = new Date().toISOString();

    if (durationMinutes < 1) {
      alert("Session too short to log (minimum 1 minute). Keep pushing next time!");
      setSecondsElapsed(0);
      return;
    }

    const { data, error } = await supabase.from('sessions').insert([{
      user_id: user.id,
      goal_id: selectedGoalId,
      category: 'deep work',
      duration_minutes: durationMinutes,
      start_time: sessionStartTime,
      end_time: endTime
    }]).select();

    if (error) {
      console.error(error);
      alert("Failed to log session: " + error.message);
    } else if (data) {
      setSessions([...sessions, data[0]]);
      alert(`Epic! You just banked ${durationMinutes} minutes of Deep Work.`);
      setSecondsElapsed(0);
      setSessionStartTime(null);
    }
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGoalHours = (goalId) => {
    const totalMinutes = sessions.filter(s => s.goal_id === goalId && s.duration_minutes).reduce((acc, s) => acc + s.duration_minutes, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  const getGoalProgress = (goalId) => {
    const totalMinutes = sessions.filter(s => s.goal_id === goalId && s.duration_minutes).reduce((acc, s) => acc + s.duration_minutes, 0);
    return Math.min((totalMinutes / 60) / 100 * 100, 100); // UI visual strictly tracks progress to 100 hours
  };

  const renderHeatmap = () => {
    const days = [];
    const today = new Date();
    const sessionMap = {};
    
    sessions.forEach(s => {
      if (!s.start_time || !s.duration_minutes) return;
      const dateStr = new Date(s.start_time).toISOString().split('T')[0];
      sessionMap[dateStr] = (sessionMap[dateStr] || 0) + s.duration_minutes;
    });

    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const mins = sessionMap[dateStr] || 0;
      
      let bg = "rgba(255,255,255,0.05)";
      if (mins > 0) bg = "rgba(34,197,94,0.3)";
      if (mins >= 30) bg = "rgba(34,197,94,0.6)";
      if (mins >= 60) bg = "rgba(34,197,94,1)";

      days.push(
        <div 
          key={dateStr} 
          title={`${dateStr}: ${mins} mins logged`}
          style={{ width: "100%", paddingTop: "100%", background: bg, borderRadius: "2px", transition: "transform 0.1s", cursor: "crosshair" }}
          onMouseOver={(e) => { e.target.style.transform = "scale(1.3)"; e.target.style.zIndex = 10; e.target.style.position = "relative"; e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)"; }}
          onMouseOut={(e) => { e.target.style.transform = "scale(1)"; e.target.style.zIndex = 1; e.target.style.position = "static"; e.target.style.boxShadow = "none"; }}
        ></div>
      );
    }
    return days;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (profile?.tier === 'free' && goals.length >= 3) {
      setFormError("Free tier limit reached: Maximum 3 active goals. Please upgrade to Pro.");
      setFormLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('goals')
      .insert([
        {
          user_id: user.id,
          title: newGoal.title,
          why_statement: newGoal.why_statement,
          deadline: newGoal.deadline || null,
        }
      ])
      .select();

    if (error) {
      setFormError(error.message);
    } else if (data) {
      setGoals([data[0], ...goals]); // Add to top of list
      setShowGoalForm(false);
      setNewGoal({ title: "", why_statement: "", deadline: "" }); // Reset
    }
    
    setFormLoading(false);
  };

  const checkCanCreate = () => {
    if (profile?.tier === 'pro' || profile?.tier === 'lifetime') return true;
    return goals.length < 3;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#050505" }}>
        <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase" }}>Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dash-padding" style={{ paddingTop: "100px", minHeight: "100vh", paddingBottom: "100px", background: "#050505", color: "#fff" }}>
      <style>{`
        @media (max-width: 768px) {
          .container { padding: 0 16px !important; }
          .dash-padding { padding-top: 40px !important; padding-bottom: 40px !important; }
          .dash-card-padding { padding: 24px !important; }
          .timer-typography { font-size: 36px !important; }
        }
      `}</style>
      <div className="container">
        
        {/* === HEADER === */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", borderBottom: "1px solid var(--color-border)", paddingBottom: "24px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h1 className="page-hero__heading" style={{ fontSize: "36px", margin: 0 }}>
              Welcome back, <span className="serif gradient-text">{profile?.full_name || user.email.split('@')[0]}</span>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Level 1 unlocked</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginTop: "16px" }}>
            <button 
              onClick={() => setActiveTab('overview')} 
              style={{ background: activeTab === 'overview' ? "var(--color-surface-raised)" : "transparent", color: activeTab === 'overview' ? "var(--color-ink)" : "var(--color-ink-muted)", border: "1px solid var(--color-border)", padding: "10px 20px", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "all 0.2s" }}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              style={{ background: activeTab === 'settings' ? "var(--color-surface-raised)" : "transparent", color: activeTab === 'settings' ? "var(--color-ink)" : "var(--color-ink-muted)", border: "1px solid var(--color-border)", padding: "10px 20px", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "all 0.2s" }}
            >
              Settings
            </button>
            <button onClick={handleLogout} style={{ background: "transparent", color: "var(--color-ink-muted)", border: "1px solid transparent", padding: "10px", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "all 0.2s" }} onMouseOver={(e) => {e.target.style.color = "#ef4444"}} onMouseOut={(e) => {e.target.style.color = "var(--color-ink-muted)"}}>
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* === MAIN CONTENT === */}
        {activeTab === 'overview' ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))", gap: "32px", alignItems: "start" }}>
          
          {/* LEFT: THE GOAL STACK */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 600, display: "flex", gap: "12px", alignItems: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                The Goal Stack
                <span style={{ fontSize: "14px", fontWeight: "normal", color: "var(--color-ink-muted)" }}>
                  ({goals.length}{profile?.tier === 'free' ? ' / 3' : ''})
                </span>
              </h2>
              
              {!showGoalForm && (
                <button 
                  onClick={() => checkCanCreate() ? setShowGoalForm(true) : alert("Free limit reached! Upgrade to Pro coming soon.")}
                  style={{ background: "#22c55e", color: "#000", border: "none", padding: "8px 16px", borderRadius: "100px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}
                >
                  + New Goal
                </button>
              )}
            </div>

            {/* UPGRADE LOCK FOR FREE USERS AT 3 GOALS */}
            {profile?.tier === 'free' && goals.length >= 3 && !showGoalForm && (
              <div className="dash-card-padding" style={{ background: "rgba(34,197,94,0.05)", border: "1px dashed #22c55e", padding: "24px", borderRadius: "var(--radius-card)", textAlign: "center", marginBottom: "24px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px", display: "inline-block" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <h4 style={{ margin: "0 0 8px 0" }}>Max Goals Reached</h4>
                <p style={{ fontSize: "14px", color: "var(--color-ink-soft)", margin: "0 0 16px 0" }}>Focus on your current 3 goals, or upgrade to add an infinite stack.</p>
                <Link to="/pricing" style={{ background: "var(--color-ink)", color: "var(--color-surface)", padding: "8px 24px", borderRadius: "40px", fontSize: "13px", fontWeight: 700, textDecoration: "none", display: "inline-block" }}>Upgrade to Pro →</Link>
              </div>
            )}

            {/* CREATE GOAL FORM */}
            {showGoalForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="dash-card-padding" style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "var(--radius-card)", marginBottom: "32px", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "18px", margin: 0 }}>Define your mission</h3>
                  <button onClick={() => setShowGoalForm(false)} style={{ background: "none", border: "none", color: "var(--color-ink-muted)", cursor: "pointer", fontSize: "20px", padding: 0, lineHeight: 1 }}>&times;</button>
                </div>
                
                {formError && <div style={{ color: "#ef4444", fontSize: "13px", padding: "10px", background: "rgba(239,68,68,0.1)", borderRadius: "8px", marginBottom: "16px" }}>{formError}</div>}
                
                <form onSubmit={handleCreateGoal}>
                  <div className="auth-form__field" style={{ marginBottom: "16px" }}>
                    <label className="auth-form__label">Goal Title *</label>
                    <input className="auth-form__input" type="text" placeholder="e.g. Master React Native" required value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} />
                  </div>
                  <div className="auth-form__field" style={{ marginBottom: "16px" }}>
                    <label className="auth-form__label">The "Why" *</label>
                    <textarea className="auth-form__input auth-form__textarea" rows="2" placeholder="Why does this matter to you?" required value={newGoal.why_statement} onChange={(e) => setNewGoal({...newGoal, why_statement: e.target.value})}></textarea>
                  </div>
                  <div className="auth-form__field" style={{ marginBottom: "24px" }}>
                    <label className="auth-form__label">Deadline (Optional)</label>
                    <input className="auth-form__input" type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} />
                  </div>
                  <button type="submit" className="auth-form__submit" disabled={formLoading} style={{ padding: "12px", width: "100%" }}>
                    {formLoading ? "Saving..." : "Lock it in"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* GOALS LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {goals.length === 0 && !showGoalForm ? (
                <div style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-card)", background: "rgba(255,255,255,0.01)" }}>
                  <p style={{ color: "var(--color-ink-soft)", margin: 0 }}>Your stack is empty. Create your first goal to begin your journey.</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <div key={goal.id} className="goal-card dash-card-padding" style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "16px", transition: "transform 0.2s, box-shadow 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>{goal.title}</h3>
                      {goal.deadline && (
                        <span style={{ fontSize: "12px", color: "var(--color-ink-muted)", border: "1px solid var(--color-border)", padding: "2px 8px", borderRadius: "4px" }}>
                          Due {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p style={{ color: "var(--color-ink-soft)", fontSize: "14px", lineHeight: 1.5, margin: "0 0 16px 0", fontStyle: "italic" }}>
                      "{goal.why_statement}"
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ height: "4px", flex: 1, background: "rgba(34,197,94,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${getGoalProgress(goal.id)}%`, background: "#22c55e", transition: "width 1s ease-out" }}></div>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--color-ink-muted)", marginTop: "8px", margin: 0, textAlign: "right" }}>{getGoalHours(goal.id)} hours logged</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* RIGHT SIDE: TIMER & HEATMAP PLACEHOLDERS */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Deep Work Logger */}
            <div className="dash-card-padding" style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "var(--radius-card)", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--gradient-dark-cta)" }}></div>
              <h3 style={{ fontSize: "20px", marginBottom: "16px", color: "var(--color-ink)" }}>Deep Work Logger</h3>
              
              <div style={{ marginBottom: "24px" }}>
                <select 
                  className="auth-form__input" 
                  style={{ textAlign: "center", cursor: "pointer" }}
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  disabled={timerActive}
                >
                  <option value="" disabled>-- Link to a Goal --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div className="timer-typography" style={{ fontFamily: "monospace", fontSize: "48px", fontWeight: 700, margin: "24px 0", color: timerActive ? "#22c55e" : "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>
                {formatTime(secondsElapsed)}
              </div>

              {!timerActive ? (
                <button 
                  onClick={handleStartTimer}
                  style={{ background: "var(--gradient-dark-cta)", color: "#fff", border: "none", padding: "14px 32px", borderRadius: "100px", fontSize: "15px", fontWeight: 600, cursor: "pointer", width: "100%", boxShadow: "var(--shadow-button)", transition: "all 0.2s" }}
                >
                  Start Deep Work
                </button>
              ) : (
                <button 
                  onClick={handleStopTimer}
                  style={{ background: "#ef4444", color: "#fff", border: "none", padding: "14px 32px", borderRadius: "100px", fontSize: "15px", fontWeight: 600, cursor: "pointer", width: "100%", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)", transition: "all 0.2s" }}
                >
                  Stop & Log Time
                </button>
              )}
            </div>

            {/* Streak Heatmap Component */}
            <div className="dash-card-padding" style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "var(--radius-card)" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-ink-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v6h6"/></svg>
                Consistency Heatmap
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "4px" }}>
                {renderHeatmap()}
              </div>
              <p style={{ fontSize: "12px", color: "var(--color-ink-muted)", marginTop: "16px", textAlign: "right", fontStyle: "italic" }}>Last 60 days of consistency</p>
            </div>

          </motion.div>
        </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
            <h2 style={{ fontSize: "28px", marginBottom: "32px" }}>Account Settings</h2>
            
            <div className="dash-card-padding" style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "var(--radius-card)", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>Profile Information</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="auth-form__field" style={{ marginBottom: "16px" }}>
                  <label className="auth-form__label">Full Name</label>
                  <input className="auth-form__input" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="auth-form__field" style={{ marginBottom: "24px" }}>
                  <label className="auth-form__label">Email Address</label>
                  <input className="auth-form__input" type="email" value={user.email} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
                  <p style={{ fontSize: "12px", color: "var(--color-ink-muted)", marginTop: "8px" }}>Email address cannot be changed currently.</p>
                </div>
                <button type="submit" className="auth-form__submit" disabled={settingsLoading}>
                  {settingsLoading ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>

            <div className="dash-card-padding" style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "var(--radius-card)", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>Security</h3>
              <form onSubmit={handleUpdatePassword}>
                <div className="auth-form__field" style={{ marginBottom: "24px" }}>
                  <label className="auth-form__label">New Password</label>
                  <input className="auth-form__input" type="password" placeholder="At least 6 characters" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} required />
                </div>
                <button type="submit" className="auth-form__submit" disabled={settingsLoading}>
                  {settingsLoading ? "Saving..." : "Update Password"}
                </button>
              </form>
            </div>

            <div className="dash-card-padding" style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "var(--radius-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
                <h3 style={{ fontSize: "18px", margin: 0 }}>Billing & Subscription</h3>
                <span style={{ fontSize: "12px", fontWeight: 800, background: profile?.tier === 'free' ? "var(--color-surface-raised)" : "var(--gradient-dark-cta)", color: profile?.tier === 'free' ? "var(--color-ink-muted)" : "#fff", padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px", border: profile?.tier === 'free' ? "1px solid var(--color-border)" : "none" }}>
                  {profile?.tier || 'Free'} Plan
                </span>
              </div>
              <p style={{ color: "var(--color-ink-soft)", marginBottom: "24px", fontSize: "14px" }}>
                {profile?.tier === 'free' ? "You are currently on the free plan. Upgrade to unlock unlimited goals and advanced tracking." : "You have full access to all premium features."}
              </p>
              {profile?.tier === 'free' && (
                <Link to="/pricing" style={{ background: "var(--color-ink)", color: "var(--color-surface)", padding: "10px 24px", borderRadius: "100px", fontSize: "14px", fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
                  Upgrade to Pro →
                </Link>
              )}
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
