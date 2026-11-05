const tbody = document.getElementById('tbodyJadwal');
const form = document.getElementById('formJadwal');

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
    'https://gitocgjctmtuuhzknilw.supabase.co',
    'sb_publishable_a3-pN2-XNagHVGtn5ZQXsg_WH3BiuvP'   // anon public key
);

/** Perbarui nomor urut setelah ada tambah/hapus */
function renumber() {
    tbody.querySelectorAll('tr').forEach((tr, i) => {
        tr.querySelector('td').textContent = i + 1;
    });
}

/** Buat <tr> baru dari data */
function buatBaris(row) {
  const tr = document.createElement('tr');
  tr.dataset.id = row.id;

  const data = [
    { label: 'No.',         value: '' },
    { label: 'Hari',        value: row.Hari },
    { label: 'Mata Kuliah', value: row.MataKuliah },
    { label: 'Dosen',       value: row.Dosen },
    { label: 'Ruangan',     value: row.Ruangan },
    { label: 'Waktu',       value: `${row['Waktu Mulai']}–${row['Waktu Selesai']}` },
  ];

  data.forEach(({ label, value }) => {
    const td = document.createElement('td');
    td.dataset.label = label;
    td.textContent = value ?? '';   // hindari "undefined"
    tr.appendChild(td);
  });

  const aksi = document.createElement('td');
  aksi.className = 'aksi';
  aksi.dataset.label = 'Aksi';
  aksi.innerHTML = `<button class="btn-hapus" type="button">Hapus</button>`;
  tr.appendChild(aksi);

  return tr;
}

async function muatJadwal() {
    const { data, error } = await supabase
        .from('Jadwal Kuliah')
        .select('*')
        .order('id', { ascending: true })

    tbody.innerHTML = '';
    data.forEach(row => tbody.appendChild(buatBaris(row)));
    renumber();
}

/* Submit form → tambah baris */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const mulai = fd.get('mulai');
    const selesai = fd.get('selesai');

    if (selesai <= mulai) {
        alert('Waktu selesai harus lebih besar dari waktu mulai.');
        return;
    }

    const { data, error } = await supabase
        .from('Jadwal Kuliah')
        .insert({
            Hari: fd.get('hari'),
            MataKuliah: fd.get('matkul'),
            Dosen: fd.get('dosen'),
            Ruangan: fd.get('ruangan'),
            'Waktu Mulai': fd.get('mulai'),
            'Waktu Selesai': fd.get('selesai'),
        })
        .select()
        .single();

    if (error) {
        alert('Gagal menambah: ' + error.message);
        return;
    }

    tbody.appendChild(buatBaris(data));
    renumber();
    form.reset();
    form.querySelector('input').focus()
});

/* Delegasi klik: hapus baris */
tbody.addEventListener('click', (e) => {
    if (e.target.matches('.btn-hapus')) {
        const tr = e.target.closest('tr');
        if (confirm('Hapus jadwal ini?')) {
            tr.remove();
            renumber();
        }
    }
});

muatJadwal();