// Sample News Data for Testing
const sampleNews = [
  {
    title: "Wisuda Akbar Pesantren 2024 - 500 Santri Lulus",
    slug: "wisuda-akbar-pesantren-2024",
    content: `<p>Alhamdulillah, pada hari yang penuh barakah ini, Pesantren Al-Hikmah telah menyelenggarakan Wisuda Akbar 2024 yang dihadiri oleh 500 santri lulusan dari berbagai program.</p>

<p>Acara yang berlangsung meriah ini dimulai dengan pembacaan ayat suci Al-Quran, dilanjutkan dengan sambutan dari Kyai dan para tamu undangan. Para santri yang telah menyelesaikan pendidikan mereka menunjukkan dedikasi dan komitmen yang luar biasa dalam menuntut ilmu.</p>

<p>Dalam sambutannya, Kyai menekankan pentingnya mengamalkan ilmu yang telah diperoleh untuk kemaslahatan umat. "Ilmu tanpa amal adalah seperti pohon tanpa buah," ujar beliau.</p>

<p>Para lulusan akan melanjutkan perjuangan mereka di berbagai bidang, mulai dari pendidikan, dakwah, hingga kewirausahaan sosial.</p>`,
    excerpt:
      "Pesantren Al-Hikmah menyelenggarakan wisuda akbar untuk 500 santri lulusan dengan penuh barakah dan sukacita.",
    category: "Achievement",
    featured: true,
    published: true,
    priority: 5,
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    views: 250,
  },
  {
    title: "Program Tahfidz Intensif Raih Prestasi Nasional",
    slug: "program-tahfidz-intensif-prestasi-nasional",
    content: `<p>Santri program Tahfidz Al-Hikmah berhasil meraih juara dalam kompetisi Musabaqah Tilawatil Quran tingkat nasional.</p>

<p>Muhammad Farid (17 tahun) berhasil meraih juara 1 kategori Hifzil Quran 30 Juz, sementara Aisyah Putri (16 tahun) meraih juara 2 kategori Tilawah.</p>

<p>Prestasi gemilang ini tidak terlepas dari bimbingan intensif para ustadz dan dukungan penuh dari pesantren. Program tahfidz yang telah berjalan selama 5 tahun ini terus menghasilkan para hafidz dan hafidzah berkualitas.</p>`,
    excerpt:
      "Santri program Tahfidz berhasil meraih juara dalam kompetisi MTQ tingkat nasional dengan prestasi yang membanggakan.",
    category: "Achievement",
    featured: true,
    published: true,
    priority: 4,
    image:
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    views: 180,
  },
  {
    title: "Pengumuman Pendaftaran Santri Baru 2024/2025",
    slug: "pendaftaran-santri-baru-2024-2025",
    content: `<p><strong>PENGUMUMAN RESMI</strong></p>

<p>Pesantren Al-Hikmah membuka pendaftaran santri baru untuk tahun ajaran 2024/2025. Pendaftaran dimulai tanggal 1 Februari - 31 Mei 2024.</p>

<h3>Program yang tersedia:</h3>
<ul>
<li>Program Tahfidz Al-Quran (6 tahun)</li>
<li>Program Ulya (3 tahun)</li>
<li>Program Wustho (3 tahun)</li>
<li>Program I'dadiyah (1 tahun)</li>
</ul>

<h3>Persyaratan:</h3>
<ul>
<li>Usia minimal 13 tahun</li>
<li>Berakhlak mulia</li>
<li>Sehat jasmani dan rohani</li>
<li>Lulus tes seleksi</li>
</ul>

<p>Informasi lengkap dapat diperoleh di sekretariat pesantren atau melalui website resmi.</p>`,
    excerpt:
      "Pembukaan pendaftaran santri baru tahun ajaran 2024/2025 untuk berbagai program pendidikan di Pesantren Al-Hikmah.",
    category: "Announcement",
    featured: false,
    published: true,
    priority: 5,
    image:
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    views: 420,
  },
  {
    title: "Seminar Parenting Islami untuk Wali Santri",
    slug: "seminar-parenting-islami-wali-santri",
    content: `<p>Pesantren Al-Hikmah akan menyelenggarakan seminar parenting islami yang ditujukan khusus untuk para wali santri.</p>

<p><strong>Detail Acara:</strong></p>
<ul>
<li>Tanggal: Sabtu, 15 Juni 2024</li>
<li>Waktu: 08.00 - 16.00 WIB</li>
<li>Tempat: Aula Utama Pesantren</li>
<li>Narasumber: Dr. Ustadz Ahmad Bahauddin, M.Pd</li>
</ul>

<p>Materi yang akan dibahas meliputi:</p>
<ul>
<li>Mendidik anak sesuai Al-Quran dan Sunnah</li>
<li>Membangun komunikasi efektif dengan anak</li>
<li>Mengatasi tantangan parenting di era digital</li>
<li>Mempersiapkan anak menjadi generasi Qurani</li>
</ul>

<p>Pendaftaran dapat dilakukan melalui sekretariat pesantren. Acara ini gratis dan akan disertai dengan sertifikat.</p>`,
    excerpt:
      "Seminar parenting islami untuk wali santri dengan narasumber ahli, membahas pendidikan anak sesuai Al-Quran dan Sunnah.",
    category: "Event",
    featured: false,
    published: true,
    priority: 3,
    image:
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    views: 95,
  },
  {
    title: "Pembangunan Masjid Baru Fase II Dimulai",
    slug: "pembangunan-masjid-baru-fase-ii",
    content: `<p>Alhamdulillah, pembangunan masjid baru Pesantren Al-Hikmah memasuki fase kedua dengan target selesai akhir tahun 2024.</p>

<p>Masjid yang akan memiliki kapasitas 2000 jamaah ini didesain dengan arsitektur Islami modern yang memadukan keindahan dan fungsi. Pembangunan fase II fokus pada finishing interior dan sistem audio visual.</p>

<p>Direktur pembangunan menyampaikan bahwa progress saat ini sudah mencapai 70%. "Insya Allah dengan dukungan dan doa semua pihak, masjid ini akan selesai tepat waktu," ujarnya.</p>

<p>Masjid baru ini akan dilengkapi dengan fasilitas modern seperti AC sentral, sound system digital, dan area parkir yang luas untuk kenyamanan jamaah.</p>`,
    excerpt:
      "Pembangunan masjid baru berkapasitas 2000 jamaah memasuki fase II dengan progress 70% dan target selesai akhir tahun.",
    category: "Academic",
    featured: true,
    published: true,
    priority: 3,
    image:
      "https://images.unsplash.com/photo-1564769625392-651b9e2df6e1?w=800&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    views: 310,
  },
  {
    title: "Lomba Kaligrafi dan Kasidah Tingkat Pesantren",
    slug: "lomba-kaligrafi-kasidah-tingkat-pesantren",
    content: `<p>Dalam rangka memperingati Maulid Nabi Muhammad SAW, Pesantren Al-Hikmah mengadakan lomba kaligrafi dan kasidah untuk semua santri.</p>

<p><strong>Kategori Lomba:</strong></p>
<ul>
<li>Kaligrafi Arab (Dewasa & Junior)</li>
<li>Kasidah Group (5-7 orang)</li>
<li>Kasidah Solo</li>
</ul>

<p>Pendaftaran dibuka hingga tanggal 20 Juni 2024. Lomba akan dilaksanakan pada tanggal 1-3 Juli 2024 di aula pesantren.</p>

<p>Hadiah menarik menanti para pemenang, termasuk beasiswa pendidikan dan piala bergilir. Kegiatan ini bertujuan mengembangkan bakat dan minat santri dalam seni Islam.</p>`,
    excerpt:
      "Lomba kaligrafi dan kasidah untuk semua santri dalam rangka memperingati Maulid Nabi dengan hadiah menarik.",
    category: "Event",
    featured: false,
    published: true,
    priority: 2,
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    views: 125,
  },
];

// Export for use in testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = sampleNews;
}

console.log("Sample news data generated:", sampleNews.length, "items");
console.log(
  "Featured news:",
  sampleNews.filter((item) => item.featured).length
);
console.log(
  "Breaking news (priority 5):",
  sampleNews.filter((item) => item.priority === 5).length
);
console.log("Categories:", [
  ...new Set(sampleNews.map((item) => item.category)),
]);
