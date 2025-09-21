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

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    },
    title: {
      fontSize: '2rem',
      color: '#333',
      marginBottom: '2rem'
    },
    error: {
      color: 'red',
      marginTop: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>
      <LoginForm onSubmit={handleLogin} />
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

export default LoginPage;
