import { FRONTEND_BASE } from '../config/constants.js';

export default function ResultCard({ slug }) {
  const full = `${FRONTEND_BASE}/${slug}`;

  const copy = async () => {
    await navigator.clipboard.writeText(full);
    alert('Copied!');
  };

  return (
    <div style={{ marginTop: 24, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <div style={{ fontSize: 14, color: '#666' }}>Your freaky URL</div>
      <div style={{ marginTop: 6, fontWeight: 600 }}>{full}</div>
      <button onClick={copy} style={{ marginTop: 12, padding: '8px 12px' }}>Copy</button>
    </div>
  );
}