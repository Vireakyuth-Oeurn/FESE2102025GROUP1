'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/config/constants';

export default function AdminLayout({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link
              href={ROUTES.ADMIN.DASHBOARD}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Dashboard
            </Link>
            <Link
              href={ROUTES.ADMIN.USERS}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Users
            </Link>
            <Link
              href={ROUTES.ADMIN.PRODUCTS}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Products
            </Link>
            <Link
              href={ROUTES.ADMIN.CATEGORIES}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Categories
            </Link>
            <Link
              href={ROUTES.ADMIN.ORDERS}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Orders
            </Link>
            <Link
              href={ROUTES.ADMIN.LOGS}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Activity Logs
            </Link>
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600">
                  <span className="text-lg font-medium leading-none text-white">
                    {user?.email?.[0]?.toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs font-medium text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
} 