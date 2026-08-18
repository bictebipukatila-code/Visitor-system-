'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';

interface BlacklistEntry {
  id: number;
  fullName: string;
  nationalId: string;
  phone: string;
  reason: string;
  blacklistedDate: string;
}

interface VisitorOption {
  fullName: string;
  phone: string;
  nationalId: string;
  email: string;
  companyName: string;
}

export default function BlacklistPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    phone: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showVisitors, setShowVisitors] = useState(false);
  const [visitors, setVisitors] = useState<VisitorOption[]>([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [visitorSearch, setVisitorSearch] = useState('');

  const fetchEntries = () => {
    api
      .get('/blacklist')
      .then((res) => setEntries(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchEntries();
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
      await api.post('/blacklist', formData);
      setFormData({ fullName: '', nationalId: '', phone: '', reason: '' });
      fetchEntries();
      showToast('Added to blacklist successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add to blacklist');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Remove this person from the blacklist?')) return;

    setRemovingId(id);
    try {
      await api.delete(`/blacklist/${id}`);
      fetchEntries();
      showToast('Removed from blacklist');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove entry', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleVisitors = () => {
    const next = !showVisitors;
    setShowVisitors(next);

    if (next) {
      setLoadingVisitors(true);
      api
        .get('/visitor')
        .then((res) => {
          const uniqueVisitors: VisitorOption[] = [];
          const seen = new Set<string>();
          for (const visit of res.data) {
            if (!seen.has(visit.visitor.nationalId)) {
              seen.add(visit.visitor.nationalId);
              uniqueVisitors.push({
                fullName: visit.visitor.fullName,
                phone: visit.visitor.phone,
                nationalId: visit.visitor.nationalId,
                email: visit.visitor.email,
                companyName: visit.visitor.companyName,
              });
            }
          }
          setVisitors(uniqueVisitors);
        })
        .catch(() => {
          showToast('Failed to load visitors', 'error');
        })
        .finally(() => setLoadingVisitors(false));
    }
  };

  const handleQuickBlacklist = (visitor: VisitorOption) => {
    setFormData({
      fullName: visitor.fullName,
      nationalId: visitor.nationalId,
      phone: visitor.phone,
      reason: '',
    });
    setShowVisitors(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredEntries = entries.filter((entry) => {
    const q = search.toLowerCase();
    return (
      entry.fullName.toLowerCase().includes(q) ||
      entry.nationalId.toLowerCase().includes(q) ||
      entry.phone.includes(q)
    );
  });

  const filteredVisitors = visitors.filter((v) => {
    const q = visitorSearch.toLowerCase();
    return (
      v.fullName.toLowerCase().includes(q) ||
      v.nationalId.toLowerCase().includes(q) ||
      v.phone.includes(q)
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
          Blacklist Management
        </h1>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Add to Blacklist
          </h2>

          {error && (
            <div className="mb-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              placeholder="National ID"
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
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Reason"
              required
              className="rounded border border-gray-300 px-3 py-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="col-span-2 rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add to Blacklist'}
            </button>
          </form>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, National ID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded border border-gray-300 px-3 py-2"
          />
          <button
            onClick={handleToggleVisitors}
            className="whitespace-nowrap rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {showVisitors ? 'Hide Visitors' : 'View All Visitors'}
          </button>
        </div>

        {showVisitors && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              All Registered Visitors
            </h2>

            <input
              type="text"
              placeholder="Search visitors..."
              value={visitorSearch}
              onChange={(e) => setVisitorSearch(e.target.value)}
              className="mb-4 w-full max-w-sm rounded border border-gray-300 px-3 py-2"
            />

            {loadingVisitors ? (
              <div className="text-sm text-gray-500">Loading visitors...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-600">
                    <th className="p-2">Name</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">National ID</th>
                    <th className="p-2">Company</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.map((v) => (
                    <tr key={v.nationalId} className="border-b text-sm">
                      <td className="p-2">{v.fullName}</td>
                      <td className="p-2">{v.phone}</td>
                      <td className="p-2">{v.nationalId}</td>
                      <td className="p-2">{v.companyName}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleQuickBlacklist(v)}
                          className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          Blacklist
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredVisitors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No visitors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        <table className="w-full rounded-lg bg-white shadow">
          <thead>
            <tr className="border-b bg-gray-100 text-left text-sm text-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">National ID</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Blacklisted Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="border-b text-sm">
                <td className="p-3">{entry.fullName}</td>
                <td className="p-3">{entry.nationalId}</td>
                <td className="p-3">{entry.phone}</td>
                <td className="p-3">{entry.reason}</td>
                <td className="p-3">
                  {new Date(entry.blacklistedDate).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleRemove(entry.id)}
                    disabled={removingId === entry.id}
                    className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    {removingId === entry.id ? 'Removing...' : 'Remove'}
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