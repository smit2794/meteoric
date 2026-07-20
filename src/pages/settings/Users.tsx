import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Edit2 } from 'lucide-react';

const INITIAL_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@meteoric.com', role: 'admin', department: 'Administration', status: 'active', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin' },
  { id: 2, name: 'General Manager', email: 'manager@meteoric.com', role: 'manager', department: 'Management', status: 'active', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Manager' },
  { id: 3, name: 'Executive Officer', email: 'exec@meteoric.com', role: 'executive', department: 'QA', status: 'active', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Exec' }
];

export default function Users() {
  const [users, setUsers] = useState<any[]>(INITIAL_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const { hasActionPermission } = useAuth();
  const { showSuccess, showError } = useToast();

  const canCreate = hasActionPermission('settings', 'create');
  const canEdit = hasActionPermission('settings', 'edit');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales',
    department: 'Sales',
    status: 'active'
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'sales',
      department: 'Sales',
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // blank password unless changing it
      role: user.role,
      department: user.department,
      status: user.status
    });
    setModalOpen(true);
  };

  const handleDeactivate = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
      showSuccess(`User status updated to ${nextStatus}.`);
    } catch (err) {
      showError('Failed to update user status.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        showSuccess('User details updated successfully.');
      } else {
        if (!formData.password) {
          showError('Password is required for new users.');
          return;
        }
        const newUser = {
          ...formData,
          id: Date.now(),
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.name}`
        };
        setUsers(prev => [newUser, ...prev]);
        showSuccess('New user registered successfully.');
      }
      setModalOpen(false);
    } catch (err) {
      showError('Failed to save user.');
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <img src={row.avatar_url} alt="avatar" className="w-8 h-8 rounded-full bg-slate-100 object-cover" />
          <span className="font-semibold text-slate-800">{row.name}</span>
        </div>
      )
    },
    { header: 'Email Address', accessor: 'email', sortable: true },
    {
      header: 'Role',
      accessor: 'role',
      sortable: true,
      render: (row: any) => (
        <span className="capitalize px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
          {row.role}
        </span>
      )
    },
    { header: 'Department', accessor: 'department', sortable: true },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            disabled={!canEdit}
            className={`p-1 rounded transition-colors ${canEdit ? 'hover:bg-slate-100 text-slate-600' : 'text-slate-300 cursor-not-allowed'}`}
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeactivate(row.id, row.status)}
            disabled={!canEdit}
            className={`px-2 py-1 text-xs font-bold rounded transition-colors ${!canEdit ? 'text-slate-300 cursor-not-allowed' : row.status === 'active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Users Registry</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Manage system user profiles, roles, and status config for Meteoric Biopharmaceuticals.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKeys={['name', 'email', 'role', 'department']}
        searchPlaceholder="Search users..."
        filters={[
          { label: 'Role', accessor: 'role', options: ['admin', 'executive', 'sales', 'qa', 'manager'] },
          { label: 'Status', accessor: 'status', options: ['active', 'inactive'] }
        ]}
        exportFileName="meteoric_users.csv"
        actions={
          <button
            onClick={handleOpenAdd}
            disabled={!canCreate}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg shadow-sm ${canCreate ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit User Details' : 'Register New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@meteoric.com"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="admin">Admin</option>
                <option value="executive">Executive</option>
                <option value="sales">Sales Rep</option>
                <option value="qa">QA Officer</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Administration">Administration</option>
                <option value="IT">IT</option>
                <option value="Sales">Sales</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canEdit}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Save Details
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
