import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { Star, Trash2, Plus, Search, Filter, CheckCircle, XCircle, ThumbsUp } from "lucide-react";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyComment, setReplyComment] = useState("");
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, pendingCount: 0 });
  
  // Filters
  const [filters, setFilters] = useState({
    status: "",
    rating: "",
    search: ""
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: 50,
        status: filters.status,
        rating: filters.rating,
        search: filters.search
      }).toString();

      const { data } = await api.get(`/reviews/admin/all?${queryParams}`);
      setReviews(data.reviews || []);
      setStats(data.stats || { averageRating: 0, totalReviews: 0, pendingCount: 0 });
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch reviews");
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm("Deleted reviews cannot be restored. Confirm?")) return;
    try {
      await api.delete(`/reviews/admin/${id}`);
      toast.success("Review deleted");
      setReviews(reviews.filter(r => r._id !== id));
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/reviews/admin/${replyingTo._id}/response`, {
        comment: replyComment
      });
      toast.success("Response added");
      setReviews(reviews.map(r => r._id === replyingTo._id ? data.review : r));
      setReplyingTo(null);
      setReplyComment("");
    } catch (error) {
      toast.error("Failed to add response");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/reviews/admin/${id}/status`, { status });
      toast.success(`Review ${status}`);
      setReviews(reviews.map(r => r._id === id ? { ...r, status: data.review.status } : r));
      
      // Update pending count in stats if it changed
      if (status === 'approved' || status === 'rejected') {
        setStats(prev => ({ ...prev, pendingCount: Math.max(0, prev.pendingCount - 1) }));
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h1>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
             <Star size={24} className="fill-current" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Store Rating</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.averageRating} / 5.0</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
             <Plus size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Reviews</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalReviews}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
             <Filter size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Moderation</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search comments or products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
           />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-white text-sm"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-white text-sm"
            value={filters.rating}
            onChange={(e) => setFilters({...filters, rating: e.target.value})}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm text-gray-400">
             Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm text-gray-400">
             No reviews found
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
               <div className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                       <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                          {review.user?.name?.[0]?.toUpperCase() || 'U'}
                       </div>
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                          <div>
                             <div className="flex items-center gap-2">
                               <h3 className="font-bold text-gray-900">{review.user?.name || "Anonymous User"}</h3>
                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                 review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                 review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                 'bg-orange-100 text-orange-700'
                               }`}>
                                 {review.status}
                               </span>
                             </div>
                             <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                Reviewing <span className="font-semibold text-blue-600">{review.product?.name || "Unknown Product"}</span>
                             </p>
                          </div>
                          <div className="flex gap-2 text-gray-400">
                             {review.status === 'pending' && (
                               <>
                                 <button 
                                   onClick={() => handleUpdateStatus(review._id, 'approved')}
                                   className="hover:text-green-600 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                                   title="Approve review"
                                 >
                                    <CheckCircle size={18} />
                                 </button>
                                 <button 
                                   onClick={() => handleUpdateStatus(review._id, 'rejected')}
                                   className="hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                   title="Reject review"
                                 >
                                    <XCircle size={18} />
                                 </button>
                               </>
                             )}
                             <button 
                               onClick={() => setReplyingTo(review)} 
                               className="hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                               title="Reply to review"
                             >
                                <Plus size={18} />
                             </button>
                             <button 
                               onClick={() => handleDelete(review._id)} 
                               className="hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                               title="Delete review"
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </div>

                       <div className="flex items-center mt-3 gap-2">
                          <div className="flex">
                             {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={16} 
                                  className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-200"} 
                                />
                             ))}
                          </div>
                          <span className="text-xs text-gray-400 font-medium">
                             {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                             })}
                          </span>
                          {review.isVerifiedPurchase && (
                             <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-green-100">Verified Purchase</span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                             <ThumbsUp size={10} /> {review.helpfulCount || 0} Helpful
                          </span>
                       </div>

                       {review.title && <h4 className="font-semibold text-gray-800 mt-3">{review.title}</h4>}
                       <p className="text-gray-600 mt-2 leading-relaxed">{review.comment}</p>

                       {review.images?.length > 0 && (
                          <div className="flex gap-3 mt-4">
                             {review.images.map((img, idx) => (
                                <img key={idx} src={img} alt="Review" className="h-20 w-20 object-cover rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-100" />
                             ))}
                          </div>
                       )}

                       {/* Admin Response */}
                       {review.adminResponse?.comment ? (
                          <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
                             <div className="absolute -top-3 left-4 px-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Reply</div>
                             <p className="text-gray-700 text-sm leading-relaxed">{review.adminResponse.comment}</p>
                             <p className="text-[10px] text-gray-400 mt-2 font-medium italic">
                                Responded on {new Date(review.adminResponse.respondedAt).toLocaleDateString()}
                             </p>
                          </div>
                       ) : replyingTo?._id === review._id ? (
                          <div className="mt-6">
                             <form onSubmit={handleReply} className="space-y-3">
                                <textarea 
                                  value={replyComment}
                                  onChange={(e) => setReplyComment(e.target.value)}
                                  placeholder="Write your response here..."
                                  className="w-full p-3 text-sm border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all min-h-[100px]"
                                  required
                                />
                                <div className="flex gap-2">
                                   <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                      Send Response
                                   </button>
                                   <button type="button" onClick={() => setReplyingTo(null)} className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                      Cancel
                                   </button>
                                </div>
                             </form>
                          </div>
                       ) : null}
                    </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
