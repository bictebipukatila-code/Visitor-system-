'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';

interface Visit {
  id: number;
  purposeOfVisit: string;
  visitStatus: string;
  checkInTime: string;
  checkOutTime: string | null;
  visitor: {
    fullName: string;
    phone: string;
  };
}

export default function ReceptionistDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const fetchVisits = () => {
    api
      .get('/visitor')
      .then((res) => {
        setVisits(res.data);
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleCheckOut = async (id: number) => {
    setCheckingOutId(id);
    try {
      await api.patch(`/visitor/${id}/checkout`);
      fetchVisits();
      showToast('Visitor checked out successfully');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to check out visitor', 'error');
    } finally {
      setCheckingOutId(null);
    }
  };

  const filteredVisits = visits.filter((visit) => {
    const q = search.toLowerCase();
    return (
      visit.visitor.fullName.toLowerCase().includes(q) ||
      visit.visitor.phone.includes(q)
    );
  });

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Receptionist Dashboard
          </h1>
          <button
            onClick={() => router.push('/receptionist/register-visitor')}
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            + Register Visitor
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full max-w-sm rounded border border-gray-300 px-3 py-2"
        />

        <table className="w-full rounded-lg bg-white shadow">
          <thead>
            <tr className="border-b bg-gray-100 text-left text-sm text-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Purpose</th>
              <th className="p-3">Status</th>
              <th className="p-3">Check-In Time</th>
              <th className="p-3">Check-Out Time</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit) => (
              <tr key={visit.id} className="border-b text-sm">
                <td className="p-3">{visit.visitor.fullName}</td>
                <td className="p-3">{visit.visitor.phone}</td>
                <td className="p-3">{visit.purposeOfVisit}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      visit.visitStatus === 'CHECKED_IN'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {visit.visitStatus}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(visit.checkInTime).toLocaleString()}
                </td>
                <td className="p-3">
                  {visit.checkOutTime
                    ? new Date(visit.checkOutTime).toLocaleString()
                    : '—'}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/receptionist/edit-visitor/${visit.id}`)}
                      className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    {visit.visitStatus === 'CHECKED_IN' ? (
                      <button
                        onClick={() => handleCheckOut(visit.id)}
                        disabled={checkingOutId === visit.id}
                        className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        {checkingOutId === visit.id ? 'Checking out...' : 'Check Out'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}