<?php
session_start(); // PINDAHKAN KE PALING ATAS, SEBELUM <!DOCTYPE html>
?>
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Promora - Keranjang Kamu</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="./assets/css/cart.css" />
    <link
      rel="shortcut icon"
      href="./assets/img/logo.png"
      type="image/x-icon"
    />
    <!-- --------- UNICONS ---------- -->
    <link
      rel="stylesheet"
      href="https://cdn.hugeicons.com/font/hgi-stroke-rounded.css"
    />
  </head>
  <body class="bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
          <a href="index.html" class="flex items-center space-x-2">
            <div class="flex items-center space-x-2">
              <img
                class="h-8 flex items-center justify-center"
                src="./assets/img/Container.png"
                alt=""
              />
            </div>
          </a>

          <div class="hidden md:flex space-x-8">
            <a
              href="index.html"
              class="text-gray-700 hover:text-purple-600 font-medium"
              >Home</a
            >
            <a
              href="explore.html"
              class="text-gray-700 hover:text-purple-600 font-medium"
              >Explore</a
            >
            <a href="#" class="text-gray-700 hover:text-purple-600 font-medium"
              >About</a
            >
          </div>

          <!-- Keranjang + Auth Area -->
              <div class="flex items-center space-x-5">
                <a href="cart.html" class="hover:opacity-80 transition">
                  <img src="./assets/img/cart.png" alt="Cart" class="h-6 w-6" />
                </a>

                <!-- LOGIN & SIGN UP (muncul kalau BELUM login) -->
                <div id="auth-buttons" class="flex items-center space-x-3">
                  <button onclick="window.location.href='lamanLogin.html'" 
                          class="text-gray-700 font-medium px-4 py-2 hover:text-purple-600 transition">
                    Login
                  </button>
                  <button onclick="window.location.href='lamanLogin.html'" 
                          class="bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 transition">
                    Sign Up
                  </button>
                </div>

                <!-- USER INFO (muncul kalau SUDAH login) -->
                <div id="user-info" class="hidden items-center space-x-4">
                  <span id="user-name" class="font-medium text-gray-800"></span>

                  <div class="relative">
                    <button id="avatar-button" class="focus:outline-none flex items-center space-x-3">
                      <img id="user-avatar" src="./assets/img/user.png" alt="Profile" 
                          class="h-10 w-10 rounded-full object-cover border-2 border-purple-600 hover:opacity-90 cursor-pointer" />
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <div id="dropdown-menu" class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 hidden z-50">
                      <a href="profile.html" class="block px-4 py-3 text-gray-700 hover:bg-purple-50 transition">Profil Saya</a>
                      <a href="orders.html" class="block px-4 py-3 text-gray-700 hover:bg-purple-50 transition">Pesanan Saya</a>
                      <hr class="my-1">
                      <button onclick="logout()" class="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-3 mb-3">
          <svg
            class="w-12 h-12 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
          <h1 class="text-5xl font-bold text-primary">Keranjang Kamu</h1>
        </div>
        <p class="text-gray-600 text-lg">
          Periksa kembali promo yang ingin kamu beli sebelum melanjutkan
          pembayaran.
        </p>
      </div>

     <div class="grid grid-cols-3 gap-8">
        
        <!-- Cart Items -->
        <div class="col-span-2">
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">

            <!-- Table Header -->
            <div class="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b font-semibold text-gray-700">
              <div class="col-span-1">Pilih</div>
              <div class="col-span-3">Produk</div>
              <div class="col-span-2 text-center">Harga</div>
              <div class="col-span-2 text-left pl-2">Fee Jastip</div>
              <div class="col-span-2 text-left pl-2">Jumlah</div>
              <div class="col-span-1 -ml-4">Subtotal</div>
              <div class="col-span-1 flex justify-end">Aksi</div>
            </div>

            <!-- Cart Items -->
            <div id="cartItems">
            <?php
            require_once 'backend/config/db.php';

            if(!isset($_SESSION['user_id'])) {
                echo '<div class="px-6 py-12 text-center text-gray-500">
                        <p class="text-lg">Silakan login untuk melihat keranjang Anda</p>
                        <a href="lamanLogin.html" class="text-purple-600 hover:underline mt-2 inline-block">Login Sekarang</a>
                      </div>';
            } else {
                $database = new Database();
                $db = $database->getConnection();
                $user_id = $_SESSION['user_id'];
                
                // Query untuk mengambil cart items dengan detail produk
                $query = "SELECT c.id as cart_id, c.quantity, c.product_id,
                                p.name, p.brand, p.price, p.fee, p.image, p.stock
                          FROM cart c
                          JOIN products p ON c.product_id = p.id
                          WHERE c.user_id = :user_id
                          ORDER BY c.created_at DESC";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':user_id', $user_id);
                $stmt->execute();
                $cart_items = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if(count($cart_items) == 0) {
                    echo '<div class="px-6 py-12 text-center text-gray-500">
                            <p class="text-lg">Keranjang Anda masih kosong</p>
                            <a href="explore.html" class="text-purple-600 hover:underline mt-2 inline-block">Mulai Belanja</a>
                          </div>';
                } else {
                    foreach($cart_items as $item):
                        $subtotal = ($item['price'] * $item['quantity']) + $item['fee'];
            ?>
                    <div class="cart-item border-b" 
                        data-id="<?php echo $item['cart_id']; ?>" 
                        data-product-id="<?php echo $item['product_id']; ?>"
                        data-price="<?php echo $item['price']; ?>" 
                        data-fee="<?php echo $item['fee']; ?>"
                        data-stock="<?php echo $item['stock']; ?>">
                    <div class="grid grid-cols-12 gap-4 px-6 py-6 items-center">
                        
                        <div class="col-span-4 flex items-center space-x-4">
                            <input type="checkbox" class="item-check w-5 h-5 accent-primary" 
                              <?php echo $item['stock'] <= 0 ? 'disabled' : ''; ?> />
                            <img src="<?php echo htmlspecialchars($item['image']); ?>" 
                                 alt="<?php echo htmlspecialchars($item['name']); ?>" 
                                 class="w-20 h-20 object-cover rounded-lg" />
                            <div>
                                <h3 class="font-semibold text-gray-800"><?php echo htmlspecialchars($item['name']); ?></h3>
                                <p class="text-sm text-gray-500"><?php echo htmlspecialchars($item['brand']); ?></p>
                            </div>
                        </div>
                        
                        <div class="col-span-2 text-center">
                            <span class="text-primary font-semibold">Rp <?php echo number_format($item['price'], 0, ',', '.'); ?></span>
                        </div>
                        
                        <div class="col-span-2 text-left pl-2">
                            <span class="text-gray-700">Rp <?php echo number_format($item['fee'], 0, ',', '.'); ?></span>
                        </div>
                        
                        <div class="col-span-2 flex justify-start items-center space-x-2 -ml-6">
                            <?php if($item['stock'] > 0): ?>
                                <button class="qty-btn qty-minus w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center">−</button>
                                <input type="number" class="qty-input w-10 text-center border border-gray-300 rounded-lg py-1" 
                                      value="<?php echo $item['quantity']; ?>" min="1" max="<?php echo $item['stock']; ?>" />
                                <button class="qty-btn qty-plus w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center">+</button>
                            <?php else: ?>
                                <span class="text-red-500 font-semibold">Kuota Habis</span>
                            <?php endif; ?>
                        </div>
                        
                        <div class="col-span-1 text-center pr-2 -ml-4 whitespace-nowrap">
                            <span class="item-subtotal text-primary font-bold">Rp <?php echo number_format($subtotal, 0, ',', '.'); ?></span>
                        </div>
                        
                        <div class="col-span-1 flex justify-end">
                            <button class="delete-btn text-red-500 hover:text-red-700">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                                </svg>
                            </button>
                        </div>
                        
                    </div>
                </div>
            <?php 
                    endforeach;
                }
            }
            ?>
            </div>
          </div>
        </div>


        <!-- Order Summary -->
<div class="col-span-1">
  <div class="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">
      Ringkasan Pesanan
    </h2>

    <!-- Metode Pembayaran -->
    <div class="mb-6">
      <label class="block text-gray-700 font-semibold mb-2">Metode Pembayaran</label>
      <!-- Ganti dropdown Metode Pembayaran di cart.php -->
      <select id="payment-method" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
        <option value="">Pilih Metode Pembayaran</option>
        <option value="transfer">Transfer Bank (BRI & BNI)</option>
        <option value="ewallet">E-Wallet (OVO, GoPay, DANA)</option>
        <option value="qris">QRIS</option>
      </select>
    </div>

    <!-- Jasa Pengiriman -->
    <div class="mb-6">
      <label class="block text-gray-700 font-semibold mb-2">Jasa Pengiriman</label>
      <select id="courier-method" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
        <option value="">Pilih Jasa Pengiriman</option>
      </select>
      <div id="courier-info" class="mt-2 text-sm text-gray-600 hidden"></div>
    </div>

    <div class="space-y-4 mb-6">
      <div class="flex justify-between text-gray-700">
        <span>Total Harga</span>
        <span id="totalPromo" class="font-semibold">Rp 0</span>
      </div>
      <div class="flex justify-between text-gray-700">
        <span>Total Fee Jastip</span>
        <span id="totalFee" class="font-semibold">Rp 0</span>
      </div>
      <div class="flex justify-between text-gray-700">
        <div class="flex items-center space-x-1">
          <span>Ongkir</span>
          <span id="distance-info" class="text-xs text-gray-500"></span>
        </div>
        <span id="totalOngkir" class="font-semibold">Rp 0</span>
      </div>
    </div>

    <div class="border-t pt-4 mb-6">
      <div class="flex justify-between items-center">
        <span class="text-xl font-bold text-gray-800">Grand Total</span>
        <span id="grandTotal" class="text-3xl font-bold text-primary">Rp 0</span>
      </div>
    </div>

    <button id="checkout-btn" disabled
        class="w-full block text-center bg-gray-300 text-gray-500 py-4 rounded-xl font-semibold text-lg cursor-not-allowed mb-3">
        Pilih Metode Pembayaran & Pengiriman
    </button>
  </div>
</div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-purple-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <a href="index.html" class="flex items-center space-x-2 my-4">
              <div class="flex items-center space-x-2">
                <img
                  class="h-8 flex items-center justify-center"
                  src="./assets/img/Container.png"
                  alt=""
                />
              </div>
            </a>
            <p class="text-purple-200 text-sm">
              Platform digital yang menghubungkan pencari promo dengan jastip
              terpercaya.
            </p>
          </div>

          <div>
            <h4 class="font-bold mb-4">Quick Links</h4>
            <ul class="space-y-2 text-purple-200">
              <li><a href="#" class="hover:text-white">Home</a></li>
              <li><a href="#" class="hover:text-white">Promo</a></li>
              <li><a href="#" class="hover:text-white">Jastip</a></li>
              <li><a href="#" class="hover:text-white">About</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-4">Support</h4>
            <ul class="space-y-2 text-purple-200">
              <li><a href="#" class="hover:text-white">Help Center</a></li>
              <li><a href="#" class="hover:text-white">FAQ</a></li>
              <li>
                <a href="#" class="hover:text-white">Terms & Conditions</a>
              </li>
              <li><a href="#" class="hover:text-white">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-4">Follow Us</h4>
            <div class="flex space-x-4">
              <a
                href="#"
                class="w-10 h-10 bg-purple-800 rounded-lg flex items-center justify-center hover:bg-purple-700"
              >
                <i class="hgi hgi-stroke hgi-instagram"></i>
              </a>
              <a
                href="#"
                class="w-10 h-10 bg-purple-800 rounded-lg flex items-center justify-center hover:bg-purple-700"
              >
                <i class="hgi hgi-stroke hgi-twitter"></i>
              </a>
              <a
                href="#"
                class="w-10 h-10 bg-purple-800 rounded-lg flex items-center justify-center hover:bg-purple-700"
              >
                <i class="hgi hgi-stroke hgi-facebook-02"></i>
              </a>
            </div>
          </div>
        </div>

        <div
          class="border-t border-purple-800 pt-8 text-center text-purple-200 text-sm"
        >
          <p>© 2025 Promora — All rights reserved</p>
        </div>
      </div>
    </footer>
    <script src="./assets/js/cart.js"></script>
  </body>
</html>
