// ============ SUPABASE CONFIGURATION ============
// Initialize Supabase Client
// IMPORTANT: Replace these with your Supabase credentials
const SUPABASE_URL = 'https://zqylkepwzwtiozmqbtlj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_z7T1CDBKRArikgs_R1nvTg_-SSimhK3';

let supabase = null;

// Initialize Supabase when ready
async function initSupabase() {
    try {
        if (window.supabase && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase initialized successfully');
            return true;
        } else {
            console.warn('⚠️ Supabase library not loaded yet');
            return false;
        }
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return false;
    }
}

// ============ LOGIN FUNCTIONALITY ============
let selectedRole = 'admin';

// Role Selection
document.querySelectorAll('.role-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        selectedRole = this.getAttribute('data-role');
        console.log('Selected role:', selectedRole);
    });
});

// Show Alert Message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // Auto-remove alert after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Validate Email Format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Login with Email and Password (Supabase)
async function loginWithSupabase(email, password) {
    try {
        if (!supabase) {
            throw new Error('Supabase not initialized. Please check your configuration.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('❌ Supabase login error:', error);
            showAlert(`Login failed: ${error.message}`, 'error');
            return null;
        }

        if (data && data.user) {
            console.log('✅ User logged in:', data.user.email);
            return data.user;
        }
    } catch (error) {
        console.error('❌ Error during login:', error);
        showAlert(error.message, 'error');
        return null;
    }
}

// Demo Login (for testing without Supabase setup)
async function demoDemoLogin(email, password) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo credentials
    const demoAdminCredentials = {
        'admin@gmail.com': 'admin123'
    };

    const demoStaffCredentials = {
        'staff@gmail.com': 'staff123'
    };

    if (selectedRole === 'admin') {
        if (demoAdminCredentials[email] === password) {
            return {
                id: 'demo-admin-' + Date.now(),
                email: email,
                role: 'admin',
                name: 'Admin User'
            };
        }
    } else if (selectedRole === 'staff') {
        if (demoStaffCredentials[email] === password) {
            return {
                id: 'demo-staff-' + Date.now(),
                email: email,
                role: 'staff',
                name: 'Staff Member'
            };
        }
    }

    throw new Error('Invalid credentials');
}

// Form Submit Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginBtn = document.getElementById('loginBtn');

    // Validation
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        loginBtn.classList.add('loading');
        loginBtn.textContent = 'Signing in...';

        // Try Supabase login first
        let user = null;
        if (supabase) {
            user = await loginWithSupabase(email, password);
        }

        // Fallback to demo login if Supabase not configured
        if (!user) {
            console.log('📌 Using demo login mode (Supabase not configured)');
            user = await demoDemoLogin(email, password);
            showAlert('✅ Demo login successful! Using local data storage.', 'info');
        }

        if (user) {
            // Store user session
            const sessionData = {
                userId: user.id,
                email: user.email,
                role: selectedRole,
                loginTime: new Date().toISOString()
            };

            sessionStorage.setItem('userSession', JSON.stringify(sessionData));

            if (rememberMe) {
                localStorage.setItem('rememberEmail', email);
                localStorage.setItem('rememberRole', selectedRole);
            }

            showAlert(`✅ Welcome ${selectedRole.toUpperCase()}!`, 'success');

            // Redirect to dashboard
            setTimeout(() => {
                if (selectedRole === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showAlert(error.message || 'Login failed. Please try again.', 'error');
    } finally {
        loginBtn.classList.remove('loading');
        loginBtn.textContent = 'Sign In';
    }
});

// Load remembered email and role
window.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    await initSupabase();

    // Add small delay to ensure Supabase is ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already logged in
    if (supabase) {
        try {
            const { data } = await supabase.auth.getSession();
            if (data && data.session) {
                // Determine redirect based on session
                const userRole = localStorage.getItem('rememberRole') || 'staff';
                if (userRole === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
                return;
            }
        } catch (error) {
            console.warn('⚠️ Session check error:', error);
        }
    }

    // Load remembered credentials
    const rememberedEmail = localStorage.getItem('rememberEmail');
    const rememberedRole = localStorage.getItem('rememberRole');

    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }

    if (rememberedRole) {
        selectedRole = rememberedRole;
        document.querySelectorAll('.role-option').forEach(option => {
            if (option.getAttribute('data-role') === rememberedRole) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    // Demo credentials info
    console.log('📌 Demo Credentials:');
    console.log('Admin - Email: admin@gmail.com, Password: admin123');
    console.log('Staff - Email: staff@gmail.com, Password: staff123');
});

// Forgot Password Handler
document.getElementById('forgotPassword').addEventListener('click', (e) => {
    e.preventDefault();
    showAlert('⚠️ Password reset coming soon! Contact your administrator.', 'info');
});

// Signup Link Handler
document.getElementById('signupLink').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'register.html';
});
