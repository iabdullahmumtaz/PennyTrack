import { useState, type FormEvent } from 'react';
import { useTeam } from '../App';
import { teams as api } from '../api';

export default function TeamsPage() {
  const { teamList, setTeamList, team, setTeam } = useTeam();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  async function createTeam(e: FormEvent) {
    e.preventDefault();
    const t = await api.create(name);
    setTeamList((p) => [...p, t]);
    setTeam(t);
    setName('');
  }

  async function invite(e: FormEvent) {
    e.preventDefault();
    if (!team) return;
    await api.addMember(team._id, email, role);
    const updated = await api.list();
    setTeamList(updated);
    setTeam(updated.find((x) => x._id === team._id) ?? null);
    setEmail('');
  }

  return (
    <div>
      <div className="header-row">
        <h1>Teams</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
        <h3 style={{ marginBottom: '1rem' }}>Create team</h3>
        <form onSubmit={createTeam}>
          <div className="form-group">
            <label>Team name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <button type="submit">Create</button>
        </form>
      </div>

      {team && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>{team.name}</h3>
          <p style={{ color: 'var(--muted)', margin: '0.5rem 0 1rem' }}>
            Your role: <span className={`badge ${team.role}`}>{team.role}</span>
          </p>
          {team.role === 'admin' && (
            <form onSubmit={invite} style={{ maxWidth: 400, marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Invite by email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit">Add member</button>
            </form>
          )}
          <h4 style={{ marginBottom: '0.5rem' }}>Members</h4>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ padding: '0.5rem 0' }}>
              {team.owner?.name} ({team.owner?.email}) — owner
            </li>
            {team.members?.map((m) => (
              <li key={String(m.user?._id ?? m.user)} style={{ padding: '0.5rem 0' }}>
                {m.user?.name} ({m.user?.email}) — <span className="badge">{m.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3>Your teams</h3>
        <ul style={{ listStyle: 'none', marginTop: '0.75rem' }}>
          {teamList.map((t) => (
            <li key={t._id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              {t.name} <span className={`badge ${t.role}`}>{t.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
