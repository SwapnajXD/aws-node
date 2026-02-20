import { useState } from 'react';
import { API_URL } from '../config/constants.js';
import { validateUrl } from '../utils/validation.js';

export default function LinkForm({ onCreated }) {
  const [longUrl, setLongUrl] = useState('');
  const [phrase, setPhrase] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateUrl(longUrl)) {
      setError('Please enter a valid http(s) URL');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl, phrase })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to shorten');
      onCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 24 }}>
      <input
        placeholder="https://example.com/very/long/path"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
      />
      <input
        placeholder="your-freaky-phrase (optional)"
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
      />
      <button type="submit" disabled={busy} style={{ padding: '10px 14px' }}>
        {busy ? 'Creating…' : 'Create freaky URL'}
      </button>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
    </form>
  );
}