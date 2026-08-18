'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') {
      router.push('/receptionist/dashboard');
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            onClick={() => router.push('/admin/blacklist')}
            className="rounded-lg bg-white p-6 text-left shadow hover:bg-gray-50"
          >
            <div className="text-lg font-semibold text-gray-800">Blacklist</div>
            <div className="text-sm text-gray-500">Manage blacklisted visitors</div>
          </button>

          <button
            onClick={() => router.push('/admin/receptionists')}
            className="rounded-lg bg-white p-6 text-left shadow hover:bg-gray-50"
          >
            <div className="text-lg font-semibold text-gray-800">Receptionists</div>
            <div className="text-sm text-gray-500">Manage receptionist accounts</div>
          </button>

          <button
            onClick={() => router.push('/admin/reports')}
            className="rounded-lg bg-white p-6 text-left shadow hover:bg-gray-50"
          >
            <div className="text-lg font-semibold text-gray-800">Reports</div>
            <div className="text-sm text-gray-500">Generate visit reports</div>
          </button>
        </div>
      </div>
    </div>
  );
}