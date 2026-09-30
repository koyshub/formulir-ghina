/*
 * Daftar isian formulir "List Akad & Sungkeman".
 *
 * Satu sumber untuk tiga hal: tampilan formulir, PDF, dan pesan teks
 * WhatsApp. Kunci (k) sama dengan kunci biodata di aplikasi MC View, jadi
 * aplikasi bisa langsung membuat acara dari PDF atau teks hasil formulir.
 * Kunci berawalan "acara." adalah data acara (tanggal, jam, lokasi, WA),
 * sisanya masuk ke biodata acara.
 */
(function (root) {
  'use strict';

  function mempelai(s) {
    const S = s.toUpperCase();
    const siapa = s === 'cpw' ? 'wanita' : 'pria';
    return [
      { k: 'nama_' + s, label: 'Nama lengkap calon pengantin ' + siapa,
        teks: 'Nama Lengkap ' + S, wajib: true,
        petunjuk: s === 'cpw' ? 'contoh: Sari Fadilah' : 'contoh: Muhammad Dimas Anindityo' },
      { k: 'panggilan_' + s, label: 'Panggilan orang tua ke ' + S,
        teks: 'Panggilan orangtua ke ' + S,
        petunjuk: s === 'cpw' ? 'contoh: Teteh, Neng, Kakak' : 'contoh: Mas, Aa, Abang' },
      { k: 'ig_' + s, label: 'Instagram ' + S, teks: 'Instagram ' + S, jenis: 'ig',
        petunjuk: 'username' },
      { k: 'anak_ke_' + s, label: 'Anak ke-', teks: 'Anak ke', jenis: 'angka',
        lebar: 'setengah' },
      { k: 'jumlah_saudara_' + s, label: 'dari ... bersaudara',
        teks: 'Jumlah bersaudara', jenis: 'angka', lebar: 'setengah' },
      { k: 'ayah_' + s, label: 'Nama lengkap Bapak', teks: 'Nama Bapak',
        alm: 'alm_ayah_' + s, almLabel: 'Almarhum', almTanda: 'Alm',
        sambung: 'ayah_sambung_' + s, sambungLabel: 'Nama Bapak sambung (jika ada)',
        sambungTeks: 'Bapak sambung' },
      { k: 'ibu_' + s, label: 'Nama lengkap Ibu', teks: 'Nama Ibu',
        alm: 'alm_ibu_' + s, almLabel: 'Almarhumah', almTanda: 'Almh',
        sambung: 'ibu_sambung_' + s, sambungLabel: 'Nama Ibu sambung (jika ada)',
        sambungTeks: 'Ibu sambung' },
      { k: 'sebutan_ayah_' + s, label: 'Panggilan ke Bapak',
        teks: 'Panggilan ' + S + ' ke Bapak', petunjuk: 'Bapa / Papa',
        lebar: 'setengah' },
      { k: 'sebutan_ibu_' + s, label: 'Panggilan ke Ibu',
        teks: 'Panggilan ' + S + ' ke Ibu', petunjuk: 'Mamah / Umi',
        lebar: 'setengah' },
      { k: 'kakak_' + s, label: 'Nama kakak', teks: 'Nama Kakak', jenis: 'banyak',
        petunjuk: 'Satu nama per baris. Kosongkan bila tidak ada.' },
      { k: 'adik_' + s, label: 'Nama adik', teks: 'Nama Adik', jenis: 'banyak',
        petunjuk: 'Satu nama per baris. Kosongkan bila tidak ada.' },
    ];
  }

  const BAGIAN = [
    {
      id: 'acara', judul: 'Info Acara', ikon: '💍', teks: 'Info Acara',
      keterangan: 'Kapan dan di mana akad nikah berlangsung.',
      isian: [
        { k: 'acara.jenis', label: 'Jenis acara', teks: 'Jenis acara',
          jenis: 'pilihan', bawaan: 'Akad Nikah',
          pilihan: ['Akad Nikah', 'Akad & Resepsi Nikah', 'Resepsi Nikah', 'Lamaran'] },
        { k: 'acara.tanggal', label: 'Tanggal acara', teks: 'Tanggal acara',
          jenis: 'tanggal', wajib: true, lebar: 'setengah' },
        { k: 'acara.jam', label: 'Jam akad nikah', teks: 'Jam Akad nikah',
          jenis: 'jam', wajib: true, lebar: 'setengah' },
        { k: 'disandingkan', label: 'Akad disandingkan?', teks: 'Akad disandingkan',
          jenis: 'yatidak' },
        { k: 'acara.lokasi', label: 'Lokasi acara', teks: 'Lokasi acara', wajib: true,
          petunjuk: 'Nama gedung / rumah dan alamat singkat' },
        { k: 'maps', label: 'Link Google Maps lokasi', teks: 'Maps', jenis: 'url',
          petunjuk: 'https://maps.app.goo.gl/...',
          bantuan: 'Buka Google Maps, cari lokasinya, ketuk Bagikan, lalu Salin link.' },
        { k: 'acara.wa', label: 'No. WhatsApp yang bisa dihubungi', teks: 'WhatsApp',
          jenis: 'telp', wajib: true, petunjuk: '0812 3456 7890',
          bantuan: 'Susunan acara nanti dikirim ke nomor ini.' },
      ],
    },
    {
      id: 'cpw', judul: 'Keluarga Inti CPW', ikon: '👰', teks: 'Data Keluarga Inti CPW',
      keterangan: 'Calon pengantin wanita dan keluarga intinya.',
      isian: mempelai('cpw'),
    },
    {
      id: 'cpp', judul: 'Keluarga Inti CPP', ikon: '🤵', teks: 'Data Keluarga Inti CPP',
      keterangan: 'Calon pengantin pria dan keluarga intinya.',
      isian: mempelai('cpp'),
    },
    {
      id: 'perangkat', judul: 'Perangkat Nikah', ikon: '📜', teks: 'Perangkat Nikah',
      keterangan: 'Kosongkan yang belum diketahui.',
      isian: [
        { k: 'wali', label: 'Wali nikah', teks: 'Wali Nikah' },
        { k: 'saksi_cpw', label: 'Saksi CPW', teks: 'Saksi CPW', lebar: 'setengah' },
        { k: 'saksi_cpp', label: 'Saksi CPP', teks: 'Saksi CPP', lebar: 'setengah' },
        { k: 'penghulu', label: 'Penghulu', teks: 'Penghulu' },
        { k: 'kua', label: 'KUA kecamatan', teks: 'KUA Kecamatan' },
      ],
    },
    {
      id: 'pengisi', judul: 'Pengisi Acara', ikon: '🎤', teks: 'Pengisi Acara',
      keterangan: 'Kosongkan yang belum diketahui.',
      isian: [
        { k: 'qori', label: 'Qori', teks: 'Qori' },
        { k: 'jubir_cpw', label: 'Perwakilan sambutan keluarga CPW',
          teks: 'Perwakilan Sambutan CPW' },
        { k: 'jubir_cpp', label: 'Perwakilan sambutan keluarga CPP',
          teks: 'Perwakilan Sambutan CPP' },
        { k: 'nasihat', label: 'Nasihat pernikahan', teks: 'Nasihat Pernikahan' },
      ],
    },
    {
      id: 'vendor', judul: 'Vendor', ikon: '✨', teks: 'Vendor',
      keterangan: 'Nama vendor atau akun Instagram-nya.',
      isian: [
        { k: 'dekorasi', label: 'Decor / backdrop', teks: 'Decor/backdrop', lebar: 'setengah' },
        { k: 'mua', label: 'MUA', teks: 'MUA', lebar: 'setengah' },
        { k: 'dokumentasi', label: 'Foto / video (FG/VG)', teks: 'FG/VG', lebar: 'setengah' },
        { k: 'hiburan', label: 'Entertain / sound', teks: 'Entertain/sound', lebar: 'setengah' },
        { k: 'henna', label: 'Henna art', teks: 'Henna art', lebar: 'setengah' },
        { k: 'seserahan', label: 'Seserahan', teks: 'Seserahan', lebar: 'setengah' },
        { k: 'wcc', label: 'WCC', teks: 'WCC', lebar: 'setengah' },
        { k: 'wo', label: 'WO', teks: 'WO', lebar: 'setengah' },
        { k: 'catering', label: 'Catering', teks: 'Catering' },
      ],
    },
  ];

  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
    'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  /** "2026-10-11" -> "Sabtu, 11 Oktober 2026" */
  function tanggalPanjang(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return iso || '';
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
  }

  /** "08:00" -> "08.00" */
  function jamTitik(j) { return (j || '').replace(':', '.'); }

  function ambil(data, k) {
    if (k.startsWith('acara.')) return ((data.acara || {})[k.slice(6)] || '').toString();
    return ((data.bio || {})[k] || '').toString();
  }

  /** Nama akun Instagram tanpa @ dan tanpa alamat lengkap. */
  function akunIg(v) {
    return (v || '').trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/[/?#].*$/, '')
      .replace(/^@/, '');
  }

  root.FORMULIR = { BAGIAN, BULAN, tanggalPanjang, jamTitik, ambil, akunIg, versi: 1 };
  if (typeof module !== 'undefined') module.exports = root.FORMULIR;
})(typeof window !== 'undefined' ? window : globalThis);
