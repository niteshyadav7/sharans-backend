import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import './SharansAuth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      toast.success('Welcome to Sharans! 🌿✨');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
            <strong>Begin Your</strong>
            <span className="sharans-highlight">Beauty Journey</span>
          </h2>
          <p className="sharans-hero-subtitle">
            Join thousands who trust Sharans for natural skincare
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

      {/* Right Side - Register Form */}
      <div className="sharans-auth-form-container">
        <div className="sharans-form-wrapper">
          <div className="sharans-form-header">
            <h2>Create Account</h2>
            <p>Join the natural beauty revolution</p>
          </div>

          <form onSubmit={handleSubmit} className="sharans-form sharans-form-compact">
            <div className="sharans-input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
            </div>

            <div className="sharans-input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                autoComplete="email"
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
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
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

            <div className="sharans-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="sharans-password-input">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="sharans-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <label className="sharans-remember sharans-terms-checkbox">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="sharans-terms-link">
                  Terms & Conditions
                </Link>
              </span>
            </label>

            <button
              type="submit"
              className="sharans-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="sharans-spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="sharans-signup-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
