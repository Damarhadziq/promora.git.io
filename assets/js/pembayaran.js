

    // Countdown
    let detik = 24 * 60 * 60;
    setInterval(() => {
      detik--;
      const h = String(Math.floor(detik / 3600)).padStart(2, '0');
      const m = String(Math.floor((detik % 3600) / 60)).padStart(2, '0');
      const s = String(detik % 60).padStart(2, '0');
      document.getElementById('countdown').textContent = `${h}:${m}:${s}`;
    }, 1000);


  //Memanggil harga dari cart
    window.addEventListener("load", function () {
      function formatRupiah(angka) {
        return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }

      const total = parseInt(localStorage.getItem("totalBayar")) || 0;
      const promo = parseInt(localStorage.getItem("totalPromo")) || 0;
      const fee = parseInt(localStorage.getItem("totalFee")) || 0;
      const jumlah = parseInt(localStorage.getItem("jumlahBarang")) || 0;

      document.querySelectorAll(".total-bayar").forEach(el => el.textContent = formatRupiah(total));
      document.querySelectorAll(".total-promo").forEach(el => el.textContent = formatRupiah(promo));
      document.querySelectorAll(".total-fee").forEach(el => el.textContent = formatRupiah(fee));
      document.querySelectorAll(".jumlah-barang").forEach(el => el.textContent = jumlah + " barang");
    });



    // Pilih metode
    function pilihMetode(metode) {
      document.querySelectorAll('#detail-bca, #detail-qris').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('#check-bca, #check-qris').forEach(el => el.classList.add('hidden'));
      if (metode === 'bca') {
        document.getElementById('detail-bca').classList.remove('hidden');
        document.getElementById('check-bca').classList.remove('hidden');
      } else {
        document.getElementById('detail-qris').classList.remove('hidden');
        document.getElementById('check-qris').classList.remove('hidden');
      }
    }

    function copy(text) {
      navigator.clipboard.writeText(text);
      alert('Disalin: ' + text);
    }

    // Modal — TIDAK MENGUNCI SCROLL
    function openModal() {
      document.getElementById('modal').classList.remove('hidden');
    }
    function closeModal() {
      document.getElementById('modal').classList.add('hidden');
      document.getElementById('preview').classList.add('hidden');
      document.getElementById('file-input').value = '';
      document.getElementById('btn-kirim').disabled = true;
      document.getElementById('btn-kirim').classList.add('opacity-50', 'cursor-not-allowed');
    }

    // Klik di luar modal = tutup
    document.getElementById('modal').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });

    // Upload & Preview
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const previewImg = document.getElementById('preview-img');
    const btnKirim = document.getElementById('btn-kirim');

    dropArea.addEventListener('click', () => fileInput.click());
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
      dropArea.addEventListener(e, ev => ev.preventDefault());
    });
    dropArea.addEventListener('drop', e => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleFile({target: {files: [file]}});
    });
    fileInput.addEventListener('change', handleFile);

    function handleFile(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          previewImg.src = reader.result;
          preview.classList.remove('hidden');
          btnKirim.disabled = false;
          btnKirim.classList.remove('opacity-50', 'cursor-not-allowed');
        };
        reader.readAsDataURL(file);
      }
    }

    function kirimBukti() {
      closeModal();
      document.getElementById('notif').classList.remove('hidden');

      setTimeout(() => {
        document.getElementById('notif').classList.add('hidden');

        // Redirect ke halaman home
        window.location.href = "index.html"; 
      }, 4000);
    }

    // Script ini WAJIB ada di SETIAP halaman biar status login konsisten
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userName = localStorage.getItem('userName');

  if (isLoggedIn && userName) {
    // Sudah login → sembunyiin Login/Sign Up, tampilkan user info
    const auth = document.getElementById('auth-buttons');
    const user = document.getElementById('user-info');
    if (auth) auth.classList.add('hidden');
    if (user) {
      user.classList.remove('hidden');
    }
  } else {
    // Belum login
    const auth = document.getElementById('auth-buttons');
    const user = document.getElementById('user-info');
    if (auth) auth.classList.remove('hidden');
    if (user) user.classList.add('hidden');
  }
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  
  // Update UI langsung + tutup dropdown kalau ada
  const auth = document.getElementById('auth-buttons');
  const user = document.getElementById('user-info');
  const dropdown = document.getElementById('dropdown-menu');
  if (auth) auth.classList.remove('hidden');
  if (user) user.classList.add('hidden');
  if (dropdown) dropdown.classList.add('hidden');

  alert('Kamu telah logout 👋');
}

// Dropdown avatar
document.getElementById('avatar-button')?.addEventListener('click', function(e) {
  e.stopPropagation();
  document.getElementById('dropdown-menu')?.classList.toggle('hidden');
});

// Tutup dropdown kalau klik luar
document.addEventListener('click', () => {
  document.getElementById('dropdown-menu')?.classList.add('hidden');
});

// Jalankan tiap halaman dibuka
window.addEventListener('load', checkLoginStatus);


