import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import LoginForm from './LoginForm';

const LoginPage = () => {
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Login</h1>
        
        {error && <p style={styles.error}>{error}</p>}
        
        <LoginForm onSubmit={handleLogin} />

        <p style={styles.register}>
          Don't have an account? 
          <a href="/register" style={styles.link}> Register here</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5'
  },
  loginBox: {
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#333'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '1rem'
  },
  register: {
    textAlign: 'center',
    marginTop: '1rem'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none'
  }
};

export default LoginPage;
