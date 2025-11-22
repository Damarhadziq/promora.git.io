// assets/js/profile.js
const API_BASE_URL = 'backend/api';

// Load user profile saat page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();
});

// Fungsi untuk load data profile
async function loadUserProfile() {
    try {
        const response = await fetch(API_BASE_URL + '/get_profile.php', {
            method: 'GET',
            credentials: 'include' // Penting untuk kirim session cookie
        });
        
        const result = await response.json();
        
        if (result.logged_in && result.user) {
            const user = result.user;
            
            // Update display name dan email di sidebar
            document.getElementById('displayName').textContent = user.full_name;
            document.getElementById('displayEmail').textContent = user.email;
            
            // Update Personal Information di Overview Tab
            updateOverviewTab(user);
            
            // Update form Edit Profile
            updateEditForm(user);
            
            // Simpan ke localStorage sebagai backup
            localStorage.setItem('userData', JSON.stringify(user));
        } else {
            // User belum login, redirect ke login page
            alert('Anda belum login. Silakan login terlebih dahulu.');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Gagal memuat profil. Silakan refresh halaman.');
    }
}

// Update Overview Tab
function updateOverviewTab(user) {
    const overviewTab = document.getElementById('overviewTab');
    
    // Update Personal Information
    const personalInfo = overviewTab.querySelector('.bg-gray-50.rounded-xl');
    if (personalInfo) {
        const infoHTML = `
            <h4 class="font-bold text-gray-800 mb-4">Personal Information</h4>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Full Name</p>
                    <p class="font-semibold text-gray-800">${user.full_name}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="font-semibold text-gray-800">${user.email}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Phone Number</p>
                    <p class="font-semibold text-gray-800">${user.phone || 'Not set'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Username</p>
                    <p class="font-semibold text-gray-800">@${user.username}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Role</p>
                    <p class="font-semibold text-gray-800">${user.role === 'customer' ? 'Customer' : 'Seller'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Member Since</p>
                    <p class="font-semibold text-gray-800">${user.member_since}</p>
                </div>
            </div>
        `;
        personalInfo.innerHTML = infoHTML;
    }
}

// Update Edit Form
function updateEditForm(user) {
    document.getElementById('firstName').value = user.first_name || '';
    document.getElementById('lastName').value = user.last_name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
}

// Save Profile Changes
async function saveProfile(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName || !email) {
        showNotification('First name and email are required', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/update_profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Profile updated successfully!', 'success');
            // Reload profile data
            await loadUserProfile();
            // Switch ke overview tab
            switchTab('overview');
        } else {
            showNotification(result.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while updating profile', 'error');
    }
}

// Change Password
async function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('All password fields are required', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New password and confirmation do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Password changed successfully!', 'success');
            // Reset form
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showNotification(result.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while changing password', 'error');
    }
}

// Switch Tab Function
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
        btn.classList.add('text-gray-500');
    });
    
    // Show selected tab
    const tabMap = {
        'overview': 'overviewTab',
        'edit': 'editTab',
        'security': 'securityTab',
        'activity': 'activityTab'
    };
    
    const selectedTab = document.getElementById(tabMap[tabName]);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Add active class to clicked button
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
        activeBtn.classList.remove('text-gray-500');
    }
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    
    // Change icon based on type
    const icon = notification.querySelector('i');
    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle text-red-500 text-xl';
    } else {
        icon.className = 'fas fa-check-circle text-green-500 text-xl';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Cancel Edit
function cancelEdit() {
    loadUserProfile(); // Reload original data
    switchTab('overview');
}

// Logout Function
async function logout() {
    try {
        const response = await fetch(API_BASE_URL + '/logout.php', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error:', error);
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Upload Image (placeholder)
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImage').src = e.target.result;
            showNotification('Profile picture updated!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Toggle 2FA (placeholder)
function toggle2FA(checkbox) {
    if (checkbox.checked) {
        showNotification('Two-factor authentication enabled', 'success');
    } else {
        showNotification('Two-factor authentication disabled', 'success');
    }
}

// End Session (placeholder)
function endSession(button) {
    const sessionDiv = button.closest('.flex');
    sessionDiv.style.opacity = '0.5';
    showNotification('Session ended', 'success');
    setTimeout(() => {
        sessionDiv.remove();
    }, 1000);
}

// Load More Activity (placeholder)
function loadMoreActivity() {
    showNotification('Loading more activities...', 'success');
}