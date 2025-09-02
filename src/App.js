import { useState, useEffect } from 'react';
import RolesPage from './RolesPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import { auth } from './firebase';

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
      if (u) setPage('roles');
    });
    return unsub;
  }, []);

  if (user && page === 'roles') {
    return <RolesPage onBack={() => setPage('home')} />;
  }

  if (page === 'login') {
    return <LoginPage onLogin={() => setPage('roles')} />;
  }

  if (page === 'register') {
    return <RegisterPage onRegister={() => setPage('roles')} />;
  }

  return (
    <div className="homepage-container">
      <img src="/taskmaster-logo.png" alt="Taskmaster Skull" style={{ width: 300, height: 300, marginBottom: 32, filter: 'drop-shadow(0 4px 24px #0008)' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: 2, margin: 0, textShadow: '0 2px 8px #000a' }}> </h1>
      <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
        <button className="button-30" onClick={() => setPage('login')}>
          Log In
        </button>
        <button className="button-30" onClick={() => setPage('register')}>
          Register
        </button>
      </div>
    </div>
  );
}

export default App;
