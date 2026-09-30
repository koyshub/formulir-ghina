/*
 * PDF hasil formulir. Tampilannya mengikuti PDF biodata di aplikasi
 * MC View: kop GHINA MC EVENTS yang sama, Calibri (Carlito) 11 pt, judul
 * tebal bergaris bawah, dan tabel bergaris tipis.
 *
 * Seluruh isian juga disimpan di dalam PDF (kunci /MCViewData, JSON
 * base64) supaya aplikasi bisa membuat acara darinya tanpa salah baca.
 * Dibuat sepenuhnya di HP klien; tidak ada data yang dikirim ke server.
 */
(function (root) {
  'use strict';
  const F = root.FORMULIR || (typeof require !== 'undefined' ? require('./data.js') : null);
  const L = root.PDFLib || (typeof require !== 'undefined' ? require('../vendor/pdf-lib.min.js') : null);

  // Satuan point, diukur dari atas halaman A4 (sama dengan lembar biodata).
  const U = {
    W: 595.28, H: 841.89,
    kiri: 72, kanan: 595.28 - 72, tengah: 595.28 / 2, atas: 72,
    bawah: 841.89 - 72 - 14,
    huruf: 11,
    barisTabel: 13.4277, barisNormal: 13.4277 * 1.15, setelah: 10, naik: 10.4736,
    garis: 0.5, pad: 5.76,
    kolom2: [66.34, 220.58, 528.55],
    kolom3: [66.34, 211.40, 364.36, 539.65],
  };

  const WARNA = {
    hitam: L.rgb(0, 0, 0),
    mawar: L.rgb(0xd6 / 255, 0x33 / 255, 0x6c / 255),
    abu: L.rgb(0x7a / 255, 0x7a / 255, 0x7a / 255),
    tautan: L.rgb(0x1f / 255, 0x5f / 255, 0xbf / 255),
    merahMuda: [0xff / 255, 0x75 / 255, 0xc7 / 255],
    koral: [0xff / 255, 0x4d / 255, 0x4e / 255],
  };

  function keBase64Utf8(teks) {
    if (typeof Buffer !== 'undefined') return Buffer.from(teks, 'utf8').toString('base64');
    const bytes = new TextEncoder().encode(teks);
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  /** Pecah [teks] jadi baris-baris selebar [lebar] (per kata, lalu per huruf). */
  function bungkus(teks, font, ukuran, lebar) {
    const hasil = [];
    for (const paragraf of String(teks).split('\n')) {
      const kata = paragraf.split(/\s+/).filter(Boolean);
      let kini = '';
      for (let w of kata) {
        const coba = kini ? kini + ' ' + w : w;
        if (font.widthOfTextAtSize(coba, ukuran) <= lebar) { kini = coba; continue; }
        if (kini) { hasil.push(kini); kini = ''; }
        while (font.widthOfTextAtSize(w, ukuran) > lebar && w.length > 1) {
          let n = w.length;
          while (n > 1 && font.widthOfTextAtSize(w.slice(0, n), ukuran) > lebar) n--;
          hasil.push(w.slice(0, n));
          w = w.slice(n);
        }
        kini = w;
      }
      hasil.push(kini);
    }
    return hasil.length ? hasil : [''];
  }

  async function buatPdf(data, aset) {
    const doc = await L.PDFDocument.create();
    doc.registerFontkit(aset.fontkit);
    const biasa = await doc.embedFont(aset.reguler, { subset: false });
    const tebal = await doc.embedFont(aset.tebal, { subset: false });
    const logo = await doc.embedPng(aset.logo);

    // Buang huruf yang tidak ada di font (mis. emoji) supaya PDF tidak gagal.
    const adaHuruf = new Set(biasa.getCharacterSet());
    const bersih = (t) => Array.from(String(t || ''))
      .filter((c) => c === '\n' || adaHuruf.has(c.codePointAt(0))).join('');
    const b = {};
    for (const [k, v] of Object.entries(data.bio || {})) b[k] = bersih(v);
    const a = {};
    for (const [k, v] of Object.entries(data.acara || {})) a[k] = bersih(v);
    const nilai = (k) => bersih(F.ambil(data, k)).trim();
    const namaKanan = [b.panggilan_cpw || b.nama_cpw, b.panggilan_cpp || b.nama_cpp]
      .map((x) => (x || '').trim()).filter(Boolean).join(' & ');

    let page;
    let y;

    // ----- dasar menggambar -------------------------------------------------
    const tulis = (t, x, dasar, opsi = {}) => {
      if (!t) return;
      page.drawText(t, {
        x, y: U.H - dasar, size: opsi.ukuran || U.huruf,
        font: opsi.font || biasa, color: opsi.warna || WARNA.hitam,
      });
    };
    const kotak = (x, atas, w, h, warna) => {
      if (w <= 0 || h <= 0) return;
      page.drawRectangle({ x, y: U.H - atas - h, width: w, height: h, color: warna || WARNA.hitam });
    };
    const tautan = (x, atas, w, h, url) => {
      const ctx = doc.context;
      const annot = ctx.register(ctx.obj({
        Type: 'Annot', Subtype: 'Link', Border: [0, 0, 0],
        Rect: [x, U.H - atas - h, x + w, U.H - atas],
        A: { Type: 'Action', S: 'URI', URI: L.PDFString.of(url) },
      }));
      page.node.addAnnot(annot);
    };

    function kop() {
      const sisi = 32, atasLogo = 22;
      page.drawImage(logo, { x: U.kiri, y: U.H - atasLogo - sisi, width: sisi, height: sisi });
      const xTeks = U.kiri + sisi + 9;
      // Huruf berjarak lebar, digambar satu per satu.
      let x = xTeks;
      for (const c of 'GHINA MC EVENTS') {
        tulis(c, x, 35, { font: tebal, ukuran: 10.5, warna: WARNA.mawar });
        x += tebal.widthOfTextAtSize(c, 10.5) + 1.4;
      }
      tulis('@ghinadz_mc', xTeks, 48.5, { ukuran: 9.5, warna: WARNA.abu });
      if (namaKanan) {
        const w = biasa.widthOfTextAtSize(namaKanan, 9.5);
        tulis(namaKanan, U.kanan - w, 48.5, { ukuran: 9.5, warna: WARNA.abu });
      }
      const n = 90, lebar = U.kanan - U.kiri;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const c = WARNA.merahMuda.map((v, j) => v + (WARNA.koral[j] - v) * t);
        kotak(U.kiri + (lebar * i) / n, 58, lebar / n + 0.2, 1.1, L.rgb(c[0], c[1], c[2]));
      }
    }

    function kaki() {
      const t = 'Dikirim lewat formulir GHINA MC EVENTS' +
        (data.diisi ? ' · ' + data.diisi : '');
      const w = biasa.widthOfTextAtSize(t, 8);
      tulis(t, U.tengah - w / 2, U.H - 34, { ukuran: 8, warna: WARNA.abu });
    }

    function halaman() {
      page = doc.addPage([U.W, U.H]);
      kop();
      kaki();
      y = U.atas;
    }

    function paragrafJudul(t, tengah) {
      const w = tebal.widthOfTextAtSize(t, U.huruf);
      const x = tengah ? U.tengah - w / 2 : U.kiri;
      tulis(t, x, y + U.naik, { font: tebal });
      kotak(x, y + U.naik + 1.25, w, 0.66);
      y += U.barisNormal + U.setelah;
    }

    // ----- isi sel ----------------------------------------------------------
    // Sel berisi daftar baris; tiap baris berisi potongan {t, x, font, url}.
    function selTeks(t, x0, lebar, opsi = {}) {
      return bungkus(t || '', biasa, U.huruf, lebar).map((s) => [
        { t: s, x: x0, url: opsi.url, warna: opsi.url ? WARNA.tautan : null },
      ]);
    }

    function selLabel(pasangan, x0, lebar) {
      const maks = Math.max(...pasangan.map(([l]) => biasa.widthOfTextAtSize(l, U.huruf)));
      const xTitik = x0 + maks + biasa.widthOfTextAtSize(' ', U.huruf);
      const xIsi = xTitik + biasa.widthOfTextAtSize(': ', U.huruf);
      const out = [];
      for (const [l, isi] of pasangan) {
        const bagian = (isi || '').split('\n');
        const pertama = bungkus(bagian[0], biasa, U.huruf, x0 + lebar - xIsi);
        out.push([{ t: l, x: x0 }, { t: ':', x: xTitik }, { t: pertama[0], x: xIsi }]);
        for (const s of pertama.slice(1)) out.push([{ t: s, x: xIsi }]);
        for (const lain of bagian.slice(1)) {
          for (const s of bungkus(lain, biasa, U.huruf, lebar)) out.push([{ t: s, x: x0 }]);
        }
      }
      return out;
    }

    function bagian(judul, kolom, baris) {
      const tata = baris.map((r) => {
        const sel = r.map((isi, i) => {
          const x0 = kolom[i] + U.pad;
          const lebar = kolom[i + 1] - U.pad - x0;
          return isi.label ? selLabel(isi.label, x0, lebar)
            : selTeks(isi.teks, x0, lebar, { url: isi.url });
        });
        const n = Math.max(1, ...sel.map((s) => s.length));
        return { h: n * U.barisTabel, sel };
      });
      const pertama = tata.length ? tata[0].h + U.garis * 2 : 0;
      if (y + U.barisNormal + U.setelah + pertama > U.bawah) halaman();
      paragrafJudul(judul, false);

      const garisDatar = (atas) =>
        kotak(kolom[0], atas, kolom[kolom.length - 1] + U.garis - kolom[0], U.garis);
      garisDatar(y);
      y += U.garis;
      for (const { h, sel } of tata) {
        if (y + h + U.garis > U.bawah) {
          halaman();
          garisDatar(y);
          y += U.garis;
        }
        sel.forEach((baris) => {
          baris.forEach((potong, n) => {
            const dasar = y + U.naik + n * U.barisTabel;
            for (const p of potong) {
              tulis(p.t, p.x, dasar, { warna: p.warna });
              if (p.url && p.t) {
                const w = biasa.widthOfTextAtSize(p.t, U.huruf);
                kotak(p.x, dasar + 1.25, w, 0.5, WARNA.tautan);
                tautan(p.x, dasar - U.naik, w, U.barisTabel, p.url);
              }
            }
          });
        });
        for (const x of kolom) kotak(x, y - U.garis, U.garis, h + U.garis * 2);
        y += h;
        garisDatar(y);
        y += U.garis;
      }
      y += U.barisNormal + U.setelah;
    }

    // ----- isi dokumen ------------------------------------------------------
    halaman();
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(a.tanggal || '');
    const tgl = d ? Number(d[3]) + ' ' + F.BULAN[Number(d[2]) - 1].toUpperCase() + ' ' + d[1] : '';
    const lokasi = (a.lokasi || '').trim().toUpperCase();
    paragrafJudul('LIST AKAD & SUNGKEMAN', true);
    paragrafJudul([tgl, lokasi].filter(Boolean).join(' – ') || ' ', true);
    y += U.barisNormal + U.setelah;

    const ya = (v) => (v === 'ya' ? 'Ya' : v === 'tidak' ? 'Tidak' : '');
    const maps = nilai('maps');
    bagian('INFO ACARA', U.kolom2, [
      [{ teks: 'Jenis Acara' }, { teks: nilai('acara.jenis') }],
      [{ teks: 'Tanggal' }, { teks: F.tanggalPanjang(nilai('acara.tanggal')) }],
      [{ teks: 'Jam Akad Nikah' }, { teks: F.jamTitik(nilai('acara.jam')) }],
      [{ teks: 'Akad Disandingkan' }, { teks: ya(nilai('disandingkan')) }],
      [{ teks: 'Lokasi' }, { teks: nilai('acara.lokasi') }],
      [{ teks: 'Google Maps' }, { teks: maps, url: /^https?:\/\//i.test(maps) ? maps : undefined }],
      [{ teks: 'WhatsApp' }, { teks: nilai('acara.wa') }],
    ]);

    const nama = (s) => {
      const n = (b['nama_' + s] || '').trim();
      const p = (b['panggilan_' + s] || '').trim();
      return p ? n + ' (' + p + ')' : n;
    };
    const ig = (s) => {
      const akun = F.akunIg(b['ig_' + s]);
      return akun ? { teks: '@' + akun, url: 'https://instagram.com/' + akun } : { teks: '' };
    };
    const ortu = (s) => {
      const alm = (k, t) => {
        const n = (b[k + '_' + s] || '').trim();
        return n && b['alm_' + k + '_' + s] === 'ya' && !/\(alm/i.test(n) ? n + ' (' + t + ')' : n;
      };
      const out = [
        [(b['sebutan_ayah_' + s] || '').trim() || 'Bapak', alm('ayah', 'Alm')],
        [(b['sebutan_ibu_' + s] || '').trim() || 'Ibu', alm('ibu', 'Almh')],
      ];
      if ((b['ayah_sambung_' + s] || '').trim()) out.push(['Bapak Sambung', b['ayah_sambung_' + s].trim()]);
      if ((b['ibu_sambung_' + s] || '').trim()) out.push(['Ibu Sambung', b['ibu_sambung_' + s].trim()]);
      return out;
    };
    const saudara = (s) => [
      ['Kaka', (b['kakak_' + s] || '').trim()],
      ['Adik', (b['adik_' + s] || '').trim()],
    ];
    const anakKe = (s) => {
      const ke = (b['anak_ke_' + s] || '').trim();
      const dari = (b['jumlah_saudara_' + s] || '').trim();
      if (!ke && !dari) return '';
      if (!dari) return 'Anak ke-' + ke;
      if (!ke) return 'Dari ' + dari + ' bersaudara';
      return 'Anak ke-' + ke + ' dari ' + dari + ' bersaudara';
    };
    bagian('BIODATA MEMPELAI', U.kolom3, [
      [{ teks: 'Nama Lengkap Mempelai' }, { teks: nama('cpw') }, { teks: nama('cpp') }],
      [{ teks: 'Instagram' }, ig('cpw'), ig('cpp')],
      [{ teks: 'Nama Orang Tua' }, { label: ortu('cpw') }, { label: ortu('cpp') }],
      [{ teks: 'Panggilan ke Orang Tua' },
        { teks: [b.sebutan_ayah_cpw, b.sebutan_ibu_cpw].filter(Boolean).join(' & ') },
        { teks: [b.sebutan_ayah_cpp, b.sebutan_ibu_cpp].filter(Boolean).join(' & ') }],
      [{ teks: 'Nama Saudara Kandung' }, { label: saudara('cpw') }, { label: saudara('cpp') }],
      [{ teks: 'Anak Ke' }, { teks: anakKe('cpw') }, { teks: anakKe('cpp') }],
    ]);

    const daftar = (id) => F.BAGIAN.find((x) => x.id === id).isian
      .map((f) => [{ teks: f.teks }, { teks: nilai(f.k) }]);
    bagian('PERANGKAT NIKAH', U.kolom2, daftar('perangkat'));
    bagian('PENGISI ACARA', U.kolom2, daftar('pengisi'));
    bagian('VENDOR', U.kolom2, daftar('vendor'));

    // ----- data untuk aplikasi ----------------------------------------------
    const judulDok = 'List Akad & Sungkeman ' + namaKanan;
    doc.setTitle(judulDok.trim());
    doc.setSubject('Formulir data acara GHINA MC EVENTS');
    doc.setCreator('Formulir GHINA MC EVENTS');
    doc.setKeywords(['MCView-Formulir']);
    doc.getInfoDict().set(L.PDFName.of('MCViewData'),
      L.PDFString.of(keBase64Utf8(JSON.stringify({ ...data, v: F.versi }))));
    // Tanpa object stream supaya kunci di atas tetap terbaca apa adanya.
    return doc.save({ useObjectStreams: false });
  }

  root.FORMULIR_PDF = { buatPdf, bungkus };
  if (typeof module !== 'undefined') module.exports = root.FORMULIR_PDF;
})(typeof window !== 'undefined' ? window : globalThis);
