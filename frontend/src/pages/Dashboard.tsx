import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type PieLabelRenderProps,
} from 'recharts';
import { useTeam } from '../App';
import { dashboard, downloadExport } from '../api';
import type { DashboardStats } from '../types';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function Dashboard() {
  const { team } = useTeam();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!team?._id) return;
    dashboard.stats(team._id).then(setStats).catch(console.error);
  }, [team?._id]);

  if (!team) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--muted)' }}>Create a team to get started.</p>
      </div>
    );
  }

  if (!stats) return <p>Loading dashboard…</p>;

  const pieLabel = ({ category, percent }: PieLabelRenderProps) =>
    `${category} ${((percent ?? 0) * 100).toFixed(0)}%`;

  return (
    <div>
      <div className="header-row">
        <h1>Finance Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="secondary" onClick={() => downloadExport(team._id, 'csv')}>
            Export CSV
          </button>
          <button type="button" className="secondary" onClick={() => downloadExport(team._id, 'pdf')}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Total spent</h3>
          <p>${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card stat-card">
          <h3>Categories</h3>
          <p>{stats.byCategory.length}</p>
        </div>
        <div className="card stat-card">
          <h3>Team</h3>
          <p style={{ fontSize: '1.1rem' }}>{team.name}</p>
        </div>
      </div>

      <div className="charts-row">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Spending by category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stats.byCategory}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={pieLabel}
              >
                {stats.byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Monthly trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.monthly}>
              <XAxis dataKey="label" tick={{ fill: '#8ba3c7', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8ba3c7' }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Recent expenses</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>By</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map((e) => (
              <tr key={e._id}>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td>{e.category}</td>
                <td>${e.amount.toFixed(2)}</td>
                <td>{e.user?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
