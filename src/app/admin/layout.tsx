import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Chat RKT',
  description: 'Admin dashboard for managing chat sessions',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}