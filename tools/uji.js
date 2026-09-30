/*
 * Uji formulir tanpa browser: buat PDF dan pesan teks dari data contoh.
 *   node tools/uji.js [folder_keluaran]
 * Hasilnya dipakai tes aplikasi MC View (impor PDF & teks formulir).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const akar = path.join(__dirname, '..');
globalThis.PDFLib = require(path.join(akar, 'vendor/pdf-lib.min.js'));
const fontkit = require(path.join(akar, 'vendor/fontkit.umd.min.js'));
require(path.join(akar, 'js/data.js'));
const { buatTeks } = require(path.join(akar, 'js/teks.js'));
const { buatPdf } = require(path.join(akar, 'js/pdf.js'));

const contoh = {
  diisi: '30 September 2026',
  acara: {
    jenis: 'Akad & Resepsi Nikah',
    tanggal: '2026-10-11',
    jam: '08:00',
    lokasi: 'Gedung Serbaguna Cisauk',
    wa: '0812 9876 5432',
  },
  bio: {
    disandingkan: 'tidak',
    maps: 'https://maps.app.goo.gl/AbCdEf123',
    nama_cpw: 'Sari Fadilah', panggilan_cpw: 'Teteh', ig_cpw: '@sarifadilah',
    anak_ke_cpw: '2', jumlah_saudara_cpw: '3',
    ayah_cpw: 'Karnadi', sebutan_ayah_cpw: 'Bapa',
    ibu_cpw: 'Komariah', alm_ibu_cpw: 'ya', ibu_sambung_cpw: 'Siti Aminah',
    sebutan_ibu_cpw: 'Mamah',
    kakak_cpw: 'Rina Fadilah', adik_cpw: 'Sri Komala\nDewi Lestari',
    nama_cpp: 'Muhammad Dimas Anindityo', panggilan_cpp: 'Nang',
    ig_cpp: 'https://instagram.com/dimas.anin',
    ayah_cpp: 'Slamet Suroyo', ibu_cpp: 'Asih Ponisih', alm_ibu_cpp: 'ya',
    sebutan_ayah_cpp: 'Bapak', sebutan_ibu_cpp: 'Ibu',
    kakak_cpp: 'Metiara Anisa', adik_cpp: '',
    wali: 'Bp Karnadi', saksi_cpw: 'Bp Asli', saksi_cpp: 'Bp Ahmad Fauzi',
    penghulu: 'Bp Khaerudin, S.Ag', kua: 'Cisauk',
    qori: 'Ust Mistam', jubir_cpw: 'Bp Odih', jubir_cpp: 'Bp Lukman',
    nasihat: 'KH. Abdul Rozak 😊',
    dekorasi: 'Nd Decoration', mua: 'Iniwinibeauty', dokumentasi: 'Magenta photograph.id',
    hiburan: 'Bosscoustic', henna: 'Henna by Rara', seserahan: '', wcc: 'Semaya Moment',
    wo: 'Semaya WO', catering: 'Dapur Ibu',
  },
};

(async () => {
  const keluar = process.argv[2] || path.join(akar, 'out');
  fs.mkdirSync(keluar, { recursive: true });
  const aset = {
    fontkit,
    reguler: fs.readFileSync(path.join(akar, 'aset/Carlito-Regular.ttf')),
    tebal: fs.readFileSync(path.join(akar, 'aset/Carlito-Bold.ttf')),
    logo: fs.readFileSync(path.join(akar, 'aset/logo-bulat.png')),
  };
  const pdf = await buatPdf(contoh, aset);
  fs.writeFileSync(path.join(keluar, 'formulir_contoh.pdf'), pdf);
  fs.writeFileSync(path.join(keluar, 'formulir_contoh.txt'), buatTeks(contoh), 'utf8');
  fs.writeFileSync(path.join(keluar, 'formulir_contoh.json'), JSON.stringify(contoh, null, 2), 'utf8');
  console.log('PDF', pdf.length, 'byte ->', keluar);
})().catch((e) => { console.error(e); process.exit(1); });
