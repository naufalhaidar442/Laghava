import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://gitocgjctmtuuhzknilw.supabase.co',
  'sb_publishable_a3-pN2-XNagHVGtn5ZQXsg_WH3BiuvP'
);

const JadwalHariIni = document.getElementById('jadwalHariIni');

/** Nama hari Indonesia. Index = nilai new Date().getDay() */
const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/** Ambil nama hari ini */
function hariIni() {
  return NAMA_HARI[new Date().getDay()];
}

/** Buat satu baris <tr> untuk tabel jadwal hari ini */
function buatBaris(row) {
  const tr = document.createElement('tr');
  tr.dataset.id = row.id;

  // Hanya 3 kolom sesuai permintaan: Mata Kuliah, Ruangan, Waktu Mulai
  const cells = [
    { label: 'Mata Kuliah', value: row.MataKuliah },
    { label: 'Ruangan',     value: row.Ruangan },
    { label: 'Waktu',       value: row['Waktu Mulai'] },
  ];

  cells.forEach(({ label, value }) => {
    const td = document.createElement('td');
    td.dataset.label = label;
    td.textContent = value ?? '—';
    tr.appendChild(td);
  });

  return tr;
}

/** Muat & render jadwal hari ini */
async function tampilkanJadwal() {
  const hari = hariIni();

  // Update judul kartu
  const judul = JadwalHariIni.querySelector('h4');
  if (judul) judul.textContent = `Kelas Hari Ini (${hari})`;

  const { data, error } = await supabase
    .from('Jadwal Kuliah')
    .select('*')
    .eq('Hari', hari)                       // filter di server
    .order('Waktu Mulai', { ascending: true });

  if (error) {
    console.error('tampilkanJadwal:', error);
    JadwalHariIni.innerHTML =
      `<h4>Kelas Hari Ini (${hari})</h4>` +
      `<p style="color:#dc2626">Gagal memuat: ${error.message}</p>`;
    return;
  }

  // Bersihkan isi kecuali judul
  JadwalHariIni.querySelectorAll('tr, p, .hari-ini-kosong').forEach(el => el.remove());

  if (!data || data.length === 0) {
    const p = document.createElement('p');
    p.className = 'hari-ini-kosong';
    p.textContent = `Tidak ada kelas hari ${hari}. 🎉`;
    JadwalHariIni.appendChild(p);
    return;
  }

  // Buat <table> kecil untuk menampung baris
  const table = document.createElement('table');
  table.className = 'tabelHariIni';

  // Header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Mata Kuliah</th>
      <th>Ruangan</th>
      <th>Waktu Mulai</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(row => tbody.appendChild(buatBaris(row)));
  table.appendChild(tbody);

  JadwalHariIni.appendChild(table);
}

tampilkanJadwal();