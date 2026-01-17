import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true
  });

  useEffect(() => {
    if (id) {
       const fetchCategory = async () => {
          try {
             const { data } = await api.get(`/categories/${id}`);
             // API returns { category: ... } or just object?
             // category.controller.js getCategoryById returns json(category).
             // So data IS the category object?
             // Let's check getCategoryById in controller. 
             // res.status(200).json(category);
             // So data is the category.
             setFormData({
                name: data.name,
                description: data.description || "",
                image: data.image || "",
                isActive: data.isActive
             });
          } catch (error) {
             toast.error("Failed to load category");
             navigate("/categories");
          } finally {
             setLoading(false);
          }
       };
       fetchCategory();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
     const { name, value, type, checked } = e.target;
     setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
     }));
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
     try {
        if (id) {
           await api.put(`/categories/${id}`, formData);
           toast.success("Category updated");
        } else {
           await api.post("/categories", formData);
           toast.success("Category created");
        }
        navigate("/categories");
     } catch (error) {
        toast.error(error.response?.data?.message || "Operation failed");
     }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex justify-center items-start min-h-screen bg-transparent p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden border border-gray-100">
         <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{id ? "Edit Category" : "Add Category"}</h2>
            <button onClick={() => navigate("/categories")} className="text-gray-500 hover:text-gray-700">
               <X size={24} />
            </button>
         </div>

         <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
               <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="e.g. Skin Care"
               />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
               <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={4} 
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Description..."
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
               <div className="flex gap-4 items-start">
                  <input 
                     type="url" 
                     name="image" 
                     value={formData.image} 
                     onChange={handleChange} 
                     className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50 h-10"
                     placeholder="https://..."
                  />
                  {formData.image && (
                     <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => e.target.style.display = 'none'}
                     />
                  )}
               </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
               <input 
                  type="checkbox" 
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded"
               />
               <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
               <button type="button" onClick={() => navigate("/categories")} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
               <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg">
                  {id ? "Update Category" : "Add Category"}
               </button>
            </div>
         </form>
      </div>
    </div>
  );
};

export default CategoryForm;
