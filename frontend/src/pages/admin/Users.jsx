import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Spinner } from '../../components/ui/LoadingScreen';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const currentUser = useSelector(selectUser);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { search, limit: 100 } });
      setUsers(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggleRole = async (user) => {
    if (user._id === currentUser._id) { toast.error("Can't change your own role"); return; }
    try {
      await api.put(`/admin/users/${user._id}/role`, { role: user.role === 'admin' ? 'user' : 'admin' });
      toast.success('Role updated');
      fetchUsers();
    } catch (err) { toast.error('Failed'); }
  };

  const toggleStatus = async (user) => {
    if (user._id === currentUser._id) { toast.error("Can't deactivate yourself"); return; }
    try {
      await api.put(`/admin/users/${user._id}/toggle-status`);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} total users</p>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
          className="input text-sm py-2 w-64" />
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-slate-500">No users found</td></tr>}
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/2">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="font-medium text-white">{u.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'} capitalize`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => toggleRole(u)} className="text-xs text-blue-400 hover:underline">
                          {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        <span className="text-slate-700">|</span>
                        <button onClick={() => toggleStatus(u)} className={`text-xs hover:underline ${u.isActive ? 'text-red-400' : 'text-emerald-400'}`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
