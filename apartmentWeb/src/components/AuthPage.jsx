import { useState } from 'react';
import './AuthPage.css';

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      // TODO: Your teammate should add Firebase signup logic here
      console.log('Sign up with:', formData);
      // Example: await createUserWithEmailAndPassword(auth, formData.email, formData.password)
    } else {
      // TODO: Your teammate should add Firebase login logic here
      console.log('Login with:', { email: formData.email, password: formData.password });
      // Example: await signInWithEmailAndPassword(auth, formData.email, formData.password)
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {isSignUp ? 'Create New Account' : 'Welcome Back'}
        </h1>
        <p className="auth-subtitle">
          {isSignUp ? (
            <>
              Already Registered?{' '}
              <button
                className="auth-toggle-link"
                onClick={() => setIsSignUp(false)}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                className="auth-toggle-link"
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </>
          )}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">NAME</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Ilana Martins"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">EMAIL</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="hello@reallygreatsite.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="******"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            {isSignUp ? 'SIGN UP' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
