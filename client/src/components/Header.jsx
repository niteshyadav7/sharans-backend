import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            <span className="logo-icon">🌿</span>
            <span className="logo-text">SHARANS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav desktop-nav">
            <Link to="/" className="nav-link">HOME</Link>
            <Link to="/products?category=bath-body" className="nav-link">BATH & BODY</Link>
            <Link to="/products?category=hair-care" className="nav-link">HAIR CARE</Link>
            <Link to="/about" className="nav-link">ABOUT US</Link>
            <Link to="/contact" className="nav-link">CONTACT US</Link>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <Link to="/cart" className="cart-btn">
              <ShoppingCart size={20} />
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </Link>

            {/* Desktop Auth */}
            <div className="desktop-auth">
              {user ? (
                <div className="user-menu">
                  <Link to="/account" className="user-btn">
                    <User size={18} />
                    <span>{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="sign-in-link">Sign In</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
              HOME
            </Link>
            <Link to="/products?category=bath-body" className="mobile-nav-link" onClick={closeMobileMenu}>
              BATH & BODY
            </Link>
            <Link to="/products?category=hair-care" className="mobile-nav-link" onClick={closeMobileMenu}>
              HAIR CARE
            </Link>
            <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
              ABOUT US
            </Link>
            <Link to="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>
              CONTACT US
            </Link>

            {/* Mobile Auth */}
            <div className="mobile-auth">
              {user ? (
                <>
                  <Link to="/account" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <User size={18} />
                    <span>My Account</span>
                  </Link>
                  <button onClick={handleLogout} className="mobile-nav-link logout">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

