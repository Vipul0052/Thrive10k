import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Trash2, Edit2, Play, Square, X, Map as MapIcon, Compass, Trophy, Share2, Camera, CheckCircle2, Circle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { QRCodeSVG } from 'qrcode.react';


import Sidebar from "../components/Sidebar";

const getLevel = (totalHours) => {
  if (totalHours < 10) return { name: "Novice", icon: "🌱", color: "#22c55e", desc: "Top 90%" };
  if (totalHours < 50) return { name: "Apprentice", icon: "⭐", color: "#3b82f6", desc: "Top 50%" };
  if (totalHours < 100) return { name: "Scholar", icon: "🔮", color: "#8b5cf6", desc: "Top 20%" };
  if (totalHours < 500) return { name: "Adept", icon: "🔥", color: "#f59e0b", desc: "Top 5%" };
  if (totalHours < 1000) return { name: "Master", icon: "👑", color: "#ef4444", desc: "Top 1%" };
  return { name: "Legend", icon: "🏆", color: "#fbbf24", desc: "Top 0.1%" };
};

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
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]); // Today's Plan / Subgoals
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [streak, setStreak] = useState(23); // Real-time streak



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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [profileUpdateMsg, setProfileUpdateMsg] = useState({ text: "", type: "" });
  const [avatarUpdateMsg, setAvatarUpdateMsg] = useState({ text: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  // Error & Action States
  const [timerError, setTimerError] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editGoalTitle, setEditGoalTitle] = useState("");
  const [editGoalWhy, setEditGoalWhy] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showLimitCard, setShowLimitCard] = useState(false);
  
  // Level Up State
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  const currentTotalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const currentTotalHours = currentTotalMinutes / 60;
  const currentLevel = getLevel(currentTotalHours);

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
      
      const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', currentUser.id);
      if (active && tasksData) setTasks(tasksData);

      const { data: leaderboardData } = await supabase.from('profiles').select('full_name, total_hours, avatar_url').order('total_hours', { ascending: false }).limit(10);
      if (active && leaderboardData) setLeaderboard(leaderboardData);
      
      // Calculate real streak
      if (sessionsData) {
        const sortedSessions = [...sessionsData].sort((a,b) => new Date(b.start_time) - new Date(a.start_time));
        let currentStreak = 0;
        let lastDate = null;
        for (const s of sortedSessions) {
          const d = new Date(s.start_time).toDateString();
          if (d !== lastDate) {
             currentStreak++;
             lastDate = d;
          }
        }
        setStreak(currentStreak);
      }

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
    if (!selectedGoalId) { 
      setTimerError("Please select a goal below before starting a session.");
      setTimeout(() => setTimerError(""), 3000);
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
      setTimerError("Session was too short to log. Minimum 1 minute required.");
      setTimeout(() => setTimerError(""), 3000);
      setSecondsElapsed(0); return;
    }

    const { data, error } = await supabase.from('sessions').insert([{
      user_id: user.id, goal_id: selectedGoalId, category: 'deep work',
      duration_minutes: durationMinutes, start_time: sessionStartTime, end_time: endTime
    }]).select();

    if (error) { 
      setTimerError("Could not save session: " + error.message);
      setTimeout(() => setTimerError(""), 3000);
    }
    else if (data) { 
      setSessions([...sessions, data[0]]); 
      setSecondsElapsed(0); 
      setSessionStartTime(null); 
      
      const newTotalMinutes = currentTotalMinutes + durationMinutes;
      const newLevel = getLevel(newTotalMinutes / 60);
      if (newLevel.name !== currentLevel.name) {
        setLevelUpData(newLevel);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 6000);
      }
    }
  };

  const handleCreateTask = async (title, goalId = null) => {
    if (!title) return;
    const { data, error } = await supabase.from('tasks').insert([{
      user_id: user.id, title, goal_id: goalId, status: 'pending'
    }]).select();
    if (!error && data) setTasks([...tasks, data[0]]);
  };

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (!error) setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
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

  const handleSaveEdit = async (id) => {
    const { error } = await supabase.from('goals').update({ title: editGoalTitle, why_statement: editGoalWhy }).eq('id', id);
    if (!error) {
      setGoals(goals.map(g => g.id === id ? { ...g, title: editGoalTitle, why_statement: editGoalWhy } : g));
      setEditingGoalId(null);
    }
  };

  const handleConfirmDelete = async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) {
      setGoals(goals.filter(g => g.id !== id));
      if (selectedGoalId === id) setSelectedGoalId("");
      setConfirmDeleteId(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); 
    if (!editName.trim()) return;
    setSettingsLoading(true);
    const { error } = await supabase.from('profiles').update({ full_name: editName }).eq('id', user.id);
    if (!error) {
      const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditName(updatedProfile.full_name || "");
        setProfileUpdateMsg({ text: "Profile updated successfully", type: "success" });
        setTimeout(() => setProfileUpdateMsg({ text: "", type: "" }), 5000);
      }
    } else {
      setProfileUpdateMsg({ text: error.message, type: "error" });
      setTimeout(() => setProfileUpdateMsg({ text: "", type: "" }), 5000);
    }
    setSettingsLoading(false);
  };



  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSettingsLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from('Avatars').upload(filePath, file);
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('Avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (!updateError) {
        setProfile({ ...profile, avatar_url: publicUrl });
        setAvatarUpdateMsg({ text: "Profile picture updated", type: "success" });
        setTimeout(() => setAvatarUpdateMsg({ text: "", type: "" }), 5000);
      }
    } else {
      setAvatarUpdateMsg({ text: uploadError.message, type: "error" });
      setTimeout(() => setAvatarUpdateMsg({ text: "", type: "" }), 5000);
    }
    setSettingsLoading(false);
  };





  const handleUpdatePassword = async (e) => {
    e.preventDefault(); 
    setSettingsLoading(true);
    setPasswordError(""); setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      setSettingsLoading(false); return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      setSettingsLoading(false); return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
       email: user.email,
       password: currentPassword
    });

    if (verifyError) {
       setPasswordError("Incorrect current password.");
       setSettingsLoading(false); return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPasswordError(error.message);
    else { 
      setPasswordSuccess("Password safely updated."); 
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); 
    }
    setSettingsLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogout} goals={goals} profile={profile} streak={streak} />

      <div className="dash-padding" style={{ minHeight: "100vh", paddingBottom: "100px" }}>
        <style>{`
          .dash-padding { margin-left: 240px; padding-top: 100px; }
          .dash-header-mobile { display: none; }
          @media (max-width: 768px) {
            .dash-padding { margin-left: 0; padding-top: 0; }
            .dash-header-mobile { 
              display: flex; 
              align-items: center; 
              justify-content: space-between; 
              padding: 16px 20px; 
              border-bottom: 1px solid var(--color-border); 
              margin-bottom: 32px; 
              background: #fff; 
              position: sticky; 
              top: 0; 
              z-index: 10; 
            }
            .container { padding: 0 16px !important; }
            .dash-tabs { width: 100%; justify-content: space-between; margin-top: 24px !important; }
            .dash-tabs button { flex: 1; text-align: center; padding: 12px 0 !important; }
          }
        `}</style>
        
        <div className="dash-header-mobile">
          <Link to="/dashboard" style={{ display: "flex", alignItems: "flex-start", textDecoration: "none", color: "var(--color-ink)" }}>
            <span className="serif" style={{ fontSize: "20px", lineHeight: 1 }}>thrive</span>
            <span style={{ fontSize: "10px", fontWeight: "bold", marginLeft: "2px", lineHeight: 1 }}>10K</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(true)} style={{ color: "var(--color-ink)" }}>
            <Menu size={24} />
          </button>
        </div>


        <div className="container">
        
        {location.pathname === '/dashboard' || location.pathname === '/dashboard/' ? (
          <>
            {/* === HEADER === */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", borderBottom: "1px solid var(--color-border)", paddingBottom: "24px", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <h1 className="page-hero__heading" style={{ fontSize: "36px", margin: 0 }}>
                  Welcome back, <span className="serif gradient-text">{profile?.full_name || user.email.split('@')[0]}</span>
                </h1>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.03)", padding: "6px 12px", borderRadius: "100px", marginTop: "12px", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "16px" }}>{currentLevel.icon}</span>
                  <span style={{ fontSize: "14px", color: "var(--color-ink)", fontWeight: 700 }}>{currentLevel.name}</span>
                  <span style={{ fontSize: "12px", color: "var(--color-ink-muted)", fontWeight: 500, marginLeft: "4px" }}>({currentTotalHours.toFixed(1)} hrs total)</span>
                </div>
              </div>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
          
          {/* THE STACK */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 600, display: "flex", gap: "10px", alignItems: "center" }}>The Goal Stack</h2>
              {!showGoalForm && (
                <button 
                  onClick={() => {
                    if (goals.length >= 3 && profile?.tier === 'free') setShowLimitCard(true);
                    else setShowGoalForm(true);
                  }} 
                  style={{ background: "#22c55e", color: "#000", border: "none", padding: "8px 16px", borderRadius: "100px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}
                >
                  + New Goal
                </button>
              )}
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
              {showLimitCard && (
                <div style={{ background: "rgba(34,197,94,0.05)", border: "1px dashed #22c55e", padding: "32px", borderRadius: "24px", textAlign: "center", position: "relative" }}>
                  <button onClick={() => setShowLimitCard(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--color-ink-muted)", cursor: "pointer" }}><X size={16} /></button>
                  <h3 style={{ color: "#16a34a", fontSize: "18px", marginBottom: "8px", fontWeight: 700 }}>Unlock Unlimited Goals</h3>
                  <p style={{ color: "var(--color-ink-soft)", fontSize: "14px", marginBottom: "20px" }}>You've reached the free limit of 3 core goals. Upgrade to PRO to add more goals and track limitless ambitions!</p>
                  <button onClick={() => navigate('/pricing')} style={{ background: "#22c55e", color: "#000", border: "none", padding: "12px 28px", borderRadius: "100px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}>Upgrade to PRO</button>
                </div>
              )}

              {goals.map(g => (
                <div key={g.id} style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "20px" }}>
                  <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", fontWeight: 700 }}>{g.title}</h3>
                  <p style={{ color: "var(--color-ink-soft)", fontSize: "14px", margin: "0 0 16px 0", lineHeight: 1.5 }}>"{g.why_statement}"</p>
                  <div style={{ height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${getGoalProgress(g.id)}%`, background: "#22c55e", transition: "width 0.5s ease" }} />
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--color-ink-muted)", marginTop: "8px", textAlign: "right" }}>{getGoalHours(g.id)}h logged</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* LOGGER & HEATMAP */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px", textAlign: "center", marginBottom: "32px" }}>
              {timerError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "#fee2e2", color: "#ef4444", padding: "12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "24px", border: "1px dashed #fca5a5" }}>
                  {timerError}
                </motion.div>
              )}
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px", maxWidth: "100%" }}>
                {goals.map(g => (
                  <button 
                    key={g.id} 
                    onClick={() => { if (!timerActive) { setSelectedGoalId(g.id); setTimerError(""); } }} 
                    style={{ 
                      flex: "0 0 auto", 
                      padding: "8px 16px", 
                      borderRadius: "100px", 
                      fontSize: "13px", 
                      fontWeight: 600, 
                      border: selectedGoalId === g.id ? "1px solid var(--color-ink)" : "1px solid var(--color-border)", 
                      background: selectedGoalId === g.id ? "var(--color-ink)" : "var(--color-surface)", 
                      color: selectedGoalId === g.id ? "#fff" : "var(--color-ink-soft)", 
                      cursor: timerActive ? "not-allowed" : "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {g.title}
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "56px", fontWeight: 700, margin: "24px 0", color: timerActive ? "#22c55e" : "var(--color-ink)" }}>{formatTime(secondsElapsed)}</div>
              <button onClick={timerActive ? handleStopTimer : handleStartTimer} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", background: timerActive ? "#ef4444" : "var(--color-ink)", color: "#fff", border: "none", padding: "16px", borderRadius: "100px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                {timerActive ? <><Square size={16}/> End Session</> : <><Play size={16}/> Start Deep Work</>}
              </button>
            </div>

            <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: "20px" }}>Consistency Heatmap</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "4px" }}>{renderHeatmap()}</div>
              <p style={{ fontSize: "11px", color: "var(--color-ink-muted)", marginTop: "16px", textAlign: "right" }}>Last 60 days of output</p>
            </div>
          </motion.div>

        </div>
          </>
        ) : location.pathname.startsWith('/dashboard/goals/') ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: "600px", margin: "0 auto" }}>
            {(() => {
              const gid = location.pathname.split('/').pop();
              const g = goals.find(x => x.id === gid);
              if (!g) return <div style={{ textAlign: "center", padding: "40px" }}><h2 style={{ fontSize: "20px" }}>Goal not found</h2></div>;
              
              return (
                <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px", marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "22px", marginBottom: "24px", fontWeight: 700 }}>Goal Settings</h3>
                  {editingGoalId === g.id ? (
                    <div style={{ marginBottom: "16px" }}>
                      <label className="auth-form__label">Goal Title</label>
                      <input className="auth-form__input" value={editGoalTitle} onChange={e=>setEditGoalTitle(e.target.value)} style={{ marginBottom: "16px" }} />
                      <label className="auth-form__label">The Why</label>
                      <textarea className="auth-form__input" rows="2" value={editGoalWhy} onChange={e=>setEditGoalWhy(e.target.value)} style={{ marginBottom: "20px" }} />
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => handleSaveEdit(g.id)} style={{ background: "var(--color-ink)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "100px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Save</button>
                        <button onClick={() => setEditingGoalId(null)} style={{ background: "transparent", color: "var(--color-ink-muted)", border: "none", padding: "10px 24px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "24px", margin: 0, fontWeight: 700 }}>{g.title}</h3>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button onClick={() => { setEditingGoalId(g.id); setEditGoalTitle(g.title); setEditGoalWhy(g.why_statement); setConfirmDeleteId(null); }} style={{ background: "none", border: "none", color: "var(--color-ink-muted)", cursor: "pointer" }}><Edit2 size={16} /></button>
                          <button onClick={() => { setConfirmDeleteId(g.id); setEditingGoalId(null); }} style={{ background: "none", border: "none", color: "var(--color-ink-muted)", cursor: "pointer" }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <p style={{ color: "var(--color-ink-soft)", fontSize: "15px", margin: "0 0 32px 0", lineHeight: 1.5 }}>"{g.why_statement}"</p>
                    </>
                  )}

                  {confirmDeleteId === g.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ background: "#fee2e2", border: "1px dashed #ef4444", padding: "24px", borderRadius: "12px", marginBottom: "24px" }}>
                      <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: 600, marginBottom: "16px", marginTop: 0 }}>Delete this goal forever? This will not delete your logged sessions, but the goal will be gone entirely.</p>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => { handleConfirmDelete(g.id); navigate('/dashboard'); }} style={{ background: "#ef4444", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Yes, Remove</button>
                        <button onClick={() => setConfirmDeleteId(null)} style={{ background: "transparent", color: "#ef4444", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                      </div>
                    </motion.div>
                  )}

                  <div style={{ background: "rgba(0,0,0,0.02)", padding: "20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <span style={{ fontSize: "14px", color: "var(--color-ink-soft)", fontWeight: 600 }}>Total Hours Logged</span>
                     <span style={{ fontSize: "28px", color: "var(--color-ink)", fontWeight: 800 }}>{getGoalHours(g.id)}h</span>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        ) : location.pathname === '/dashboard/settings' ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "24px", fontWeight: 700 }}>Profile Detail</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
                 <div style={{ position: "relative" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "var(--gradient-dark-cta)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                       {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontSize: "24px", fontWeight: 800 }}>{profile?.full_name?.charAt(0)}</span>}
                    </div>
                    <label style={{ position: "absolute", bottom: "-8px", right: "-8px", background: "#fff", border: "1px solid var(--color-border)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                       <Camera size={16} />
                       <input type="file" hidden onChange={handleAvatarUpload} accept="image/*" />
                    </label>
                 </div>
                 <div>
                    <div style={{ fontWeight: 700, fontSize: "18px" }}>{profile?.full_name}</div>
                    <div style={{ fontSize: "13px", color: "var(--color-ink-muted)" }}>{user?.email}</div>
                 </div>
              </div>
              <form onSubmit={handleUpdateProfile}>
                {profileUpdateMsg.text && (
                  <div style={{ padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", fontSize: "13px", fontWeight: 600, background: profileUpdateMsg.type === 'success' ? "#f0fdf4" : "rgba(239,68,68,0.08)", color: profileUpdateMsg.type === 'success' ? "#16a34a" : "#ef4444", border: profileUpdateMsg.type === 'success' ? "1px solid rgba(22,163,74,0.2)" : "1px solid rgba(239,68,68,0.2)" }}>
                     {profileUpdateMsg.type === 'success' ? "✓ " : "✕ "}{profileUpdateMsg.text}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                   <label className="auth-form__label" style={{ margin: 0 }}>Display Name</label>
                   <div style={{ fontSize: "11px", fontWeight: 800, color: profile?.tier === 'free' ? "var(--color-ink-muted)" : "#10b981", background: profile?.tier === 'free' ? "rgba(0,0,0,0.05)" : "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
                      {profile?.tier === 'free' ? "FREE PLAN" : "PRO PLAN"}
                   </div>
                </div>
                <input className="auth-form__input" placeholder="Your full name" value={editName} onChange={e=>setEditName(e.target.value)} required style={{ marginBottom: "20px" }} />
                <button type="submit" className="auth-form__submit" disabled={settingsLoading}>Save Profile</button>
              </form>
              {profile?.tier === 'free' && (
                <button type="button" onClick={() => navigate('/pricing')} style={{ width: "100%", marginTop: "12px", background: "#f0fdf4", border: "1px dashed #10b981", color: "#10b981", padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                  Upgrade to Pro for Unlimited Goals →
                </button>
              )}


            </div>

            <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "24px" }}>Passcode</h3>
              <form onSubmit={handleUpdatePassword}>
                {passwordError && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "16px", fontWeight: 600 }}>{passwordError}</div>}
                {passwordSuccess && <div style={{ color: "#22c55e", fontSize: "13px", marginBottom: "16px", fontWeight: 600 }}>{passwordSuccess}</div>}
                <label className="auth-form__label" style={{ display: "block", marginBottom: "8px" }}>Current Password</label>
                <input className="auth-form__input" type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required style={{ marginBottom: "16px", width: "100%" }} />
                <label className="auth-form__label" style={{ display: "block", marginBottom: "8px" }}>New Password</label>
                <input className="auth-form__input" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required style={{ marginBottom: "16px", width: "100%" }} />
                <label className="auth-form__label" style={{ display: "block", marginBottom: "8px" }}>Confirm New Password</label>
                <input className="auth-form__input" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required style={{ marginBottom: "24px", width: "100%" }} />
                <button type="submit" className="auth-form__submit" disabled={settingsLoading}>Update Securely</button>
              </form>
            </div>
            <div style={{ background: "#fffafb", border: "1px solid #fecaca", padding: "32px", borderRadius: "24px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "#ef4444" }}>Security</h3>
              <p style={{ fontSize: "14px", color: "var(--color-ink-soft)", marginBottom: "24px" }}>Sign out of your account on this device securely.</p>
              <button onClick={handleLogout} style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "12px 24px", borderRadius: "100px", fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
            </div>
          </motion.div>
        ) : location.pathname === '/dashboard/log-hours' ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px" }}>Work Logs</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sessions.sort((a,b) => new Date(b.start_time) - new Date(a.start_time)).map(s => {
                const goal = goals.find(g => g.id === s.goal_id);
                return (
                  <div key={s.id} style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "16px 24px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700 }}>{goal?.title || "Untethered Session"}</div>
                      <div style={{ fontSize: "12px", color: "var(--color-ink-muted)" }}>{new Date(s.start_time).toLocaleDateString()} at {new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#22c55e" }}>+{s.duration_minutes}m</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : location.pathname === '/dashboard/plan' ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: "700px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Today's Plan</h2>
            <p style={{ color: "var(--color-ink-soft)", marginBottom: "32px" }}>Break your big goals into small, actionable subgoals.</p>
            
            <div style={{ marginBottom: "40px" }}>
              <input 
                className="auth-form__input" 
                placeholder="What's the next step? (Press Enter)" 
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') { handleCreateTask(e.target.value); e.target.value = ''; } 
                }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Categorized by Goal */}
              {goals.map(g => {
                const goalTasks = tasks.filter(t => t.goal_id === g.id);
                return (
                  <div key={g.id} style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "24px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--color-ink)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                       <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "var(--color-ink)" }} /> {g.title}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                       {goalTasks.map(t => (
                         <div key={t.id} onClick={() => toggleTask(t.id, t.status)} style={{ padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", transition: "all 0.2s", background: t.status === 'completed' ? "transparent" : "rgba(0,0,0,0.02)" }}>
                            {t.status === 'completed' ? <CheckCircle2 size={18} color="#22c55e" /> : <Circle size={18} color="var(--color-border-strong)" />}
                            <span style={{ fontSize: "15px", textDecoration: t.status === 'completed' ? "line-through" : "none", color: t.status === 'completed' ? "var(--color-ink-muted)" : "var(--color-ink)", fontWeight: 500 }}>{t.title}</span>
                         </div>
                       ))}
                       <input 
                          style={{ background: "none", border: "none", borderBottom: "1px dashed var(--color-border)", padding: "12px", fontSize: "14px", outline: "none", color: "var(--color-ink-soft)", marginTop: "8px" }}
                          placeholder={`+ Add next action...`}
                          onKeyDown={(e) => { if (e.key === 'Enter') { handleCreateTask(e.target.value, g.id); e.target.value = ''; } }}
                       />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : location.pathname === '/dashboard/calendar' ? (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px" }}>Output Calendar</h2>
            <div className="calendar-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "32px" }}>
               <div style={{ background: "#fff", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "32px", overflow: "hidden" }}>
                  <Calendar 
                    onChange={setSelectedDate} 
                    value={selectedDate}
                    tileContent={({ date }) => {
                       const dStr = date.toISOString().split('T')[0];
                       const dayMins = sessions.filter(s => s.start_time?.startsWith(dStr)).reduce((acc, s) => acc + s.duration_minutes, 0);
                       return dayMins > 0 ? <div style={{ height: "4px", width: "4px", background: "#22c55e", borderRadius: "50%", margin: "2px auto" }} /> : null;
                    }}
                  />
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "24px" }}>
                     <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>{selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h4>
                     <p style={{ fontSize: "12px", color: "var(--color-ink-muted)", marginBottom: "16px" }}>Activity Summary</p>
                     <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {(() => {
                           const dStr = selectedDate.toISOString().split('T')[0];
                           const daySessions = sessions.filter(s => s.start_time?.startsWith(dStr));
                           if (daySessions.length === 0) return <p style={{ fontSize: "13px", opacity: 0.5 }}>No sessions recorded.</p>;
                           return daySessions.map((s, i) => (
                             <div key={i} style={{ marginBottom: "12px", paddingLeft: "12px", borderLeft: "2px solid var(--color-ink)" }}>
                                <div style={{ fontWeight: 600, fontSize: "14px" }}>{goals.find(g => g.id === s.goal_id)?.title}</div>
                                <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>+{s.duration_minutes} mins</div>
                             </div>
                           ));
                        })()}
                     </div>
                  </div>
               </div>
            </div>
            <style>{`
               @media (max-width: 900px) {
                  .calendar-grid { grid-template-columns: 1fr !important; }
               }
               .react-calendar { width: 100%; border: none; font-family: inherit; }
               .react-calendar__navigation button { font-size: 16px; font-weight: 700; color: var(--color-ink); }
               .react-calendar__month-view__weekdays { font-weight: 800; text-transform: uppercase; font-size: 11px; opacity: 0.5; }
               .react-calendar__tile { height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; }
               .react-calendar__tile--active { background: var(--color-ink) !important; color: #fff; }
               .react-calendar__tile:hover { background: rgba(0,0,0,0.05); }
            `}</style>
          </motion.div>


        ) : location.pathname === '/dashboard/milestones' ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px" }}>The 10,000 Hour Milestones</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              {[10, 50, 100, 500, 1000, 5000, 10000].map(h => {
                const unlocked = currentTotalHours >= h;
                return (
                  <div key={h} style={{ opacity: unlocked ? 1 : 0.4, background: unlocked ? "var(--gradient-dark-cta)" : "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px", color: unlocked ? "#fff" : "var(--color-ink)" }}>
                    <div style={{ fontSize: "24px", marginBottom: "12px" }}>{unlocked ? "💎" : "🔒"}</div>
                    <div style={{ fontSize: "13px", textTransform: "uppercase", fontWeight: 800 }}>{h} Hours</div>
                    <div style={{ fontSize: "18px", fontWeight: 700 }}>{unlocked ? "Mastered" : "LOCKED"}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : location.pathname === '/dashboard/map' ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: "center", maxWidth: "1000px", margin: "0 auto" }}>
             <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "40px" }}>The 10,000 Hour Roadmap</h2>
             <div style={{ background: "var(--color-ink)", padding: "60px", borderRadius: "40px", color: "#fff", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.1, background: "radial-gradient(circle at 20% 30%, #fff 0%, transparent 50%)" }}></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "60px", position: "relative", zIndex: 1 }}>
                   {[
                     { h: 100, label: "Foundational mastery", icon: "🌱" },
                     { h: 1000, label: "Professional competence", icon: "🚀" },
                     { h: 2500, label: "Specialist excellence", icon: "💎" },
                     { h: 5000, label: "World-class expert", icon: "🌌" },
                     { h: 10000, label: "Mastery Ascended", icon: "☀️" }
                   ].map((stage, idx) => {
                     const isReached = currentTotalHours >= stage.h;
                     return (
                       <div key={idx} style={{ display: "flex", alignItems: "center", gap: "32px", textAlign: "left", opacity: isReached ? 1 : 0.3 }}>
                          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: isReached ? "var(--gradient-dark-cta)" : "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", position: "relative" }}>
                             {stage.icon}
                             {idx < 4 && <div style={{ position: "absolute", bottom: "-60px", left: "50%", width: "2px", height: "60px", background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }}></div>}
                          </div>
                          <div>
                             <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{stage.h.toLocaleString()} HOURS</div>
                             <div style={{ fontSize: "20px", fontWeight: 800 }}>{stage.label}</div>
                             {isReached && <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700, marginTop: "4px" }}>✓ COMPLETED</div>}
                          </div>
                       </div>
                     );
                   })}
                </div>
                <div style={{ marginTop: "60px", padding: "32px", background: "rgba(255,255,255,0.05)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)" }}>
                   <div style={{ fontSize: "14px", opacity: 0.6, marginBottom: "8px" }}>YOUR CURRENT POSITION</div>
                   <div style={{ fontSize: "32px", fontWeight: 900 }}>{currentTotalHours.toFixed(1)} / 10,000 hrs</div>
                   <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginTop: "20px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min((currentTotalHours / 10000) * 100, 100)}%`, background: "#fff" }}></div>
                   </div>
                </div>
             </div>
          </motion.div>
        ) : location.pathname === '/dashboard/insights' ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
             <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px" }}>Deep Insights</h2>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                <div style={{ background: "#fff", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px", minHeight: "400px" }}>
                   <h3 style={{ fontSize: "18px", marginBottom: "24px", fontWeight: 700 }}>Velocity (Last 7 Days)</h3>
                   <div style={{ width: "100%", height: "300px" }}>
                      <ResponsiveContainer>
                         <AreaChart data={Array.from({length: 7}).map((_, i) => {
                            const d = new Date(); d.setDate(d.getDate() - (6 - i));
                            const dateStr = d.toISOString().split('T')[0];
                            const dayMins = sessions.filter(s => s.start_time?.startsWith(dateStr)).reduce((acc, s) => acc + s.duration_minutes, 0);
                            return { name: d.toLocaleDateString([], {weekday: 'short'}), hours: (dayMins / 60).toFixed(1) };
                         })}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="name" stroke="var(--color-ink-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--color-ink-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="hours" stroke="#000" fill="rgba(0,0,0,0.04)" strokeWidth={3} dot={{ r: 4, fill: "#000" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div style={{ background: "#fff", border: "1px solid var(--color-border)", padding: "32px", borderRadius: "24px", minHeight: "400px" }}>
                   <h3 style={{ fontSize: "18px", marginBottom: "24px", fontWeight: 700 }}>Goal Focus</h3>
                   <div style={{ width: "100%", height: "300px" }}>
                      <ResponsiveContainer>
                         <PieChart>
                            <Pie 
                               data={goals.map(g => ({ name: g.title, value: parseFloat(getGoalHours(g.id)) })).filter(x => x.value > 0)} 
                               innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none"
                            >
                               {goals.map((_, index) => (
                                 <Cell key={`cell-${index}`} fill={['#000', '#10b981', '#6366f1', '#f59e0b'][index % 4]} />
                               ))}
                            </Pie>
                            <Tooltip />
                         </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
                      {goals.map((g, i) => (
                        <div key={g.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--color-ink)" }}>
                           <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: ['#000', '#10b981', '#6366f1', '#f59e0b'][i % 4] }} />
                           {g.title}
                        </div>
                      ))}
                   </div>
                </div>
             </div>

          </motion.div>

) : location.pathname === '/dashboard/leaderboard' ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: "600px", margin: "0 auto" }}>
             <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Top Humans</h2>
             <p style={{ color: "var(--color-ink-soft)", marginBottom: "32px" }}>The highest outputs in the global network.</p>
             <div style={{ background: "var(--color-surface-raised)", borderRadius: "24px", overflow: "hidden", border: "1px solid var(--color-border)" }}>
                {leaderboard.map((u, i) => (
                  <div key={i} style={{ padding: "24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: u.full_name === profile?.full_name ? "rgba(34,197,94,0.05)" : "transparent" }}>
                     <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, color: i < 3 ? "#fbbf24" : "var(--color-ink-muted)", fontSize: "18px", width: "24px" }}>{i + 1}</span>
                        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--gradient-dark-cta)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                           {u.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                           <div style={{ fontWeight: 700, fontSize: "16px" }}>{u.full_name || "Anonymous Soul"}</div>
                           <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-ink-muted)", marginTop: "2px" }}>Level {getLevel(u.total_hours || 0).name}</div>
                        </div>
                     </div>
                     <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: "18px" }}>{(u.total_hours || 0).toFixed(0)}h</div>
                        <div style={{ fontSize: "10px", color: "var(--color-ink-muted)" }}>OUTPUT</div>
                     </div>
                  </div>
                ))}
                {leaderboard.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "var(--color-ink-muted)" }}>Scanning the network for top performers...</div>}
             </div>
          </motion.div>

        ) : location.pathname === '/dashboard/accountability' ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: "center" }}>
             <h2 style={{ fontSize: "28px", fontWeight: 700 }}>Accountability Room</h2>
             <p style={{ color: "var(--color-ink-soft)", margin: "16px 0 40px" }}>Real-time focus sessions with others.</p>
             <div style={{ padding: "60px", background: "#f0fdf4", border: "1px dashed #22c55e", borderRadius: "32px" }}>
                <div style={{ fontSize: "40px" }}>🤝</div>
                <p style={{ fontWeight: 600, color: "#16a34a", marginTop: "16px" }}>The room is currently being sanitized. Live sessions start soon.</p>
             </div>
          </motion.div>
        ) : location.pathname === '/dashboard/profile' ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: "center" }}>
             <div style={{ maxWidth: "500px", margin: "0 auto", background: "#fff", border: "1px solid var(--color-border)", padding: "48px", borderRadius: "32px" }}>
                <div style={{ width: "120px", height: "120px", borderRadius: "40px", background: "var(--gradient-dark-cta)", margin: "0 auto 24px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "40px", fontWeight: 800, color: "#fff" }}>{profile?.full_name?.charAt(0)}</span>}
                </div>
                <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>{profile?.full_name || "Thrive User"}</h2>
                <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(0,0,0,0.05)", borderRadius: "100px", fontSize: "13px", fontWeight: 700, marginBottom: "32px" }}>
                   {currentLevel.icon} {currentLevel.name} • {currentTotalHours.toFixed(1)}h Output
                </div>
                
                <div style={{ background: "rgba(0,0,0,0.02)", padding: "32px", borderRadius: "24px", marginBottom: "32px", textAlign: "center" }}>
                   <p style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>Public Profile QR</p>
                   <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", padding: "16px", background: "#fff", borderRadius: "16px", display: "inline-block" }}>
                      <QRCodeSVG value={`${window.location.origin}/profile/${user?.id}`} size={160} />
                   </div>
                   <p style={{ fontSize: "12px", color: "var(--color-ink-muted)" }}>Anyone with this link can see your level and total output hours.</p>
                </div>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/profile/${user?.id}`);
                    alert("Public link copied to clipboard!");
                  }}
                  style={{ background: "var(--color-ink)", color: "#fff", border: "none", padding: "16px 32px", borderRadius: "100px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", margin: "0 auto", cursor: "pointer" }}
                >
                   <Share2 size={18} /> Copy Public Link
                </button>
             </div>
          </motion.div>

        ) : null}

      </div>
    </div>
    <AnimatePresence>
      {showLevelUp && levelUpData && (
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} style={{ position: "fixed", bottom: "40px", right: "40px", zIndex: 9999, background: "#fff", border: "2px solid #fbbf24", padding: "32px", borderRadius: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxWidth: "340px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>{levelUpData.icon}</div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: levelUpData.color, marginBottom: "8px" }}>Level Up!</h3>
          <p style={{ fontSize: "15px", color: "var(--color-ink)", fontWeight: 600, marginBottom: "4px" }}>You are now a {levelUpData.name}.</p>
          <p style={{ fontSize: "13px", color: "var(--color-ink-soft)" }}>Congratulations on achieving this milestone! Only {levelUpData.desc} of users reach this output level.</p>
          <button onClick={() => setShowLevelUp(false)} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "var(--color-ink-muted)", cursor: "pointer" }}><X size={16}/></button>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

