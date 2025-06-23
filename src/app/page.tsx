import { redirect } from 'next/navigation';

export const viewport = {
  themeColor: '#26E600',
};

export default function HomePage() {
  redirect('/dashboard');
  return null; 
}