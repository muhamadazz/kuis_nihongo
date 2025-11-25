# Japanese Quiz Application

Aplikasi kuis bahasa Jepang interaktif dengan tiga kategori pembelajaran: Kotoba (Kosakata), Bunpo (Tata Bahasa), dan Kanji (Karakter Jepang).

## Fitur

- **3 Kategori Quiz**
  - **Kotoba** - Kosakata bahasa Jepang
  - **Bunpo** - Tata bahasa dengan sub-bab
  - **Kanji** - Karakter Jepang

- **Sistem Quiz**
  - 10 soal diambil secara random dari database untuk setiap sesi
  - Tampilan pilihan ganda dengan feedback instan
  - Tracking skor real-time
  - Hasil akhir dengan persentase keberhasilan

- **Admin Panel**
  - Tambah soal baru ke database
  - Kelola kategori dan bab

## Teknologi

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Firebase Firestore
- **Build Tool**: Vite

## Instalasi

### Prasyarat
- Node.js 18+
- npm atau yarn

### Setup

1. Clone repository
```bash
git clone <repository-url>
cd project
```

2. Install dependencies
```bash
npm install
```

3. Konfigurasi Firebase
   - Buat file `.env` di root project
   - Tambahkan konfigurasi Firebase Anda:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Jalankan development server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5173`

## Build untuk Production

```bash
npm run build
```

Output akan tersimpan di folder `dist/`

## Penggunaan

### Menu Utama
Pilih salah satu dari tiga kategori quiz:
- Klik **Kotoba** untuk quiz kosakata
- Klik **Bunpo** untuk memilih bab tata bahasa
- Klik **Kanji** untuk quiz karakter Jepang

### Mengerjakan Quiz
1. Baca pertanyaan dengan teliti
2. Pilih salah satu dari 4 pilihan jawaban (A, B, C, D)
3. Jawaban benar ditandai hijau, jawaban salah ditandai merah
4. Klik "Soal Berikutnya" untuk lanjut ke pertanyaan berikutnya
5. Setelah semua 10 soal selesai, lihat hasil akhir

### Admin Panel
Klik ikon gear (⚙️) di pojok kanan atas untuk membuka admin panel:
- Tambah soal baru dengan lengkap (pertanyaan, 4 pilihan, jawaban benar)
- Pilih kategori dan bab yang sesuai
- Data akan disimpan otomatis ke Firebase

## Struktur Database

### Collections di Firebase Firestore

**categories**
- `id` - ID unik kategori
- `name` - Nama kategori (Kotoba, Bunpo, Kanji)
- `slug` - URL slug
- `description` - Deskripsi kategori

**chapters**
- `id` - ID unik bab
- `categoryId` - Referensi ke kategori
- `title` - Judul bab
- `order` - Urutan bab

**questions**
- `id` - ID unik pertanyaan
- `categoryId` - Referensi ke kategori
- `chapterId` - Referensi ke bab (opsional)
- `questionText` - Teks pertanyaan
- `optionA`, `optionB`, `optionC`, `optionD` - Pilihan jawaban
- `correctAnswer` - Jawaban benar (a, b, c, atau d)
- `createdAt` - Timestamp pembuatan

## Scripts

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run preview` - Preview build production lokal
- `npm run lint` - Jalankan ESLint
- `npm run typecheck` - Type checking dengan TypeScript

## Lisensi

Dibuat oleh ninjin 🥕
