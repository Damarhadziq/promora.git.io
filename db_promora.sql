-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 03 Des 2025 pada 05.34
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_promora`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`, `full_name`, `email`, `created_at`, `last_login`) VALUES
(1, 'admin', '$2y$10$2m1YAppY8XUUfV1ft957FOuKRuQF5iWgvM3JEMaYOIw2BOu3H9.he', 'Super Admin', 'admin@promora.com', '2025-11-27 14:13:41', '2025-12-03 10:09:04');

-- --------------------------------------------------------

--
-- Struktur dari tabel `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `quantity`, `created_at`) VALUES
(5, 8, 2, 3, '2025-11-28 17:38:56');

-- --------------------------------------------------------

--
-- Struktur dari tabel `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `total_price` int(11) NOT NULL,
  `total_fee` int(11) NOT NULL,
  `shipping_cost` int(11) NOT NULL,
  `grand_total` int(11) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `courier_method` varchar(50) NOT NULL,
  `courier_estimate` varchar(50) DEFAULT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `status` enum('pending','waiting','verified','rejected') DEFAULT 'pending',
  `shipping_status` enum('pending','processing','shipped','delivered','completed') DEFAULT 'pending',
  `admin_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `invoices`
--

INSERT INTO `invoices` (`id`, `invoice_number`, `user_id`, `seller_id`, `total_price`, `total_fee`, `shipping_cost`, `grand_total`, `payment_method`, `courier_method`, `courier_estimate`, `payment_proof`, `status`, `shipping_status`, `admin_note`, `created_at`, `updated_at`) VALUES
(1, 'INV-20251201-4F8F66', 1, 3, 315000, 26000, 8000, 349000, 'ewallet', 'gojek', '1-2 jam', NULL, 'pending', 'pending', NULL, '2025-12-01 16:19:03', '2025-12-01 16:19:03'),
(2, 'INV-20251202-B7DA98', 1, 3, 200000, 18000, 56000, 274000, 'ewallet', 'jnt', '2-3 hari', 'payment_2_1764647082.png', 'rejected', 'pending', 'Tidak masuk', '2025-12-02 03:43:56', '2025-12-02 10:10:24'),
(3, 'INV-20251202-1B5B81', 1, 3, 1020000, 34000, 56000, 1110000, 'transfer', 'jnt', '2-3 hari', NULL, 'pending', 'pending', NULL, '2025-12-02 05:36:20', '2025-12-02 05:36:20'),
(4, 'INV-20251202-BFDB1E', 1, 3, 164000, 15000, 56000, 235000, 'qris', 'jnt', '2-3 hari', 'payment_4_1764655660.jpg', 'verified', 'processing', NULL, '2025-12-02 05:53:30', '2025-12-03 03:27:37'),
(5, 'INV-20251203-245EC6', 1, 3, 340000, 34000, 40000, 414000, 'transfer', 'jnt', '2-3 hari', NULL, 'pending', 'pending', NULL, '2025-12-03 02:48:22', '2025-12-03 02:48:22'),
(6, 'INV-20251203-CCE8D3', 1, 3, 371000, 19000, 40000, 430000, 'transfer', 'jnt', '2-3 hari', 'payment_6_1764730660.jpeg', 'verified', 'completed', NULL, '2025-12-03 02:57:10', '2025-12-03 03:58:17');

-- --------------------------------------------------------

--
-- Struktur dari tabel `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `fee` int(11) NOT NULL,
  `subtotal` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_id`, `quantity`, `price`, `fee`, `subtotal`) VALUES
(1, 1, 4, 1, 315000, 26000, 341000),
(2, 2, 7, 1, 200000, 18000, 218000),
(3, 3, 15, 3, 340000, 34000, 1054000),
(4, 4, 14, 4, 41000, 15000, 179000),
(5, 5, 15, 1, 340000, 34000, 374000),
(6, 6, 9, 2, 185500, 19000, 390000);

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `original_price` int(11) DEFAULT NULL,
  `discount` int(11) DEFAULT NULL,
  `fee` int(11) DEFAULT NULL,
  `stock` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `seller_id` int(11) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `image2` varchar(255) DEFAULT NULL,
  `image3` varchar(255) DEFAULT NULL,
  `image4` varchar(255) DEFAULT NULL,
  `image5` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `name`, `brand`, `category`, `price`, `original_price`, `discount`, `fee`, `stock`, `description`, `seller_id`, `location`, `image`, `image2`, `image3`, `image4`, `image5`, `created_at`) VALUES
(1, 'Tas Zara Leather Mini', 'Zara', 'fashion', 480000, 1800000, 70, 25000, 0, NULL, 1, 'jakarta', './assets/img/Tas Zara.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(2, 'Jaket Bommer Bahan Suede', 'H&M', 'fashion', 314650, 485000, 65, 28000, 0, NULL, 1, 'bandung', './assets/img/Jaket Bommer Bahan Suede.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(3, 'Professional Makeup Palette Set', 'Sephora', 'kecantikan', 180000, 450000, 60, 20000, 4, '', 2, 'jakarta', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=100&h=100&fit=crop', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(4, 'Tas Hermes', 'Hermes', 'fashion', 315000, 630000, 50, 26000, 0, NULL, 3, 'surabaya', './assets/img/Tas Hermes.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(5, 'Kacamata Evernoon', 'Zalora', 'aksesoris', 1575000, 3500000, 55, 50000, 0, NULL, 3, 'jakarta', './assets/img/Kacamata.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(6, 'Air Max Sneakers Limited Edition', 'Nike', 'fashion', 648500, 1297000, 50, 35000, 0, NULL, 3, 'jakarta', './assets/img/Nike Air Max Dn8 SE.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(7, 'Premium Cotton T-Shirt Pack', 'Uniqlo', '0', 200000, 399000, 52, 18000, 0, 'Deskripsi T-Shirt', 3, 'bandung', './assets/img/tshirt.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:42'),
(8, 'Classic Backpack Large', 'Herschel', 'fashion', 494000, 1029000, 48, 32000, 1, 'Deskripsi Backpack', 3, 'surabaya', './assets/img/backpack.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:42'),
(9, 'Matte Lipstick Collection', 'MAC', 'kecantikan', 185500, 350000, 47, 19000, 0, '0', 3, 'jakarta', './assets/img/1764170956_0_images.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:42'),
(14, 'Gunting Mahal y', 'Lokal', 'elektronik', 41000, 54000, 10, 15000, 9, 'Gunting', 3, 'Bangkok', './assets/img/1764240577_0_5c47b82b10ccce7591d1b2a11f01707d.jpg', NULL, NULL, NULL, NULL, '2025-11-27 17:49:37'),
(15, 'Classic Backpack New', 'Herschel', 'fashion', 340000, 450000, 20, 34000, 0, 'Tas', 3, 'Bangkok', './assets/img/1764255567_0_images (1).jpeg', './assets/img/1764255567_1_images.jpeg', './assets/img/1764257240_69286dd81529c_image2.jpg', NULL, NULL, '2025-11-27 21:59:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `store_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `stores`
--

INSERT INTO `stores` (`id`, `user_id`, `store_name`, `description`, `logo`, `address`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES
(1, 3, 'Budi Jastip', 'Melayani jastip mall Bangkok setiap hari. Trusted seller dengan pengalaman 3+ tahun.', 'logo_3_1764431890.jpeg', 'Jalan Pramuka, Wonosobo, Jawa Tengah, Jawa, 56311, Indonesia', -7.36042391, 109.90207672, '2025-11-27 12:18:45', '2025-12-01 09:34:04'),
(2, 2, 'fahrel jastip', 'Melayani jastip mall Bekasi etiap hari. Trusted seller dengan pengalaman 3+ tahun.', 'logo_2_1764582473.jpg', 'Perumnas 2, Lagoon, Kayuringinjaya, Bekasi, Jawa Barat, Jawa, 17144, Indonesia', -6.24295076, 106.98829651, '2025-12-01 09:47:53', '2025-12-01 09:48:23');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `ktp_photo` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('customer','seller') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `username`, `phone`, `profile_photo`, `address`, `latitude`, `longitude`, `ktp_photo`, `is_verified`, `verified_at`, `verified_by`, `rejection_reason`, `password`, `role`, `created_at`) VALUES
(1, 'arvio', 'setyan', 'arviosetyan@gmail.com', 'arvivio', '+6287914914', 'profile_1_1764437766.jpeg', 'Jalan Wiralodra, Indramayu, Jawa Barat, Jawa, 45211, Indonesia', -6.32775362, 108.32395631, NULL, 1, NULL, NULL, NULL, '$2y$10$qYTWM0N6wNorxxX5Sl86/OvII875IdJg8So33eMkpXDLynDxJLnjK', 'customer', '2025-11-22 14:26:22'),
(2, 'fahrel', 'dima', 'fahreldima@gmail.com', 'fahreldima', '', NULL, NULL, NULL, NULL, NULL, 1, '2025-12-01 16:46:17', 1, NULL, '$2y$10$SRkG9GpR4EhXOy1GBWsHMub7cSjqYTT1qVfIv6GHQuG5ng0mkBrGC', 'seller', '2025-11-22 14:29:17'),
(3, 'Budi', 'Santoso', 'Budisantoso123@gmail.com', 'budisantoso', '+629812039201', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-27 16:48:02', 1, NULL, '$2y$10$lF9H5OYszSNt/TiWuNbNoenuHTNInNKhJYgLyI1Rb63GQM62SxAI.', 'seller', '2025-11-26 13:30:52'),
(4, 'Rahma', 'Nadia', 'nadia@gmail.com', 'rahmanadia', '+629509204', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_6927daef5b000_1764219631.png', 0, NULL, NULL, NULL, '$2y$10$P8GLbIElTbTxEGA61eHbtu3j.jy4gLh8Pah529D0db2N2xM2Qhk3q', 'seller', '2025-11-27 05:00:31'),
(5, 'farah', 'farah', 'farah@gmail.com', 'farah', '+629129824924', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_6927dbfddbd9e_1764219901.jpeg', 0, NULL, NULL, NULL, '$2y$10$nChI7rdb01cZRAYwg3487.0NpalkCtq/XJ15LMjNdHBgUD1x23H8.', 'seller', '2025-11-27 05:05:01'),
(6, 'ghulam', 'jaizun', 'ghulam@gmail.com', 'ghulamun', '0897294294', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_6927de8a5bb5a_1764220554.png', 1, '2025-11-27 16:21:55', 1, NULL, '$2y$10$VfvPZa7CSoV4o.n8LEMcQO9q3mn1.OMJCf4O5xwbv/dlP0NRA.yRK', 'seller', '2025-11-27 05:15:54'),
(7, 'Basyam', 'Walidani', 'basyam@gmail.com', 'basyam', '+62879719279e', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, '$2y$10$NxmTKSAeQqle9cdZQYuGu.BKnaSRXJTgUel6X18S7u4RCNCvvQ5Oi', 'customer', '2025-11-28 17:13:02'),
(8, 'Agis', 'Putri', 'agis@gmail.com', 'agis', '08926846284', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, '$2y$10$6zEz9CeRnzTy7JXlMfaP6eag2GzYlC.TTlL0ZHTPrgVyWE.5/tJde', 'customer', '2025-11-28 17:15:55'),
(10, 'aditya', 'juanda', 'aditya@gmail.com', 'adit', '+6289427638', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, '$2y$10$50fXKeooM0xP/o4LGJtkd.4alVvBrIVUjZVKhbZKzsv5azc356s.q', 'customer', '2025-11-28 17:29:32'),
(11, 'mujahidil', 'qirom', 'mujahidilqirom@gmail.com', 'qirom', '0895804480125', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, '$2y$10$oXX0qdQHWMwbtQhsRijMfOn61/Ydc7jStS4mVVa8655XuNzocuOCO', 'customer', '2025-12-03 04:12:37'),
(12, 'alfian', 'miftah', 'alfian@gmail.com', 'alfianmiftah', '30909024082', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_692fb8e867f88_1764735208.png', 0, NULL, NULL, NULL, '$2y$10$J.VWbDsoVV803EC473.m/OXpe9Fon6JS2Jm30SKiPo/bTFHD/aqjC', 'seller', '2025-12-03 04:13:28'),
(13, 'cindy', 'aurel', 'cindy@gmail.com', 'cindy', '00930284', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_692fb9f63e759_1764735478.png', 0, NULL, NULL, NULL, '$2y$10$ziIAOgfDmE0Ra.SoHoZNp..zOF5RBf5VAscoyMEQhUfhsCxSQJmWS', 'seller', '2025-12-03 04:17:58'),
(16, 'damar', 'hadziq', 'damar@gmail.com', 'damar', '089241748', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_692fbd458c1f3_1764736325.jpeg', 0, NULL, NULL, NULL, '$2y$10$iJ/fN2bHGCqO8yTZsHJQq.GN4e/eJq12LUDSn0jM1/r2YBranpSSq', 'seller', '2025-12-03 04:32:05');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `seller_id` (`seller_id`);

--
-- Indeks untuk tabel `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_store` (`user_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ketidakleluasaan untuk tabel `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
