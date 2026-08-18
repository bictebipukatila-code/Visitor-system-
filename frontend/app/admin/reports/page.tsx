'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

interface Visit {
  id: number;
  purposeOfVisit: string;
  department: string;
  personToVisit: string;
  visitStatus: string;
  checkInTime: string;
  checkOutTime: string | null;
  visitor: {
    fullName: string;
    phone: string;
    email: string;
    nationalId: string;
    companyName: string;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [visits, setVisits] = useState<Visit[]>([]);
  const [totalVisits, setTotalVisits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setChecking(false);
  }, [router]);

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/reports', {
        params: { startDate, endDate },
      });
      setVisits(res.data.visits);
      setTotalVisits(res.data.totalVisits);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get('/reports/download', {
        params: { startDate, endDate },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `visitor-report-${startDate}-to-${endDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (checking) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Visitor Reports
        </h1>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>

            {totalVisits !== null && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="rounded border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {downloading ? 'Downloading...' : 'Download CSV'}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {totalVisits !== null && (
            <div className="mt-4 text-sm text-gray-600">
              Total Visits:{' '}
              <span className="font-semibold text-gray-800">
                {totalVisits}
              </span>
            </div>
          )}
        </div>

        {totalVisits !== null && (
          <table className="w-full rounded-lg bg-white shadow">
            <thead>
              <tr className="border-b bg-gray-100 text-left text-sm text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Company</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Department</th>
                <th className="p-3">Status</th>
                <th className="p-3">Check-In</th>
                <th className="p-3">Check-Out</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-b text-sm">
                  <td className="p-3">{visit.visitor.fullName}</td>
                  <td className="p-3">{visit.visitor.phone}</td>
                  <td className="p-3">{visit.visitor.companyName}</td>
                  <td className="p-3">{visit.purposeOfVisit}</td>
                  <td className="p-3">{visit.department}</td>
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
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    No visits found for this date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
                          