import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Landing from '@/pages/Landing';

const ArcadeLayout = lazy(() => import('@/pages/ArcadeLayout'));
const Login = lazy(() => import('@/pages/Login'));
const Arcade = lazy(() => import('@/pages/Arcade'));
const Rewards = lazy(() => import('@/pages/Rewards'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <span className="animate-crystal-pulse text-5xl" role="status" aria-label="Loading">
        💎
      </span>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<ArcadeLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/arcade" element={<Arcade />} />
              <Route path="/rewards" element={<Rewards />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
