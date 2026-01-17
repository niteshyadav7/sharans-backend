import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <h4 className="footer-title">About Sharans</h4>
            <p className="footer-text">
              Natural, cruelty-free skincare products crafted with
              love for your skin and the planet.
            </p>
          </div>

          {/* Customer Support */}
          <div className="footer-section">
            <h4 className="footer-title">Customer Support</h4>
            <ul className="footer-links">
              <Link to="/faq" className="footer-link">FAQ</Link>
              <Link to="/returns" className="footer-link">Returns & Exchanges</Link>
              <Link to="/shipping" className="footer-link">Shipping Information</Link>
              <Link to="/contact" className="footer-link">Contact Us</Link>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="footer-section">
            <h4 className="footer-title">Follow Us</h4>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <Facebook size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h4 className="footer-title">Newsletter</h4>
            <p className="footer-text">Subscribe to get special offers and updates.</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Your email" 
                className="newsletter-input"
              />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Sharans. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
