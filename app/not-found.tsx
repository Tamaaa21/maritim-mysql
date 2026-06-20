import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-sky-50 to-white">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-sky-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-8">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
