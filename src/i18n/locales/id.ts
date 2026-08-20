import type { PartialDictionary } from "../localeMeta";
import { appsId } from "./apps/id";

/** Bahasa Indonesia — UI portal + apps (dokumen legal tetap fallback ke Inggris) */
export const id: PartialDictionary = {
  brand: "Blank Note",
  common: {
    backToPortal: "← Kembali ke portal",
    loading: "Memuat…",
    close: "Tutup",
    save: "Simpan",
    cancel: "Batal",
    edit: "Edit",
    delete: "Hapus",
    clear: "Kosongkan",
    forceLandscape: {
      title: "Putar ke mode lanskap",
      hint: "Aplikasi ini dirancang untuk tampilan mendatar. Silakan putar perangkat Anda.",
    },
  },
  usageGuide: {
    title: "Cara kerja Blank Note",
    steps: [
      {
        title: "Jelajahi Library",
        body: "Buka Library dari header, lalu pin aplikasi yang Anda suka ke Home.",
      },
      {
        title: "Jalankan dari Home",
        body: "Aplikasi yang di-pin ada di Home. Tekan lama untuk menyusun ulang atau membuat folder.",
      },
      {
        title: "Data tetap di perangkat ini",
        body: "Input dan file alat disimpan di browser ini secara default. Cadangkan dari tiap aplikasi sebelum menghapus data.",
      },
    ],
    dontShowAgain: "Jangan tampilkan lagi",
    close: "Mulai",
  },
  header: {
    support: "Dukung pengembang",
    supportShort: "Dukung",
    supportAria: "Dukung pengembang (membuka Stripe Checkout)",
    supportTitle: "Buka halaman dukungan",
    langToggleAria: "Ganti bahasa tampilan",
    menuAria: "Menu situs",
    menuOpen: "Buka menu",
    menuClose: "Tutup menu",
    homeNav: "Home",
    libraryNav: "Library",
    localOnlyBadge: "Input & file tetap di perangkat",
    localOnlyBadgeShort: "Di perangkat",
    layoutToggle: {
      aria: "Ganti lebar konten",
      caption: "Lebar",
      defaultShort: "Std",
      wideShort: "Lebar",
      fullShort: "Penuh",
      default: "Lebar standar",
      wide: "Tampilan lebih lebar",
      full: "Lebar penuh",
    },
  },
  home: {
    heroTitleLine1: "Alat Anda,",
    heroTitleLine2: "tertata seperti desktop.",
    heroLead1: "Peluncur bergaya alat tulis — pin hanya yang Anda pakai.",
    heroLead2: "Pin aplikasi dari Library agar muncul di Home.",
    openLibrary: "Buka Library",
    emptyPins: "Home masih kosong",
    emptyPinsHint: "Pin aplikasi dari Library agar muncul di sini.",
    removeAria: "Hapus {title} dari Home",
    dragAria:
      "{title}. Seret atau gunakan tombol panah untuk menyusun ulang. Tekan G untuk digabung ke folder berikutnya",
    openAria: "Buka {title}",
    lockedOnMobileAria:
      "{title}. Tidak tersedia di ponsel atau mode potret. Silakan gunakan komputer.",
    moveLeft: "Pindah ke kiri",
    moveRight: "Pindah ke kanan",
    reorderedAnnounce: "{title} dipindah ke urutan {n}",
    removedAnnounce: "{title} dihapus dari Home",
    editingAnnounce:
      "Mode edit Home. Tumpuk ikon untuk membuat folder, seret untuk menyusun ulang, ketuk × untuk menghapus. Ketuk area kosong atau Esc untuk selesai.",
    gridLabel: "Aplikasi di Home",
    folderDefaultName: "Folder",
    openFolderAria: "Buka {title}",
    dissolveFolderAria: "Lepas {title} dan kembalikan aplikasi ke Home",
    folderDragAria: "{title}. Seret atau gunakan tombol panah untuk menyusun ulang",
    renameFolderAria: "Ubah nama folder",
    renameFolderPlaceholder: "Nama folder",
    closeFolder: "Tutup",
    ejectFromFolder: "Keluarkan",
    ejectFromFolderAria: "Keluarkan {title} ke Home",
    groupWithNext: "Gabung dengan berikutnya",
    combineHint:
      "Ditumpuk di tengah — lepas saat disorot untuk membuat folder",
    combineAddHint: "Di atas folder — lepas untuk menambahkannya ke sini",
    folderCreatedAnnounce: "Folder dibuat",
    folderAddedAnnounce: "{title} ditambahkan ke folder",
    folderDissolvedAnnounce: "Folder dilepas",
    ejectedAnnounce: "{title} dikeluarkan ke Home",
  },
  library: {
    title: "Library",
    lead: "Pilih aplikasi, baca penjelasannya, lalu pin ke Home.",
    install: "Pin",
    installed: "Sudah di-pin",
    uninstall: "Lepas pin",
    removeFromHome: "Lepas dari Home",
    openApp: "Buka",
    installHint: "Pin aplikasi ini ke Home. Buka dari Home setelahnya.",
    openFromHome: "Buka aplikasi ini dari Home.",
    detailBack: "Kembali ke Library",
    notFound: "Aplikasi tidak ditemukan.",
    scrollPrev: "Aplikasi sebelumnya",
    scrollNext: "Aplikasi berikutnya",
    aboutLabel: "Tentang aplikasi ini",
    highlightsLabel: "Yang bisa Anda lakukan",
    gettingStartedLabel: "Cara mulai",
    tipLabel: "Tips",
    updatedAtLabel: "Terakhir diperbarui",
    devicesLabel: "Perangkat yang didukung",
    deviceSmartphone: "Smartphone",
    deviceTablet: "Tablet",
    deviceWindows: "Windows",
    deviceMac: "Mac",
    devicePcRecommended: "Direkomendasikan PC",
    localDataNote:
      "Input dan file diproses serta disimpan di perangkat ini secara default; pengelola tidak mengumpulkan atau menyimpan isinya. Menghapus data browser dapat menghapusnya, jadi cadangkan atau ekspor yang penting. Lihat Kebijakan Privasi untuk detail.",
    filterAria: "Filter aplikasi",
    filterAll: "Semua",
    filterUnpinned: "Belum di-pin",
    filterEmpty: "Tidak ada aplikasi yang cocok dengan filter ini.",
  },
  genres: {
    business: {
      name: "Efisiensi kerja",
      description: "Alat praktis yang sedikit meredakan pekerjaan sehari-hari",
    },
    creators: {
      name: "Dukungan kreator",
      description: "Kotak peralatan untuk publikasi dan karya kreatif",
    },
    utilities: {
      name: "Utilitas sehari-hari",
      description: "Utilitas umum untuk tugas kecil sehari-hari",
    },
    minigames: {
      name: "Minigame",
      description: "Sedikit kegilaan dan peluang untuk waktu istirahat",
    },
  },
  tools: {
    "invoice-maker": {
      title: "Pembuat formulir",
      description:
        "Faktur, penawaran, surat jalan & kwitansi A4. PDF multi-mata uang.",
    },
    "mail-template": {
      title: "Templat email",
      description: "Percepat balasan email dengan tag dan variabel.",
    },
    "folder-generator": {
      title: "Generator folder",
      description: "Buat folder massal dengan tanggal, nomor, dan daftar.",
    },
    "excel-merger": {
      title: "Gabung Excel",
      description:
        "Seret lembar untuk digabung. Peringatkan referensi dan bisa ekspor nilai.",
    },
    "pdf-editor": {
      title: "Editor PDF",
      description: "Gabung, urutkan, dan hapus halaman di browser.",
    },
    "image-compressor": {
      title: "Kompres gambar",
      description: "Ubah ukuran dan kompres massal di browser.",
    },
    "text-cleaner": {
      title: "Pembersih teks",
      description: "Bersihkan baris baru, spasi, dan karakter kontrol. Simpan aturan sendiri.",
    },
    "media-metadata-editor": {
      title: "Editor tag media",
      description: "Edit tag dan sampul audio/video di browser.",
    },
    "frame-extractor": {
      title: "Ekstrak frame",
      description: "Geser video per frame dan simpan momen sebagai gambar.",
    },
    "character-relation-editor": {
      title: "Peta karakter",
      description: "Susun hubungan cerita dengan kartu dan garis relasi.",
    },
    "book-visualizer": {
      title: "Editor halaman",
      description: "Edit tata letak halaman dan bagikan dengan .mybook.",
    },
    "palette-collector": {
      title: "Palet warna",
      description: "Ekstrak palet dari gambar, dengan cek kontras WCAG.",
    },
    "lunch-savings": {
      title: "Tabungan makan siang",
      description: "Catat selisih dengan anggaran dan menabung sambil bermain.",
    },
    "link-stocker": {
      title: "Simpan tautan",
      description: "Simpan URL “hampir bookmark” sebagai kartu ber-OGP.",
    },
    "url-cleaner": {
      title: "Pembersih URL & QR",
      description: "Rapikan URL panjang dan buat kode QR di tempat.",
    },
    "ultimate-probability-slot": {
      title: "Slot peluang",
      description: "Tantang mesin slot berpeluang rendah buatan sendiri.",
    },
    "pixel-drop-puzzle": {
      title: "Pixel drop",
      description: "Jatuhkan foto ke celah. Presisi di bawah piksel.",
    },
    "robot-freethrow": {
      title: "Lemparan proyeksi",
      description: "Bidik ring dengan sudut, kecepatan awal, dan spin.",
    },
    "crypto-message": {
      title: "Pesan rahasia",
      description: "Enkripsi dan dekripsi dengan frasa. Termasuk Caesar.",
    },
    "monster-driver": {
      title: "Monster drive",
      description: "Berhenti di merah, gas di hijau. Aksi orang pertama.",
    },
  },
  card: {
    open: "Buka",
    comingSoon: "Segera hadir",
    comingSoonHint: "Akan tersedia sebentar lagi",
    mobileSupported: "Mobile OK",
    mobileSupportedHint: "Dioptimalkan untuk ponsel",
    pcRecommended: "Direkomendasikan PC",
    pcRecommendedHint: "Lebih nyaman di komputer",
  },
  footer: {
    tagline: "Alat mandiri yang meredakan hari-hari",
    navAria: "Informasi pengelola",
    contact: "Kontak",
    terms: "Ketentuan",
    privacy: "Privasi",
    environmentLabel: "Lingkungan",
    noticeLabel: "Pemberitahuan",
    localOnly:
      "🔒 File dan input alat diproses serta disimpan di browser secara default; pengelola tidak mengumpulkan atau menyimpan isinya. Tanpa cookie pelacakan pribadi. Kami hanya mengukur kunjungan dan penggunaan secara anonim. Beberapa alat dapat melakukan permintaan jaringan terbatas (lihat Privasi).",
  },
  messages: {
    environment:
      "Alat biasanya berjalan di browser, tanpa instalasi. Bisa dipakai di Windows, Mac, atau ponsel; beberapa hanya untuk PC. Melihat situs dan penggunaan pertama memerlukan internet; kami tidak menjamin seluruh situs bisa offline.",
    persistence:
      "Data disimpan di LocalStorage browser. Bisa hilang saat membersihkan cache atau ganti perangkat. Ekspor secara berkala yang penting.",
    safety:
      "Data yang Anda masukkan disimpan di perangkat (browser) secara default. Pengelola tidak mengumpulkan atau menyimpan isi itu di server. Ini tidak menutup risiko perangkat: buat salinan untuk yang penting.",
    safetyShort:
      "Data tetap di browser secara default; pengelola tidak mengumpulkan isinya.",
    privacyBanner:
      "File dan input diproses di browser ini secara default. Pengelola tidak mengumpulkan atau menyimpan isinya.",
    privacyBannerShort:
      "Di perangkat secara default. Kami tidak menyimpan input Anda.",
  },
  dataManager: {
    buttonTitle: "Data (cadangan & pemulihan)",
    buttonAria: "Data (cadangan & pemulihan)",
    buttonLabel: "Cadangan",
    buttonLabelShort: "Data",
    dialogTitle: "Data (cadangan & pemulihan)",
    close: "Tutup",
    safetyHeading: "Tentang keamanan data",
    backupReasonHeading: "Mengapa membuat cadangan",
    export: "📥 Ekspor (simpan)",
    import: "📤 Impor (muat)",
    noData:
      "Alat ini hanya bekerja dalam sesi dan tidak menyimpan pengaturan. Pengelola tidak mengumpulkan atau menyimpan konten yang diproses.",
    exportOk: "Cadangan diunduh.",
    exportFail: "Gagal mengekspor.",
    importOk: "Data dimuat.",
    importFail: "Gagal memuat.",
    importInvalid: "File tidak dapat diterapkan.",
    importConfirm: "Data saat ini akan ditimpa. Lanjutkan?",
  },
  apps: appsId,
  contact: {
    title: "Kontak",
    lead: "Isi formulir lalu kirim untuk membuka aplikasi email Anda. Tidak ada yang dikirim ke server.",
    mailtoHint: "※ Saat mengirim, klien email Anda akan terbuka",
    submit: "Buka email untuk mengirim",
    messageRequired: "Masukkan pesan.",
    categoryLabel: "Jenis pertanyaan",
    categories: {
      general: "Pertanyaan umum",
      feature: "Saran fitur",
      bug: "Laporan bug",
      other: "Lainnya",
    },
    appLabel: "Aplikasi terkait",
    appPlaceholder: "Opsional",
    appNone: "(Tidak ada)",
    nameLabel: "Nama Anda",
    namePlaceholder: "Opsional",
    emailLabel: "Email balasan",
    emailPlaceholder: "anda@example.com",
    emailHint: "Opsional — isi jika menginginkan balasan",
    messageLabel: "Pesan",
    messagePlaceholder: "Pertanyaan, saran, atau detail bug Anda",
    subjectPrefix: "[Blank Note] Kontak",
    bodyLabels: {
      category: "Jenis pertanyaan",
      app: "Aplikasi terkait",
      name: "Nama",
      email: "Email balasan",
      message: "Pesan",
      environment: "Lingkungan (otomatis)",
      notProvided: "(tidak diisi)",
    },
  },
};
