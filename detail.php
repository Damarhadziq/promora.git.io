<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Promora - Jasa Titip Terpercaya</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="./assets/css/styles.css" />
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
    <?php
    // Cek apakah ada ID produk
    if (!isset($_GET['id'])) {
        header('Location: explore.html');
        exit;
    }
    ?>
    <!-- Navigation -->

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
              class="text-purple-600 hover:text-purple-600 font-medium"
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

    <!-- Breadcrumb -->
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <a href="#" class="hover:text-primary">Home</a>
        <span>›</span>
        <a href="#" class="hover:text-primary">Promo</a>
        <span>›</span>
        <span class="text-gray-700">Detail</span>
      </div>
    </div>

    <!-- Product Detail Section -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <div class="bg-white rounded-2xl p-4 shadow-custom">
            <img
              id="mainImage"
              src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"
              alt="Product"
              class="w-full h-96 object-cover rounded-xl"
            />
          </div>
          <div class="grid grid-cols-4 gap-3">
            <img
              onclick="changeImage(this.src)"
              src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&h=200&fit=crop"
              class="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition border-2 border-primary"
            />
            <img
              onclick="changeImage(this.src)"
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop"
              class="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition border-2 border-transparent hover:border-primary"
            />
            <img
              onclick="changeImage(this.src)"
              src="https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=200&h=200&fit=crop"
              class="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition border-2 border-transparent hover:border-primary"
            />
            <img
              onclick="changeImage(this.src)"
              src="https://images.unsplash.com/photo-1624687943971-e86af76d57de?w=200&h=200&fit=crop"
              class="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition border-2 border-transparent hover:border-primary"
            />
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-3">
              Tas Zara Leather Mini
            </h1>
            <div class="flex items-center space-x-3">
              <span class="text-gray-600">Zara</span>
              <span
                class="px-3 py-1 bg-purple-100 text-primary text-xs rounded-full"
                >Fashion</span
              >
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-baseline space-x-3">
              <span class="text-4xl font-bold text-primary">Rp 480.000</span>
              <span class="text-xl text-gray-400 line-through"
                >Rp 1.200.000</span
              >
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Fee Jastip:</span>
              <span class="text-sm font-semibold text-gray-800">Rp 35.000</span>
            </div>
            <span
              class="inline-block px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded"
              >Diskon 60%</span
            >
          </div>

          <div class="flex items-center space-x-2 text-primary">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9V5h2v4H9zm0 2h2v2H9v-2z"
              ></path>
            </svg>
            <span class="text-sm font-medium"
              >Stok Tersedia: <span id="stock">8</span> item</span
            >
          </div>

          <div class="flex space-x-4">
            <button
              onclick="addToCart()"
              class="flex-1 gradient-bg text-white py-3 rounded-lg font-semiboldhover:opacity-90 transition flex items-center justify-center space-x-2"
            >
              <i class="hgi hgi-stroke hgi-shopping-cart-01"></i>
              <span>Add to Cart</span>
            </button>
            <button
              onclick="chatSeller()"
              class="flex-1 border-2 border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary transition flex items-center justify-center space-x-2"
            >
              <i class="hgi hgi-stroke hgi-message-02"></i>
              <span>Chat Seller</span>
            </button>
          </div>

          <!-- Product Description -->
          <div class="bg-white rounded-xl p-6 shadow-custom">
            <h3 class="text-xl font-bold text-gray-900 mb-4">
              Deskripsi Produk
            </h3>
            <ul class="space-y-3 text-gray-700">
              <li class="flex items-start space-x-2">
                <span class="text-primary mt-1">•</span>
                <span>Tas kulit asli dari Zara koleksi terbaru</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="text-primary mt-1">•</span>
                <span>Barang resmi mall Bangkok dengan diskon 60%</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="text-primary mt-1">•</span>
                <span>Dilengkapi dengan dustbag dan kartu autentik</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="text-primary mt-1">•</span>
                <span>Material: 100% Genuine Leather</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="text-primary mt-1">•</span>
                <span>Dimensi: 20cm x 15cm x 8cm</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Seller Information -->
      <div class="mt-12 bg-white rounded-xl p-8 shadow-custom">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Informasi Penjual</h3>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              alt="Seller"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <div class="flex items-center space-x-2">
                <h4 class="text-lg font-bold text-gray-900">
                  Nadia Jastip Bangkok
                </h4>
                <svg
                  class="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <div class="flex items-center space-x-4 mt-1">
                <div class="flex items-center space-x-1">
                  <span class="text-yellow-400">⭐</span>
                  <span class="text-sm font-semibold text-gray-700">4.8</span>
                  <span class="text-sm text-gray-500">(120 reviews)</span>
                </div>
                <div class="flex items-center space-x-1 text-sm text-gray-600">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>30 completed orders</span>
                </div>
              </div>
              <div
                class="flex items-center space-x-1 text-sm text-gray-500 mt-1"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <span>Bangkok, Thailand</span>
              </div>
            </div>
          </div>
          <button
            class="px-6 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary transition"
          >
            Lihat Profil
          </button>
        </div>
      </div>

      <!-- Similar Products -->
      <div class="mt-12">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">Produk Serupa</h3>
          <div class="flex space-x-2">
            <button
              onclick="scrollProducts('left')"
              class="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              <svg
                class="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <button
              onclick="scrollProducts('right')"
              class="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              <svg
                class="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div
          id="productsContainer"
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <!-- Product Card 1 -->
          <div
            class="bg-white rounded-xl shadow-custom overflow-hidden hover:shadow-xl transition"
          >
            <div class="relative">
              <img
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop"
                alt="Product"
                class="w-full h-64 object-cover"
              />
              <span
                class="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full"
                >Diskon 55%</span
              >
            </div>
            <div class="p-5">
              <span class="text-xs text-gray-500">Coach</span>
              <h4 class="text-lg font-bold text-gray-900 mt-1 mb-3">
                Signature Handbag Collection
              </h4>
              <div class="flex items-baseline space-x-2 mb-3">
                <span class="text-2xl font-bold text-primary"
                  >Rp 1.575.000</span
                >
                <span class="text-sm text-gray-400 line-through"
                  >Rp 3.500.000</span
                >
              </div>
              <div class="text-sm text-gray-600 mb-4">
                <span>Fee Jastip:</span>
                <span class="font-semibold">Rp 50.000</span>
              </div>
              <div
                class="flex items-center space-x-2 text-sm text-gray-600 mb-4"
              >
                <span>Riko Pratama</span>
                <svg
                  class="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <button
                class="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center space-x-2"
              >
                <i class="hgi hgi-stroke hgi-shopping-cart-01"></i>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          <!-- Product Card 2 -->
          <div
            class="bg-white rounded-xl shadow-custom overflow-hidden hover:shadow-xl transition"
          >
            <div class="relative">
              <img
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"
                alt="Product"
                class="w-full h-64 object-cover"
              />
              <span
                class="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full"
                >Diskon 48%</span
              >
            </div>
            <div class="p-5">
              <span class="text-xs text-gray-500">Herschel</span>
              <h4 class="text-lg font-bold text-gray-900 mt-1 mb-3">
                Classic Backpack Large
              </h4>
              <div class="flex items-baseline space-x-2 mb-3">
                <span class="text-2xl font-bold text-primary">Rp 494.000</span>
                <span class="text-sm text-gray-400 line-through"
                  >Rp 950.000</span
                >
              </div>
              <div class="text-sm text-gray-600 mb-4">
                <span>Fee Jastip:</span>
                <span class="font-semibold">Rp 32.000</span>
              </div>
              <div
                class="flex items-center space-x-2 text-sm text-gray-600 mb-4"
              >
                <span>Sarah Amelia</span>
                <svg
                  class="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <button
                class="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center space-x-2"
              >
                <i class="hgi hgi-stroke hgi-shopping-cart-01"></i>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          <!-- Product Card 3 -->
          <div
            class="bg-white rounded-xl shadow-custom overflow-hidden hover:shadow-xl transition"
          >
            <div class="relative">
              <img
                src="https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop"
                alt="Product"
                class="w-full h-64 object-cover"
              />
              <span
                class="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full"
                >Diskon 39%</span
              >
            </div>
            <div class="p-5">
              <span class="text-xs text-gray-500">Bellroy</span>
              <h4 class="text-lg font-bold text-gray-900 mt-1 mb-3">
                Slim Sleeve Wallet
              </h4>
              <div class="flex items-baseline space-x-2 mb-3">
                <span class="text-2xl font-bold text-primary">Rp 475.800</span>
                <span class="text-sm text-gray-400 line-through"
                  >Rp 780.000</span
                >
              </div>
              <div class="text-sm text-gray-600 mb-4">
                <span>Fee Jastip:</span>
                <span class="font-semibold">Rp 22.000</span>
              </div>
              <div
                class="flex items-center space-x-2 text-sm text-gray-600 mb-4"
              >
                <span>Dina Wijaya</span>
                <svg
                  class="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <button
                class="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center space-x-2"
              >
                <i class="hgi hgi-stroke hgi-shopping-cart-01"></i>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="mt-12 bg-white rounded-xl p-8 shadow-custom">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <h3 class="text-2xl font-bold text-gray-900">Ulasan Pembeli</h3>
            <div class="flex items-center space-x-2">
              <span class="text-yellow-400 text-xl">⭐</span>
              <span class="text-xl font-bold text-gray-900">4.8</span>
              <span class="text-gray-500">/dari 120 pembeli</span>
            </div>
          </div>
          <button
            class="px-6 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary transition"
          >
            Lihat Semua Ulasan
          </button>
        </div>

        <div class="space-y-6">
          <!-- Review 1 -->
          <div class="border-b border-gray-200 pb-6">
            <div class="flex items-start space-x-4">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop"
                alt="User"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-bold text-gray-900">Amanda Putri</h4>
                    <div class="flex items-center space-x-2 mt-1">
                      <div class="flex text-yellow-400">
                        <span>⭐⭐⭐⭐⭐</span>
                      </div>
                      <span class="text-sm text-gray-500">5 hari lalu</span>
                    </div>
                  </div>
                </div>
                <p class="text-gray-700 mt-3">
                  Seller sangat responsif dan barang original 100%. Recommended
                  banget!
                </p>
              </div>
            </div>
          </div>

          <!-- Review 3 -->
          <div class="pb-6">
            <div class="flex items-start space-x-4">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop"
                alt="User"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-bold text-gray-900">Lisa Wijaya</h4>
                    <div class="flex items-center space-x-2 mt-1">
                      <div class="flex text-yellow-400">
                        <span>⭐⭐⭐⭐⭐</span>
                      </div>
                      <span class="text-sm text-gray-500">1 minggu lalu</span>
                    </div>
                  </div>
                </div>
                <p class="text-gray-700 mt-3">
                  Packingnya rapi dan barang sesuai foto. Worth it dengan harga
                  segini!
                </p>
              </div>
            </div>
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
          <p>© 2024 Promora — All rights reserved</p>
        </div>
      </div>
    </footer>

    <!-- Notification Toast -->
    <div
      id="toast"
      class="fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl p-4 transform translate-y-32 opacity-0 transition-all duration-300 z-50"
    >
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <div>
          <h4 class="font-bold text-gray-900">Berhasil ditambahkan!</h4>
          <p class="text-sm text-gray-600">Produk telah masuk ke keranjang</p>
        </div>
      </div>
    </div>
  <script src="./assets/js/detail.js"></script>
  </body>
</html>
