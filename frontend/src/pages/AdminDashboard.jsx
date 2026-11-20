import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { SortHeader } from '../components/SortableTable';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Building2,
  Mail,
  MapPin,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'users'
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Stores State
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [storeSort, setStoreSort] = useState({ field: 'name', order: 'ASC' });

  // Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: 'ALL' });
  const [userSort, setUserSort] = useState({ field: 'name', order: 'ASC' });

  // Modals
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add Store Form
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [storeModalError, setStoreModalError] = useState('');
  const [storeModalSuccess, setStoreModalSuccess] = useState('');
  const [submittingStore, setSubmittingStore] = useState(false);

  // Add User Form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    role: 'NORMAL_USER'
  });
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showUserConfirmPassword, setShowUserConfirmPassword] = useState(false);
  const [userModalError, setUserModalError] = useState('');
  const [userModalSuccess, setUserModalSuccess] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);

  // Fetch Dashboard Stats
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Stores with Filters & Sort
  const loadStores = useCallback(async () => {
    try {
      setLoadingStores(true);
      const params = {
        name: storeFilters.name,
        email: storeFilters.email,
        address: storeFilters.address,
        sortBy: storeSort.field,
        sortOrder: storeSort.order,
      };
      const data = await api.getAdminStores(params);
      setStores(data.stores);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoadingStores(false);
    }
  }, [storeFilters, storeSort]);

  // Fetch Users with Filters & Sort
  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const params = {
        name: userFilters.name,
        email: userFilters.email,
        address: userFilters.address,
        role: userFilters.role,
        sortBy: userSort.field,
        sortOrder: userSort.order,
      };
      const data = await api.getAdminUsers(params);
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [userFilters, userSort]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleStoreSort = (field) => {
    setStoreSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const handleUserSort = (field) => {
    setUserSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  // Create Store Submit
  const handleCreateStore = async (e) => {
    e.preventDefault();
    setStoreModalError('');
    setStoreModalSuccess('');

    if (newStore.name.trim().length < 20 || newStore.name.trim().length > 60) {
      setStoreModalError('Store name must be between 20 and 60 characters');
      return;
    }
    if (newStore.address.trim().length > 400 || !newStore.address.trim()) {
      setStoreModalError('Address is required and must not exceed 400 characters');
      return;
    }

    setSubmittingStore(true);
    try {
      await api.createAdminStore({
        name: newStore.name.trim(),
        email: newStore.email.trim(),
        address: newStore.address.trim(),
        ownerId: newStore.ownerId ? Number(newStore.ownerId) : null,
      });

      setStoreModalSuccess('Store registered successfully');
      loadStores();
      loadUsers();
      loadStats();
      setTimeout(() => {
        setIsAddStoreOpen(false);
        setNewStore({ name: '', email: '', address: '', ownerId: '' });
        setStoreModalSuccess('');
      }, 1200);
    } catch (err) {
      setStoreModalError(err.message || 'Failed to create store');
    } finally {
      setSubmittingStore(false);
    }
  };

  // Create User Submit
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserModalError('');
    setUserModalSuccess('');

    if (newUser.name.trim().length < 20 || newUser.name.trim().length > 60) {
      setUserModalError('Name must be between 20 and 60 characters');
      return;
    }
    if (newUser.password.length < 8 || newUser.password.length > 16) {
      setUserModalError('Password must be between 8 and 16 characters');
      return;
    }
    if (!/[A-Z]/.test(newUser.password)) {
      setUserModalError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/~`]/.test(newUser.password)) {
      setUserModalError('Password must contain at least one special character');
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      setUserModalError('Passwords do not match');
      return;
    }
    if (newUser.address.trim().length > 400 || !newUser.address.trim()) {
      setUserModalError('Address is required and must not exceed 400 characters');
      return;
    }

    setSubmittingUser(true);
    try {
      await api.createAdminUser({
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        address: newUser.address.trim(),
        role: newUser.role,
      });

      setUserModalSuccess('User created successfully');
      loadUsers();
      loadStores();
      loadStats();
      setTimeout(() => {
        setIsAddUserOpen(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          address: '',
          role: 'NORMAL_USER'
        });
        setShowUserPassword(false);
        setShowUserConfirmPassword(false);
        setUserModalSuccess('');
      }, 1200);
    } catch (err) {
      setUserModalError(err.message || 'Failed to create user');
    } finally {
      setSubmittingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 mb-1.5">
            <ShieldCheck size={13} className="text-slate-600" />
            <span>Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            System Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage stores, user accounts, and view platform metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddStoreOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Store</span>
          </button>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Users</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {loadingStats ? '...' : stats.totalUsers}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Stores</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {loadingStats ? '...' : stats.totalStores}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Star size={22} className="fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submitted Ratings</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {loadingStats ? '...' : stats.totalRatings}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('stores')}
          className={`pb-3.5 text-sm font-semibold transition-colors relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'stores'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 size={16} />
          <span>Stores Management</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {stores.length > 0 || (storeFilters.name || storeFilters.email || storeFilters.address) ? stores.length : (stats.totalStores ?? 0)}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3.5 text-sm font-semibold transition-colors relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} />
          <span>Users Management</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {users.length > 0 || (userFilters.name || userFilters.email || userFilters.address || userFilters.role !== 'ALL') ? users.length : (stats.totalUsers ?? 0)}
          </span>
        </button>
      </div>

      {/* STORES TAB */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={storeFilters.name}
                onChange={(e) => setStoreFilters((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Filter by store name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
            <div className="relative flex-1 w-full">
              <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={storeFilters.email}
                onChange={(e) => setStoreFilters((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Filter by email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
            <div className="relative flex-1 w-full">
              <MapPin size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={storeFilters.address}
                onChange={(e) => setStoreFilters((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Filter by address..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
            {(storeFilters.name || storeFilters.email || storeFilters.address) && (
              <button
                onClick={() => setStoreFilters({ name: '', email: '', address: '' })}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Stores Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <SortHeader label="Store Name" field="name" currentSort={storeSort} onSort={handleStoreSort} />
                    <SortHeader label="Email" field="email" currentSort={storeSort} onSort={handleStoreSort} />
                    <SortHeader label="Address" field="address" currentSort={storeSort} onSort={handleStoreSort} />
                    <SortHeader label="Overall Rating" field="rating" currentSort={storeSort} onSort={handleStoreSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loadingStores ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400">Loading stores...</td>
                    </tr>
                  ) : stores.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400">No stores match the criteria</td>
                    </tr>
                  ) : (
                    stores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-900">{store.name}</td>
                        <td className="px-5 py-3.5 text-slate-600">{store.email}</td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={store.address}>{store.address}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <RatingStars value={Number(store.rating)} size={15} />
                            <span className="font-bold text-slate-800 text-xs">
                              {Number(store.rating) > 0 ? Number(store.rating).toFixed(1) : 'No ratings'}
                            </span>
                            {store.ratings_count > 0 && (
                              <span className="text-[11px] text-slate-400 font-medium">({store.ratings_count})</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userFilters.name}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Filter by name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
            <div className="relative flex-1 w-full">
              <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userFilters.email}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Filter by email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
            <div className="relative flex-1 w-full">
              <MapPin size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userFilters.address}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Filter by address..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
            <div className="w-full md:w-44">
              <select
                value={userFilters.role}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-medium text-slate-700"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="NORMAL_USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
            {(userFilters.name || userFilters.email || userFilters.address || userFilters.role !== 'ALL') && (
              <button
                onClick={() => setUserFilters({ name: '', email: '', address: '', role: 'ALL' })}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <SortHeader label="Name" field="name" currentSort={userSort} onSort={handleUserSort} />
                    <SortHeader label="Email" field="email" currentSort={userSort} onSort={handleUserSort} />
                    <SortHeader label="Address" field="address" currentSort={userSort} onSort={handleUserSort} />
                    <SortHeader label="Role" field="role" currentSort={userSort} onSort={handleUserSort} />
                    <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">Loading users...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">No users match the criteria</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-900">{u.name}</td>
                        <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={u.address}>{u.address}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${
                              u.role === 'ADMIN'
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : u.role === 'STORE_OWNER'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {u.role === 'ADMIN' ? 'Admin' : (u.role === 'STORE_OWNER' ? 'Store Owner' : 'Normal User')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-slate-200"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title="User Account Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-medium">Name</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Email</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedUser.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 font-medium">Address</p>
                <p className="font-medium text-slate-700 mt-0.5">{selectedUser.address}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Role</p>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-semibold border ${
                    selectedUser.role === 'ADMIN'
                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                      : selectedUser.role === 'STORE_OWNER'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {selectedUser.role === 'ADMIN' ? 'Admin' : (selectedUser.role === 'STORE_OWNER' ? 'Store Owner' : 'Normal User')}
                </span>
              </div>
            </div>

            {selectedUser.role === 'STORE_OWNER' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Store Owner Associated Store
                </p>
                {selectedUser.store_name ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{selectedUser.store_name}</span>
                      <div className="flex items-center gap-1.5">
                        <RatingStars value={Number(selectedUser.store_rating || 0)} size={16} />
                        <span className="text-xs font-extrabold text-amber-900">
                          {Number(selectedUser.store_rating || 0) > 0 ? Number(selectedUser.store_rating).toFixed(1) : 'No ratings yet'}
                        </span>
                      </div>
                    </div>
                    {selectedUser.store_ratings_count > 0 && (
                      <p className="text-xs text-slate-500">
                        Based on {selectedUser.store_ratings_count} customer {selectedUser.store_ratings_count === 1 ? 'rating' : 'ratings'}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No store has been linked to this owner yet.</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD STORE MODAL */}
      <Modal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        title="Add New Store"
      >
        <form onSubmit={handleCreateStore} className="space-y-4">
          {storeModalError && (
            <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{storeModalError}</span>
            </div>
          )}
          {storeModalSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>{storeModalSuccess}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Store Name
              </label>
              <span className="text-[11px] text-slate-400">{newStore.name.length}/60 (min 20)</span>
            </div>
            <input
              type="text"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              placeholder="e.g. Dorabjee Gourmet Supermarket"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Store Email
            </label>
            <input
              type="email"
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
              placeholder="store@domain.com"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Store Address
              </label>
              <span className="text-[11px] text-slate-400">{newStore.address.length}/400</span>
            </div>
            <textarea
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              placeholder="Physical street address..."
              rows={2}
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assign Store Owner (Optional)
            </label>
            <select
              value={newStore.ownerId}
              onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm font-medium text-slate-700"
            >
              <option value="">None / Assign Later</option>
              {users.filter((u) => u.role === 'STORE_OWNER').length === 0 ? (
                <option value="" disabled>No Store Owners registered yet</option>
              ) : (
                users
                  .filter((u) => u.role === 'STORE_OWNER')
                  .map((u) => (
                    <option key={u.id} value={u.id} disabled={Boolean(u.store_id)}>
                      {u.name} ({u.email}){u.store_name ? ` — Already managing ${u.store_name}` : ' — Available'}
                    </option>
                  ))
              )}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddStoreOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingStore}
              className="px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submittingStore ? 'Saving...' : 'Add Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD USER MODAL */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => {
          setIsAddUserOpen(false);
          setShowUserPassword(false);
          setShowUserConfirmPassword(false);
        }}
        title="Add New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {userModalError && (
            <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{userModalError}</span>
            </div>
          )}
          {userModalSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>{userModalSuccess}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <span className="text-[11px] text-slate-400">{newUser.name.length}/60 (min 20)</span>
            </div>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Siddharth Chandrakant Joshi"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="user@example.com"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password (8-16 chars, 1 uppercase, 1 special char)
            </label>
            <div className="relative">
              <input
                type={showUserPassword ? 'text' : 'password'}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="e.g. Password123!"
                required
                className="w-full pl-3.5 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowUserPassword(!showUserPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showUserConfirmPassword ? 'text' : 'password'}
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                required
                className={`w-full pl-3.5 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                  newUser.confirmPassword && newUser.password !== newUser.confirmPassword
                    ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500'
                    : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowUserConfirmPassword(!showUserConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showUserConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newUser.confirmPassword && newUser.password !== newUser.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Address
              </label>
              <span className="text-[11px] text-slate-400">{newUser.address.length}/400</span>
            </div>
            <textarea
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              placeholder="Residential or business address..."
              rows={2}
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              User Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm font-medium text-slate-700"
            >
              <option value="NORMAL_USER">Normal User</option>
              <option value="ADMIN">System Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddUserOpen(false);
                setShowUserPassword(false);
                setShowUserConfirmPassword(false);
              }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingUser}
              className="px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submittingUser ? 'Saving...' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
