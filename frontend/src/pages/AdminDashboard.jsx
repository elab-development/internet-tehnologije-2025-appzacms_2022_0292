import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { useAdminStore } from '../stores/useAdminStore';

function StatCard({ label, value }) {
  return (
    <div className='rounded border p-4 bg-white'>
      <div className='text-xs text-gray-500'>{label}</div>
      <div className='text-2xl font-semibold text-gray-900 mt-1'>{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const overview = useAdminStore((s) => s.overview);
  const users = useAdminStore((s) => s.users);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);

  const fetchOverview = useAdminStore((s) => s.fetchOverview);
  const fetchUsers = useAdminStore((s) => s.fetchUsers);
  const setUserRole = useAdminStore((s) => s.setUserRole);
  const clearError = useAdminStore((s) => s.clearError);

  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sort, setSort] = useState('createdAt_desc');

  useEffect(() => {
    clearError?.();
    fetchOverview();
    fetchUsers({ sort: 'createdAt_desc' });
  }, [fetchOverview, fetchUsers, clearError]);

  const totals = overview?.totals || { users: 0, sites: 0, pages: 0, posts: 0 };
  const usersByRole = overview?.usersByRole || [];
  const pagesByStatus = overview?.pagesByStatus || [];
  const postsByStatus = overview?.postsByStatus || [];
  const topSites = overview?.topSites || [];

  const rolePie = useMemo(() => {
    // recharts voli { name, value }
    return usersByRole.map((x) => ({ name: x.role, value: x.count }));
  }, [usersByRole]);

  const pagesBar = useMemo(() => {
    return pagesByStatus.map((x) => ({ name: x.status, count: x.count }));
  }, [pagesByStatus]);

  const postsBar = useMemo(() => {
    return postsByStatus.map((x) => ({ name: x.status, count: x.count }));
  }, [postsByStatus]);

  const topSitesBar = useMemo(() => {
    return topSites.map((s) => ({
      name: s.slug,
      pages: s.pagesCount,
      posts: s.postsCount,
      total: s.total,
    }));
  }, [topSites]);

  const onSearch = async (e) => {
    e.preventDefault();
    await fetchUsers({
      q: q.trim() || undefined,
      role: roleFilter || undefined,
      sort,
    });
  };

  const onClear = async () => {
    setQ('');
    setRoleFilter('');
    setSort('createdAt_desc');
    await fetchUsers({ sort: 'createdAt_desc' });
  };

  const onRoleChange = async (userId, nextRole) => {
    await setUserRole(userId, nextRole);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>Admin Dashboard</h1>
          <div className='text-sm text-gray-500'>
            Overview + user role management
          </div>
        </div>
      </div>

      {error && (
        <div className='rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
          {error}
        </div>
      )}

      {/* Totals */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatCard label='Users' value={totals.users} />
        <StatCard label='Sites' value={totals.sites} />
        <StatCard label='Pages' value={totals.pages} />
        <StatCard label='Posts' value={totals.posts} />
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Users by role (pie) */}
        <div className='rounded border p-4 bg-white'>
          <div className='text-sm font-medium mb-3'>Users by role</div>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={rolePie}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={90}
                  label
                >
                  {rolePie.map((_, idx) => (
                    <Cell key={idx} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pages by status */}
        <div className='rounded border p-4 bg-white'>
          <div className='text-sm font-medium mb-3'>Pages by status</div>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={pagesBar}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey='count' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Posts by status */}
        <div className='rounded border p-4 bg-white'>
          <div className='text-sm font-medium mb-3'>Posts by status</div>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={postsBar}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey='count' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top sites chart */}
      <div className='rounded border p-4 bg-white'>
        <div className='flex items-center justify-between gap-3 mb-3'>
          <div className='text-sm font-medium'>Top sites (pages + posts)</div>
          <div className='text-xs text-gray-500'>Top 5</div>
        </div>
        <div className='h-72'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={topSitesBar}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey='pages' />
              <Bar dataKey='posts' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users table */}
      <div className='rounded border bg-white'>
        <div className='p-4 border-b'>
          <div className='flex items-start md:items-center justify-between gap-3 flex-col md:flex-row'>
            <div>
              <div className='text-sm font-medium'>Users</div>
              <div className='text-xs text-gray-500'>
                Change user roles (admin/user)
              </div>
            </div>

            <form
              onSubmit={onSearch}
              className='flex flex-col sm:flex-row gap-2 w-full md:w-auto'
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className='border rounded px-3 py-2 text-sm w-full sm:w-56'
                placeholder='Search name/email...'
              />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className='border rounded px-3 py-2 text-sm bg-white'
              >
                <option value=''>All roles</option>
                <option value='admin'>admin</option>
                <option value='user'>user</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className='border rounded px-3 py-2 text-sm bg-white'
              >
                <option value='createdAt_desc'>Newest</option>
                <option value='createdAt_asc'>Oldest</option>
                <option value='name_asc'>Name A-Z</option>
                <option value='name_desc'>Name Z-A</option>
              </select>

              <button
                type='submit'
                className='px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 text-sm'
              >
                Search
              </button>

              <button
                type='button'
                onClick={onClear}
                className='px-4 py-2 rounded border hover:bg-gray-50 text-sm'
              >
                Clear
              </button>
            </form>
          </div>
        </div>

        <div className='p-4 overflow-x-auto'>
          {loading && users.length === 0 ? (
            <div className='text-sm text-gray-500'>Loading users...</div>
          ) : users.length === 0 ? (
            <div className='text-sm text-gray-500'>No users found.</div>
          ) : (
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-xs text-gray-500 border-b'>
                  <th className='py-2 pr-3'>Name</th>
                  <th className='py-2 pr-3'>Email</th>
                  <th className='py-2 pr-3'>Role</th>
                  <th className='py-2 pr-3'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className='border-b last:border-b-0'>
                    <td className='py-2 pr-3'>
                      <div className='font-medium text-gray-900'>{u.name}</div>
                      <div className='text-xs text-gray-500'>ID: {u.id}</div>
                    </td>
                    <td className='py-2 pr-3 text-gray-700'>{u.email}</td>
                    <td className='py-2 pr-3'>
                      <span className='inline-flex items-center px-2 py-1 rounded border text-xs'>
                        {u.role}
                      </span>
                    </td>
                    <td className='py-2 pr-3'>
                      <div className='flex items-center gap-2'>
                        <select
                          className='border rounded px-2 py-1 text-sm bg-white'
                          value={u.role}
                          onChange={(e) => onRoleChange(u.id, e.target.value)}
                          disabled={loading}
                          title='Change role'
                        >
                          <option value='user'>user</option>
                          <option value='admin'>admin</option>
                        </select>
                      </div>
                      <div className='text-xs text-gray-400 mt-1'>
                        Role updates are admin-only.
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
