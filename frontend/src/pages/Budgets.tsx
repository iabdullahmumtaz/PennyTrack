import { useEffect, useState, type FormEvent } from 'react';
import { useTeam } from '../App';
import { budgets as api } from '../api';
import type { Budget } from '../types';

export default function Budgets() {
  const { team } = useTeam();
  const [list, setList] = useState<Budget[]>([]);
  const [form, setForm] = useState({ category: 'Office', limit: '', period: 'monthly' });

  function load() {
    if (!team?._id) return;
    api.list(team._id).then(setList).catch(console.error);
  }

  useEffect(load, [team?._id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!team) return;
    await api.create({ ...form, team: team._id, limit: Number(form.limit) });
    setForm({ ...form, limit: '' });
    load();
  }

  if (!team) return <p>Create a team first.</p>;
  const isAdmin = team.role === 'admin';

  return (
    <div>
      <div className="header-row">
        <h1>Budgets</h1>
      </div>

      {isAdmin && (
        <div className="card" style={{ marginBottom: '1.5rem', maxWidth: 480 }}>
          <h3 style={{ marginBottom: '1rem' }}>Set budget</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Limit ($)</label>
              <input
                type="number"
                min="0"
                value={form.limit}
                onChange={(e) => setForm({ ...form, limit: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Period</label>
              <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <button type="submit">Create budget</button>
          </form>
        </div>
      )}

      <div className="stats-grid">
        {list.map((b) => {
          const pct = Math.min(100, (b.spent / b.limit) * 100);
          const over = b.spent > b.limit;
          return (
            <div key={b._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{b.category}</h3>
                <span className="badge">{b.period}</span>
              </div>
              <p style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>
                ${b.spent.toFixed(2)} / ${b.limit.toFixed(2)}
              </p>
              <div className={`budget-bar ${over ? 'over' : ''}`}>
                <span style={{ width: `${pct}%` }} />
              </div>
              {isAdmin && (
                <button
                  type="button"
                  className="danger"
                  style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
                  onClick={() => api.remove(b._id).then(load)}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
