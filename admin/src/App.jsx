import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Orders from './pages/Orders';
import Dashboard from './pages/Dashboard';
import GiftCards from './pages/GiftCards';
import Reviews from './pages/Reviews';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import Coupons from './pages/Coupons';

import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Storefront from './pages/Storefront';





function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            {/* Catalog */}
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:id" element={<CategoryForm />} />

            {/* Sales */}

            <Route path="orders" element={<Orders />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="gift-cards" element={<GiftCards />} />

            {/* Users */}
            <Route path="customers" element={<Customers />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="settings" element={<Settings />} />
            <Route path="storefront" element={<Storefront />} />
            <Route path="storefront/:section" element={<Storefront />} />



          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
