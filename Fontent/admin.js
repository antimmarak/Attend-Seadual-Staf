// ============ SUPABASE CONFIGURATION ============
const SUPABASE_URL = 'https://zqylkepwzwtiozmqbtlj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_z7T1CDBKRArikgs_R1nvTg_-SSimhK3';

let supabase = null;
let currentUser = null;

// Initialize Supabase
async function initSupabase() {
    try {
        if (window.supabase && window.supabase.createClient) {
            supabase = window.supabase.createClient('https://zqylkepwzwtiozmqbtlj.supabase.co', SUPABASE_ANON_KEY);
            console.log('✅ Supabase initialized');
            return true;
        }
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
    }
    return false;
}

// ============ SESSION MANAGEMENT ============
function checkUserSession() {
    const sessionData = sessionStorage.getItem('userSession');
    if (!sessionData) {
        window.location.href = 'login.html';
        return false;
    }

    currentUser = JSON.parse(sessionData);
    
    // Verify it's admin role
    if (currentUser.role !== 'admin') {
        showAlert('❌ Access denied. Admin access required.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }

    return true;
}

// ============ UI FUNCTIONS ============
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.maxWidth = '400px';
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function updateUserInfo() {
    document.getElementById('userName').textContent = currentUser.email.split('@')[0].toUpperCase();
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').textContent = currentUser.email.charAt(0).toUpperCase();
}

// ============ TAB NAVIGATION ============
function initTabNavigation() {
    document.querySelectorAll('.admin-tab-btn:not(.btn-logout)').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active button
            document.querySelectorAll('.admin-tab-btn:not(.btn-logout)').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');

            // Update active content
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            const activeTab = document.getElementById(tabName);
            if (activeTab) {
                activeTab.style.display = 'block';
            }
        });
    });
}

// ============ STAFF MANAGEMENT ============
let staffList = JSON.parse(localStorage.getItem('staffData')) || [];

function renderStaffTable() {
    const tbody = document.getElementById('staffTable');
    
    if (staffList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No staff members yet</td></tr>';
        return;
    }

    tbody.innerHTML = staffList.map(staff => `
        <tr>
            <td><strong>${staff.name}</strong></td>
            <td>${staff.staffId}</td>
            <td>${staff.email}</td>
            <td><span class="status-badge" style="background: #e0e7ff; color: #3730a3;">${staff.department}</span></td>
            <td><span class="status-badge" style="background: #dcfce7; color: #166534;">Active</span></td>
            <td>
                <button class="btn btn-sm" onclick="editStaff(${staff.id})" style="font-size: 12px; padding: 6px 12px;">Edit</button>
                <button class="btn btn-sm" style="background: #dc2626; font-size: 12px; padding: 6px 12px;" onclick="deleteStaff(${staff.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function deleteStaff(staffId) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        staffList = staffList.filter(s => s.id !== staffId);
        localStorage.setItem('staffData', JSON.stringify(staffList));
        renderStaffTable();
        showAlert('✅ Staff member deleted successfully', 'success');
    }
}

function initStaffFormHandler() {
    const form = document.getElementById('addStaffForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const newStaff = {
                id: Date.now(),
                name: document.getElementById('staffName').value,
                staffId: document.getElementById('staffId').value,
                email: document.getElementById('staffEmail').value,
                department: document.getElementById('staffDept').value
            };

            staffList.push(newStaff);
            localStorage.setItem('staffData', JSON.stringify(staffList));
            renderStaffTable();
            this.reset();
            showAlert('✅ Staff member added successfully', 'success');
        });
    }
}

// ============ STATISTICS ============
function updateDashboardStats() {
    document.getElementById('totalUsers').textContent = staffList.length;
    document.getElementById('activeToday').textContent = Math.floor(staffList.length * 0.8);
    document.getElementById('pendingActions').textContent = Math.floor(Math.random() * 5);
}

// ============ LOGOUT ============
function initLogoutHandler() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.removeItem('userSession');
                localStorage.removeItem('rememberEmail');
                localStorage.removeItem('rememberRole');
                window.location.href = 'login.html';
            }
        });
    }
}

// ============ SUPABASE DATA SYNC ============
async function syncWithSupabase() {
    if (!supabase) {
        console.log('📌 Supabase not configured - using local storage');
        return;
    }

    try {
        // Load staff data from Supabase
        const { data, error } = await supabase
            .from('staff')
            .select('*');

        if (error) {
            console.warn('⚠️ Could not sync with Supabase:', error.message);
            return;
        }

        if (data && data.length > 0) {
            staffList = data;
            localStorage.setItem('staffData', JSON.stringify(staffList));
            renderStaffTable();
            console.log('✅ Synced staff data from Supabase');
        }
    } catch (error) {
        console.error('❌ Sync error:', error);
    }
}

async function saveToSupabase(tableName, record) {
    if (!supabase) {
        console.log('📌 Supabase not configured - saving locally only');
        return;
    }

    try {
        const { error } = await supabase
            .from(tableName)
            .upsert([record], { onConflict: 'id' });

        if (error) {
            console.warn('⚠️ Could not save to Supabase:', error.message);
            return;
        }

        console.log('✅ Data saved to Supabase');
    } catch (error) {
        console.error('❌ Error saving to Supabase:', error);
    }
}

// ============ INITIALIZATION ============
window.addEventListener('DOMContentLoaded', async () => {
    // Check session
    if (!checkUserSession()) return;

    // Initialize Supabase
    await initSupabase();

    // Update UI
    updateUserInfo();
    renderStaffTable();
    updateDashboardStats();

    // Initialize event listeners
    initTabNavigation();
    initStaffFormHandler();
    initLogoutHandler();

    // Sync with Supabase
    await syncWithSupabase();

    console.log('✅ Admin Panel loaded successfully');
    console.log('Current user:', currentUser);
});

// ============ SUPABASE SETUP GUIDE ============
console.log(`
╔════════════════════════════════════════════════════════════╗
║         SUPABASE SETUP INSTRUCTIONS                        ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ 1. Go to https://supabase.com and create a new project    ║
║ 2. Update SUPABASE_URL and SUPABASE_ANON_KEY in:          ║
║    - login.js                                              ║
║    - admin.js                                              ║
║    - script.js (if integrating with main app)              ║
║                                                            ║
║ 3. Create these tables in Supabase SQL Editor:            ║
║                                                            ║
║    CREATE TABLE staff (                                    ║
║      id BIGINT PRIMARY KEY,                               ║
║      name TEXT NOT NULL,                                  ║
║      staffId TEXT UNIQUE NOT NULL,                        ║
║      email TEXT NOT NULL,                                 ║
║      department TEXT NOT NULL,                            ║
║      created_at TIMESTAMP DEFAULT NOW()                   ║
║    );                                                      ║
║                                                            ║
║    CREATE TABLE attendance (                              ║
║      id BIGINT PRIMARY KEY,                               ║
║      staffId BIGINT NOT NULL,                             ║
║      date DATE NOT NULL,                                  ║
║      checkInTime TIME,                                    ║
║      checkOutTime TIME,                                   ║
║      status TEXT,                                         ║
║      created_at TIMESTAMP DEFAULT NOW()                   ║
║    );                                                      ║
║                                                            ║
║ 4. Enable Authentication (Email/Password) in:             ║
║    Supabase Project Settings → Authentication              ║
║                                                            ║
║ 5. Create RLS Policies for security (optional)            ║
║                                                            ║
║ 6. Test the login system with demo credentials first      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
