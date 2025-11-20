        // Sample product data
        const products = [
            {
                id: 1,
                brand: 'Zara',
                name: 'Tas Zara Leather Mini',
                price: 'Rp 480.000',
                originalPrice: 'Rp 1.200.000',
                fee: 'Rp 35.000',
                stock: '8 item',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
            },
            {
                id: 6,
                brand: 'Casio',
                name: 'Casio G-Shock Limited',
                price: 'Rp 990.000',
                originalPrice: 'Rp 1.800.000',
                fee: 'Rp 38.000',
                stock: '3 item',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
            }
        ];

        // Render products
        function renderProducts() {
            const grid = document.getElementById('products-grid');
            grid.innerHTML = products.map(product => `
                <div class="bg-white rounded-2xl shadow-sm overflow-hidden product-card">
                    <div class="relative h-64 overflow-hidden">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                        ${product.stock === '0 item' ? '<div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Stok Habis</div>' : ''}
                    </div>
                    <div class="p-5">
                        <p class="text-sm text-gray-500 mb-1">${product.brand}</p>
                        <h3 class="text-lg font-bold text-gray-900 mb-3">${product.name}</h3>
                        
                        <div class="flex items-baseline space-x-2 mb-1">
                            <span class="text-2xl font-bold text-[#7A5AF8]">${product.price}</span>
                            <span class="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-1">Fee: ${product.fee}</p>
                        <p class="text-sm ${product.stock === '0 item' ? 'text-red-600' : 'text-green-600'} font-semibold mb-4">Stok: ${product.stock}</p>
                        
                        <div class="flex space-x-2">
                            <button onclick="editProduct(${product.id})" class="flex-1 px-4 py-2 border border-[#7A5AF8] text-[#7A5AF8] rounded-lg font-medium hover:bg-[#7A5AF8] hover:text-white transition">
                                Edit
                            </button>
                            <button onclick="deleteProduct(${product.id})" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Switch tabs
        function switchTab(tabName) {
            // Hide all content
            document.getElementById('content-produk').classList.add('hidden');
            document.getElementById('content-order').classList.add('hidden');
            document.getElementById('content-statistik').classList.add('hidden');
            document.getElementById('content-pengaturan').classList.add('hidden');
            
            // Remove active class from all tabs
            document.getElementById('tab-produk').className = 'tab-inactive px-8 py-3 rounded-full font-semibold transition hover:bg-gray-200';
            document.getElementById('tab-order').className = 'tab-inactive px-8 py-3 rounded-full font-semibold transition hover:bg-gray-200';
            document.getElementById('tab-statistik').className = 'tab-inactive px-8 py-3 rounded-full font-semibold transition hover:bg-gray-200';
            document.getElementById('tab-pengaturan').className = 'tab-inactive px-8 py-3 rounded-full font-semibold transition hover:bg-gray-200';
            
            // Show selected content and activate tab
            document.getElementById('content-' + tabName).classList.remove('hidden');
            document.getElementById('tab-' + tabName).className = 'tab-active px-8 py-3 rounded-full font-semibold transition';
        }

        // Add product
        function tambahProduk() {
            alert('Fitur tambah produk akan membuka form untuk menambahkan produk baru.\n\nForm akan berisi:\n- Upload gambar produk\n- Nama brand\n- Nama produk\n- Harga\n- Harga coret\n- Fee jastip\n- Stok\n- Deskripsi');
        }

        // Edit product
        function editProduct(id) {
            const product = products.find(p => p.id === id);
            alert(`Edit produk: ${product.name}\n\nFitur ini akan membuka form edit dengan data produk yang sudah ada.`);
        }

        // Delete product
        function deleteProduct(id) {
            const product = products.find(p => p.id === id);
            if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
                const index = products.findIndex(p => p.id === id);
                if (index > -1) {
                    products.splice(index, 1);
                    renderProducts();
                    alert('Produk berhasil dihapus!');
                }
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            renderProducts();
        });
