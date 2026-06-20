"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-sky-50 to-white">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">Error</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Terjadi Kesalahan</h2>
        <p className="text-slate-500 mb-8">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
        >
          Coba Lagi
        </button>
      </div>
    </main>
  );
}
