import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store token
      localStorage.setItem('token', token);
      
      // Decode token to get user info (basic)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Fetch full user data
        fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Welcome! 🌿');
            navigate('/');
          }
        })
        .catch(err => {
          console.error(err);
          toast.error('Authentication failed');
          navigate('/login');
        });
      } catch (error) {
        console.error(error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    } else {
      toast.error('Authentication failed');
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="sharans-spinner" style={{ width: '50px', height: '50px' }}></div>
      <p>Completing authentication...</p>
    </div>
  );
};

export default AuthCallback;
