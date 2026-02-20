import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config/constants.js';

export default function RedirectPage() {
  const { slug } = useParams();
  const [status, setStatus] = useState('Resolving…');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/resolve/${slug}`);
        const data = await res.json();
        if (res.ok && data.longUrl) {
          setStatus('Redirecting…');
          window.location.replace(data.longUrl);
        } else {
          setStatus(data.error || 'Link not found');
        }
      } catch {
        setStatus('Error resolving link');
      }
    })();
  }, [slug]);

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '70vh', fontFamily: 'system-ui,sans-serif' }}>
      <div>
        <h2>{status}</h2>
        <p style={{ color: '#666' }}>slug: {slug}</p>
      </div>
    </div>
  );
}