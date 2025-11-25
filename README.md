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
  - Upload foto soal ke Cloudinary
  - Kelola kategori dan bab

## Teknologi

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Firebase Firestore
- **Cloud Storage**: Cloudinary
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

3. Konfigurasi Firebase dan Cloudinary
   - Buat file `.env` di root project
   - Tambahkan konfigurasi Firebase dan Cloudinary Anda:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

4. Setup Cloudinary (untuk fitur upload foto)
   - Buat akun di [Cloudinary](https://cloudinary.com)
   - Login ke dashboard Cloudinary
   - Dapatkan Cloud Name dari dashboard
   - Buat Upload Preset:
     - Pergi ke Settings > Upload
     - Scroll ke bagian "Upload presets"
     - Klik "Add upload preset"
     - Pilih mode "Unsigned"
     - Simpan preset name
   - Isi `.env` dengan Cloud Name dan Upload Preset yang didapat

5. Jalankan development server
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
- Upload foto untuk soal (opsional) - foto akan otomatis di-upload ke Cloudinary
- Pilih kategori sesuai dengan jenis soal

**Perbedaan Form berdasarkan Kategori:**
- **Kotoba (Kosakata) & Kanji**: Soal langsung ditambahkan tanpa pilih bab, dapat diakses dari kategori
- **Bunpo (Tata Bahasa)**: Wajib memilih bab terlebih dahulu, soal akan tersimpan dalam bab yang dipilih
- Data akan disimpan otomatis ke Firebase

## Struktur Database

### Collections di Firebase Firestore

**categories**
- `id` (string) - ID unik kategori (auto-generated)
- `name` (string) - Nama kategori (Kotoba, Bunpo, Kanji)
- `slug` (string) - URL slug untuk routing
- `createdAt` (timestamp) - Waktu pembuatan data

**chapters**
- `id` (string) - ID unik bab (auto-generated)
- `categoryId` (string) - Referensi ke kategori (foreign key)
- `title` (string) - Judul bab
- `chapterNumber` (number) - Nomor urutan bab
- `createdAt` (timestamp) - Waktu pembuatan data

**questions**
- `id` (string) - ID unik pertanyaan (auto-generated)
- `categoryId` (string) - Referensi ke kategori (foreign key)
- `chapterId` (string | null) - Referensi ke bab, null jika tidak ada bab
- `questionText` (string) - Teks pertanyaan
- `imageUrl` (string | null) - URL foto dari Cloudinary (opsional)
- `optionA` (string) - Pilihan jawaban A
- `optionB` (string) - Pilihan jawaban B
- `optionC` (string) - Pilihan jawaban C
- `optionD` (string) - Pilihan jawaban D
- `correctAnswer` (string) - Jawaban benar ('a', 'b', 'c', atau 'd')
- `createdAt` (timestamp) - Waktu pembuatan data

## Penjelasan Struktur Quiz

### Flow untuk Kotoba & Kanji
```
User Membuka App
    ↓
Pilih Kategori (Kotoba/Kanji)
    ↓
Quiz Dimulai (ambil 10 soal random dari kategori)
    ↓
Jawab Soal
```
**Struktur Database**: Soal disimpan dengan `chapterId = null`

### Flow untuk Bunpo
```
User Membuka App
    ↓
Pilih Kategori (Bunpo)
    ↓
Pilih Bab/Chapter
    ↓
Quiz Dimulai (ambil 10 soal dari bab yang dipilih)
    ↓
Jawab Soal
```
**Struktur Database**: Soal disimpan dengan `chapterId = <id bab tertentu>`

### Flow Admin - Menambah Soal Kotoba/Kanji
```
Buka Admin Panel
    ↓
Pilih Kategori (Kotoba/Kanji)
    ↓
Isi Form Soal (tanpa pilih bab)
    ↓
Upload (chapterId otomatis = null)
```

### Flow Admin - Menambah Soal Bunpo
```
Buka Admin Panel
    ↓
Pilih Kategori (Bunpo)
    ↓
Pilih Bab (WAJIB)
    ↓
Isi Form Soal
    ↓
Upload (chapterId = bab yang dipilih)
```

## Scripts

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run preview` - Preview build production lokal
- `npm run lint` - Jalankan ESLint
- `npm run typecheck` - Type checking dengan TypeScript

## Lisensi

Dibuat oleh ninjin 🥕
