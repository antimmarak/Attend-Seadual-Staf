// ============ SUPABASE CONFIGURATION ============
const SUPABASE_URL = 'https://zqylkepwzwtiozmqbtlj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxeWxrZXB3end0aW96bXFidGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzY5NDIsImV4cCI6MjA3ODk1Mjk0Mn0.k4Yc2CewdtM29tYsW8LfHKtNJGXsmzEpdB3aDHShKFk';

let supabase = null;
let currentUser = null;

// ============ PERMISSIONS CONFIGURATION (DEFINED FIRST) ============
const DEFAULT_PERMISSIONS = {
    'Admin': {
        viewDashboard: true,
        manageStaff: true,
        manageUsers: true,
        viewReports: true,
        editSettings: true,
        viewLogs: true,
        managePermissions: true,
        exportData: true,
        deleteRecords: true
    },
    'Manager': {
        viewDashboard: true,
        manageStaff: true,
        manageUsers: false,
        viewReports: true,
        editSettings: false,
        viewLogs: true,
        managePermissions: false,
        exportData: true,
        deleteRecords: false
    },
    'Staff': {
        viewDashboard: true,
        manageStaff: false,
        manageUsers: false,
        viewReports: false,
        editSettings: false,
        viewLogs: false,
        managePermissions: false,
        exportData: false,
        deleteRecords: false
    }
};

// Initialize Supabase
async function initSupabase() {
    try {
        if (window.supabase && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
let usersList = JSON.parse(localStorage.getItem('usersData')) || [];
let editingStaffId = null;

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
                <button class="btn btn-sm" onclick="editStaff(${staff.id})" style="font-size: 12px; padding: 6px 12px; background: #2563eb; color: white;">✏️ Edit</button>
                <button class="btn btn-sm" style="background: #dc2626; color: white; font-size: 12px; padding: 6px 12px;" onclick="deleteStaff(${staff.id})">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function editStaff(staffId) {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) {
        showAlert('❌ Staff member not found', 'error');
        return;
    }

    editingStaffId = staffId;
    document.getElementById('staffName').value = staff.name;
    document.getElementById('staffId').value = staff.staffId;
    document.getElementById('staffEmail').value = staff.email;
    document.getElementById('staffDept').value = staff.department;

    const submitBtn = document.querySelector('#addStaffForm button[type="submit"]');
    submitBtn.textContent = '💾 Update Staff';
    submitBtn.style.background = '#2563eb';

    // Scroll to form
    document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('staffName').focus();
}

function deleteStaff(staffId) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        staffList = staffList.filter(s => s.id !== staffId);
        localStorage.setItem('staffData', JSON.stringify(staffList));
        renderStaffTable();
        showAlert('✅ Staff member deleted successfully', 'success');
        updateDashboardStats();
    }
}

function initStaffFormHandler() {
    const form = document.getElementById('addStaffForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const staffName = document.getElementById('staffName').value.trim();
            const staffId = document.getElementById('staffId').value.trim();
            const staffEmail = document.getElementById('staffEmail').value.trim();
            const staffDept = document.getElementById('staffDept').value;

            // Validation
            if (!staffName || !staffId || !staffEmail || !staffDept) {
                showAlert('❌ Please fill in all fields', 'error');
                return;
            }

            if (editingStaffId) {
                // Update existing staff
                const staffIndex = staffList.findIndex(s => s.id === editingStaffId);
                if (staffIndex > -1) {
                    staffList[staffIndex] = {
                        id: editingStaffId,
                        name: staffName,
                        staffId: staffId,
                        email: staffEmail,
                        department: staffDept
                    };
                    showAlert('✅ Staff member updated successfully', 'success');
                    editingStaffId = null;
                    const submitBtn = document.querySelector('#addStaffForm button[type="submit"]');
                    submitBtn.textContent = '➕ Add Staff';
                    submitBtn.style.background = '';
                }
            } else {
                // Check for duplicate staff ID
                if (staffList.some(s => s.staffId === staffId)) {
                    showAlert('❌ Staff ID already exists', 'error');
                    return;
                }

                // Add new staff
                const newStaff = {
                    id: Date.now(),
                    name: staffName,
                    staffId: staffId,
                    email: staffEmail,
                    department: staffDept
                };
                staffList.push(newStaff);
                showAlert('✅ Staff member added successfully', 'success');
            }

            localStorage.setItem('staffData', JSON.stringify(staffList));
            renderStaffTable();
            updateDashboardStats();
            this.reset();
        });
    }
}

// ============ USER FORM HANDLER ============
function initUserFormHandler() {
    const form = document.getElementById('addUserForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const userName = document.getElementById('userName').value.trim();
            const userEmail = document.getElementById('userEmail').value.trim();
            const userRole = document.getElementById('userRole').value;
            const userPassword = document.getElementById('userPassword').value;

            // Validation
            if (!userName || !userEmail || !userRole || !userPassword) {
                showAlert('❌ Please fill in all fields', 'error');
                return;
            }

            if (userPassword.length < 8) {
                showAlert('❌ Password must be at least 8 characters', 'error');
                return;
            }

            // Check for duplicate email
            if (usersList.some(u => u.email === userEmail)) {
                showAlert('❌ Email already registered', 'error');
                return;
            }

            // Create new user
            const newUser = {
                name: userName,
                email: userEmail,
                role: userRole,
                password: userPassword, // In production, this should be hashed
                permissions: { ...DEFAULT_PERMISSIONS[userRole] },
                createdAt: new Date().toISOString(),
                lastLogin: null,
                status: 'Active'
            };

            usersList.push(newUser);
            localStorage.setItem('usersData', JSON.stringify(usersList));
            renderUsersTable();
            updateDashboardStats();
            this.reset();
            showAlert(`✅ User ${userEmail} created successfully with ${userRole} role`, 'success');
        });
    }
}

// ============ PENDING ACTIONS MANAGEMENT ============
function getPendingActions() {
    const actions = [];
    
    // Check for users that need verification
    usersList.forEach((user, idx) => {
        if (!user.lastLogin) {
            actions.push({
                id: `user-verify-${idx}`,
                type: 'User Verification',
                description: `User "${user.name || user.email}" has never logged in`,
                severity: 'warning',
                user: user.email
            });
        }
    });
    
    // Check for staff that need setup
    staffList.forEach((staff, idx) => {
        if (!staff.status || staff.status !== 'Active') {
            actions.push({
                id: `staff-setup-${idx}`,
                type: 'Staff Setup',
                description: `Staff member "${staff.name}" needs to be activated`,
                severity: 'warning',
                staff: staff.staffId
            });
        }
    });
    
    // Check for users without permissions set
    usersList.forEach((user, idx) => {
        if (!user.permissions || Object.keys(user.permissions).length === 0) {
            actions.push({
                id: `perms-set-${idx}`,
                type: 'Permissions Setup',
                description: `Permissions not configured for user "${user.name || user.email}"`,
                severity: 'error',
                user: user.email
            });
        }
    });
    
    return actions;
}

function displayPendingActions() {
    const actions = getPendingActions();
    const count = actions.length;
    
    document.getElementById('pendingActions').textContent = count;
    
    // Store actions in sessionStorage for detail page
    sessionStorage.setItem('pendingActions', JSON.stringify(actions));
    
    // Log for debugging
    if (count > 0) {
        console.log(`⚠️ ${count} pending action(s) found:`, actions);
    }
    
    return count;
}

// ============ STATISTICS ============
function updateDashboardStats() {
    document.getElementById('totalUsers').textContent = staffList.length + usersList.length;
    document.getElementById('activeToday').textContent = Math.floor((staffList.length + usersList.length) * 0.8);
    displayPendingActions();
}

// ============ USER ACCOUNTS MANAGEMENT ============
function renderUsersTable() {
    const tbody = document.getElementById('usersTable');
    
    if (usersList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No users registered</td></tr>';
        return;
    }

    tbody.innerHTML = usersList.map((user, index) => {
        const roleColor = user.role === 'Admin' ? '#3730a3' : user.role === 'Manager' ? '#92400e' : '#166534';
        const roleBg = user.role === 'Admin' ? '#e0e7ff' : user.role === 'Manager' ? '#fef3c7' : '#dcfce7';
        return `
            <tr>
                <td><strong>${user.name || user.email.split('@')[0]}</strong></td>
                <td>${user.email}</td>
                <td><span class="status-badge" style="background: ${roleBg}; color: ${roleColor};">${user.role || 'Staff'}</span></td>
                <td><span class="status-badge" style="background: #dcfce7; color: #166534;">✓ Active</span></td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                <td>
                    <button class="btn btn-sm" onclick="openUserPermissions(${index})" style="font-size: 12px; padding: 6px 12px; background: #2563eb; color: white;">🔐 Permissions</button>
                    <button class="btn btn-sm" onclick="editUser(${index})" style="font-size: 12px; padding: 6px 12px; background: #0891b2; color: white;">✏️ Edit</button>
                    <button class="btn btn-sm" style="background: #dc2626; color: white; font-size: 12px; padding: 6px 12px;" onclick="deleteUser(${index})">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function editUser(userIndex) {
    const user = usersList[userIndex];
    if (!user) {
        showAlert('❌ User not found', 'error');
        return;
    }

    const newName = prompt('Edit user name:', user.name || user.email);
    if (newName !== null && newName.trim()) {
        user.name = newName.trim();
        localStorage.setItem('usersData', JSON.stringify(usersList));
        renderUsersTable();
        showAlert(`✅ User ${user.email} updated successfully`, 'success');
    }
}

function deleteUser(userIndex) {
    const user = usersList[userIndex];
    if (confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
        usersList.splice(userIndex, 1);
        localStorage.setItem('usersData', JSON.stringify(usersList));
        renderUsersTable();
        showAlert('✅ User deleted successfully', 'success');
        updateDashboardStats();
    }
}

function openUserPermissions(userIndex) {
    const user = usersList[userIndex];
    if (!user) {
        showAlert('❌ User not found', 'error');
        return;
    }

    // Create modal for permissions
    const modal = document.createElement('div');
    modal.id = 'permissionsModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    const userPerms = user.permissions || DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS['Staff'];
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
    `;

    const permissionsHtml = Object.entries(DEFAULT_PERMISSIONS['Admin']).map(([perm, defaultVal]) => {
        const isChecked = userPerms[perm] || false;
        return `
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="perm_${perm}" ${isChecked ? 'checked' : ''} 
                    style="width: 18px; height: 18px; cursor: pointer; margin-right: 12px;">
                <label for="perm_${perm}" style="cursor: pointer; margin: 0; font-weight: 500; color: #1e293b;">
                    ${perm.replace(/([A-Z])/g, ' $1').trim()}
                </label>
            </div>
        `;
    }).join('');

    modalContent.innerHTML = `
        <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 20px;">🔐 Manage Permissions</h3>
        <p style="color: #64748b; margin-bottom: 20px;"><strong>User:</strong> ${user.email}</p>
        <p style="color: #64748b; margin-bottom: 20px;"><strong>Role:</strong> ${user.role}</p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-bottom: 20px;">
            ${permissionsHtml}
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <button onclick="closePermissionsModal()" style="padding: 10px 20px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; background: white; color: #1e293b; font-weight: 600;">Cancel</button>
            <button onclick="saveUserPermissions(${userIndex})" style="padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; font-weight: 600;">✅ Save Permissions</button>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function closePermissionsModal() {
    const modal = document.getElementById('permissionsModal');
    if (modal) modal.remove();
}

// ============ PENDING ACTIONS MODAL ============
function showPendingActionsModal() {
    const modal = document.getElementById('pendingActionsModal');
    const actions = getPendingActions();
    const actionsList = document.getElementById('pendingActionsList');
    
    if (actions.length === 0) {
        actionsList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                <p style="font-size: 3em; margin: 0;">✅</p>
                <p style="font-size: 1.1em; margin: 10px 0 0 0;">No pending actions!</p>
                <p style="font-size: 0.9em; margin: 5px 0 0 0; color: #94a3b8;">All tasks are completed.</p>
            </div>
        `;
    } else {
        actionsList.innerHTML = actions.map((action, idx) => {
            const severityColor = action.severity === 'error' ? '#dc2626' : '#ea580c';
            const severityBg = action.severity === 'error' ? '#fee2e2' : '#fff7ed';
            return `
                <div style="background: ${severityBg}; border-left: 4px solid ${severityColor}; padding: 15px; margin-bottom: 12px; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <p style="margin: 0 0 5px 0; color: ${severityColor}; font-weight: 600; font-size: 0.95em;">
                                ${action.severity === 'error' ? '🔴' : '⚠️'} ${action.type}
                            </p>
                            <p style="margin: 0; color: #1e293b; font-size: 0.9em;">
                                ${action.description}
                            </p>
                        </div>
                        <span style="background: ${severityColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75em; font-weight: 600; white-space: nowrap; margin-left: 10px;">
                            ${action.severity.toUpperCase()}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    modal.style.display = 'flex';
}

function closePendingActionsModal() {
    const modal = document.getElementById('pendingActionsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('pendingActionsModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePendingActionsModal();
            }
        });
    }
});

function saveUserPermissions(userIndex) {
    const user = usersList[userIndex];
    if (!user) return;

    const permissions = {};
    Object.keys(DEFAULT_PERMISSIONS['Admin']).forEach(perm => {
        const checkbox = document.getElementById(`perm_${perm}`);
        permissions[perm] = checkbox ? checkbox.checked : false;
    });

    user.permissions = permissions;
    localStorage.setItem('usersData', JSON.stringify(usersList));
    closePermissionsModal();
    renderUsersTable();
    showAlert(`✅ Permissions updated for ${user.email}`, 'success');
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
    try {
        // Initialize Supabase first
        const supInit = await initSupabase();
        console.log('Supabase init result:', supInit);

        // Add delay for Supabase to fully load
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check session with error handling
        const sessionOk = checkUserSession();
        if (!sessionOk) return;

        // Update UI
        updateUserInfo();
        renderStaffTable();
        renderUsersTable();
        updateDashboardStats();

        // Initialize event listeners
        initTabNavigation();
        initStaffFormHandler();
        initUserFormHandler();
        initLogoutHandler();

        // Sync with Supabase
        await syncWithSupabase();

        console.log('✅ Admin Panel loaded successfully');
        console.log('Current user:', currentUser);
        console.log('Staff List:', staffList);
        console.log('Users List:', usersList);
    } catch (error) {
        console.error('❌ Admin initialization error:', error);
        showAlert('Error loading admin panel. Please login again.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
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
