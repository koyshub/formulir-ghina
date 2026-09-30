# Formulir List Akad & Sungkeman — GHINA MC EVENTS

Halaman web untuk klien mengisi data akad & sungkeman. Setelah diisi:

1. PDF dibuat langsung di HP klien (kop GHINA MC EVENTS, sama dengan PDF di aplikasi MC View).
2. Klien menekan **Kirim PDF ke WhatsApp** → pilih WhatsApp → chat Ghina, PDF terlampir.
   Cadangan: **Kirim sebagai pesan teks** langsung membuka chat Ghina berisi data.
3. Di aplikasi MC View, PDF atau pesan teks itu dibagikan ke MC View
   (tekan lama → Bagikan → MC View) atau dipilih dari menu **Formulir Klien**,
   lalu acara terbuat otomatis beserta biodatanya.

Tidak ada server dan tidak ada database: data hanya ada di HP klien sampai dikirim lewat WhatsApp.

## Nomor WhatsApp tujuan

Link yang dikirim dari aplikasi sudah membawa nomor Ghina, misalnya
`https://namaakun.github.io/formulir-ghina/?wa=6281234567890`.
Nomor cadangan (kalau link dibuka tanpa `?wa=`) bisa diisi di `js/config.js`.

## Unggah ke GitHub Pages (gratis)

Cara termudah, tanpa perintah apa pun:

1. Masuk ke <https://github.com> (daftar gratis kalau belum punya akun).
2. Klik **New repository**, beri nama `formulir-ghina`, pilih **Public**, klik **Create repository**.
3. Klik **uploading an existing file**, lalu seret *semua isi* folder ini
   (index.html, folder `aset`, `css`, `js`, `vendor`, dan file lain) ke halaman itu. Klik **Commit changes**.
4. Buka **Settings → Pages**. Pada *Build and deployment*, pilih **Deploy from a branch**,
   branch **main**, folder **/ (root)**, lalu **Save**.
5. Tunggu 1–2 menit. Alamatnya: `https://NAMAAKUN.github.io/formulir-ghina/`.
6. Masukkan alamat itu di aplikasi MC View → **Formulir Klien** → *Alamat formulir*.

## Mencoba di laptop

```
node tools/server.js          # buka http://127.0.0.1:8765/
node tools/uji.js             # buat contoh PDF & teks di folder out/
```

Isi folder `out/` dipakai tes aplikasi MC View (`test/data/`) untuk memastikan
aplikasi selalu bisa membaca PDF dan teks dari formulir ini.

## Isi folder

- `index.html`, `css/gaya.css` — tampilan formulir.
- `js/data.js` — daftar isian (kuncinya sama dengan biodata di aplikasi).
- `js/pdf.js` — pembuat PDF (pdf-lib), termasuk data untuk impor aplikasi.
- `js/teks.js` — pesan teks WhatsApp.
- `js/app.js` — alur isi → PDF → kirim.
- `aset/` — logo dan font Carlito (lisensi SIL OFL), sudah dipangkas ke huruf Latin.
- `vendor/` — pdf-lib dan fontkit (lisensi MIT).
