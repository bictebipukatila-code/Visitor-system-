'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function EditVisitorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    purposeOfVisit: '',
    department: '',
    personToVisit: '',
    remarks: '',
  });
  const [visitorName, setVisitorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api
      .get(`/visitor/${id}`)
      .then((res) => {
        const visit = res.data;
        setVisitorName(visit.visitor.fullName);
        setFormData({
          purposeOfVisit: visit.purposeOfVisit,
          department: visit.department,
          personToVisit: visit.personToVisit,
          remarks: visit.remarks || '',
        });
      })
      .catch(() => {
        setError('Failed to load visit details');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.patch(`/visitor/${id}`, formData);
      setSuccess('Visit updated successfully!');
      setTimeout(() => {
        router.push('/receptionist/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update visit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        <div className="mx-auto max-w-xl rounded-lg bg-white p-8 shadow">
          <h1 className="mb-1 text-2xl font-bold text-gray-800">
            Edit Visit
          </h1>
          <p className="mb-6 text-sm text-gray-500">{visitorName}</p>

          {error && (
            <div className="mb-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded bg-green-100 px-4 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Purpose of Visit
              </label>
              <input
                name="purposeOfVisit"
                value={formData.purposeOfVisit}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Person to Visit
              </label>
              <input
                name="personToVisit"
                value={formData.personToVisit}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Remarks (optional)
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/receptionist/dashboard')}
                className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}