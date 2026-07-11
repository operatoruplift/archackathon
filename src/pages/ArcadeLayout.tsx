import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ArcadeProvider } from '@/context/ArcadeContext';

export default function ArcadeLayout() {
  return (
    <ArcadeProvider>
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </ArcadeProvider>
  );
}
