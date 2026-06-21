# BMKG Maritim Tegal

Portal informasi cuaca maritim dan layanan publik berbasis Next.js untuk Stasiun Meteorologi Maritim Tegal – BMKG.

## Teknologi Utama

- **Framework:** Next.js 16 (React 19 + TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** MySQL + Drizzle ORM
- **Auth:** Custom JWT (HMAC-SHA256) + bcrypt
- **Animasi:** Framer Motion
- **Form:** React Hook Form + Zod
- **Testing:** Vitest (236 tests)
- **CI/CD:** GitHub Actions

## Fitur

### Halaman Publik
- Beranda (hero slider, prakiraan cuaca, informasi BMKG)
- About (visi-misi, struktur organisasi)
- Prakiraan cuaca maritim
- Layanan publik
- Dokumentasi kegiatan
- Buku tamu online
- Kontak

### Panel Admin (CMS)
- Dashboard statistik
- Manajemen prakiraan cuaca
- Manajemen publikasi / buletin
- Manajemen dokumentasi kegiatan
- Slider hero home
- Struktur organisasi
- Data buku tamu (CRUD + backup/restore)
- Kelola layanan
- Display digital otomatis
- Manajemen user
- History login
- Pengaturan (ganti password)

### Keamanan
- **CSRF Protection** — double-submit cookie pattern
- **Rate Limiting** — login (5/menit), create user (10/menit), buku tamu (5/menit)
- **Timing-safe** token comparison
- **RBAC** — role-based access control (super_admin, admin, karyawan)
- **Audit logging** — 39 log points untuk operasi sensitif
- **Security headers** — CSP, HSTS, X-Frame-Options, X-XSS-Protection

## Cara Install & Jalankan

### Prasyarat

| Software | Minimal Versi |
|----------|--------------|
| Node.js | 20.x LTS |
| npm | 9+ |
| MySQL | 8.0+ |

### Langkah-langkah

```bash
# 1. Clone repository
git clone <url-repository>
cd BMKG-Maritim-Tegal

# 2. Install dependency
npm install

# 3. Konfigurasi environment
cp .env.example .env
# Edit .env sesuai konfigurasi server

# 4. Jalankan development
npm run dev
```

### Build & Production

```bash
npm run build
npm run start
```

### Testing

```bash
npm run test           # Run semua tests (236 tests)
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npm run typecheck      # TypeScript check
```

## Environment Variables

| Variabel | Wajib | Fungsi |
|----------|-------|--------|
| `MYSQL_HOST` | Ya | Host MySQL |
| `MYSQL_PORT` | Ya | Port MySQL |
| `MYSQL_USER` | Ya | Username MySQL |
| `MYSQL_PASSWORD` | Ya | Password MySQL |
| `MYSQL_DATABASE` | Ya | Nama database |
| `TOKEN_SECRET` | Ya | Secret untuk JWT (random hex 32 bytes) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Tidak | reCAPTCHA site key |
| `RECAPTCHA_SECRET_KEY` | Tidak | reCAPTCHA secret key |
| `BMKG_API_URL` | Tidak | URL API BMKG |
| `BMKG_CACHE_TTL` | Tidak | Cache TTL (ms) |
| `OPENWEATHER_API_KEY` | Tidak | API key OpenWeatherMap |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Tidak | Nomor WhatsApp |

## Database

10 tabel: `users`, `buku_tamu`, `hero_images`, `prakiraan_images`, `prakiraan_categories`, `kegiatan_documents`, `layanan_cards`, `struktur_organisasi`, `display_slides`, `publications`, `login_logs`.

Migration: `npx drizzle-kit push`

## Role Pengguna

| Role | Akses |
|------|-------|
| `super_admin` | Full akses (manajemen users, semua CRUD) |
| `admin` | Semua fitur kecuali manajemen users |
| `karyawan` | Terbatas (dashboard, history login, ganti password) |

## Struktur Project

```
app/
├── api/                    # API routes
│   ├── admin/              # Admin endpoints (protected)
│   ├── submit/             # Public endpoints
│   ├── weather/            # Weather proxy
│   └── bmkg/               # BMKG API proxy
├── admin/                  # Admin pages
├── about/                  # About pages
├── prakiraan/              # Prakiraan pages
├── layanan/                # Layanan page
├── kegiatan/               # Kegiatan page
├── kontak/                 # Kontak page
└── buku_tamu/              # Buku tamu page
components/                 # Reusable components
db/                         # Database schema + connection
hooks/                      # Custom React hooks
lib/                        # Utilities (auth, validation, storage)
services/                   # Business logic layer
types/                      # TypeScript types
scripts/                    # Seed + test scripts
```

## Deployment (VPS BMKG)

Project di-deploy ke VPS BMKG sendiri.

```bash
# Build
npm run build

# Jalankan dengan PM2
pm2 start npm --name "bmkg-tegal" -- start
```

## License

Internal — Stasiun Meteorologi Maritim Tegal, BMKG.
