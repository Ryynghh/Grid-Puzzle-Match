# 🍎 Fruit Crush 🍌

Sebuah game browser puzzle Match-3 yang seru dan adiktif, dirancang dengan tema buah-buahan segar. Proyek ini dibangun sepenuhnya menggunakan Vanilla JavaScript, HTML, dan CSS tanpa _framework_ tambahan.

## ✨ Fitur Utama

- **Mekanik Match-3, 4, dan 5+**: Susun buah yang sama secara mendatar atau menurun. Deteksi cerdas akan menghancurkan semua kombinasi valid sekaligus (termasuk pola L atau T).
- **Sistem Combo (Beruntun)**: Dapatkan _multiplier_ skor berlipat ganda dari reaksi berantai (cascade) saat buah baru berjatuhan secara otomatis.
- **Batas Waktu & Langkah**: Tantang dirimu dengan waktu 60 detik dan batasan 30 langkah (moves) per sesi.
- **Desain Responsif**: Bermain dengan nyaman di perangkat Desktop, Tablet, maupun Smartphone. Papan permainan akan selalu mempertahankan rasio 1:1 di layar sekecil apa pun.
- **Sistem Klik Intuitif**: Cukup klik dua buah yang bersebelahan untuk menukarnya. Jika tidak ada kecocokan (invalid move), buah akan memunculkan animasi jeda lalu kembali ke posisi semula.
- **Pencegahan Auto-Match**: Algoritma pembuatan papan (_board generation_) memastikan tidak ada buah yang langsung berjejer 3 saat game baru pertama kali dimuat.
- **Modal Game Over**: Tampilan _pop-up_ di akhir permainan untuk menunjukkan skor akhir beserta tombol _Play Again_.

## 🎮 Cara Bermain

1. Tekan tombol **Start Game** di tengah layar.
2. Klik sebuah buah (buah akan meredup), lalu klik buah di sebelahnya untuk menukar posisi mereka.
3. Buat deretan minimal 3 buah yang sama untuk menghancurkannya dan mencetak skor.
4. Perhatikan sisa **Waktu (Time)** dan **Langkah (Moves)** di bagian atas layar.
5. Permainan berakhir jika waktu habis atau langkah mencapai angka 0.

## 🛠️ Teknologi yang Digunakan

- **HTML5**: Struktur semantik halaman.
- **CSS3**: CSS Grid, Flexbox, animasi transisi (opacity), CSS variables, dan _media queries_ untuk responsivitas.
- **JavaScript (ES6+)**: Manipulasi DOM, struktur data `Set` untuk pengumpulan _match_, interval & timeout, _array destructuring_, dan algoritma logika game.

## 🚀 Cara Menjalankan Project Secara Lokal

1. _Clone_ repositori ini ke komputer lokalmu:
   ```bash
   git clone [https://github.com/Ryynghh/Grid-Puzzle-Match.git](https://github.com/Ryynghh/Grid-Puzzle-Match.git)
   ```
