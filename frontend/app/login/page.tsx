'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/receptionist/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Welcome message */}
      <div className="hidden w-1/2 flex-col justify-center bg-blue-600 px-16 text-white md:flex">
        <h1 className="mb-4 text-4xl font-bold">
          Visitor Management System
        </h1>
        <p className="text-lg text-blue-100">
          Welcome to the Visitor Management System, where you can register,
          manage, and view all visitor activity in one place.
        </p>

        <div className="mt-10 space-y-4 text-blue-100">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
              ✓
            </span>
            <span>Register and track visitor check-ins</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
              ✓
            </span>
            <span>Manage blacklist and staff accounts</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
              ✓
            </span>
            <span>Generate and download detailed reports</span>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex w-full items-center justify-center bg-gray-50 px-6 md:w-1/2">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md"
        >
          <h2 className="mb-1 text-2xl font-bold text-gray-800">
            Welcome Back
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Log in to access your dashboard
          </p>

          {error && (
            <div className="mb-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}