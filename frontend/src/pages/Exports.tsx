import { useState } from 'react';
import { useTeam } from '../App';
import { downloadExport } from '../api';

export default function Exports() {
  const { team } = useTeam();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  async function handleExport(type: 'csv' | 'pdf') {
    if (!team?._id) return;
    setError('');
    setLoading(type);
    try {
      await downloadExport(team._id, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading('');
    }
  }

  if (!team) {
    return (
      <div>
        <h1>Exports</h1>
        <p style={{ color: 'var(--muted)' }}>Create a team to export reports.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="header-row">
        <h1>Export Reports</h1>
      </div>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
      <div className="stats-grid" style={{ maxWidth: 640 }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>CSV export</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Download all team expenses as a spreadsheet.
          </p>
          <button type="button" onClick={() => handleExport('csv')} disabled={loading === 'csv'}>
            {loading === 'csv' ? 'Downloading…' : 'Download CSV'}
          </button>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>PDF export</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Generate a printable expense summary for {team.name}.
          </p>
          <button type="button" onClick={() => handleExport('pdf')} disabled={loading === 'pdf'}>
            {loading === 'pdf' ? 'Downloading…' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
