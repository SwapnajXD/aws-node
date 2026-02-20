import { useState } from 'react';
import LinkForm from './components/LinkForm.jsx';
import ResultCard from './components/ResultCard.jsx';
import './App.css';

export default function App() {
  const [result, setResult] = useState(null);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1>aws_node — URL Shortener</h1>
      <p style={{ color: '#555' }}>
        Make your URLs look <b>freaky</b> with a custom phrase — the redirect stays safe and deterministic.
      </p>

      <LinkForm onCreated={setResult} />
      {result && <ResultCard slug={result.slug} />}
    </div>
  );
}