document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Product Database
        const products = [
            {
                id: 1,
                name: 'Summer Collection Dress',
                brand: 'Zara',
                category: 'fashion',
                price: 179700,
                originalPrice: 250000,
                discount: 70,
                fee: 25000,
                seller: 'Sarah Amelia',
                verified: true,
                location: 'jakarta',
                image: 'dress'
            },
            {
                id: 2,
                name: 'Winter Jacket Premium',
                brand: 'H&M',
                category: 'fashion',
                price: 314650,
                originalPrice: 485000,
                discount: 65,
                fee: 28000,
                seller: 'Sarah Amelia',
                verified: true,
                location: 'bandung',
                image: 'jacket'
            },
            {
                id: 3,
                name: 'Professional Makeup Palette Set',
                brand: 'Sephora',
                category: 'kosmetik',
                price: 180000,
                originalPrice: 450000,
                discount: 60,
                fee: 20000,
                seller: 'Dina Widya',
                verified: true,
                location: 'jakarta',
                image: 'makeup'
            },
            {
                id: 4,
                name: 'Evening Cocktail Dress',
                brand: 'Mango',
                category: 'fashion',
                price: 315000,
                originalPrice: 630000,
                discount: 50,
                fee: 26000,
                seller: 'Riko Pratama',
                verified: true,
                location: 'surabaya',
                image: 'cocktail'
            },
            {
                id: 5,
                name: 'Signature Handbag Collection',
                brand: 'Coach',
                category: 'aksesoris',
                price: 1575000,
                originalPrice: 3500000,
                discount: 55,
                fee: 50000,
                seller: 'Riko Pratama',
                verified: true,
                location: 'jakarta',
                image: 'handbag'
            },
            {
                id: 6,
                name: 'Premium Cotton T-Shirt Pack',
                brand: 'Uniqlo',
                category: 'fashion',
                price: 191520,
                originalPrice: 399000,
                discount: 52,
                fee: 18000,
                seller: 'Dina Widya',
                verified: true,
                location: 'bandung',
                image: 'tshirt'
            },
            {
                id: 7,
                name: 'Air Max Sneakers Limited Edition',
                brand: 'Nike',
                category: 'fashion',
                price: 648500,
                originalPrice: 1297000,
                discount: 50,
                fee: 35000,
                seller: 'Riko Pratama',
                verified: true,
                location: 'jakarta',
                image: 'sneakers'
            },
            {
                id: 8,
                name: 'Classic Backpack Large',
                brand: 'Herschel',
                category: 'aksesoris',
                price: 494000,
                originalPrice: 1029000,
                discount: 48,
                fee: 32000,
                seller: 'Sarah Amelia',
                verified: true,
                location: 'surabaya',
                image: 'backpack'
            },
            {
                id: 9,
                name: 'Matte Lipstick Collection',
                brand: 'MAC',
                category: 'kosmetik',
                price: 185500,
                originalPrice: 350000,
                discount: 47,
                fee: 19000,
                seller: 'Sarah Amelia',
                verified: true,
                location: 'jakarta',
                image: 'lipstick'
            }
        ];

        let filteredProducts = [...products];
        let currentPage = 1;
        const productsPerPage = 9;

        // Format currency
        function formatRupiah(amount) {
            return 'Rp ' + amount.toLocaleString('id-ID');
        }

        // Get product image
        function getProductImage(type) {
            const images = {
                dress: '👗',
                jacket: '🧥',
                makeup: '💄',
                cocktail: '👗',
                handbag: '👜',
                tshirt: '👕',
                sneakers: '👟',
                backpack: '🎒',
                lipstick: '💋'
            };
            return images[type] || '📦';
        }

        // Render products
        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            const start = (currentPage - 1) * productsPerPage;
            const end = start + productsPerPage;
            const pageProducts = filteredProducts.slice(start, end);
            
            grid.innerHTML = '';
            
            pageProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card bg-white rounded-xl shadow-md overflow-hidden';
                card.innerHTML = `
                    <div class="relative">
                        <div class="w-full h-64 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-6xl">
                            ${getProductImage(product.image)}
                        </div>
                        <span class="badge-discount absolute top-4 right-4">Diskon ${product.discount}%</span>
                    </div>
                    <div class="p-5">
                        <p class="text-gray-500 text-sm mb-1">${product.brand}</p>
                        <h3 class="font-bold text-gray-800 mb-2 h-12 overflow-hidden">${product.name}</h3>
                        <p class="text-2xl font-bold text-purple-600 mb-1">${formatRupiah(product.price)}</p>
                        <p class="text-gray-400 text-sm line-through mb-1">${formatRupiah(product.originalPrice)}</p>
                        <p class="text-gray-500 text-xs mb-4">Fee Jastip: ${formatRupiah(product.fee)}</p>
                        <div class="flex items-center mb-4 gap-1">
                            <span class="text-sm text-gray-700">${product.seller}</span>
                            ${product.verified ? '<i class="hgi hgi-stroke hgi-new-releases text-base relative top-[1px]"></i>' : ''}
                        </div>
                        <button class="w-full primary-color text-white gap-2 py-3 rounded-lg font-medium hover:opacity-90 flex items-center justify-center">
                            <i class="hgi hgi-stroke hgi-shopping-cart-01"></i> Add to Cart
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
            
            document.getElementById('productCount').textContent = filteredProducts.length;
        }

        // Apply filters
        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const category = document.getElementById('categoryFilter').value;
            const location = document.getElementById('locationFilter').value;
            const minDiscount = parseInt(document.getElementById('discountRange').value);
            
            // Get checked categories from sidebar
            const checkedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
                .map(cb => cb.value);
            
            filteredProducts = products.filter(product => {
                const matchSearch = product.name.toLowerCase().includes(searchTerm) || 
                                  product.brand.toLowerCase().includes(searchTerm);
                const matchCategory = !category || product.category === category;
                const matchLocation = !location || product.location === location;
                const matchDiscount = product.discount >= minDiscount;
                const matchSidebarCategory = checkedCategories.length === 0 || 
                                            checkedCategories.includes(product.category);
                
                return matchSearch && matchCategory && matchLocation && matchDiscount && matchSidebarCategory;
            });
            
            // Apply sorting
            const sortValue = document.getElementById('sortFilter').value;
            if (sortValue === 'price-low') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortValue === 'price-high') {
                filteredProducts.sort((a, b) => b.price - a.price);
            } else if (sortValue === 'newest') {
                filteredProducts.sort((a, b) => b.id - a.id);
            } else {
                filteredProducts.sort((a, b) => b.discount - a.discount);
            }
            
            currentPage = 1;
            renderProducts();
        }

        // Reset filters
        function resetFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('locationFilter').value = '';
            document.getElementById('sortFilter').value = '';
            document.getElementById('discountRange').value = '0';
            document.getElementById('discountValue').textContent = '0%';
            document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
            
            filteredProducts = [...products];
            currentPage = 1;
            renderProducts();
        }

        // Event Listeners
        document.getElementById('applyFilters').addEventListener('click', applyFilters);
        document.getElementById('resetFilter').addEventListener('click', resetFilters);
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') applyFilters();
        });
        
        // Discount range slider
        document.getElementById('discountRange').addEventListener('input', (e) => {
            document.getElementById('discountValue').textContent = e.target.value + '%';
        });
        
        // Category checkboxes
        document.querySelectorAll('.category-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
        
        // Pagination
        document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentPage = parseInt(e.target.dataset.page);
                document.querySelectorAll('.pagination-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
        
        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        document.getElementById('nextPage').addEventListener('click', () => {
            const maxPage = Math.ceil(filteredProducts.length / productsPerPage);
            if (currentPage < maxPage) {
                currentPage++;
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Initial render
        renderProducts();