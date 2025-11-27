// ========== DYNAMIC PRODUCT LOADING ==========
// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Redirect jika tidak ada ID
if (!productId) {
    window.location.href = 'explore.html';
}

// Function untuk change image
function changeImage(src) {
    document.getElementById('mainImage').src = src;
    
    // Hilangkan border active dari semua thumbnail
    document.querySelectorAll('.grid.grid-cols-4.gap-3 img').forEach(img => {
        img.classList.remove('border-primary');
        img.classList.add('border-transparent');
    });
    
    // Tambahkan border active ke thumbnail yang diklik
    event.target.classList.remove('border-transparent');
    event.target.classList.add('border-primary');
}

// Fetch product detail
async function loadProductDetail() {
    try {
        // UBAH PATH INI SESUAI DENGAN EXPLORE.JS
        const response = await fetch(`backend/api/products/list_all.php?id=${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Jika data array (list semua), cari by ID
        let product;
        if (Array.isArray(data)) {
            product = data.find(p => p.id == productId);
        } else {
            product = data;
        }
        
        if (!product || !product.id) {
            alert('Produk tidak ditemukan!');
            window.location.href = 'explore.html';
            return;
        }
        
        // Update main image dan thumbnail gallery
const mainImage = document.getElementById('mainImage');
const thumbnailGallery = document.querySelector('.grid.grid-cols-4.gap-3');

// Kumpulkan semua gambar yang ada
const images = [
    product.image,
    product.image2,
    product.image3,
    product.image4,
    product.image5
].filter(img => img && img !== null && img !== ''); // Filter yang ada isi aja

// Set main image (pakai gambar pertama)
if (images.length > 0) {
    mainImage.src = images[0];
} else {
    mainImage.src = 'assets/img/placeholder.jpg';
}

// Update thumbnail gallery
if (thumbnailGallery && images.length > 0) {
    if (images.length === 1) {
        // Kalau cuma 1 gambar, sembunyikan gallery
        thumbnailGallery.style.display = 'none';
    } else {
        // Kalau lebih dari 1, tampilkan thumbnail
        thumbnailGallery.style.display = 'grid';
        thumbnailGallery.innerHTML = images.map((img, index) => `
            <img onclick="changeImage('${img}')"
                 src="${img}"
                 alt="Thumbnail ${index + 1}"
                 class="w-full h-24 object-cover rounded-lg cursor-pointer border-2 ${index === 0 ? 'border-primary' : 'border-transparent hover:border-primary'}"
                 onerror="this.style.display='none'" />
        `).join('');
    }
}

        
        // Update product title
        document.querySelector('h1.text-4xl').textContent = product.name;
        
        // Update brand
        const brandElement = document.querySelector('h1.text-4xl').nextElementSibling.querySelector('.text-gray-600');
        if (brandElement) {
            brandElement.textContent = product.brand || 'Brand';
        }
        
        // Update category badge
        const categoryBadge = document.querySelector('.bg-purple-100');
        if (categoryBadge) {
            categoryBadge.textContent = product.category || 'Kategori';
        }
        
        // Update price
        const priceElement = document.querySelector('.text-4xl.font-bold.text-primary');
        if (priceElement) {
            priceElement.textContent = `Rp ${parseInt(product.price).toLocaleString('id-ID')}`;
        }
        
        // Update original price
        const originalPriceEl = document.querySelector('.text-xl.text-gray-400.line-through');
        if (originalPriceEl && product.original_price) {
            originalPriceEl.textContent = `Rp ${parseInt(product.original_price).toLocaleString('id-ID')}`;
        }
        
        // Update fee jastip
        const feeElement = document.querySelector('.text-sm.font-semibold.text-gray-800');
        if (feeElement) {
            feeElement.textContent = `Rp ${parseInt(product.fee || 0).toLocaleString('id-ID')}`;
        }
        
        // Update discount badge
        const discountBadge = document.querySelector('.bg-red-100.text-red-600');
        if (discountBadge) {
            const discount = product.discount || Math.round(((product.original_price - product.price) / product.original_price) * 100);
            discountBadge.textContent = `Diskon ${discount}%`;
        }
        
        // Update stock
        const stockEl = document.getElementById('stock');
        if (stockEl) {
            stockEl.textContent = product.stock || 0;
        }
        
        // Update description
        if (product.description) {
            const descList = document.querySelector('.bg-white.rounded-xl.p-6 ul');
            if (descList) {
                const descriptions = product.description.split('\n').filter(desc => desc.trim() !== '');
                if (descriptions.length > 0) {
                    descList.innerHTML = descriptions.map(desc => `
                        <li class="flex items-start space-x-2">
                            <span class="text-primary mt-1">•</span>
                            <span>${desc}</span>
                        </li>
                    `).join('');
                }
            }
        }
        
        // Update seller info
        const sellerNameElement = document.querySelector('.text-lg.font-bold.text-gray-900');
        if (sellerNameElement && product.store_name) {
            sellerNameElement.textContent = product.store_name;
        }
        
        // Update location
        if (product.location) {
            const locationSpans = document.querySelectorAll('.text-sm.text-gray-500 span');
            const locationSpan = Array.from(locationSpans).find(span => 
                span.textContent.includes('Bangkok') || span.textContent.includes('Thailand')
            );
            if (locationSpan) {
                locationSpan.textContent = product.location;
            }
        }
        
        // Load similar products
        loadSimilarProducts(product.category, product.id);
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Gagal memuat produk! Error: ' + error.message);
        // Jangan redirect, biarkan user lihat error
    }
}
      // Chat seller function
      function chatSeller() {
        window.location.href = "chat.html";
      }
// Load similar products
async function loadSimilarProducts(category, currentProductId) {
    try {
        // UBAH PATH INI JUGA
        const response = await fetch(`backend/api/products/list_all.php`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allProducts = await response.json();
        
        // Filter produk dengan kategori sama, exclude produk current
        const similarProducts = allProducts
            .filter(p => p.category === category && p.id != currentProductId)
            .slice(0, 3); // Ambil 3 produk pertama
        
        const container = document.getElementById('productsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (similarProducts.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-3 text-center py-8">Belum ada produk serupa</p>';
            return;
        }
        
        similarProducts.forEach(product => {
            const discount = product.discount || Math.round(((product.original_price - product.price) / product.original_price) * 100);
            
            const productCard = document.createElement('div');
            productCard.className = 'bg-white rounded-xl shadow-custom overflow-hidden hover:shadow-xl transition';
            productCard.innerHTML = `
                <a href="detail.php?id=${product.id}" class="block">
                    <div class="relative">
                        <img src="${product.image || 'assets/img/placeholder.jpg'}" 
                             alt="${product.name}"
                             class="w-full h-64 object-cover"
                             onerror="this.src='./assets/img/placeholder.jpg'" />
                        ${discount > 0 ? `<span class="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">Diskon ${discount}%</span>` : ''}
                    </div>
                    <div class="p-5">
                        <span class="text-xs text-gray-500">${product.brand || 'Brand'}</span>
                        <h4 class="text-lg font-bold text-gray-900 mt-1 mb-3">${product.name}</h4>
                        <div class="flex items-baseline space-x-2 mb-3">
                            <span class="text-2xl font-bold text-primary">Rp ${parseInt(product.price).toLocaleString('id-ID')}</span>
                            ${product.original_price ? `<span class="text-sm text-gray-400 line-through">Rp ${parseInt(product.original_price).toLocaleString('id-ID')}</span>` : ''}
                        </div>
                        <div class="text-sm text-gray-600 mb-4">
                            <span>Fee Jastip:</span>
                            <span class="font-semibold">Rp ${parseInt(product.fee || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div class="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                            <span>${product.store_name || 'Toko'}</span>
                            ${product.verified == 1 ? `<svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>` : ''}
                        </div>
                        <button onclick="addToCartFromDetail(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}); return false;" 
                                class="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center space-x-2">
                            <i class="hgi hgi-stroke hgi-shopping-cart-01"></i>
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </a>
            `;
            container.appendChild(productCard);
        });
        
    } catch (error) {
        console.error('Error loading similar products:', error);
    }
}

// Fungsi add to cart (tambahkan ini jika belum ada)
function addToCartFromDetail(productId, productName, price) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        alert('Silakan login terlebih dahulu!');
        window.location.href = 'lamanLogin.html';
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast();
}

// Load product saat halaman dibuka
window.addEventListener('DOMContentLoaded', loadProductDetail);