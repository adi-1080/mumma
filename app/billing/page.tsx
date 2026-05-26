import { redirect } from 'next/navigation';

export default function BillingPage() {
  redirect('/pricing');
}

export const metadata = {
  title: "Billing | Mumma's Kitchen",
  description: "Manage your Mumma's Kitchen subscription, view plan benefits, and track your voice characters usage.",
};
