import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <span className="text-6xl" aria-hidden="true">
        💎
      </span>
      <h1 className="font-display text-5xl font-bold text-ink">404</h1>
      <Link
        to="/"
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-teal"
      >
        Crystal Z
      </Link>
    </main>
  );
}
