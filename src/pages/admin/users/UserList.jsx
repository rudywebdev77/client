import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as userService from '../../../services/userService';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiUserCheck, FiUserX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import TablePagination from '../../../components/shared/TablePagination';

export const UserList = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers({ search, role, page, limit: pageSize });
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Reset page to 1 whenever search or role changes
  useEffect(() => {
    setPage(1);
  }, [search, role]);

  useEffect(() => {
    fetchUsers();
  }, [page, role, pageSize, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await userService.deleteUser(id);
        if (res.success) {
          toast.success('User deleted successfully');
          fetchUsers();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    try {
      const res = await userService.toggleUserStatus(id, nextStatus);
      if (res.success) {
        toast.success(`User status updated to ${nextStatus}`);
        setUsers(users.map((u) => (u._id === id ? { ...u, status: nextStatus } : u)));
      }
    } catch (err) {
      toast.error('Failed to change user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-sm text-slate-400">Manage staff members and clients.</p>
        </div>
        <Link
          to="/admin/users/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/10"
        >
          <FiPlus className="h-5 w-5" /> Add New User
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute top-2.5 left-3 text-slate-500 hover:text-slate-300">
            <FiSearch className="h-4.5 w-4.5" />
          </button>
        </form>

        <div className="flex items-center gap-3">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="staff">Staff</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 shadow-xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-500">
            <p className="text-lg">No users found</p>
            <p className="text-sm">Try modifying your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-transparent">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-800 flex items-center justify-center text-white font-bold uppercase">
                        {u.profileImage ? (
                          <img src={`http://localhost:5000${u.profileImage}`} alt={u.fullName} className="h-full w-full object-cover" />
                        ) : (
                          u.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{u.fullName}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize font-medium">{u.role}</td>
                    <td className="px-6 py-4 text-slate-400">{u.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xxs font-semibold uppercase tracking-wider ${u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                          }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/users/${u._id}`}
                          title="View Profile"
                          className="rounded-lg p-1.5 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                        >
                          <FiEye className="h-4.5 w-4.5" />
                        </Link>
                        <Link
                          to={`/admin/users/edit/${u._id}`}
                          title="Edit User"
                          className="rounded-lg p-1.5 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                        >
                          <FiEdit className="h-4.5 w-4.5" />
                        </Link>
                        <button
                          onClick={() => handleStatusToggle(u._id, u.status)}
                          title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                          className={`rounded-lg p-1.5 transition-colors ${u.status === 'active'
                              ? 'hover:bg-amber-500/10 hover:text-amber-400'
                              : 'hover:bg-emerald-500/10 hover:text-emerald-400'
                            }`}
                        >
                          {u.status === 'active' ? <FiUserX className="h-4.5 w-4.5" /> : <FiUserCheck className="h-4.5 w-4.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          title="Delete User"
                          className="rounded-lg p-1.5 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination – always visible once data is loaded */}
        {!loading && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
};
