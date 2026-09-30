/*
 * Pesan teks WhatsApp dari isi formulir, mengikuti format "List Akad &
 * Sungkeman" yang biasa dikirim Ghina. Aplikasi MC View bisa membaca
 * pesan ini kembali (baris "Label : isi"), jadi formatnya jangan diubah
 * tanpa mengubah pembacanya di aplikasi (lib/services/formulir_impor.dart).
 */
(function (root) {
  'use strict';
  const F = root.FORMULIR || (typeof require !== 'undefined' ? require('./data.js') : null);

  const PENANDA = '_Dikirim lewat formulir GHINA MC EVENTS_';

  function nilaiTeks(data, f) {
    const v = F.ambil(data, f.k).trim();
    if (f.k === 'acara.tanggal') return F.tanggalPanjang(v);
    if (f.k === 'acara.jam') return F.jamTitik(v);
    if (f.jenis === 'yatidak') return v === 'ya' ? 'Ya' : v === 'tidak' ? 'Tidak' : '';
    if (f.jenis === 'ig') return v ? '@' + F.akunIg(v) : '';
    if (f.jenis === 'banyak') {
      return v.split('\n').map((x) => x.trim()).filter(Boolean).join('; ');
    }
    if (f.alm && v && (data.bio || {})[f.alm] === 'ya') return v + ' (' + f.almTanda + ')';
    return v;
  }

  function buatTeks(data) {
    const baris = [
      '•••••••••••••••••••━━﷽━━━━━┓',
      '       List Akad & Sungkeman',
      '┗━━━━━━━━━━•••••••••••••••••••',
    ];
    for (const b of F.BAGIAN) {
      baris.push('', '*' + b.teks + '*');
      for (const f of b.isian) {
        baris.push(f.teks + ' : ' + nilaiTeks(data, f));
        if (f.sambung) {
          const s = ((data.bio || {})[f.sambung] || '').trim();
          if (s) baris.push(f.sambungTeks + ' : ' + s);
        }
      }
    }
    baris.push('', PENANDA);
    return baris.join('\n');
  }

  root.FORMULIR_TEKS = { buatTeks, PENANDA };
  if (typeof module !== 'undefined') module.exports = root.FORMULIR_TEKS;
})(typeof window !== 'undefined' ? window : globalThis);
