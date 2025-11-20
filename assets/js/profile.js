        // Tab Switching
        function switchTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.add('hidden');
            });
            
            // Remove active class from all buttons
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('text-gray-500');
            });
            
            // Show selected tab
            const tabs = {
                'overview': 'overviewTab',
                'edit': 'editTab',
                'security': 'securityTab',
                'activity': 'activityTab'
            };
            
            document.getElementById(tabs[tabName]).classList.remove('hidden');
            
            // Add active class to clicked button
            const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
            activeButton.classList.add('active');
            activeButton.classList.remove('text-gray-500');
        }

        // Image Upload Handler
        function handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('profileImage').src = e.target.result;
                    showNotification('Profile picture updated successfully!');
                }
                reader.readAsDataURL(file);
            }
        }

        // Save Profile
        function saveProfile(event) {
            event.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            
            // Update display name
            document.getElementById('displayName').textContent = `${firstName} ${lastName}`;
            document.getElementById('displayEmail').textContent = email;
            
            showNotification('Profile updated successfully!');
            
            // Switch back to overview tab
            setTimeout(() => {
                switchTab('overview');
            }, 1500);
        }

        // Cancel Edit
        function cancelEdit() {
            switchTab('overview');
        }

        // Change Password
        function changePassword(event) {
            event.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                showNotification('Please fill all password fields!', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match!', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                showNotification('Password must be at least 8 characters!', 'error');
                return;
            }
            
            // Clear form
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            showNotification('Password changed successfully!');
        }

        // Toggle 2FA
        function toggle2FA(checkbox) {
            if (checkbox.checked) {
                showNotification('Two-Factor Authentication enabled!');
            } else {
                showNotification('Two-Factor Authentication disabled!');
            }
        }

        // End Session
        function endSession(button) {
            const sessionElement = button.closest('.flex');
            sessionElement.style.opacity = '0.5';
            button.disabled = true;
            button.textContent = 'Ended';
            showNotification('Session ended successfully!');
        }

        // Logout
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                showNotification('Logging out...');
                setTimeout(() => {
                    window.location.href = '#';
                }, 1500);
            }
        }

        // Load More Activity
        function loadMoreActivity() {
            showNotification('Loading more activities...');
        }

        // Show Notification
        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            const notificationText = document.getElementById('notificationText');
            const icon = notification.querySelector('i');
            
            notificationText.textContent = message;
            
            if (type === 'success') {
                icon.className = 'fas fa-check-circle text-green-500 text-xl';
            } else if (type === 'error') {
                icon.className = 'fas fa-exclamation-circle text-red-500 text-xl';
            }
            
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Smooth scroll
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

        // Form validation on input
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', function() {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.value) && this.value !== '') {
                    this.style.borderColor = '#ef4444';
                    showNotification('Please enter a valid email address!', 'error');
                } else {
                    this.style.borderColor = '#7A5AF8';
                }
            });
        });

        document.querySelectorAll('input[type="tel"]').forEach(input => {
            input.addEventListener('blur', function() {
                const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
                if (!phoneRegex.test(this.value.replace(/\s/g, '')) && this.value !== '') {
                    this.style.borderColor = '#ef4444';
                    showNotification('Please enter a valid phone number!', 'error');
                } else {
                    this.style.borderColor = '#7A5AF8';
                }
            });
        });

        // Auto-resize textarea
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        });

        // Initialize - load saved data from localStorage simulation
        window.addEventListener('DOMContentLoaded', function() {
            // Simulate loading animation
            setTimeout(() => {
                showNotification('Profile loaded successfully!');
            }, 500);
        });

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