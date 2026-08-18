'use client';

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="flex items-center justify-between bg-[#17203A] px-6 py-4 shadow-sm">
      <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-white">
        Visitor<span className="text-[#E3A438]">MS</span>
      </span>
      <button
        onClick={handleLogout}
        className="rounded border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-[#E3A438] hover:text-[#E3A438]"
      >
        Logout
      </button>
    </nav>
  );
}