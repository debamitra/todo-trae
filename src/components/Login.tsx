import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="login-container">
      <h1>Todo List</h1>
      <p>Please sign in to continue</p>
      <button
        onClick={signInWithGoogle}
        className="google-signin-button"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;