import { useEffect, useState, type FormEvent } from 'react';
import { useTeam } from '../App';
import { expenses as api } from '../api';
import type { Expense } from '../types';

export default function Expenses() {
  const { team } = useTeam();
  const [list, setList] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    amount: '',
    category: 'Office',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });

  function load() {
    if (!team?._id) return;
    api.list(team._id).then(setList).catch(console.error);
  }

  useEffect(load, [team?._id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!team) return;
    await api.create({ ...form, team: team._id, amount: Number(form.amount) });
    setForm({ ...form, amount: '', description: '' });
    load();
  }

  if (!team) return <p>Create a team first.</p>;

  return (
    <div>
      <div className="header-row">
        <h1>Expenses</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: 480 }}>
        <h3 style={{ marginBottom: '1rem' }}>Add expense</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {['Office', 'Travel', 'Software', 'Meals', 'Marketing', 'Other'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit">Add expense</button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e._id}>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td>{e.category}</td>
                <td>${e.amount.toFixed(2)}</td>
                <td>{e.description}</td>
                <td>
                  <button
                    type="button"
                    className="danger"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => api.remove(e._id).then(load)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
