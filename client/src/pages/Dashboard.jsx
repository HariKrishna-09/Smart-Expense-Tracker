import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Plus, LogOut, Wallet, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form States
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const categories = ['Food', 'Transport', 'Shopping', 'Salary', 'Rent', 'Bills', 'Entertainment', 'Health', 'Others'];

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions');
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setTransactions([]);
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    // Redirect if not logged in
    if (!userInfo) {
        window.location.href = '/login';
        return;
    }
    fetchTransactions();
}, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await API.post('/transactions', {
        amount: Number(amount),
        category,
        type,
        date,
        notes
      });

      setAmount('');
      setCategory('');
      setNotes('');
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      alert('Failed to add transaction');
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      alert('Failed to delete transaction');
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpense;

  const categoryData = Object.entries(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Wallet className="text-emerald-500" size={28} />
          <h1 className="text-2xl font-bold">Smart Expense</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 rounded-2xl font-medium"
          >
            <Plus size={20} /> Add Transaction
          </button>
          <button onClick={() => { 
            logout();
          }}
          className="text-slate-400 hover:text-white">
            <LogOut size={22} />
            </button>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-400 text-sm">Total Income</p>
            <p className="text-4xl font-bold text-emerald-500 mt-2">₹{totalIncome}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-400 text-sm">Total Expense</p>
            <p className="text-4xl font-bold text-red-500 mt-2">₹{totalExpense}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-400 text-sm">Savings</p>
            <p className={`text-4xl font-bold mt-2 ${savings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              ₹{savings}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-semibold mb-4">Spending by Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-center py-20">No data yet. Add some expenses!</p>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3 max-h-[420px] overflow-auto">
              {transactions.length === 0 ? (
                <p className="text-slate-400 text-center py-12">No transactions found. Add your first one!</p>
              ) : (
                transactions.slice(0, 10).map((t) => (
                  <div key={t._id} className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl group">
                    <div>
                      <p className="font-medium">{t.category}</p>
                      <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                      {t.notes && <p className="text-xs text-slate-500">{t.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount}
                      </p>
                      <button 
                        onClick={() => deleteTransaction(t._id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add New Transaction</h2>

            <form onSubmit={handleAddTransaction} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Type</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-2xl ${type === 'expense' ? 'bg-red-500' : 'bg-slate-700'}`}>Expense</button>
                  <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-2xl ${type === 'income' ? 'bg-emerald-500' : 'bg-slate-700'}`}>Income</button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Amount (₹)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-800 rounded-2xl" required />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-800 rounded-2xl" required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-800 rounded-2xl" required />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 bg-slate-800 rounded-2xl h-20" placeholder="Optional" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-slate-800 rounded-2xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-medium">Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;