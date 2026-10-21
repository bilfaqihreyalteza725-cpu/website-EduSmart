const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Penyimpanan: pakai localStorage jika diizinkan, jika diblokir (mis. pratinjau/iframe) pakai memori sementara
const store = (() => {
  try {
    const ls = window['local' + 'Storage'];
    ls.setItem('__t', '1');
    ls.removeItem('__t');
    return ls;
  } catch (e) {
    const m = {};
    return {
      mem: true,
      getItem: k => (k in m ? m[k] : null),
      setItem: (k, v) => { m[k] = String(v); },
      removeItem: k => { delete m[k]; }
    };
  }
})();

// Menu mobile
$('#burger').addEventListener('click', () => {
  $('#menu').classList.toggle('open');
});
$$('#menu a').forEach(a => a.addEventListener('click', () => {
  $('#menu').classList.remove('open');
}));

// Mode gelap
$('#themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  $('#themeBtn').textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Filter kursus berdasarkan kategori dan pencarian
let activeCat = 'Semua';
function filterCourses() {
  const q = $('#q').value.trim().toLowerCase();
  let shown = 0;
  $$('.course').forEach(c => {
    const okCat = activeCat === 'Semua' || c.dataset.cat === activeCat;
    const okText = c.textContent.toLowerCase().includes(q);
    const show = okCat && okText;
    c.classList.toggle('hide', !show);
    if (show) shown++;
  });
  $('#empty').style.display = shown ? 'none' : 'block';
}
$$('.cat').forEach(cat => cat.addEventListener('click', () => {
  const same = cat.classList.contains('active');
  $$('.cat').forEach(x => x.classList.remove('active'));
  activeCat = same ? 'Semua' : cat.dataset.cat;
  if (!same) cat.classList.add('active');
  filterCourses();
  $('#kursus').scrollIntoView({ behavior: 'smooth' });
}));
$('#q').addEventListener('input', () => {
  activeCat = 'Semua';
  $$('.cat').forEach(x => x.classList.remove('active'));
  filterCourses();
});
$('#searchBtn').addEventListener('click', () => {
  activeCat = 'Semua';
  $$('.cat').forEach(x => x.classList.remove('active'));
  filterCourses();
  $('#kursus').scrollIntoView({ behavior: 'smooth' });
});

// Progres belajar: setiap kursus punya modul yang bisa ditandai selesai
const MODULES = ['Pendahuluan & Tujuan Belajar', 'Materi Inti', 'Contoh & Studi Kasus', 'Latihan Soal', 'Evaluasi & Rangkuman', 'Konsep Lanjutan', 'Proyek Mini / Praktik Mandiri', 'Diskusi & Refleksi'];
let progress = {}; // { "Judul Kursus": [true,false,...] }
const progKey = () => 'edusmart_progress_' + (getSession() || 'tamu');
function loadStarted() {
  try { progress = JSON.parse(store.getItem(progKey()) || '{}'); } catch (e) { progress = {}; }
}
function saveProgress() {
  try { store.setItem(progKey(), JSON.stringify(progress)); } catch (e) {}
}
function courseState(title) {
  const done = progress[title];
  if (!done) return { started: false, pct: 0, finished: false };
  const n = done.filter(Boolean).length;
  return { started: n > 0, pct: Math.round(n / MODULES.length * 100), finished: n === MODULES.length };
}

function paint() {
  let startedCount = 0;
  $$('.course').forEach(c => {
    const btn = c.querySelector('.enroll');
    const title = btn.dataset.title;
    const st = courseState(title);
    if (st.started) startedCount++;
    btn.textContent = st.finished ? '✔ Selesai' : st.started ? '▶ Lanjutkan (' + st.pct + '%)' : 'Mulai Belajar';
    btn.classList.toggle('ghost', st.started);
  });
  $('#startedCount').textContent = startedCount;
  const total = $$('.course').length;
  $('.progress i').style.width = Math.round(startedCount / total * 100) + '%';
}

const CONTENT = {"Aljabar Dasar untuk Pemula": {"modules": ["Aljabar adalah cabang matematika yang menggunakan huruf (variabel) untuk mewakili bilangan yang belum diketahui. Tujuannya adalah melatih cara berpikir logis dalam memecahkan masalah sehari-hari.", "Variabel seperti x dan y mewakili nilai yang bisa berubah. Persamaan seperti 2x + 3 = 7 berarti mencari nilai x yang membuat kedua sisi sama besar.", "Contoh: jika harga 3 buku adalah Rp45.000, maka harga satu buku adalah x, dengan persamaan 3x = 45000, sehingga x = 15000.", "Coba selesaikan: 4x - 6 = 10. Langkah pertama, tambahkan 6 ke kedua sisi, lalu bagi hasilnya dengan 4.", "Aljabar dasar menjadi fondasi untuk topik lanjutan seperti kalkulus dan statistika. Menguasainya membantu berpikir sistematis dalam banyak bidang.", "Konsep lanjutan: persamaan bisa punya dua variabel sekaligus, seperti x + y = 10, yang punya banyak kemungkinan solusi.", "Proyek mini: hitung total belanja jika harga 1 pensil adalah p dan kamu membeli 5 pensil serta membayar Rp7.500. Berapa nilai p?", "Refleksi: aljabar melatih pola pikir 'apa yang belum diketahui, dan bagaimana mencarinya' — pola pikir ini berguna di luar matematika, misalnya saat memecahkan masalah sehari-hari."], "quiz": [{"q": "Jika 2x + 5 = 15, berapakah nilai x?", "opt": ["3", "5", "7", "10"], "a": 1, "exp": "2x = 10, sehingga x = 5."}, {"q": "Dalam persamaan 3x = 21, apa langkah pertama mencari x?", "opt": ["Tambah 21 ke kedua sisi", "Bagi kedua sisi dengan 3", "Kurangi 3 dari 21", "Kalikan dengan 3"], "a": 1, "exp": "Untuk mengisolasi x, bagi kedua sisi dengan koefisiennya, yaitu 3."}, {"q": "Variabel dalam aljabar digunakan untuk...", "opt": ["Mengganti tanda operasi", "Mewakili nilai yang belum diketahui", "Mengganti satuan ukuran", "Menghapus persamaan"], "a": 1, "exp": "Variabel seperti x atau y mewakili nilai yang belum diketahui dan bisa dicari."}, {"q": "Jika 5p = 7.500, berapakah nilai p?", "opt": ["1.000", "1.500", "2.000", "2.500"], "a": 1, "exp": "7.500 dibagi 5 sama dengan 1.500."}, {"q": "Persamaan x + y = 10 memiliki...", "opt": ["Hanya satu solusi", "Tidak ada solusi", "Banyak kemungkinan solusi", "Solusi negatif saja"], "a": 2, "exp": "Karena ada dua variabel bebas, banyak pasangan x dan y yang memenuhi persamaan ini."}, {"q": "Manfaat utama belajar aljabar di luar matematika adalah...", "opt": ["Menghafal rumus", "Melatih pola pikir memecahkan masalah", "Menggambar grafik", "Menghitung cepat tanpa alat"], "a": 1, "exp": "Aljabar melatih cara berpikir sistematis yang berguna untuk memecahkan berbagai masalah."}]}, "Kalkulus Visual": {"modules": ["Kalkulus mempelajari perubahan: seberapa cepat sesuatu berubah (turunan) dan seberapa besar akumulasi perubahan itu (integral).", "Limit adalah nilai yang didekati suatu fungsi saat variabelnya mendekati titik tertentu. Konsep ini menjadi dasar dari turunan.", "Contoh turunan: jika posisi mobil adalah f(t) = t², maka kecepatannya pada waktu t adalah turunannya, yaitu f'(t) = 2t.", "Coba bayangkan: jarak tempuh grafik kecepatan terhadap waktu adalah luas di bawah kurva. Itulah gagasan dasar dari integral.", "Kalkulus dipakai luas di bidang fisika, ekonomi, dan teknik untuk memodelkan perubahan, seperti percepatan, pertumbuhan populasi, atau laju keuntungan.", "Konsep lanjutan: turunan kedua mengukur perubahan dari percepatan, misalnya seberapa cepat kecepatan itu sendiri berubah.", "Proyek mini: gambarkan grafik y = x² lalu perkirakan kemiringan garis singgung di titik x = 2 menggunakan turunan.", "Refleksi: kalkulus membantu memahami dunia yang terus berubah, dari pertumbuhan tanaman hingga pergerakan harga saham."], "quiz": [{"q": "Turunan menggambarkan...", "opt": ["Luas di bawah kurva", "Laju perubahan suatu fungsi", "Nilai tetap suatu fungsi", "Titik potong dua garis"], "a": 1, "exp": "Turunan mengukur seberapa cepat suatu fungsi berubah pada titik tertentu."}, {"q": "Jika f(t) = t², maka f'(t) adalah...", "opt": ["t", "2t", "t²", "2t²"], "a": 1, "exp": "Menggunakan aturan pangkat, turunan dari t² adalah 2t."}, {"q": "Integral berkaitan erat dengan konsep...", "opt": ["Kecepatan sesaat", "Luas di bawah kurva", "Kemiringan garis singgung", "Bilangan prima"], "a": 1, "exp": "Integral menghitung akumulasi, yang secara visual digambarkan sebagai luas di bawah kurva."}, {"q": "Turunan kedua dari suatu fungsi menggambarkan...", "opt": ["Nilai awal fungsi", "Perubahan dari laju perubahan (percepatan)", "Luas di bawah kurva", "Titik potong sumbu x"], "a": 1, "exp": "Turunan kedua mengukur bagaimana laju perubahan itu sendiri berubah, seperti percepatan."}, {"q": "Kemiringan garis singgung pada grafik y = x² di titik x = 2 dihitung dari...", "opt": ["Nilai y saja", "Turunan fungsi di titik itu", "Luas di bawah grafik", "Titik potong sumbu y"], "a": 1, "exp": "Kemiringan garis singgung sama dengan nilai turunan fungsi pada titik tersebut."}, {"q": "Kalkulus banyak digunakan untuk memodelkan...", "opt": ["Hal yang selalu tetap", "Hal yang terus berubah", "Data yang sudah final", "Angka acak saja"], "a": 1, "exp": "Kalkulus dirancang untuk memahami dan memodelkan perubahan, bukan nilai yang tetap."}]}, "Fisika Dasar SMA": {"modules": ["Fisika mempelajari gejala alam seperti gerak, gaya, energi, dan listrik melalui pengamatan dan perhitungan.", "Hukum Newton pertama menyatakan benda akan tetap diam atau bergerak lurus beraturan jika tidak ada gaya total yang bekerja padanya.", "Contoh: mobil melaju 60 km/jam selama 2 jam menempuh jarak 120 km, dihitung dari kecepatan dikali waktu.", "Coba hitung: benda bermassa 2 kg didorong gaya 10 N. Berapa percepatannya? Gunakan rumus F = m × a.", "Konsep energi, termasuk energi kinetik dan potensial, menjelaskan bagaimana benda bergerak dan berinteraksi dalam kehidupan sehari-hari.", "Konsep lanjutan: hukum kekekalan energi menyatakan energi tidak bisa diciptakan atau dimusnahkan, hanya berubah bentuk.", "Proyek mini: hitung energi kinetik benda bermassa 4 kg yang bergerak dengan kecepatan 3 m/s menggunakan rumus Ek = ½mv².", "Refleksi: memahami gaya dan energi membantu menjelaskan kejadian sehari-hari, seperti mengapa mobil butuh waktu untuk berhenti."], "quiz": [{"q": "Hukum Newton pertama disebut juga hukum...", "opt": ["Aksi-reaksi", "Kelembaman (inersia)", "Gravitasi", "Kekekalan energi"], "a": 1, "exp": "Hukum Newton pertama dikenal sebagai hukum kelembaman atau inersia."}, {"q": "Benda bermassa 2 kg didorong gaya 10 N. Percepatannya adalah...", "opt": ["2 m/s²", "5 m/s²", "10 m/s²", "20 m/s²"], "a": 1, "exp": "a = F/m = 10/2 = 5 m/s²."}, {"q": "Satuan gaya dalam Sistem Internasional adalah...", "opt": ["Joule", "Newton", "Watt", "Pascal"], "a": 1, "exp": "Gaya diukur dalam satuan Newton (N)."}, {"q": "Hukum kekekalan energi menyatakan energi...", "opt": ["Bisa diciptakan bebas", "Bisa musnah total", "Hanya berubah bentuk", "Selalu bertambah"], "a": 2, "exp": "Energi tidak diciptakan atau dimusnahkan, hanya berubah dari satu bentuk ke bentuk lain."}, {"q": "Energi kinetik benda bermassa 4 kg dengan kecepatan 3 m/s adalah...", "opt": ["6 Joule", "12 Joule", "18 Joule", "24 Joule"], "a": 2, "exp": "Ek = ½ × 4 × 3² = ½ × 4 × 9 = 18 Joule."}, {"q": "Mobil butuh waktu untuk berhenti karena adanya...", "opt": ["Energi potensial", "Kelembaman (inersia)", "Gaya magnet", "Tekanan udara saja"], "a": 1, "exp": "Benda yang bergerak cenderung mempertahankan geraknya karena sifat kelembaman (inersia)."}]}, "Kimia Organik Ringkas": {"modules": ["Kimia organik mempelajari senyawa yang mengandung karbon, unsur yang menjadi dasar semua makhluk hidup.", "Gugus fungsi adalah bagian molekul yang menentukan sifat kimia suatu senyawa, misalnya gugus -OH pada alkohol.", "Contoh: etanol (C2H5OH) memiliki gugus hidroksil yang membuatnya bisa larut dalam air dan mudah menguap.", "Coba identifikasi: senyawa dengan gugus -COOH termasuk golongan apa? Ini adalah ciri khas asam karboksilat.", "Memahami gugus fungsi membantu memprediksi reaksi kimia dan sifat zat, penting dalam bidang farmasi dan industri makanan.", "Konsep lanjutan: isomer adalah senyawa dengan rumus kimia sama tapi struktur berbeda, sehingga sifatnya pun bisa berbeda.", "Proyek mini: gambarkan struktur sederhana propana (C3H8) dan identifikasi berapa ikatan karbon-karbon yang ada.", "Refleksi: kimia organik menjadi dasar banyak produk sehari-hari, dari plastik, obat-obatan, hingga bahan bakar."], "quiz": [{"q": "Kimia organik berfokus pada senyawa yang mengandung unsur...", "opt": ["Oksigen", "Karbon", "Nitrogen", "Besi"], "a": 1, "exp": "Kimia organik mempelajari senyawa berbasis karbon."}, {"q": "Gugus -OH adalah ciri khas golongan...", "opt": ["Asam karboksilat", "Alkohol", "Keton", "Eter"], "a": 1, "exp": "Gugus hidroksil (-OH) adalah ciri khas senyawa alkohol."}, {"q": "Gugus -COOH adalah ciri khas golongan...", "opt": ["Alkohol", "Asam karboksilat", "Amina", "Aldehid"], "a": 1, "exp": "Gugus karboksil (-COOH) adalah ciri khas asam karboksilat."}, {"q": "Isomer adalah senyawa dengan...", "opt": ["Rumus dan struktur sama", "Rumus sama, struktur berbeda", "Struktur sama, rumus berbeda", "Tidak mengandung karbon"], "a": 1, "exp": "Isomer memiliki rumus kimia yang sama tetapi susunan atomnya (struktur) berbeda."}, {"q": "Propana (C3H8) memiliki berapa ikatan karbon-karbon?", "opt": ["1", "2", "3", "4"], "a": 1, "exp": "Tiga atom karbon tersusun berurutan, sehingga ada 2 ikatan karbon-karbon."}, {"q": "Kimia organik menjadi dasar pembuatan produk seperti...", "opt": ["Besi dan baja saja", "Plastik dan obat-obatan", "Batu dan pasir", "Air murni saja"], "a": 1, "exp": "Banyak produk sehari-hari seperti plastik dan obat dibuat dari senyawa organik berbasis karbon."}]}, "English for Daily Life": {"modules": ["Percakapan sehari-hari sering memakai kalimat sederhana seperti sapaan, memesan makanan, atau menanyakan arah.", "Frasa umum: 'Could I have...' untuk memesan dengan sopan, dan 'Excuse me, where is...' untuk bertanya arah.", "Contoh dialog: 'Could I have a cup of coffee, please?' adalah cara sopan memesan di kafe.", "Coba latih: bagaimana cara bertanya 'Di mana stasiun terdekat?' dalam bahasa Inggris dengan sopan?", "Latihan rutin berbicara dan mendengarkan adalah kunci agar percakapan bahasa Inggris terasa lebih alami.", "Konsep lanjutan: gunakan 'would like' untuk permintaan yang lebih sopan dibanding 'want', terutama pada situasi formal.", "Proyek mini: coba tulis dialog singkat memesan taksi, termasuk menyebutkan tujuan dan waktu penjemputan.", "Refleksi: semakin sering berlatih percakapan nyata, rasa percaya diri berbicara bahasa Inggris akan tumbuh lebih cepat."], "quiz": [{"q": "Cara sopan memesan kopi adalah...", "opt": ["Give me coffee", "Could I have a coffee, please?", "Coffee now", "I want coffee"], "a": 1, "exp": "'Could I have...please?' adalah cara sopan dalam memesan."}, {"q": "'Excuse me, where is...' digunakan untuk...", "opt": ["Meminta maaf", "Menanyakan arah", "Memesan makanan", "Menyapa teman"], "a": 1, "exp": "Frasa ini dipakai untuk menanyakan lokasi atau arah suatu tempat."}, {"q": "Manakah sapaan yang paling umum di pagi hari?", "opt": ["Good night", "Good afternoon", "Good morning", "Goodbye"], "a": 2, "exp": "'Good morning' adalah sapaan yang digunakan pada pagi hari."}, {"q": "Kalimat yang lebih sopan untuk meminta sesuatu adalah...", "opt": ["I want a taxi", "I would like a taxi, please", "Give me a taxi", "Taxi now"], "a": 1, "exp": "'Would like' terdengar lebih sopan dibanding 'want' terutama dalam situasi formal."}, {"q": "Saat memesan taksi, informasi penting yang perlu disebutkan adalah...", "opt": ["Warna sepatu", "Tujuan dan waktu penjemputan", "Nama orang tua", "Menu makanan"], "a": 1, "exp": "Tujuan dan waktu penjemputan adalah informasi penting saat memesan transportasi."}, {"q": "Cara terbaik meningkatkan rasa percaya diri berbicara bahasa Inggris adalah...", "opt": ["Menghindari berbicara", "Berlatih percakapan secara rutin", "Hanya membaca teori tata bahasa", "Menunggu sampai sempurna dulu"], "a": 1, "exp": "Latihan percakapan nyata secara rutin adalah cara paling efektif membangun kepercayaan diri."}]}, "Persiapan IELTS Academic": {"modules": ["IELTS Academic menguji empat keterampilan: Listening, Reading, Writing, dan Speaking, dengan skor band 1 hingga 9.", "Strategi Reading: baca pertanyaan dulu sebelum teks, lalu cari kata kunci untuk menemukan jawaban lebih cepat.", "Contoh Writing Task 1: mendeskripsikan grafik dengan kalimat pembuka, tren utama, lalu detail pendukung data.", "Coba latih Speaking Part 1: jawab pertanyaan sederhana seperti 'Tell me about your hometown' selama 1-2 menit.", "Latihan konsisten dengan simulasi waktu asli membantu meningkatkan kecepatan dan akurasi di hari ujian sesungguhnya.", "Konsep lanjutan: pada Writing Task 2, penting menyusun argumen dengan struktur jelas: pendahuluan, isi, dan kesimpulan.", "Proyek mini: coba tulis satu paragraf pendapat tentang pentingnya belajar bahasa asing, minimal 4 kalimat.", "Refleksi: skor IELTS yang baik datang dari latihan konsisten, bukan hanya menghafal kosakata di menit terakhir."], "quiz": [{"q": "IELTS Academic menguji berapa keterampilan utama?", "opt": ["2", "3", "4", "5"], "a": 2, "exp": "IELTS menguji 4 keterampilan: Listening, Reading, Writing, dan Speaking."}, {"q": "Strategi efektif dalam Reading adalah...", "opt": ["Membaca seluruh teks dulu tanpa lihat soal", "Membaca soal dulu lalu cari kata kunci", "Menghafal teks", "Melewati soal sulit tanpa dibaca"], "a": 1, "exp": "Membaca pertanyaan lebih dulu membantu mencari jawaban lebih efisien."}, {"q": "Skor IELTS dinyatakan dalam bentuk...", "opt": ["Persentase", "Band 1-9", "Huruf A-F", "Angka 0-100"], "a": 1, "exp": "IELTS menggunakan skala band dari 1 hingga 9."}, {"q": "Struktur penting dalam Writing Task 2 meliputi...", "opt": ["Hanya kesimpulan", "Pendahuluan, isi, dan kesimpulan", "Daftar kosakata saja", "Gambar pendukung"], "a": 1, "exp": "Esai yang baik memiliki struktur jelas: pendahuluan, isi argumen, dan kesimpulan."}, {"q": "Paragraf pendapat yang baik sebaiknya memuat minimal...", "opt": ["1 kalimat", "2 kalimat", "4 kalimat", "10 kalimat"], "a": 2, "exp": "Paragraf pendapat idealnya cukup panjang untuk menjelaskan ide, biasanya 4 kalimat atau lebih."}, {"q": "Skor IELTS yang baik paling didukung oleh...", "opt": ["Menghafal kosakata di menit terakhir", "Latihan konsisten", "Keberuntungan", "Menebak jawaban"], "a": 1, "exp": "Latihan rutin dan konsisten jauh lebih efektif dibanding belajar mendadak."}]}, "Python dari Nol": {"modules": ["Python adalah bahasa pemrograman yang mudah dibaca, cocok untuk pemula yang baru belajar logika pemrograman.", "Variabel menyimpan data, contohnya nama = 'Budi' menyimpan teks, dan umur = 20 menyimpan angka.", "Contoh kode: print('Halo, ' + nama) akan menampilkan 'Halo, Budi' di layar.", "Coba tulis kode sederhana: buat variabel umur, lalu cetak kalimat 'Umur saya X tahun' menggunakan variabel itu.", "Setelah menguasai dasar, kamu bisa belajar struktur kontrol seperti if dan for untuk membuat program yang lebih kompleks.", "Konsep lanjutan: pernyataan if memungkinkan program mengambil keputusan, misalnya 'jika umur >= 18, maka cetak dewasa'.", "Proyek mini: buat program sederhana yang mengecek apakah sebuah angka genap atau ganjil menggunakan if dan modulus (%).", "Refleksi: belajar logika pemrograman lebih penting daripada menghafal sintaks, karena logika bisa dipakai di bahasa pemrograman lain."], "quiz": [{"q": "Perintah untuk menampilkan teks di Python adalah...", "opt": ["display()", "print()", "show()", "echo()"], "a": 1, "exp": "print() adalah fungsi bawaan Python untuk menampilkan output."}, {"q": "Manakah contoh variabel yang valid di Python?", "opt": ["2nama = 'Budi'", "nama = 'Budi'", "nama- = 'Budi'", "nama 1 = 'Budi'"], "a": 1, "exp": "Nama variabel tidak boleh diawali angka atau mengandung spasi/simbol tak valid."}, {"q": "Python cocok untuk pemula karena...", "opt": ["Sintaksnya rumit", "Sintaksnya mudah dibaca", "Hanya untuk ahli", "Tidak bisa dipakai di web"], "a": 1, "exp": "Python dirancang dengan sintaks yang sederhana dan mudah dibaca."}, {"q": "Pernyataan if digunakan untuk...", "opt": ["Mengulang kode", "Mengambil keputusan berdasarkan kondisi", "Menyimpan data", "Menghapus variabel"], "a": 1, "exp": "if memungkinkan program menjalankan kode tertentu hanya jika kondisi terpenuhi."}, {"q": "Operator % (modulus) biasanya digunakan untuk mengecek...", "opt": ["Jumlah huruf", "Sisa pembagian, misalnya genap/ganjil", "Panjang teks", "Jenis data"], "a": 1, "exp": "Modulus menghasilkan sisa pembagian, berguna untuk mengecek bilangan genap atau ganjil."}, {"q": "Hal yang lebih penting dikuasai saat belajar pemrograman adalah...", "opt": ["Menghafal sintaks", "Memahami logika pemrograman", "Mengetik secepat mungkin", "Menghafal nama variabel orang lain"], "a": 1, "exp": "Logika pemrograman bisa diterapkan ke berbagai bahasa, sementara sintaks berbeda-beda."}]}, "Web Development Modern": {"modules": ["Website dibangun dari tiga bagian utama: HTML untuk struktur, CSS untuk tampilan, dan JavaScript untuk interaksi.", "HTML menggunakan tag seperti <h1> untuk judul dan <p> untuk paragraf agar konten tersusun rapi.", "Contoh CSS: 'color: blue;' membuat teks berwarna biru, dan 'font-size: 20px;' mengatur ukuran huruf.", "Coba buat halaman sederhana dengan satu judul dan satu paragraf, lalu beri warna latar menggunakan CSS.", "Setelah menguasai dasar, kamu bisa belajar JavaScript untuk membuat tombol atau formulir yang interaktif.", "Konsep lanjutan: responsive design membuat tampilan website menyesuaikan diri baik di layar HP maupun komputer.", "Proyek mini: tambahkan satu tombol pada halamanmu, lalu beri efek warna berubah saat kursor diarahkan ke tombol itu (hover).", "Refleksi: website yang baik tidak hanya terlihat bagus, tapi juga cepat diakses dan mudah dipakai oleh semua orang."], "quiz": [{"q": "HTML digunakan untuk mengatur...", "opt": ["Warna halaman", "Struktur konten halaman", "Interaksi tombol", "Kecepatan internet"], "a": 1, "exp": "HTML berfungsi membangun struktur dan konten dasar sebuah halaman web."}, {"q": "CSS digunakan untuk mengatur...", "opt": ["Struktur data", "Tampilan dan gaya halaman", "Logika program", "Koneksi database"], "a": 1, "exp": "CSS mengatur tampilan visual seperti warna, ukuran, dan tata letak."}, {"q": "JavaScript biasanya digunakan untuk...", "opt": ["Mendesain warna saja", "Menambahkan interaksi pada halaman", "Membuat struktur teks", "Mengatur ukuran font"], "a": 1, "exp": "JavaScript membuat halaman web menjadi interaktif, misalnya saat tombol diklik."}, {"q": "Responsive design bertujuan agar website...", "opt": ["Hanya bisa dibuka di komputer", "Menyesuaikan tampilan di berbagai ukuran layar", "Selalu berwarna putih", "Tidak bisa diklik"], "a": 1, "exp": "Responsive design membuat tampilan website menyesuaikan diri di HP, tablet, maupun komputer."}, {"q": "Efek warna berubah saat kursor diarahkan ke tombol disebut...", "opt": ["Focus", "Hover", "Active", "Load"], "a": 1, "exp": "Efek 'hover' pada CSS mengubah tampilan elemen saat kursor berada di atasnya."}, {"q": "Website yang baik sebaiknya memperhatikan...", "opt": ["Hanya tampilan visual", "Kecepatan dan kemudahan akses", "Jumlah warna sebanyak mungkin", "Ukuran file sebesar mungkin"], "a": 1, "exp": "Website yang baik menyeimbangkan tampilan, kecepatan, dan kemudahan digunakan semua orang."}]}, "UI/UX Design Fundamental": {"modules": ["UI (User Interface) berkaitan dengan tampilan visual, sedangkan UX (User Experience) berkaitan dengan pengalaman pengguna secara keseluruhan.", "Riset pengguna membantu memahami kebutuhan nyata mereka sebelum mendesain, misalnya lewat wawancara atau survei singkat.", "Contoh wireframe: sketsa kasar tata letak halaman tanpa warna, untuk menentukan posisi tombol dan konten utama.", "Coba buat wireframe sederhana untuk halaman login: di mana posisi kolom email, kata sandi, dan tombol masuk?", "Prototipe interaktif memungkinkan desainer menguji alur penggunaan sebelum produk benar-benar dikembangkan oleh programmer.", "Konsep lanjutan: usability testing adalah proses menguji produk ke pengguna asli untuk menemukan bagian yang membingungkan.", "Proyek mini: amati satu aplikasi yang sering kamu pakai, lalu catat satu hal yang menurutmu bisa diperbaiki dari segi kemudahan pakai.", "Refleksi: desain yang baik sering kali tidak terlihat mencolok, tapi terasa karena penggunanya tidak kebingungan saat memakainya."], "quiz": [{"q": "UX berfokus pada...", "opt": ["Warna tombol saja", "Pengalaman pengguna secara keseluruhan", "Jenis font", "Ukuran logo"], "a": 1, "exp": "UX (User Experience) berkaitan dengan keseluruhan pengalaman pengguna saat memakai produk."}, {"q": "Wireframe biasanya digunakan untuk...", "opt": ["Menentukan warna akhir produk", "Sketsa kasar tata letak halaman", "Menulis kode program", "Menentukan harga produk"], "a": 1, "exp": "Wireframe adalah sketsa dasar tata letak sebelum desain visual dibuat."}, {"q": "Riset pengguna dilakukan untuk...", "opt": ["Menentukan harga jual", "Memahami kebutuhan nyata pengguna", "Memilih nama perusahaan", "Menentukan jam kerja tim"], "a": 1, "exp": "Riset pengguna membantu desainer memahami kebutuhan dan masalah nyata penggunanya."}, {"q": "Usability testing dilakukan untuk...", "opt": ["Menentukan harga produk", "Menemukan bagian yang membingungkan pengguna", "Memilih warna logo", "Menghitung biaya produksi"], "a": 1, "exp": "Usability testing menguji produk langsung ke pengguna untuk menemukan masalah kemudahan pakai."}, {"q": "Mengamati aplikasi yang sudah ada bermanfaat untuk...", "opt": ["Menyalin seluruh desainnya", "Belajar dari kelebihan dan kekurangannya", "Menentukan harga jual", "Mengubah nama aplikasi"], "a": 1, "exp": "Mengamati produk lain membantu belajar dari praktik baik maupun kekurangan yang ada."}, {"q": "Desain yang baik biasanya ditandai dengan...", "opt": ["Tampilan paling mencolok", "Pengguna tidak kebingungan saat memakainya", "Warna paling banyak", "Fitur paling rumit"], "a": 1, "exp": "Desain yang baik membuat pengguna nyaman dan tidak bingung, meski tampilannya sederhana."}]}, "Desain Grafis dengan Canva": {"modules": ["Canva adalah alat desain berbasis drag-and-drop yang memudahkan siapa saja membuat poster, logo, dan konten media sosial.", "Prinsip dasar desain meliputi keseimbangan, kontras, dan konsistensi warna agar hasil terlihat rapi dan profesional.", "Contoh: gunakan maksimal 2-3 warna utama dan 2 jenis huruf agar desain tidak terlihat ramai.", "Coba buat satu poster sederhana dengan judul besar, satu gambar pendukung, dan warna latar yang kontras.", "Konsistensi gaya desain antar konten membantu membangun identitas visual yang mudah dikenali oleh audiens.", "Konsep lanjutan: hierarki visual mengatur elemen mana yang dilihat pertama kali, misalnya judul dibuat lebih besar dari teks lain.", "Proyek mini: buat satu desain undangan sederhana dengan judul besar, tanggal, dan satu gambar pendukung.", "Refleksi: desain yang baik membantu pesan tersampaikan lebih cepat, bukan sekadar terlihat indah."], "quiz": [{"q": "Canva dikenal sebagai alat desain yang...", "opt": ["Hanya untuk ahli", "Mudah digunakan dengan drag-and-drop", "Tidak bisa dipakai pemula", "Khusus untuk video"], "a": 1, "exp": "Canva dirancang mudah dipakai lewat sistem seret dan lepas (drag-and-drop)."}, {"q": "Berapa jumlah warna utama yang disarankan dalam satu desain?", "opt": ["6-8 warna", "2-3 warna", "10 warna lebih", "1 warna saja selalu"], "a": 1, "exp": "Membatasi 2-3 warna utama membuat desain lebih rapi dan tidak ramai."}, {"q": "Konsistensi gaya desain penting untuk...", "opt": ["Menambah biaya produksi", "Membangun identitas visual", "Mempersulit audiens", "Mengurangi jumlah konten"], "a": 1, "exp": "Gaya yang konsisten membantu audiens mengenali identitas visual sebuah brand."}, {"q": "Hierarki visual berfungsi untuk...", "opt": ["Menentukan elemen mana yang dilihat lebih dulu", "Menentukan jumlah warna", "Memilih jenis file", "Mengatur ukuran file"], "a": 0, "exp": "Hierarki visual mengatur urutan elemen yang dilihat pengguna, biasanya dari yang paling penting."}, {"q": "Pada desain undangan, judul biasanya dibuat...", "opt": ["Lebih kecil dari teks lain", "Lebih besar agar menonjol", "Berwarna sama dengan latar", "Disembunyikan"], "a": 1, "exp": "Judul biasanya dibuat lebih besar agar menjadi fokus utama yang pertama kali dilihat."}, {"q": "Tujuan utama desain yang baik adalah...", "opt": ["Terlihat seindah mungkin saja", "Membantu pesan tersampaikan dengan jelas", "Menggunakan sebanyak mungkin elemen", "Meniru desain orang lain"], "a": 1, "exp": "Desain yang baik membantu audiens memahami pesan dengan cepat dan jelas."}]}, "Dasar Kewirausahaan": {"modules": ["Kewirausahaan dimulai dari ide yang menyelesaikan masalah nyata di sekitar kita, bukan sekadar ikut tren.", "Validasi pasar berarti menguji apakah orang benar-benar membutuhkan produk tersebut sebelum diproduksi secara besar.", "Contoh: sebelum membuka usaha makanan, coba jual dalam jumlah kecil dulu dan minta masukan dari pembeli.", "Coba latih: tuliskan satu masalah di sekitarmu, lalu pikirkan ide produk atau jasa yang bisa menjawabnya.", "Rencana bisnis sederhana mencakup target pasar, cara menjual, dan perkiraan modal yang dibutuhkan di awal.", "Konsep lanjutan: proposisi nilai menjelaskan mengapa pelanggan harus memilih produkmu dibanding produk lain yang sejenis.", "Proyek mini: tuliskan satu kalimat proposisi nilai untuk ide usahamu, misalnya 'Kami membantu X menyelesaikan Y dengan cara Z'.", "Refleksi: kegagalan kecil di awal usaha adalah bagian normal dari belajar, bukan tanda bahwa idemu buruk."], "quiz": [{"q": "Ide bisnis yang baik sebaiknya berangkat dari...", "opt": ["Tren sesaat", "Masalah nyata di sekitar", "Modal besar", "Nama yang unik"], "a": 1, "exp": "Ide bisnis yang kuat biasanya menjawab masalah nyata yang dialami orang."}, {"q": "Validasi pasar dilakukan untuk...", "opt": ["Menambah jumlah karyawan", "Menguji apakah produk dibutuhkan", "Menentukan nama toko", "Mendaftarkan merek dagang"], "a": 1, "exp": "Validasi pasar menguji permintaan nyata sebelum produksi besar-besaran."}, {"q": "Rencana bisnis sederhana sebaiknya mencakup...", "opt": ["Hanya nama produk", "Target pasar, cara jual, dan modal", "Logo perusahaan saja", "Daftar pesaing saja"], "a": 1, "exp": "Rencana bisnis dasar perlu mencakup target pasar, strategi penjualan, dan perkiraan modal."}, {"q": "Proposisi nilai menjelaskan...", "opt": ["Harga produk", "Alasan pelanggan memilih produkmu", "Nama perusahaan", "Lokasi usaha"], "a": 1, "exp": "Proposisi nilai menjelaskan keunggulan dan alasan pelanggan memilih produk tertentu."}, {"q": "Format umum proposisi nilai adalah...", "opt": ["Daftar harga produk", "Membantu X menyelesaikan Y dengan cara Z", "Nama dan alamat usaha", "Jumlah karyawan"], "a": 1, "exp": "Proposisi nilai biasa disusun dengan format yang menjelaskan masalah, solusi, dan caranya."}, {"q": "Kegagalan kecil di awal usaha sebaiknya dipandang sebagai...", "opt": ["Tanda untuk menyerah", "Bagian normal dari proses belajar", "Bukti ide pasti gagal", "Alasan mengganti nama usaha"], "a": 1, "exp": "Kegagalan kecil adalah bagian wajar dari proses belajar dan memperbaiki usaha."}]}, "Akuntansi untuk UMKM": {"modules": ["Akuntansi sederhana membantu pemilik usaha mencatat pemasukan dan pengeluaran agar keuangan lebih mudah dipantau.", "Arus kas adalah catatan uang masuk dan keluar dari usaha dalam periode tertentu, misalnya per bulan.", "Contoh: jika pemasukan Rp5.000.000 dan pengeluaran Rp3.500.000, maka keuntungan bersih bulan itu adalah Rp1.500.000.", "Coba hitung: usaha mendapat pemasukan Rp8.000.000 dan pengeluaran Rp6.200.000, berapa keuntungan bersihnya?", "Laporan keuangan sederhana membantu pemilik UMKM mengambil keputusan, seperti kapan waktu tepat menambah modal usaha.", "Konsep lanjutan: aset adalah semua yang dimiliki usaha (uang, barang, peralatan), sedangkan kewajiban adalah utang yang harus dibayar.", "Proyek mini: catat tiga aset dan satu kewajiban yang mungkin dimiliki usaha kecil seperti warung makan.", "Refleksi: pencatatan keuangan yang rapi bukan hanya untuk pajak, tapi membantu pemilik usaha melihat kondisi usahanya dengan jujur."], "quiz": [{"q": "Arus kas mencatat...", "opt": ["Jumlah karyawan", "Uang masuk dan keluar usaha", "Harga saham", "Jumlah pelanggan"], "a": 1, "exp": "Arus kas adalah catatan pergerakan uang masuk dan keluar dari suatu usaha."}, {"q": "Jika pemasukan Rp8.000.000 dan pengeluaran Rp6.200.000, keuntungan bersihnya adalah...", "opt": ["Rp1.200.000", "Rp1.800.000", "Rp2.000.000", "Rp6.200.000"], "a": 1, "exp": "Rp8.000.000 - Rp6.200.000 = Rp1.800.000."}, {"q": "Laporan keuangan sederhana berguna untuk...", "opt": ["Menentukan warna logo", "Mengambil keputusan usaha", "Menentukan jam buka toko", "Memilih nama usaha"], "a": 1, "exp": "Laporan keuangan membantu pemilik usaha mengambil keputusan berdasarkan data, bukan tebakan."}, {"q": "Aset usaha mencakup...", "opt": ["Hanya uang tunai", "Uang, barang, dan peralatan milik usaha", "Utang usaha", "Nama pemilik usaha"], "a": 1, "exp": "Aset mencakup semua kekayaan yang dimiliki usaha, termasuk uang, barang, dan peralatan."}, {"q": "Kewajiban dalam akuntansi berarti...", "opt": ["Aset usaha", "Utang yang harus dibayar", "Keuntungan bersih", "Nama produk"], "a": 1, "exp": "Kewajiban adalah utang atau tanggungan yang harus dibayar oleh usaha."}, {"q": "Manfaat pencatatan keuangan yang rapi adalah...", "opt": ["Hanya untuk keperluan pajak", "Melihat kondisi usaha secara jujur", "Menambah jumlah pelanggan", "Mengubah nama usaha"], "a": 1, "exp": "Pencatatan rapi membantu pemilik usaha memahami kondisi keuangan sebenarnya."}]}, "Gitar Akustik Pemula": {"modules": ["Gitar akustik dimainkan dengan memetik atau menggenjreng senar menggunakan tangan kanan, sementara tangan kiri menekan kunci (chord).", "Kunci dasar seperti C, G, Am, dan F adalah kunci paling umum dipakai di banyak lagu populer.", "Contoh pola strumming dasar: down-down-up-up-down-up, dimainkan berulang mengikuti ketukan lagu.", "Coba latih: pindahkan jari dari kunci C ke G secara perlahan, ulangi sampai terasa lancar tanpa melihat jari.", "Latihan rutin 15-20 menit sehari lebih efektif daripada latihan lama sekali seminggu untuk membangun kebiasaan jari.", "Konsep lanjutan: fingerpicking adalah teknik memetik senar satu per satu dengan jari, berbeda dari strumming yang menyapu semua senar.", "Proyek mini: coba mainkan progresi kunci C - G - Am - F berulang kali sambil menjaga tempo tetap stabil.", "Refleksi: kesabaran lebih penting daripada bakat di awal belajar gitar, karena jari butuh waktu untuk terbiasa."], "quiz": [{"q": "Tangan kiri pada gitar akustik umumnya berfungsi untuk...", "opt": ["Memetik senar", "Menekan kunci (chord)", "Mengatur volume", "Menyetel senar"], "a": 1, "exp": "Tangan kiri menekan senar pada fret untuk membentuk kunci (chord)."}, {"q": "Manakah yang termasuk kunci dasar gitar?", "opt": ["C, G, Am, F", "Do, Re, Mi, Fa", "A, B, C, D hanya not", "1, 2, 3, 4"], "a": 0, "exp": "C, G, Am, dan F adalah beberapa kunci dasar yang paling umum dipelajari pemula."}, {"q": "Latihan gitar yang efektif sebaiknya dilakukan...", "opt": ["Sekali lama tiap minggu", "Rutin sebentar tiap hari", "Hanya saat mood bagus", "Tanpa jadwal tetap"], "a": 1, "exp": "Latihan rutin walau singkat setiap hari lebih efektif membangun kebiasaan jari dibanding latihan jarang."}, {"q": "Fingerpicking berbeda dari strumming karena...", "opt": ["Memetik senar satu per satu dengan jari", "Hanya menggunakan pick", "Tidak menyentuh senar", "Menggunakan kaki"], "a": 0, "exp": "Fingerpicking memetik senar satu per satu, berbeda dari strumming yang menyapu semua senar sekaligus."}, {"q": "Progresi kunci C - G - Am - F adalah contoh dari...", "opt": ["Satu kunci tunggal", "Perpindahan antar kunci (progresi akor)", "Jenis senar gitar", "Nada tunggal"], "a": 1, "exp": "Progresi akor adalah urutan perpindahan beberapa kunci yang dimainkan berurutan."}, {"q": "Hal yang paling dibutuhkan pemula saat belajar gitar adalah...", "opt": ["Bakat alami", "Kesabaran dan latihan rutin", "Gitar yang mahal", "Menghafal teori musik dulu"], "a": 1, "exp": "Kesabaran dan latihan rutin lebih menentukan kemajuan dibanding bakat semata."}]}, "Teori Musik Praktis": {"modules": ["Not adalah simbol yang mewakili tinggi dan durasi suara, menjadi bahasa dasar untuk membaca dan menulis musik.", "Tangga nada mayor, seperti C mayor (C-D-E-F-G-A-B-C), adalah susunan not yang terdengar ceria dan stabil.", "Contoh harmoni: akor C mayor terdiri dari not C, E, dan G yang dimainkan bersamaan.", "Coba identifikasi: not apa saja yang membentuk akor G mayor? Petunjuk, pola intervalnya sama seperti akor mayor lain.", "Memahami teori musik membantu pemain memahami mengapa sebuah lagu terasa pas didengar, bukan hanya menghafal not.", "Konsep lanjutan: akor minor terdengar lebih sendu dibanding akor mayor, meski dibentuk dari pola not yang mirip.", "Proyek mini: bandingkan bunyi akor C mayor dan A minor, lalu tuliskan kesan yang kamu rasakan dari masing-masing.", "Refleksi: tidak perlu menghafal semua teori sekaligus; memahami sedikit demi sedikit sambil praktik langsung lebih efektif."], "quiz": [{"q": "Tangga nada C mayor terdiri dari not...", "opt": ["C-D-E-F-G-A-B", "A-B-C-D-E-F-G", "C-E-G saja", "Do-Mi-Sol saja"], "a": 0, "exp": "Tangga nada C mayor tersusun dari not C, D, E, F, G, A, B."}, {"q": "Akor C mayor terbentuk dari not...", "opt": ["C, D, E", "C, E, G", "C, F, A", "D, F, A"], "a": 1, "exp": "Akor C mayor terdiri dari not C, E, dan G yang dimainkan bersamaan."}, {"q": "Memahami teori musik membantu pemain untuk...", "opt": ["Menghafal not tanpa paham", "Memahami mengapa lagu terdengar pas", "Mengganti alat musik", "Menentukan harga alat musik"], "a": 1, "exp": "Teori musik membantu memahami struktur dan alasan di balik harmoni sebuah lagu."}, {"q": "Akor minor umumnya terdengar...", "opt": ["Lebih ceria", "Lebih sendu", "Sama persis dengan mayor", "Tidak memiliki nada"], "a": 1, "exp": "Akor minor cenderung memberi kesan sendu dibanding akor mayor yang terdengar ceria."}, {"q": "Cara terbaik memahami teori musik adalah dengan...", "opt": ["Menghafal semua sekaligus", "Memahami sedikit demi sedikit sambil praktik", "Menghindari praktik langsung", "Hanya membaca buku tanpa mendengar"], "a": 1, "exp": "Belajar bertahap sambil mempraktikkannya langsung membantu pemahaman lebih melekat."}, {"q": "Membandingkan bunyi akor mayor dan minor membantu melatih...", "opt": ["Kekuatan tangan", "Kepekaan mendengar nuansa musik", "Kecepatan mengetik not", "Menghafal angka"], "a": 1, "exp": "Latihan mendengarkan perbedaan akor melatih kepekaan musikal seseorang."}]}, "Intensif UTBK-SNBT": {"modules": ["UTBK-SNBT menguji Tes Potensi Skolastik (TPS), literasi Bahasa Indonesia dan Inggris, serta penalaran matematika.", "TPS mengukur kemampuan bernalar, bukan hafalan, sehingga latihan soal penalaran logis sangat penting dilakukan rutin.", "Contoh soal literasi: membaca satu paragraf lalu menjawab pertanyaan tentang ide pokok atau kesimpulan teks.", "Coba latih manajemen waktu: kerjakan 10 soal dalam 15 menit, lalu periksa jawaban yang salah untuk dipelajari.", "Pembahasan tiap soal yang salah penting dipelajari agar kesalahan serupa tidak terulang saat ujian sesungguhnya.", "Konsep lanjutan: penalaran matematika pada UTBK sering berbentuk soal cerita yang perlu diterjemahkan dulu menjadi persamaan.", "Proyek mini: coba buat satu soal cerita sederhana tentang kecepatan, lalu selesaikan sendiri langkah-langkahnya.", "Refleksi: progres belajar UTBK lebih terasa jika dipantau mingguan, bukan hanya dinilai dari satu kali latihan soal."], "quiz": [{"q": "UTBK-SNBT menguji kemampuan penalaran, bukan sekadar...", "opt": ["Logika", "Hafalan", "Membaca", "Berhitung"], "a": 1, "exp": "TPS pada UTBK-SNBT dirancang menguji penalaran, bukan hafalan materi."}, {"q": "Latihan literasi biasanya melibatkan...", "opt": ["Menghafal rumus", "Membaca teks dan menjawab soal pemahaman", "Menghitung cepat saja", "Menggambar diagram"], "a": 1, "exp": "Soal literasi menguji pemahaman bacaan, seperti ide pokok dan kesimpulan teks."}, {"q": "Mempelajari soal yang salah berguna untuk...", "opt": ["Menghabiskan waktu", "Menghindari kesalahan serupa", "Menambah nilai otomatis", "Mengganti jadwal ujian"], "a": 1, "exp": "Memahami kesalahan membantu mencegah kesalahan yang sama terulang di ujian sesungguhnya."}, {"q": "Soal penalaran matematika pada UTBK biasanya berbentuk...", "opt": ["Hitungan langsung tanpa konteks", "Soal cerita yang perlu diterjemahkan dulu", "Hafalan rumus saja", "Gambar tanpa teks"], "a": 1, "exp": "Soal UTBK sering disajikan dalam bentuk cerita yang perlu diubah menjadi persamaan matematika."}, {"q": "Langkah pertama menyelesaikan soal cerita matematika adalah...", "opt": ["Langsung menebak jawaban", "Menerjemahkan cerita menjadi persamaan", "Menghitung tanpa membaca soal", "Melewati soal tersebut"], "a": 1, "exp": "Soal cerita perlu diterjemahkan dulu ke bentuk persamaan sebelum dihitung."}, {"q": "Progres belajar UTBK sebaiknya dipantau...", "opt": ["Hanya sekali di akhir", "Secara mingguan", "Tidak perlu dipantau", "Hanya sehari sebelum ujian"], "a": 1, "exp": "Pemantauan mingguan membantu melihat perkembangan dan area yang perlu diperbaiki lebih awal."}]}, "Try Out Nasional Bulanan": {"modules": ["Try out adalah simulasi ujian sungguhan yang membantu mengukur kesiapan sebelum menghadapi ujian resmi.", "Hasil try out memberi gambaran peringkat nasional, sehingga kamu tahu posisi kemampuanmu dibanding peserta lain.", "Contoh manfaat: dari hasil try out, kamu bisa tahu subtes mana yang masih lemah dan perlu diperbaiki.", "Coba simulasikan: kerjakan try out dalam kondisi seperti ujian asli, tanpa gangguan, dan sesuai batas waktu.", "Analisis nilai setelah try out membantu menyusun strategi belajar yang lebih terarah untuk bulan berikutnya.", "Konsep lanjutan: membandingkan hasil try out dari bulan ke bulan membantu melihat tren kemajuan, bukan hanya nilai sesaat.", "Proyek mini: buat catatan subtes mana yang nilainya paling rendah pada try out terakhirmu, lalu rencanakan waktu belajar tambahan untuk itu.", "Refleksi: nilai try out yang naik turun adalah hal wajar; yang penting adalah tren jangka panjang, bukan satu kali hasil."], "quiz": [{"q": "Tujuan utama try out adalah...", "opt": ["Mengisi waktu luang", "Mengukur kesiapan sebelum ujian resmi", "Mengganti ujian asli", "Menentukan nilai rapor"], "a": 1, "exp": "Try out membantu mengukur sejauh mana kesiapan seseorang sebelum ujian sesungguhnya."}, {"q": "Hasil try out biasanya menunjukkan...", "opt": ["Nama sekolah terbaik", "Peringkat nasional peserta", "Jadwal ujian resmi", "Harga pendaftaran ujian"], "a": 1, "exp": "Try out umumnya memberikan gambaran peringkat dibanding peserta lain secara nasional."}, {"q": "Analisis nilai setelah try out berguna untuk...", "opt": ["Menghapus hasil ujian", "Menyusun strategi belajar berikutnya", "Mengganti soal ujian asli", "Menentukan uang pendaftaran"], "a": 1, "exp": "Analisis nilai membantu menyusun rencana belajar yang lebih fokus pada kelemahan."}, {"q": "Membandingkan hasil try out antar bulan berguna untuk melihat...", "opt": ["Nilai sesaat saja", "Tren kemajuan belajar", "Jadwal ujian resmi", "Nama peserta lain"], "a": 1, "exp": "Membandingkan beberapa hasil try out membantu melihat tren kemajuan dari waktu ke waktu."}, {"q": "Jika satu subtes nilainya rendah, langkah yang tepat adalah...", "opt": ["Mengabaikannya", "Menambah waktu belajar untuk subtes itu", "Berhenti belajar subtes itu", "Mengganti jadwal try out"], "a": 1, "exp": "Subtes dengan nilai rendah perlu mendapat porsi belajar tambahan agar lebih kuat."}, {"q": "Nilai try out yang naik turun termasuk hal yang...", "opt": ["Tidak normal", "Wajar, yang penting tren jangka panjang", "Harus dihindari sepenuhnya", "Menandakan kegagalan total"], "a": 1, "exp": "Fluktuasi nilai adalah wajar; yang lebih penting adalah tren perbaikan secara keseluruhan."}]}};
let currentCourse = null;
let quizAnswers = {}; // { "Judul": [pilihanIndex atau null, ...] }
const quizKey = () => 'edusmart_quiz_' + (getSession() || 'tamu');
let allQuizAnswers = {};
function loadQuizAnswers() {
  try { allQuizAnswers = JSON.parse(store.getItem(quizKey()) || '{}'); } catch (e) { allQuizAnswers = {}; }
}
function saveQuizAnswers() {
  try { store.setItem(quizKey(), JSON.stringify(allQuizAnswers)); } catch (e) {}
}

function openCourse(title, emoji, desc) {
  currentCourse = title;
  if (!progress[title]) progress[title] = MODULES.map(() => false);
  $('#cmEmoji').textContent = emoji;
  $('#cmTitle').textContent = title;
  $('#cmDesc').textContent = desc;
  setCmTab('materi');
  renderModules();
  renderQuiz();
  $('#courseModal').classList.add('open');
  document.body.classList.add('lock');
}
function closeCourse() {
  $('#courseModal').classList.remove('open');
  document.body.classList.remove('lock');
}
function setCmTab(tab) {
  $$('.tabs button[data-cmtab]').forEach(b => b.classList.toggle('on', b.dataset.cmtab === tab));
  $('#cmPanelMateri').style.display = tab === 'materi' ? 'block' : 'none';
  $('#cmPanelKuis').style.display = tab === 'kuis' ? 'block' : 'none';
}
$$('.tabs button[data-cmtab]').forEach(b => b.addEventListener('click', () => setCmTab(b.dataset.cmtab)));

function renderModules() {
  const done = progress[currentCourse];
  const texts = (CONTENT[currentCourse] && CONTENT[currentCourse].modules) || [];
  const n = done.filter(Boolean).length;
  const pct = Math.round(n / MODULES.length * 100);
  $('#cmBar').style.width = pct + '%';
  $('#cmPct').textContent = n + ' dari ' + MODULES.length + ' modul selesai (' + pct + '%)';
  $('#cmModules').innerHTML = '';
  MODULES.forEach((m, i) => {
    const li = document.createElement('li');
    li.className = done[i] ? 'done' : '';
    li.innerHTML = '<div class="row"><input type="checkbox" ' + (done[i] ? 'checked' : '') +
      '><span>Modul ' + (i + 1) + ': ' + m + '</span></div><p class="mtxt">' + (texts[i] || '') + '</p>';
    li.addEventListener('click', e => {
      e.preventDefault();
      done[i] = !done[i];
      saveProgress();
      renderModules();
      paint();
    });
    $('#cmModules').appendChild(li);
  });
}

function renderQuiz() {
  const qs = (CONTENT[currentCourse] && CONTENT[currentCourse].quiz) || [];
  if (!allQuizAnswers[currentCourse]) allQuizAnswers[currentCourse] = qs.map(() => null);
  const ans = allQuizAnswers[currentCourse];
  const body = $('#cmQuizBody');
  body.innerHTML = '';
  if (!qs.length) { body.innerHTML = '<p class="hint">Kuis untuk kursus ini belum tersedia.</p>'; return; }
  qs.forEach((q, qi) => {
    const wrap = document.createElement('div');
    wrap.className = 'cm-quiz-q';
    const p = document.createElement('p');
    p.textContent = (qi + 1) + '. ' + q.q;
    wrap.appendChild(p);
    q.opt.forEach((optText, oi) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.textContent = optText;
      if (ans[qi] !== null) {
        if (oi === q.a) b.classList.add('ok');
        else if (oi === ans[qi]) b.classList.add('bad');
      }
      b.addEventListener('click', () => {
        ans[qi] = oi;
        saveQuizAnswers();
        renderQuiz();
      });
      wrap.appendChild(b);
    });
    if (ans[qi] !== null) {
      const exp = document.createElement('p');
      exp.className = 'hint';
      exp.style.marginTop = '8px';
      exp.textContent = (ans[qi] === q.a ? '✅ Benar! ' : '❌ Belum tepat. ') + q.exp;
      wrap.appendChild(exp);
    }
    body.appendChild(wrap);
  });
  const answered = ans.filter(a => a !== null).length;
  const correct = ans.filter((a, i) => a === qs[i].a).length;
  $('#cmQuizMsg').textContent = answered === qs.length
    ? 'Selesai! Skor kamu: ' + correct + ' dari ' + qs.length + ' benar.'
    : answered + ' dari ' + qs.length + ' soal dijawab.';
}

const GLOSSARY = {"Aljabar Dasar untuk Pemula": [["Variabel", "Simbol (biasanya huruf seperti x atau y) yang mewakili nilai belum diketahui."], ["Persamaan", "Kalimat matematika yang menyatakan dua ekspresi bernilai sama, ditandai tanda '='."], ["Koefisien", "Angka yang mengalikan sebuah variabel, misalnya angka 3 pada 3x."], ["Konstanta", "Nilai tetap dalam persamaan yang tidak terikat pada variabel apa pun."]], "Kalkulus Visual": [["Limit", "Nilai yang didekati suatu fungsi saat variabelnya mendekati titik tertentu."], ["Turunan", "Ukuran laju perubahan sesaat dari suatu fungsi terhadap variabelnya."], ["Integral", "Operasi yang menghitung akumulasi atau luas di bawah kurva suatu fungsi."], ["Fungsi", "Aturan yang memetakan setiap input ke tepat satu output."]], "Fisika Dasar SMA": [["Gaya", "Dorongan atau tarikan yang dapat mengubah gerak suatu benda, diukur dalam Newton."], ["Massa", "Ukuran banyaknya materi dalam suatu benda, memengaruhi kelembamannya."], ["Energi Kinetik", "Energi yang dimiliki benda karena geraknya, dihitung dengan ½mv²."], ["Percepatan", "Laju perubahan kecepatan suatu benda terhadap waktu."]], "Kimia Organik Ringkas": [["Gugus Fungsi", "Bagian molekul yang menentukan sifat dan reaksi khas suatu senyawa."], ["Ikatan Kovalen", "Ikatan kimia yang terbentuk dari pemakaian bersama elektron antar atom."], ["Isomer", "Senyawa dengan rumus kimia sama tetapi struktur atau susunan atom berbeda."], ["Hidrokarbon", "Senyawa yang hanya tersusun dari atom karbon dan hidrogen."]], "English for Daily Life": [["Greeting", "Sapaan atau ucapan pembuka dalam percakapan, misalnya 'Good morning'."], ["Polite Request", "Permintaan yang disampaikan dengan sopan, misalnya menggunakan 'Could I...'"], ["Small Talk", "Percakapan ringan untuk mencairkan suasana, biasanya tentang cuaca atau kabar."], ["Vocabulary", "Kumpulan kosakata atau perbendaharaan kata dalam suatu bahasa."]], "Persiapan IELTS Academic": [["Band Score", "Skala penilaian IELTS dari 1 hingga 9 untuk tiap keterampilan."], ["Skimming", "Teknik membaca cepat untuk menangkap ide umum suatu teks."], ["Scanning", "Teknik membaca cepat untuk mencari informasi atau kata kunci tertentu."], ["Paraphrase", "Menyampaikan ulang suatu ide dengan kata-kata berbeda tanpa mengubah makna."]], "Python dari Nol": [["Variabel", "Nama yang digunakan untuk menyimpan nilai data dalam program."], ["Fungsi", "Blok kode yang dapat dipanggil berulang kali untuk menjalankan tugas tertentu."], ["Looping", "Struktur kode yang mengulang suatu proses, misalnya menggunakan for atau while."], ["Syntax Error", "Kesalahan penulisan kode yang membuat program gagal dijalankan."]], "Web Development Modern": [["HTML", "Bahasa markah untuk menyusun struktur dan konten halaman web."], ["CSS", "Bahasa yang mengatur tampilan visual seperti warna, ukuran, dan tata letak."], ["JavaScript", "Bahasa pemrograman yang membuat halaman web menjadi interaktif."], ["Responsive", "Kemampuan tampilan website menyesuaikan diri di berbagai ukuran layar."]], "UI/UX Design Fundamental": [["UI (User Interface)", "Tampilan visual yang dilihat dan digunakan pengguna, seperti tombol dan warna."], ["UX (User Experience)", "Keseluruhan pengalaman pengguna saat berinteraksi dengan produk."], ["Wireframe", "Sketsa kasar tata letak halaman sebelum desain visual dibuat."], ["Prototipe", "Model awal produk yang bisa diuji sebelum dikembangkan sepenuhnya."]], "Desain Grafis dengan Canva": [["Hierarki Visual", "Urutan elemen desain berdasarkan tingkat kepentingannya bagi mata."], ["Kontras", "Perbedaan mencolok antar elemen, misalnya warna terang dan gelap, agar mudah dibaca."], ["Tipografi", "Seni memilih dan menata huruf agar nyaman dibaca dan estetis."], ["Palet Warna", "Kumpulan warna yang dipakai konsisten dalam satu karya desain."]], "Dasar Kewirausahaan": [["Validasi Pasar", "Proses menguji apakah produk benar-benar dibutuhkan sebelum diproduksi massal."], ["Proposisi Nilai", "Pernyataan yang menjelaskan keunggulan produk dibanding alternatif lain."], ["Modal", "Sumber daya (uang atau aset) yang dibutuhkan untuk memulai usaha."], ["Target Pasar", "Kelompok pelanggan spesifik yang disasar oleh suatu produk atau jasa."]], "Akuntansi untuk UMKM": [["Arus Kas", "Catatan uang masuk dan keluar dari suatu usaha dalam periode tertentu."], ["Aset", "Segala sesuatu yang dimiliki usaha dan bernilai ekonomi, seperti uang dan peralatan."], ["Kewajiban", "Utang atau tanggungan yang harus dibayar oleh suatu usaha."], ["Laba Bersih", "Selisih antara total pemasukan dan total pengeluaran usaha."]], "Gitar Akustik Pemula": [["Chord (Kunci)", "Kombinasi beberapa nada yang dimainkan bersamaan untuk membentuk harmoni."], ["Strumming", "Teknik menggenjreng senar gitar dengan pola gerakan tangan tertentu."], ["Fret", "Batang logam pada leher gitar yang menandai posisi nada tertentu."], ["Fingerpicking", "Teknik memetik senar satu per satu menggunakan jari, bukan pick."]], "Teori Musik Praktis": [["Not", "Simbol yang mewakili tinggi dan durasi suatu suara dalam musik."], ["Tangga Nada", "Susunan not berurutan dari rendah ke tinggi dalam suatu nada dasar."], ["Akor", "Gabungan beberapa not yang dimainkan bersamaan membentuk harmoni."], ["Interval", "Jarak antara dua not dalam tangga nada."]], "Intensif UTBK-SNBT": [["TPS", "Tes Potensi Skolastik, bagian UTBK yang mengukur kemampuan bernalar."], ["Literasi", "Kemampuan memahami, menganalisis, dan menggunakan informasi dari suatu teks."], ["Penalaran", "Kemampuan berpikir logis untuk menarik kesimpulan dari informasi yang ada."], ["Subtes", "Bagian-bagian ujian yang menguji kemampuan berbeda, misalnya matematika atau literasi."]], "Try Out Nasional Bulanan": [["Try Out", "Simulasi ujian untuk mengukur kesiapan sebelum ujian resmi."], ["Peringkat Nasional", "Posisi nilai seseorang dibandingkan seluruh peserta try out se-Indonesia."], ["Analisis Nilai", "Proses meninjau hasil ujian untuk menemukan kekuatan dan kelemahan."], ["Subtes", "Bagian dari ujian yang menguji kemampuan tertentu secara terpisah."]]};
const TIPS = {"Aljabar Dasar untuk Pemula": ["Selalu kerjakan kedua sisi persamaan secara seimbang.", "Latih soal dari yang mudah ke yang lebih kompleks secara bertahap.", "Gunakan contoh nyata, seperti harga barang, untuk memahami konsep variabel."], "Kalkulus Visual": ["Gambar grafik untuk membayangkan konsep limit dan turunan.", "Pahami konsep sebelum menghafal rumus turunan atau integral.", "Latih soal bertahap dari fungsi sederhana ke fungsi yang lebih kompleks."], "Fisika Dasar SMA": ["Selalu tuliskan satuan saat menghitung agar tidak salah rumus.", "Gambar diagram gaya untuk memahami soal mekanika dengan lebih jelas.", "Hubungkan rumus dengan kejadian sehari-hari agar lebih mudah diingat."], "Kimia Organik Ringkas": ["Hafalkan gugus fungsi utama lebih dulu sebelum masuk ke reaksi kompleks.", "Gambar struktur molekul untuk memahami bentuknya, jangan hanya menghafal rumus.", "Kaitkan senyawa dengan contoh produk sehari-hari agar lebih mudah diingat."], "English for Daily Life": ["Latih berbicara dengan suara keras, bukan hanya membaca dalam hati.", "Catat kosakata baru dalam kalimat utuh, bukan kata lepas.", "Dengarkan percakapan asli, misalnya podcast atau video, untuk melatih telinga."], "Persiapan IELTS Academic": ["Latih dengan waktu terbatas seperti ujian asli agar terbiasa.", "Catat kesalahan tata bahasa yang berulang lalu perbaiki satu per satu.", "Perbanyak membaca artikel berbahasa Inggris untuk memperkaya kosakata."], "Python dari Nol": ["Ketik ulang kode contoh sendiri, jangan hanya membaca.", "Uji coba kode kecil-kecil dulu sebelum membuat program yang rumit.", "Baca pesan error dengan teliti, karena biasanya menjelaskan letak kesalahan."], "Web Development Modern": ["Latih membuat halaman sederhana dulu sebelum menambah fitur rumit.", "Gunakan Inspect Element di browser untuk belajar dari website lain.", "Simpan dan coba kode secara rutin agar terbiasa dengan strukturnya."], "UI/UX Design Fundamental": ["Amati aplikasi yang sering dipakai dan catat apa yang membuatnya nyaman.", "Mulai dari sketsa kasar sebelum masuk ke desain detail.", "Minta orang lain mencoba desainmu untuk mendapat masukan jujur."], "Desain Grafis dengan Canva": ["Batasi jumlah warna dan font agar desain terlihat rapi.", "Gunakan ruang kosong (white space) agar desain tidak terasa penuh.", "Pelajari desain yang kamu sukai, lalu analisis apa yang membuatnya menarik."], "Dasar Kewirausahaan": ["Mulai dari skala kecil untuk menguji ide sebelum berinvestasi besar.", "Dengarkan masukan calon pelanggan secara terbuka, bukan hanya membenarkan diri.", "Catat semua pemasukan dan pengeluaran sejak awal usaha."], "Akuntansi untuk UMKM": ["Pisahkan uang pribadi dan uang usaha sejak awal.", "Catat transaksi sesegera mungkin agar tidak lupa atau tercampur.", "Tinjau laporan keuangan secara rutin, misalnya setiap akhir bulan."], "Gitar Akustik Pemula": ["Latih perpindahan kunci secara perlahan sebelum mempercepat tempo.", "Rekam permainanmu sendiri untuk mendengar bagian yang masih perlu diperbaiki.", "Istirahatkan jari jika terasa sakit agar latihan tetap nyaman."], "Teori Musik Praktis": ["Dengarkan sambil melihat not agar telinga dan mata terlatih bersamaan.", "Praktikkan langsung di alat musik, jangan hanya membaca teori.", "Bandingkan beberapa akor secara langsung untuk melatih kepekaan telinga."], "Intensif UTBK-SNBT": ["Kerjakan soal dengan dibatasi waktu agar terbiasa dengan tekanan ujian asli.", "Fokus memperbaiki subtes yang nilainya paling rendah terlebih dahulu.", "Pelajari pola soal, bukan hanya menghafal jawaban dari satu soal tertentu."], "Try Out Nasional Bulanan": ["Kerjakan try out dalam kondisi setenang mungkin, seperti ujian asli.", "Jangan hanya melihat skor akhir, tapi pelajari detail tiap subtes.", "Bandingkan hasil antar bulan untuk melihat perkembangan belajarmu."]};

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function downloadMaterial(title) {
  const data = CONTENT[title] || { modules: [], quiz: [] };
  const terms = GLOSSARY[title] || [];
  const tips = TIPS[title] || [];
  const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  let html = '<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Materi - ' + esc(title) + '</title><style>' +
    'body{font-family:Arial,sans-serif;max-width:720px;margin:0 auto;padding:30px 20px;line-height:1.7;color:#0f172a;background:#f8fafc}' +
    'h1{color:#4f46e5;margin-bottom:4px}.sub{color:#64748b;margin-bottom:28px}' +
    'h2{color:#3730a3;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-top:40px}' +
    '.mod{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;margin-bottom:12px}' +
    '.mod b{color:#4f46e5}.term{margin-bottom:12px}.term b{color:#3730a3}' +
    '.q{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;margin-bottom:14px}' +
    '.q p{font-weight:600;margin-bottom:8px}.q ul{margin:0 0 8px 20px;padding:0}' +
    '.ans{color:#16a34a;font-weight:600}.exp{color:#64748b;font-size:.92rem}' +
    '.footer{margin-top:40px;text-align:center;color:#94a3b8;font-size:.85rem}' +
    '</style></head><body>' +
    '<h1>' + esc(title) + '</h1><p class="sub">Materi belajar lengkap dari EduSmart &middot; diunduh ' + tanggal + '</p>';

  html += '<h2>📘 Materi Pembelajaran</h2>';
  data.modules.forEach((m, i) => {
    html += '<div class="mod"><b>Modul ' + (i + 1) + ': ' + esc(MODULES[i] || '') + '</b><p>' + esc(m) + '</p></div>';
  });

  if (terms.length) {
    html += '<h2>📖 Istilah Penting</h2>';
    terms.forEach(t => { html += '<div class="term"><b>' + esc(t[0]) + ':</b> ' + esc(t[1]) + '</div>'; });
  }

  if (tips.length) {
    html += '<h2>💡 Tips Belajar</h2><ul>';
    tips.forEach(t => { html += '<li>' + esc(t) + '</li>'; });
    html += '</ul>';
  }

  if (data.quiz.length) {
    html += '<h2>📝 Soal Latihan &amp; Kunci Jawaban</h2>';
    data.quiz.forEach((q, i) => {
      html += '<div class="q"><p>' + (i + 1) + '. ' + esc(q.q) + '</p><ul>';
      q.opt.forEach((o, oi) => { html += '<li>' + String.fromCharCode(65 + oi) + '. ' + esc(o) + '</li>'; });
      html += '</ul><p class="ans">Jawaban: ' + String.fromCharCode(65 + q.a) + '. ' + esc(q.opt[q.a]) + '</p>' +
        '<p class="exp">' + esc(q.exp) + '</p></div>';
    });
  }

  html += '<p class="footer">Dibuat dengan EduSmart &middot; Simpan file ini untuk belajar offline kapan saja.</p></body></html>';

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Materi - ' + title.replace(/[\\/:*?"<>|]/g, '') + '.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('#cmDownload').addEventListener('click', () => downloadMaterial(currentCourse));

$$('.enroll').forEach(b => b.addEventListener('click', () => {
  const card = b.closest('.course');
  openCourse(b.dataset.title, card.querySelector('.thumb').textContent.trim(), card.querySelector('p').textContent.trim());
}));
$('#courseClose').addEventListener('click', closeCourse);
$('#courseModal').addEventListener('click', e => { if (e.target.id === 'courseModal') closeCourse(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#courseModal').classList.contains('open')) closeCourse(); });
loadQuizAnswers();

// ===== Login (demo: data disimpan di browser, bukan di server) =====
let authMode = 'login';
function getUsers() {
  try { return JSON.parse(store.getItem('edusmart_users') || '{}'); } catch (e) { return {}; }
}
function getSession() {
  try { return store.getItem('edusmart_session'); } catch (e) { return null; }
}
async function hashPass(pw, salt) {
  const text = salt + pw;
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(text)));
}
function setTab(mode) {
  authMode = mode;
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === mode));
  $('#nameRow').style.display = mode === 'register' ? 'block' : 'none';
  $('#authSubmit').textContent = mode === 'register' ? 'Buat Akun' : 'Masuk';
  $('#authMsg').textContent = '';
}
function openAuth(mode) {
  setTab(mode || 'login');
  $('#authModal').classList.add('open');
  document.body.classList.add('lock');
  if (store.mem) $('#authNote').textContent = 'Penyimpanan browser diblokir: akun hanya tersimpan selama halaman ini terbuka. Buka file langsung di browser agar tersimpan permanen.';
  $('#aEmail').focus();
}
function closeAuth() {
  $('#authModal').classList.remove('open');
  document.body.classList.remove('lock');
  $$('#authForm input').forEach(i => { i.value = ''; });
  $('#aPass').type = 'password'; $('#eyeBtn').textContent = '👁️'; $('#capsWarn').style.display = 'none';
  $('#authMsg').textContent = '';
}
function renderAuth() {
  const email = getSession();
  const user = email ? getUsers()[email] : null;
  const first = user ? user.name.split(' ')[0] : '';
  $('#authBtn').textContent = user ? 'Keluar (' + first + ')' : 'Masuk';
  $('#greet').textContent = user ? 'Halo, ' + first + '! 👋' : 'Progres Belajarmu';
}
function logout() {
  try { store.removeItem('edusmart_session'); } catch (e) {}
  loadStarted();
  loadQuizAnswers();
  paint();
  renderAuth();
}

$('#authBtn').addEventListener('click', () => { getSession() ? logout() : openAuth('login'); });
$('#authClose').addEventListener('click', closeAuth);
$('#authModal').addEventListener('click', e => { if (e.target.id === 'authModal') closeAuth(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuth(); });
$$('.tabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
$('#eyeBtn').addEventListener('click', () => {
  const inp = $('#aPass');
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  $('#eyeBtn').textContent = show ? '🙈' : '👁️';
});
$('#aPass').addEventListener('keyup', e => {
  const on = typeof e.getModifierState === 'function' && e.getModifierState('CapsLock');
  $('#capsWarn').style.display = on ? 'block' : 'none';
});

async function submitAuth() {
  const msg = $('#authMsg');
  const name = $('#aName').value.trim();
  const email = $('#aEmail').value.trim().toLowerCase();
  const pass = $('#aPass').value.trim();
  msg.style.color = '#dc2626';
  if (authMode === 'register' && name.length < 2) { msg.textContent = 'Nama minimal 2 huruf.'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Format email tidak valid.'; return; }
  if (authMode === 'register') {
    const weak = ['password','12345678','123456789','qwerty123','abc12345','11111111','letmein1','iloveyou','admin123','password1'];
    if (pass.length < 8) { msg.textContent = 'Kata sandi minimal 8 karakter.'; return; }
    if (!/[a-zA-Z]/.test(pass) || !/[0-9]/.test(pass)) { msg.textContent = 'Kombinasikan huruf dan angka pada kata sandi.'; return; }
    if (weak.includes(pass.toLowerCase()) || pass.toLowerCase().includes(email.split('@')[0].toLowerCase())) { msg.textContent = 'Kata sandi terlalu umum atau mirip emailmu. Pilih yang lain.'; return; }
  } else if (pass.length < 8) { msg.textContent = 'Kata sandi minimal 8 karakter.'; return; }
  const users = getUsers();
  const btn = $('#authSubmit');
  btn.disabled = true;
  try {
    if (authMode === 'register') {
      if (users[email]) { msg.textContent = 'Email sudah terdaftar. Silakan masuk.'; btn.disabled = false; return; }
      const salt = Math.random().toString(36).slice(2);
      users[email] = { name, salt, hash: await hashPass(pass, salt) };
      store.setItem('edusmart_users', JSON.stringify(users));
    } else {
      const u = users[email];
      if (!u) { msg.textContent = 'Email ini belum terdaftar. Coba periksa ejaannya, atau beralih ke tab Daftar.'; btn.disabled = false; return; }
      if (u.hash !== await hashPass(pass, u.salt)) { msg.textContent = 'Kata sandi salah. Klik 👁️ untuk memeriksa ketikanmu, atau pastikan Caps Lock tidak aktif.'; btn.disabled = false; return; }
    }
    store.setItem('edusmart_session', email);
  } catch (err) {
    msg.textContent = 'Penyimpanan browser tidak tersedia.';
    btn.disabled = false;
    return;
  }
  btn.disabled = false;
  msg.style.color = '#16a34a';
  msg.textContent = authMode === 'register' ? '✅ Akun berhasil dibuat!' : '✅ Berhasil masuk!';
  loadStarted();
  loadQuizAnswers();
  paint();
  renderAuth();
  setTimeout(closeAuth, 700);
}
$('#authSubmit').addEventListener('click', submitAuth);
$$('#authForm input').forEach(i => i.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); submitAuth(); }
}));

loadStarted();
paint();
renderAuth();
if (store.mem) $('#previewWarn').style.display = 'inline';

// Kuis mini
const answer = Number($('#quiz').dataset.answer);
$$('.opt').forEach((o, i) => o.addEventListener('click', () => {
  $$('.opt').forEach(x => x.classList.remove('ok', 'bad'));
  const msg = $('#quizMsg');
  if (i === answer) {
    o.classList.add('ok');
    msg.textContent = '🎉 Benar! 3x = 15, jadi x = 5.';
  } else {
    o.classList.add('bad');
    msg.textContent = '❌ Belum tepat, coba lagi.';
  }
}));

// Counter statistik
const counters = $$('.stat strong');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.transition = 'transform .6s';
      e.target.style.transform = 'scale(1.1)';
      setTimeout(() => { e.target.style.transform = 'scale(1)'; }, 600);
      io.unobserve(e.target);
    }
  });
});
counters.forEach(c => io.observe(c));

// Form newsletter
function submitNews() {
  const email = $('#email').value.trim();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  $('#formMsg').textContent = ok
    ? '✅ Terima kasih! Tips belajar akan dikirim ke ' + email
    : '⚠️ Masukkan alamat email yang valid.';
  if (ok) $('#email').value = '';
}
$('#newsBtn').addEventListener('click', submitNews);
$('#email').addEventListener('keydown', e => { if (e.key === 'Enter') submitNews(); });

// Tombol kembali ke atas
const toTop = $('#toTop');
window.addEventListener('scroll', () => {
  toTop.style.display = window.scrollY > 500 ? 'block' : 'none';
});
toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
