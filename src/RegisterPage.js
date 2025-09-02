import React, { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function RegisterPage({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onRegister();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  return (
    <div className="homepage-container">
      <img src="/taskmaster-logo.png" alt="Taskmaster Skull" style={{ width: 180, height: 180, marginBottom: 32, filter: 'drop-shadow(0 4px 24px #0008)' }} />
      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: 2, margin: 0, textShadow: '0 2px 8px #000a' }}>Register for Taskmaster</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 280, margin: '32px auto 0 auto' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
        />
        {error && <div style={{ color: 'salmon', fontWeight: 600 }}>{error}</div>}
        <button className="button-30" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
