import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { Copy, Plus, Ban, CheckCircle, Trash2, Search, Gift, ChevronLeft, ChevronRight, Calendar, Mail, X } from "lucide-react";

const GiftCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [genData, setGenData] = useState({ amount: '', recipientEmail: '' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCards = async () => {
    try {
      const { data } = await api.get("/gift-cards");
      setCards(data.cards);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch gift cards");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      if (!genData.amount) return toast.error("Amount is required");
      
      const { data } = await api.post("/gift-cards/generate", genData);
      toast.success("Gift Card Generated!");
      setCards([data.giftCard, ...cards]);
      setShowGenerate(false);
      setGenData({ amount: '', recipientEmail: '' });
    } catch (error) {
       toast.error(error.response?.data?.message || "Generation failed");
    }
  };

  const handleToggleStatus = async (card) => {
    const action = card.status === 'active' ? 'disable' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this gift card?`)) return;

    try {
      const { data } = await api.patch(`/gift-cards/${card._id}/toggle`);
      setCards(cards.map(c => c._id === card._id ? data.giftCard : c));
      toast.success(`Gift card ${data.giftCard.status}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this gift card? This action cannot be undone.")) return;

    try {
      await api.delete(`/gift-cards/${userId}`);
      setCards(cards.filter(c => c._id !== userId));
      toast.success("Gift card deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete gift card");
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };

  const filteredCards = cards.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.recipientEmail && c.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCards = filteredCards.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const stats = {
    total: cards.length,
    active: cards.filter(c => c.status === 'active').length,
    totalBalance: cards.reduce((acc, c) => acc + c.currentBalance, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Gift Credits</h1>
          <p className="text-gray-500 text-sm">Issue and manage digital gift cards and prepaid balances.</p>
        </div>
        
        <button 
           onClick={() => setShowGenerate(true)}
           className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 hover:-translate-y-0.5 transition-all"
        >
           <Plus size={20} />
           Issue New Card
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
             <Gift size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Cards</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
             <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outstanding Balance</p>
            <h3 className="text-xl font-bold text-gray-900">₹{stats.totalBalance.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <Copy size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Issued</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search by code or recipient email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Gift Code</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Values</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Recipient</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Expires</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Syncing ledger...</p>
                   </td>
                </tr>
              ) : displayedCards.length === 0 ? (
                <tr>
                   <td colSpan="6" className="px-6 py-20 text-center text-gray-400">
                      <Gift size={48} className="mx-auto mb-2 opacity-10" />
                      <p className="font-bold">No gift cards match your search</p>
                   </td>
                </tr>
              ) : (
                displayedCards.map((card) => (
                  <tr key={card._id} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 group/code">
                          <code className="text-purple-700 font-mono font-bold bg-purple-50/50 border border-purple-100 px-3 py-1.5 rounded-xl group-hover/code:scale-105 transition-transform">{card.code}</code>
                          <button onClick={() => copyToClipboard(card.code)} className="p-1.5 text-gray-300 hover:text-purple-600 transition-colors">
                             <Copy size={14} />
                          </button>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm font-black text-gray-900">₹{card.currentBalance}</div>
                       <div className="text-[10px] text-gray-400 font-bold uppercase">INITIAL: ₹{card.initialValue}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                          card.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          card.status === 'expired' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                       }`}>
                          {card.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600">
                          {card.recipientEmail ? (
                            <><Mail size={12} className="text-gray-300" /> {card.recipientEmail}</>
                          ) : (
                            <span className="text-gray-300 font-normal">Unassigned</span>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                       {new Date(card.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {card.status !== 'redeemed' && card.status !== 'expired' && (
                            <button 
                              onClick={() => handleToggleStatus(card)}
                              className={`p-2 rounded-xl border border-transparent transition-all ${card.status === 'active' ? 'text-amber-500 hover:bg-amber-50 hover:border-amber-100' : 'text-emerald-500 hover:bg-emerald-50 hover:border-emerald-100'}`}
                              title={card.status === 'active' ? "Disable Card" : "Activate Card"}
                            >
                              {card.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(card._id)}
                            className="p-2 rounded-xl text-red-400 hover:text-red-700 hover:bg-red-50 hover:border-red-100 border border-transparent transition-all"
                            title="Purge Card"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredCards.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
               Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
               >
                 <ChevronLeft size={18} />
               </button>
               <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                        currentPage === i + 1 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' 
                        : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
               </div>
               <button 
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={currentPage === totalPages}
                 className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
               >
                 <ChevronRight size={18} />
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Generation Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Issue Gift Card</h3>
                    <p className="text-sm text-gray-500 font-medium">Card code will be auto-generated.</p>
                 </div>
                 <button onClick={() => setShowGenerate(false)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X className="text-gray-400" size={24} /></button>
              </div>
              <form onSubmit={handleGenerate} className="p-6 space-y-5">
                 <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Prepaid Amount (₹)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg">₹</span>
                       <input 
                          type="number" 
                          value={genData.amount}
                          onChange={(e) => setGenData({...genData, amount: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none transition-all font-black text-lg"
                          min="1"
                          placeholder="500"
                          required
                       />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Recipient Email (Optional)</label>
                    <div className="relative">
                       <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input 
                          type="email" 
                          value={genData.recipientEmail}
                          onChange={(e) => setGenData({...genData, recipientEmail: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none transition-all font-bold"
                          placeholder="user@example.com"
                       />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 px-1">If provided, only this email can redeem this card.</p>
                 </div>
                 <div className="pt-6 border-t border-gray-50 flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => setShowGenerate(false)} className="px-6 py-3 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">Abort</button>
                    <button type="submit" className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 hover:-translate-y-0.5 transition-all">
                       Confirm Issuance
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default GiftCards;
