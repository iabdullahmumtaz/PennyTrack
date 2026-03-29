import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getToken, setToken, teams as teamsApi } from './api';
import type { Team, TeamContextValue } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import TeamsPage from './pages/Teams';
import Exports from './pages/Exports';
import './App.css';

const TeamContext = createContext<TeamContextValue | null>(null);

export function useTeam(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamContext');
  return ctx;
}

function ProtectedLayout() {
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    teamsApi
      .list()
      .then((list) => {
        setTeamList(list);
        if (list.length) setTeam(list[0]);
      })
      .catch(() => {
        setToken(null);
        navigate('/login', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function logout() {
    setToken(null);
    navigate('/login', { replace: true });
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p style={{ color: 'var(--muted)' }}>Loading PennyTrack…</p>
      </div>
    );
  }

  return (
    <TeamContext.Provider value={{ team, setTeam, teamList, setTeamList }}>
      <div className="layout">
        <aside className="sidebar">
          <div className="logo">PennyTrack</div>
          {teamList.length > 1 && (
            <select
              className="team-select"
              value={team?._id || ''}
              onChange={(e) => setTeam(teamList.find((t) => t._id === e.target.value) || null)}
            >
              {teamList.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          <NavLink to="/budgets">Budgets</NavLink>
          <NavLink to="/teams">Teams</NavLink>
          <NavLink to="/exports">Exports</NavLink>
          <button
            type="button"
            className="secondary"
            style={{ marginTop: 'auto' }}
            onClick={logout}
          >
            Logout
          </button>
        </aside>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </TeamContext.Provider>
  );
}

function RequireAuth() {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <ProtectedLayout />;
}

function GuestOnly({ children }: { children: ReactNode }) {
  if (getToken()) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/" element={<RequireAuth />}>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="exports" element={<Exports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
