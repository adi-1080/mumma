import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Profile - Mumma\'s Kitchen',
  description: 'Manage your profile and account settings',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
