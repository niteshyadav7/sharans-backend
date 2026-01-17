import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loading, setLoading] = useState(true);

  // Check if token exists on mount (in a real app, verify with backend /me endpoint)
  useEffect(() => {
    if (token) {
       // Ideally: fetch user profile
       setLoading(false); 
    } else {
       setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      // Basic role check (Backend should also enforce this)
      if (data.user.role !== 'admin') {
        toast.error("Access Denied: Admin only area");
        return { success: false };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("adminToken", data.token);
      toast.success("Welcome back!");
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("adminToken");
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
