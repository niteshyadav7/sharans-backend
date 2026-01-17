import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import './SharansAuth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      toast.success('Welcome back! 🌿');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sharans-auth-page">
      {/* Left Side - Hero Section */}
      <div className="sharans-auth-hero">
        <div className="sharans-hero-overlay"></div>
        <div className="sharans-hero-content">
          <div className="sharans-brand">
            <Sparkles className="sharans-brand-icon" />
            <h1>SHARANS</h1>
          </div>
          <h2 className="sharans-hero-title">
            <strong>Natural Beauty,</strong>
            <span className="sharans-highlight">Naturally Yours</span>
          </h2>
          <p className="sharans-hero-subtitle">
            Premium skincare crafted with nature's finest ingredients
          </p>
          
          <div className="sharans-stats">
            <div className="sharans-stat">
              <h3>10K+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="sharans-stat">
              <h3>100%</h3>
              <p>Natural Products</p>
            </div>
            <div className="sharans-stat">
              <h3>50+</h3>
              <p>Beauty Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="sharans-auth-form-container">
        <div className="sharans-form-wrapper">
          <div className="sharans-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your beauty journey</p>
          </div>

          <form onSubmit={handleSubmit} className="sharans-form">
            <div className="sharans-input-group">
              <label htmlFor="username">Username or Email</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div className="sharans-input-group">
              <label htmlFor="password">Password</label>
              <div className="sharans-password-input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="sharans-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="sharans-form-options">
              <label className="sharans-remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="sharans-forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="sharans-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="sharans-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="sharans-divider">
            <span>or continue with</span>
          </div>

          <div className="sharans-social-login">
            <button className="sharans-social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="sharans-social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <p className="sharans-signup-link">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
