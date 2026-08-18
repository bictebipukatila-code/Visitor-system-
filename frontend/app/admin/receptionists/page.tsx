'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';

interface Receptionist {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export default function ReceptionistsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReceptionists = () => {
    api
      .get('/users/receptionists')
      .then((res) => setReceptionists(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchReceptionists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/auth/register', { ...formData, role: 'RECEPTIONIST' });
      setFormData({ name: '', email: '', password: '', address: '', phone: '' });
      fetchReceptionists();
      showToast('Receptionist created successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create receptionist');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      await api.patch(`/users/${id}`, { isActive: !currentStatus });
      fetchReceptionists();
      showToast(currentStatus ? 'Receptionist disabled' : 'Receptionist enabled');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredReceptionists = receptionists.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  });

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Receptionist Management
        </h1>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Add New Receptionist
          </h2>

          {error && (
            <div className="mb-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
              required
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              required
              className="col-span-2 rounded border border-gray-300 px-3 py-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="col-span-2 rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Receptionist'}
            </button>
          </form>
        </div>

        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full max-w-sm rounded border border-gray-300 px-3 py-2"
        />

        <table className="w-full rounded-lg bg-white shadow">
          <thead>
            <tr className="border-b bg-gray-100 text-left text-sm text-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Address</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceptionists.map((r) => (
              <tr key={r.id} className="border-b text-sm">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">{r.address}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      r.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {r.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleActive(r.id, r.isActive)}
                    disabled={togglingId === r.id}
                    className={`rounded px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                      r.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {togglingId === r.id
                      ? 'Updating...'
                      : r.isActive
                      ? 'Disable'
                      : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}