/* Tampilan dan alur formulir: isi -> PDF -> kirim ke WhatsApp. */
(function () {
  'use strict';
  const F = window.FORMULIR;
  const KUNCI_SIMPAN = 'formulir-ghina-v1';

  // ----- nomor WhatsApp tujuan ----------------------------------------------
  function nomorWa(mentah) {
    let d = String(mentah || '').replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    if (d.startsWith('0')) d = '62' + d.slice(1);
    else if (d.startsWith('8')) d = '62' + d;
    return d.length >= 10 && d.length <= 15 ? d : '';
  }
  const param = new URLSearchParams(location.search);
  const waTujuan = nomorWa(param.get('wa')) || nomorWa(window.CONFIG && window.CONFIG.waGhina);

  // ----- data & simpan otomatis ---------------------------------------------
  let data = { acara: { jenis: 'Akad Nikah' }, bio: {} };
  try {
    const s = localStorage.getItem(KUNCI_SIMPAN);
    if (s) {
      const d = JSON.parse(s);
      data = { acara: { ...data.acara, ...(d.acara || {}) }, bio: { ...(d.bio || {}) } };
    }
  } catch (_) { /* penyimpanan tidak tersedia: tetap jalan tanpa simpan */ }

  let tundaSimpan;
  function simpan() {
    clearTimeout(tundaSimpan);
    tundaSimpan = setTimeout(() => {
      try { localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(data)); } catch (_) {}
    }, 300);
    perbaruiStatus();
  }

  function ambil(k) { return F.ambil(data, k); }
  function atur(k, v) {
    if (k.startsWith('acara.')) data.acara[k.slice(6)] = v;
    else data.bio[k] = v;
    simpan();
  }

  // ----- membuat elemen -----------------------------------------------------
  function el(tag, atribut, ...anak) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(atribut || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const a of anak) if (a) e.append(a);
    return e;
  }

  let nomorId = 0;
  function isian(f) {
    const id = 'i' + (++nomorId);
    const bungkus = el('div', {
      class: 'isian' + (f.lebar === 'setengah' ? ' setengah' : '') + (f.jenis ? ' jenis-' + f.jenis : ''),
      'data-kunci': f.k,
    });
    const label = el('label', { for: id, text: f.label });
    if (f.wajib) label.append(el('span', { class: 'wajib', text: '*', 'aria-hidden': 'true' }));

    if (f.jenis === 'pilihan' || f.jenis === 'yatidak') {
      const opsi = f.jenis === 'yatidak'
        ? [['ya', 'Ya'], ['tidak', 'Tidak']]
        : f.pilihan.map((p) => [p, p]);
      const grup = el('div', { class: 'chip-grup', role: 'radiogroup', 'aria-label': f.label });
      const nilai = ambil(f.k) || f.bawaan || '';
      if (!ambil(f.k) && f.bawaan) atur(f.k, f.bawaan);
      for (const [v, t] of opsi) {
        grup.append(el('label', { class: 'chip' },
          el('input', { type: 'radio', name: id, value: v, checked: nilai === v,
            onchange: () => atur(f.k, v) }),
          document.createTextNode(t)));
      }
      bungkus.append(el('span', { class: 'label', text: f.label }), grup);
      return bungkus;
    }

    let input;
    const umum = {
      id, name: f.k, placeholder: f.petunjuk || '', autocomplete: 'off',
      oninput: (ev) => { atur(f.k, ev.target.value); bungkus.classList.remove('salah'); },
    };
    if (f.jenis === 'banyak') {
      input = el('textarea', { ...umum, rows: 2 });
    } else {
      const tipe = { tanggal: 'date', jam: 'time', telp: 'tel', url: 'url' }[f.jenis] || 'text';
      input = el('input', { ...umum, type: tipe,
        inputmode: f.jenis === 'angka' ? 'numeric' : f.jenis === 'telp' ? 'tel' : null,
        autocapitalize: ['url', 'ig'].includes(f.jenis) ? 'off' : 'words' });
    }
    input.value = f.jenis === 'ig' ? F.akunIg(ambil(f.k)) : ambil(f.k);
    if (f.jenis === 'ig') {
      input.addEventListener('input', () => atur(f.k, F.akunIg(input.value)));
    }
    bungkus.append(label, f.jenis === 'ig' ? el('div', { class: 'awalan' }, el('span', { text: '@' }), input) : input);
    if (f.bantuan) bungkus.append(el('p', { class: 'bantuan', text: f.bantuan }));
    bungkus.append(el('p', { class: 'pesan-salah', text: 'Mohon diisi ya, Kak.' }));

    // Almarhum/almarhumah dan orang tua sambung.
    if (f.alm) {
      const sambung = el('div', { class: 'sambung', hidden: data.bio[f.alm] !== 'ya' && !data.bio[f.sambung] });
      const idS = 'i' + (++nomorId);
      const inputS = el('input', { id: idS, type: 'text', placeholder: 'Kosongkan bila tidak ada',
        autocapitalize: 'words', autocomplete: 'off',
        oninput: (ev) => atur(f.sambung, ev.target.value) });
      inputS.value = data.bio[f.sambung] || '';
      sambung.append(el('label', { for: idS, text: f.sambungLabel }), inputS);
      const cek = el('input', { type: 'checkbox', checked: data.bio[f.alm] === 'ya',
        onchange: (ev) => {
          atur(f.alm, ev.target.checked ? 'ya' : '');
          sambung.hidden = !ev.target.checked && !data.bio[f.sambung];
        } });
      bungkus.append(el('div', { class: 'baris-alm' },
        el('label', { class: 'chip kecil' }, cek, document.createTextNode(f.almLabel))), sambung);
    }
    return bungkus;
  }

  // ----- susun halaman ------------------------------------------------------
  const wadah = document.getElementById('formulir');
  F.BAGIAN.forEach((b, i) => {
    const grid = el('div', { class: 'grid' });
    b.isian.forEach((f) => grid.append(isian(f)));
    wadah.append(el('section', { class: 'kartu', id: 'bagian-' + b.id, 'aria-labelledby': 'judul-' + b.id },
      el('div', { class: 'kartu-kepala' },
        el('div', { class: 'kartu-ikon', 'aria-hidden': 'true', text: b.ikon }),
        el('div', {},
          el('h2', { id: 'judul-' + b.id, text: b.judul }),
          el('p', { class: 'kartu-sub', text: b.keterangan })),
        el('span', { class: 'kartu-nomor', text: (i + 1) + '/' + F.BAGIAN.length })),
      grid));
  });
  if (window.CONFIG && window.CONFIG.instagram) {
    const ig = document.getElementById('tautanIg');
    ig.href = 'https://instagram.com/' + window.CONFIG.instagram;
    ig.textContent = '@' + window.CONFIG.instagram;
  }

  // ----- status pengisian ---------------------------------------------------
  const semuaWajib = F.BAGIAN.flatMap((b) => b.isian.filter((f) => f.wajib));
  function perbaruiStatus() {
    const semua = F.BAGIAN.flatMap((b) => b.isian);
    const terisi = semua.filter((f) => ambil(f.k).trim()).length;
    const wajibTerisi = semuaWajib.filter((f) => ambil(f.k).trim()).length;
    document.getElementById('barIsi').style.width = Math.round((terisi / semua.length) * 100) + '%';
    document.getElementById('ringkas').textContent = wajibTerisi < semuaWajib.length
      ? `${terisi} dari ${semua.length} terisi · ${semuaWajib.length - wajibTerisi} wajib belum`
      : `${terisi} dari ${semua.length} terisi · siap dikirim`;
  }
  perbaruiStatus();

  // ----- kirim --------------------------------------------------------------
  let pdfTerakhir = null;
  const namaPasangan = () => [data.bio.panggilan_cpw || data.bio.nama_cpw,
    data.bio.panggilan_cpp || data.bio.nama_cpp].map((x) => (x || '').trim()).filter(Boolean).join(' & ');
  const namaBerkas = () => ('List Akad & Sungkeman' + (namaPasangan() ? ' - ' + namaPasangan() : ''))
    .replace(/[\\/:*?"<>|]/g, '-') + '.pdf';

  function periksa() {
    let pertama = null;
    for (const f of semuaWajib) {
      const kotak = wadah.querySelector(`[data-kunci="${f.k}"]`);
      const kosong = !ambil(f.k).trim();
      kotak.classList.toggle('salah', kosong);
      if (kosong && !pertama) pertama = kotak;
    }
    if (pertama) {
      pertama.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const i = pertama.querySelector('input,textarea');
      if (i) setTimeout(() => i.focus({ preventScroll: true }), 400);
      return false;
    }
    return true;
  }

  async function asetPdf() {
    const unduh = async (p) => new Uint8Array(await (await fetch(p)).arrayBuffer());
    const [reguler, tebal, logo] = await Promise.all([
      unduh('aset/Carlito-Regular.ttf'), unduh('aset/Carlito-Bold.ttf'), unduh('aset/logo-bulat.png'),
    ]);
    return { fontkit: window.fontkit, reguler, tebal, logo };
  }

  const memuat = document.getElementById('memuat');
  const lapisan = document.getElementById('lapisanSelesai');

  document.getElementById('tombolSelesai').addEventListener('click', async () => {
    if (!periksa()) return;
    memuat.hidden = false;
    try {
      const sekarang = new Date();
      data.diisi = sekarang.getDate() + ' ' + F.BULAN[sekarang.getMonth()] + ' ' + sekarang.getFullYear();
      const bytes = await window.FORMULIR_PDF.buatPdf(data, await asetPdf());
      pdfTerakhir = new File([bytes], namaBerkas(), { type: 'application/pdf' });
      const bisaBagikan = !!(navigator.canShare && navigator.canShare({ files: [pdfTerakhir] }));
      document.getElementById('petunjukBagikan').hidden = !bisaBagikan;
      document.getElementById('teksSelesai').textContent = bisaBagikan
        ? 'Data sudah jadi PDF. Tinggal kirim ke WhatsApp Ghina ya.'
        : 'Data sudah jadi PDF. Tombol di bawah akan mengunduh PDF lalu membuka WhatsApp; lampirkan PDF-nya di chat ya.';
      lapisan.hidden = false;
    } catch (e) {
      alert('Maaf, PDF belum berhasil dibuat. Coba lagi, atau kirim sebagai pesan teks.\n\n' + e);
    } finally {
      memuat.hidden = true;
    }
  });

  function bukaWa(teks) {
    const url = 'https://wa.me/' + (waTujuan || '') + '?text=' + encodeURIComponent(teks);
    window.open(url, '_blank', 'noopener');
  }

  function unduh(file) {
    const url = URL.createObjectURL(file);
    const a = el('a', { href: url, download: file.name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  document.getElementById('tombolKirimPdf').addEventListener('click', async () => {
    if (!pdfTerakhir) return;
    const pesan = 'Assalamualaikum Kak Ghina, berikut data List Akad & Sungkeman'
      + (namaPasangan() ? ' ' + namaPasangan() : '') + ' 🙏';
    if (navigator.canShare && navigator.canShare({ files: [pdfTerakhir] })) {
      try {
        await navigator.share({ files: [pdfTerakhir], title: pdfTerakhir.name, text: pesan });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // batal memilih aplikasi
      }
    }
    unduh(pdfTerakhir);
    bukaWa(pesan + '\n(PDF sudah terunduh, saya lampirkan di chat ini.)');
  });

  document.getElementById('tombolKirimTeks').addEventListener('click', () => {
    bukaWa(window.FORMULIR_TEKS.buatTeks(data));
  });
  document.getElementById('tombolUnduh').addEventListener('click', () => pdfTerakhir && unduh(pdfTerakhir));
  document.getElementById('tombolUbah').addEventListener('click', () => { lapisan.hidden = true; });
  lapisan.addEventListener('click', (e) => { if (e.target === lapisan) lapisan.hidden = true; });
})();
