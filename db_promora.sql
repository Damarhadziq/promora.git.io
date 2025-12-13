-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 13 Des 2025 pada 06.27
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
(1, 'admin', '$2y$10$2m1YAppY8XUUfV1ft957FOuKRuQF5iWgvM3JEMaYOIw2BOu3H9.he', 'Super Admin', 'admin@promora.com', '2025-11-27 14:13:41', '2025-12-12 20:03:46');

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
(5, 8, 2, 3, '2025-11-28 17:38:56'),
(11, 17, 15, 1, '2025-12-03 05:15:56'),
(13, 17, 7, 1, '2025-12-03 05:16:29'),
(17, 19, 15, 1, '2025-12-06 13:14:01'),
(18, 19, 18, 1, '2025-12-06 14:13:51'),
(20, 1, 15, 1, '2025-12-12 09:19:14');

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
(18, 'INV-20251212-2ABF94', 1, 20, 800000, 35000, 32000, 867000, 'transfer', 'jnt', '2-3 hari', 'payment_1765533000_693be548528fb.jpg', 'verified', 'completed', NULL, '2025-12-12 09:49:37', '2025-12-12 13:55:22'),
(19, 'INV-20251212-77EBAD', 1, 3, 200000, 18000, 8000, 226000, 'transfer', 'jnt', '2-3 hari', 'payment_1765533000_693be548528fb.jpg', 'verified', 'completed', NULL, '2025-12-12 09:49:37', '2025-12-12 13:54:28'),
(20, 'INV-20251212-A2AEF0', 1, 3, 200000, 18000, 40000, 258000, 'ewallet', 'jnt', '2-3 hari', 'payment_1765549384_693c254896da4.jpg', 'waiting', 'pending', NULL, '2025-12-12 14:22:51', '2025-12-12 14:23:04');

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
  `subtotal` int(11) NOT NULL,
  `tier_at_purchase` enum('basic','bronze','silver','gold') DEFAULT 'basic'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_id`, `quantity`, `price`, `fee`, `subtotal`, `tier_at_purchase`) VALUES
(20, 18, 17, 1, 800000, 35000, 835000, 'basic'),
(21, 19, 7, 1, 200000, 18000, 218000, 'silver'),
(22, 20, 7, 1, 200000, 18000, 218000, 'gold');

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `product_type` enum('Inter','Lokal') NOT NULL DEFAULT 'Lokal',
  `price` int(11) DEFAULT NULL,
  `original_price` int(11) DEFAULT NULL,
  `discount` int(11) DEFAULT NULL,
  `fee` int(11) DEFAULT NULL,
  `stock` int(11) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
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

INSERT INTO `products` (`id`, `name`, `brand`, `category`, `product_type`, `price`, `original_price`, `discount`, `fee`, `stock`, `is_deleted`, `description`, `seller_id`, `location`, `image`, `image2`, `image3`, `image4`, `image5`, `created_at`) VALUES
(1, 'Tas Zara Leather Mini', 'Zara', 'fashion', 'Lokal', 480000, 1800000, 70, 25000, 0, 0, NULL, 1, 'jakarta', './assets/img/Tas Zara.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(2, 'Jaket Bommer Bahan Suede', 'H&M', 'fashion', 'Lokal', 314650, 485000, 65, 28000, 0, 0, NULL, 1, 'bandung', './assets/img/Jaket Bommer Bahan Suede.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(3, 'Professional Makeup Palette Set', 'Sephora', 'kecantikan', 'Lokal', 180000, 450000, 60, 20000, 4, 0, '', 2, 'jakarta', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=100&h=100&fit=crop', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(4, 'Tas Hermes', 'Hermes', 'fashion', '', 315000, 630000, 50, 26000, 0, 1, '', 3, 'surabaya', './assets/img/1765528492_693bd3ac350a9_image0.jpg', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(5, 'Kacamata Evernoon', 'Zalora', 'aksesoris', 'Lokal', 1575000, 3500000, 55, 50000, 0, 0, NULL, 3, 'jakarta', './assets/img/Kacamata.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(6, 'Air Max Sneakers Limited Edition', 'Nike', 'fashion', 'Lokal', 648500, 1297000, 50, 35000, 0, 0, NULL, 3, 'jakarta', './assets/img/Nike Air Max Dn8 SE.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:21'),
(7, 'Premium Cotton T-Shirt Pack', 'Uniqlo', '0', 'Lokal', 200000, 399000, 52, 18000, 1, 0, 'Deskripsi T-Shirt', 3, 'bandung', './assets/img/tshirt.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:42'),
(8, 'Classic Backpack Large', 'Herschel', 'fashion', 'Lokal', 494000, 1029000, 48, 32000, 0, 0, 'Deskripsi Backpack', 3, 'surabaya', './assets/img/backpack.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:42'),
(9, 'Matte Lipstick Collection', 'MAC', 'kecantikan', 'Lokal', 185500, 350000, 47, 19000, 0, 0, '0', 3, 'jakarta', './assets/img/1764170956_0_images.png', NULL, NULL, NULL, NULL, '2025-11-26 20:47:42'),
(14, 'Gunting Mahal y', 'Lokal', 'elektronik', '', 48600, 54000, 10, 15000, 6, 0, 'Gunting', 3, 'Bangkok', './assets/img/1765528530_693bd3d24cbc9_image0.jpg', NULL, NULL, NULL, NULL, '2025-11-27 17:49:37'),
(15, 'Classic Backpack New', 'Herschel', 'fashion', 'Lokal', 340000, 450000, 20, 34000, 0, 0, 'Tas', 3, 'Bangkok', './assets/img/1764255567_0_images (1).jpeg', './assets/img/1764255567_1_images.jpeg', './assets/img/1764257240_69286dd81529c_image2.jpg', NULL, NULL, '2025-11-27 21:59:27'),
(16, 'Pembuatan website', 'Bintara', 'elektronik', 'Lokal', 10000, 50000, 20, 30000, 10, 0, 'blablabla', 18, 'Bangkok', './assets/img/1764739587_0_Basic.jpg', './assets/img/1764739587_1_Standard.jpg', './assets/img/1764739587_2_Lite.jpg', NULL, NULL, '2025-12-02 21:26:27'),
(17, 'UI/UX Design', 'HANDOKO', 'elektronik', 'Lokal', 800000, 1000000, 20, 35000, 8, 0, 'UI/UX Design', 20, 'Bangkok', './assets/img/1765028245_0_FindBin.png', './assets/img/1765028245_1_ROUTE.png', './assets/img/1765028245_2_FOCUS POINT.png', './assets/img/1765028245_3_CIRCLE EVENT.png', NULL, '2025-12-06 05:37:25'),
(18, 'UI/UX Design', 'HANDOKO', 'elektronik', 'Lokal', 800000, 1000000, 20, 35000, 7, 0, 'UI/UX Design', 20, 'Bangkok', './assets/img/1765028255_0_FindBin.png', './assets/img/1765028255_1_ROUTE.png', './assets/img/1765028255_2_FOCUS POINT.png', './assets/img/1765028255_3_CIRCLE EVENT.png', NULL, '2025-12-06 05:37:35'),
(19, 'Botol Plastik', 'Aqua', 'makanan', 'Lokal', 50000, 67000, 10, 5000, 49, 0, 'Botol minuman dari korea', 20, 'Bangkok', './assets/img/1765353047_0_botol.jpg', NULL, NULL, NULL, NULL, '2025-12-09 23:50:47');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `package_tier` enum('basic','bronze','silver','gold') DEFAULT 'basic',
  `package_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `stores`
--

INSERT INTO `stores` (`id`, `user_id`, `store_name`, `description`, `logo`, `address`, `latitude`, `longitude`, `created_at`, `updated_at`, `package_tier`, `package_expires_at`) VALUES
(1, 3, 'Budi Bangkok', 'Melayani jastip mall Bangkok setiap hari. Trusted seller dengan pengalaman 3+ tahun.', 'logo_3_1764431890.jpeg', 'Jalan Pramuka, Wonosobo, Jawa Tengah, Jawa, 56311, Indonesia', -7.36042391, 109.90207672, '2025-11-27 12:18:45', '2025-12-12 07:57:01', 'gold', '2026-01-12 08:57:01'),
(2, 2, 'fahrel jastip', 'Jasa Titip Bekasi Real', 'logo_2_1765521386.jpg', 'Jalan Karet Pasar Baru Barat VI, RW 03, Karet Tengsin, Tanah Abang, Jakarta Pusat, Daerah Khusus Ibukota Jakarta, Jawa, 10220, Indonesia', -6.20983427, 106.81633301, '2025-12-01 09:47:53', '2025-12-12 07:06:13', 'basic', NULL),
(3, 18, 'Arvio Pramudya', 'JASA TITIP SEMARANG', 'logo_18_1764739425.png', 'Jalan Kanguru Utara III, RW 03, Gayamsari, Semarang, Central Java, Java, 50196, Indonesia', -6.99528390, 110.45230293, '2025-12-03 05:23:45', '2025-12-06 13:30:31', 'basic', NULL),
(4, 20, 'handoko surya', 'Melayani jastip mall Bangkok setiap hari. Trusted seller dengan pengalaman 3+ tahun.', 'logo_20_1765028092.png', 'Kergon, Pekalongan, Central Java, Java, 51112, Indonesia', -6.89210532, 109.67095184, '2025-12-06 13:34:52', '2025-12-12 13:57:12', 'bronze', '2026-12-12 14:57:12'),
(5, 21, 'Aliya Jastip', 'Melayani Jasa Titip di Jepang Hokaido', 'logo_21_1765373260.jpeg', 'Gang KH. Kaimin I, RW 10, Cipulir, Kebayoran Lama, South Jakarta, Special Capital Region of Jakarta, Java, 12230, Indonesia', -6.23998942, 106.76939324, '2025-12-10 13:27:40', '2025-12-11 10:51:55', 'silver', '2026-06-11 11:51:55'),
(6, 6, 'Ghulam Jastip', 'Jastip ke ghulam yukk, semua negara ada', 'logo_6_1765549986.jpg', 'Jalan Setiabudi III, RW 03, Setiabudi, Jakarta Selatan, Daerah Khusus Ibukota Jakarta, Jawa, 10220, Indonesia', -6.20758373, 106.82575464, '2025-12-12 14:33:06', '2025-12-12 14:34:42', 'gold', '2026-01-12 15:34:42');

-- --------------------------------------------------------

--
-- Struktur dari tabel `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `package_tier` enum('bronze','silver','gold') NOT NULL,
  `duration_months` int(11) NOT NULL DEFAULT 1,
  `price` int(11) NOT NULL,
  `total_price` int(11) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `status` enum('pending','waiting','verified','rejected','expired') DEFAULT 'pending',
  `admin_note` text DEFAULT NULL,
  `starts_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `store_id`, `package_tier`, `duration_months`, `price`, `total_price`, `payment_method`, `payment_proof`, `status`, `admin_note`, `starts_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 21, 5, 'silver', 6, 99000, 594000, 'bca', 'payment_5_1765445899_693a910bbcaa1.jpeg', 'verified', 'Pembayaran terverifikasi', '2025-12-11 11:51:55', '2026-06-11 11:51:55', '2025-12-11 09:38:19', '2025-12-11 10:51:55'),
(2, 3, 1, 'gold', 1, 199000, 199000, 'bca', 'payment_1_1765526167_693bca9798871.png', 'verified', 'Pembayaran terverifikasi', '2025-12-12 08:57:01', '2026-01-12 08:57:01', '2025-12-12 07:56:07', '2025-12-12 07:57:01'),
(3, 20, 4, 'bronze', 12, 49000, 588000, 'ovo', 'payment_4_1765547805_693c1f1d576f6.jpg', 'verified', 'Pembayaran terverifikasi', '2025-12-12 14:57:12', '2026-12-12 14:57:12', '2025-12-12 13:56:45', '2025-12-12 13:57:12'),
(4, 6, 6, 'gold', 1, 199000, 199000, 'dana', 'payment_6_1765550039_693c27d7eebad.jpg', 'verified', 'Pembayaran terverifikasi', '2025-12-12 15:34:42', '2026-01-12 15:34:42', '2025-12-12 14:33:59', '2025-12-12 14:34:42');

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
(1, 'arvio', 'setyan', 'arviosetyan@gmail.com', 'arvivio', '+6287914914', 'profile_1_1764437766.jpeg', 'Jalan Wiralodra, Indramayu, Jawa Barat, Jawa, 45211, Indonesia', -6.38627144, 107.89872947, NULL, 1, NULL, NULL, NULL, '$2y$10$qYTWM0N6wNorxxX5Sl86/OvII875IdJg8So33eMkpXDLynDxJLnjK', 'customer', '2025-11-22 14:26:22'),
(2, 'fahrel', 'dima', 'fahreldima@gmail.com', 'fahreldima', '+62840102482', NULL, NULL, NULL, NULL, NULL, 1, '2025-12-01 16:46:17', 1, NULL, '$2y$10$SRkG9GpR4EhXOy1GBWsHMub7cSjqYTT1qVfIv6GHQuG5ng0mkBrGC', 'seller', '2025-11-22 14:29:17'),
(3, 'Budi', 'Santoso', 'Budisantoso123@gmail.com', 'budisantoso', '+629812039201', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-27 16:48:02', 1, NULL, '$2y$10$lF9H5OYszSNt/TiWuNbNoenuHTNInNKhJYgLyI1Rb63GQM62SxAI.', 'seller', '2025-11-26 13:30:52'),
(4, 'Rahma', 'Nadia', 'nadia@gmail.com', 'rahmanadia', '+629509204', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_6927daef5b000_1764219631.png', 0, NULL, NULL, NULL, '$2y$10$P8GLbIElTbTxEGA61eHbtu3j.jy4gLh8Pah529D0db2N2xM2Qhk3q', 'seller', '2025-11-27 05:00:31'),
(5, 'farah', 'farah', 'farah@gmail.com', 'farah', '+629129824924', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_6927dbfddbd9e_1764219901.jpeg', 1, '2025-12-10 05:10:11', 1, NULL, '$2y$10$nChI7rdb01cZRAYwg3487.0NpalkCtq/XJ15LMjNdHBgUD1x23H8.', 'seller', '2025-11-27 05:05:01'),
(6, 'ghulam', 'jaizun', 'ghulam@gmail.com', 'ghulamun', '089898989', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_6927de8a5bb5a_1764220554.png', 1, '2025-11-27 16:21:55', 1, NULL, '$2y$10$VfvPZa7CSoV4o.n8LEMcQO9q3mn1.OMJCf4O5xwbv/dlP0NRA.yRK', 'seller', '2025-11-27 05:15:54'),
(7, 'Basyam', 'Walidani', 'basyam@gmail.com', 'basyam', '+62879719279e', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, '$2y$10$NxmTKSAeQqle9cdZQYuGu.BKnaSRXJTgUel6X18S7u4RCNCvvQ5Oi', 'customer', '2025-11-28 17:13:02'),
(8, 'Agis', 'Putri', 'agis@gmail.com', 'agis', '08926846284', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, '$2y$10$6zEz9CeRnzTy7JXlMfaP6eag2GzYlC.TTlL0ZHTPrgVyWE.5/tJde', 'customer', '2025-11-28 17:15:55'),
(10, 'aditya', 'juanda', 'aditya@gmail.com', 'adit', '+6289427638', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, '$2y$10$50fXKeooM0xP/o4LGJtkd.4alVvBrIVUjZVKhbZKzsv5azc356s.q', 'customer', '2025-11-28 17:29:32'),
(11, 'mujahidil', 'qirom', 'mujahidilqirom@gmail.com', 'qirom', '0895804480125', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, '$2y$10$oXX0qdQHWMwbtQhsRijMfOn61/Ydc7jStS4mVVa8655XuNzocuOCO', 'customer', '2025-12-03 04:12:37'),
(12, 'alfian', 'miftah', 'alfian@gmail.com', 'alfianmiftah', '30909024082', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_692fb8e867f88_1764735208.png', 0, NULL, NULL, NULL, '$2y$10$J.VWbDsoVV803EC473.m/OXpe9Fon6JS2Jm30SKiPo/bTFHD/aqjC', 'seller', '2025-12-03 04:13:28'),
(13, 'cindy', 'aurel', 'cindy@gmail.com', 'cindy', '00930284', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_692fb9f63e759_1764735478.png', 1, '2025-12-10 04:52:34', 1, NULL, '$2y$10$ziIAOgfDmE0Ra.SoHoZNp..zOF5RBf5VAscoyMEQhUfhsCxSQJmWS', 'seller', '2025-12-03 04:17:58'),
(16, 'damar', 'hadziq', 'damar@gmail.com', 'damar', '089241748', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_692fbd458c1f3_1764736325.jpeg', 1, '2025-12-02 21:20:21', 1, NULL, '$2y$10$iJ/fN2bHGCqO8yTZsHJQq.GN4e/eJq12LUDSn0jM1/r2YBranpSSq', 'seller', '2025-12-03 04:32:05'),
(17, 'VIOOOOOOO', 'SETYAN', 'arviopramudya2707@gmail.com', 'arvio', '0876543456789', 'profile_17_1764738914.png', 'RW 10, Sukorejo, Gunung Pati, Kota Semarang, Jawa Tengah, Jawa, 50221, Indonesia', -7.03340993, 110.38918775, NULL, 1, NULL, NULL, NULL, '$2y$10$TsXakSx7ldlGiTStEa3RBOnj61os07p/vjZUfb9CvrWBJ9KkEIkHO', 'customer', '2025-12-03 05:12:15'),
(18, 'Arvio', 'Pramudya', 'arviopramudya@gmail.com', 'BINTARA', '085786465401', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_692fc8fa17ab6_1764739322.png', 1, '2025-12-02 21:22:26', 1, NULL, '$2y$10$B3sZ5ACQyfJIBnvNcrbev.tAsFIWZUPeLwaKgC47eUvDx0vGkymOa', 'seller', '2025-12-03 05:22:02'),
(19, 'korim', 'kirom', 'kirom@gmail.com', 'kiromaw', '+6288120329', 'profile_19_1765027168.png', 'Petra School, Jalan Bugenvil Raya, RW 05, Pedurungan Lor, Pedurungan, Kota Semarang, Jawa Tengah, Jawa, 50113, Indonesia', -7.00881216, 110.48476773, NULL, 1, NULL, NULL, NULL, '$2y$10$tbdm.Jfev3tKAZ06iVCRCuHULcVcF3AtYSzBfkTW8YlPDnfw7ur8K', 'customer', '2025-12-06 13:12:18'),
(20, 'handoko', 'surya', 'handokur@gmail.com', 'handoko', '+6292893828932', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_69342ec90059b_1765027529.png', 1, '2025-12-06 05:26:29', 1, NULL, '$2y$10$PEowhZuSjGinafcUtgu4xOZGcY2kN949pthFzqv5lMZpEcE8ZZWW6', 'seller', '2025-12-06 13:25:29'),
(21, 'Aliya', 'Putri', 'aliya@gmail.com', 'aliya', '+62840102482', NULL, NULL, NULL, NULL, 'uploads/ktp/KTP_693971e54e81a_1765372389.png', 1, '2025-12-10 05:13:54', 1, NULL, '$2y$10$W9BJcl8RfJdzYuge5wIFO.rjIyKKVDu51Y8YpL9GNzXJHspCU/Rgu', 'seller', '2025-12-10 13:13:09');

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
-- Indeks untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `idx_subscription_status` (`status`),
  ADD KEY `idx_subscription_expires` (`expires_at`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT untuk tabel `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT untuk tabel `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT untuk tabel `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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

--
-- Ketidakleluasaan untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
