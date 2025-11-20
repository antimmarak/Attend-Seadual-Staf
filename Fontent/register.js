// ============ SUPABASE CONFIGURATION ============
const SUPABASE_URL = 'https://zqylkepwzwtiozmqbtlj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_z7T1CDBKRArikgs_R1nvTg_-SSimhK3';

let supabase = null;

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

// ============ UTILITY FUNCTIONS ============
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============ PASSWORD VALIDATION ============
function checkPasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    // Update UI
    document.getElementById('req-length').classList.toggle('met', requirements.length);
    document.getElementById('req-uppercase').classList.toggle('met', requirements.uppercase);
    document.getElementById('req-lowercase').classList.toggle('met', requirements.lowercase);
    document.getElementById('req-number').classList.toggle('met', requirements.number);
    document.getElementById('req-special').classList.toggle('met', requirements.special);

    // Calculate strength
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        strengthDiv.className = 'password-strength';
        return null;
    } else if (metRequirements <= 2) {
        strengthDiv.className = 'password-strength weak';
        strengthDiv.textContent = '⚠️ Weak password';
        return 'weak';
    } else if (metRequirements <= 3) {
        strengthDiv.className = 'password-strength fair';
        strengthDiv.textContent = '📊 Fair password';
        return 'fair';
    } else if (metRequirements === 4) {
        strengthDiv.className = 'password-strength good';
        strengthDiv.textContent = '✓ Good password';
        return 'good';
    } else {
        strengthDiv.className = 'password-strength strong';
        strengthDiv.textContent = '✅ Strong password';
        return 'strong';
    }
}

// ============ PASSWORD STRENGTH MONITORING ============
document.getElementById('password').addEventListener('input', function() {
    checkPasswordStrength(this.value);
});

// ============ REGISTRATION FORM HANDLER ============
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const staffId = document.getElementById('staffId').value.trim();
    const department = document.getElementById('department').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const termsAccepted = document.getElementById('terms').checked;

    const registerBtn = document.getElementById('registerBtn');

    // Validation
    if (!fullName || !email || !staffId || !department || !password || !confirmPassword || !role) {
        showAlert('❌ Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('❌ Please enter a valid email address', 'error');
        return;
    }

    if (password.length < 8) {
        showAlert('❌ Password must be at least 8 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('❌ Passwords do not match', 'error');
        return;
    }

    if (!termsAccepted) {
        showAlert('❌ Please accept the Terms & Conditions', 'error');
        return;
    }

    try {
        registerBtn.classList.add('loading');
        registerBtn.textContent = 'Creating Account...';

        // Try Supabase registration first
        if (supabase) {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        staff_id: staffId,
                        department: department,
                        role: role
                    }
                }
            });

            if (error) {
                console.error('❌ Supabase registration error:', error);
                showAlert(`Registration failed: ${error.message}`, 'error');
                registerBtn.classList.remove('loading');
                registerBtn.textContent = 'Create Account';
                return;
            }

            if (data && data.user) {
                console.log('✅ User registered:', data.user.email);

                // Save user profile to database
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([{
                        id: data.user.id,
                        full_name: fullName,
                        email: email,
                        staff_id: staffId,
                        department: department,
                        role: role,
                        status: 'pending_approval',
                        created_at: new Date().toISOString()
                    }]);

                if (profileError) {
                    console.warn('⚠️ Could not save profile:', profileError.message);
                }

                showAlert('✅ Account created successfully! Check your email for verification.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
        } else {
            // Fallback: Save to localStorage for demo mode
            console.log('📌 Using demo mode - saving to localStorage');
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Check if email already exists
            if (users.some(u => u.email === email)) {
                showAlert('❌ Email already registered', 'error');
                registerBtn.classList.remove('loading');
                registerBtn.textContent = 'Create Account';
                return;
            }

            const newUser = {
                id: 'user-' + Date.now(),
                fullName: fullName,
                email: email,
                staffId: staffId,
                department: department,
                password: btoa(password), // Simple base64 encoding for demo only
                role: role,
                status: role === 'admin' ? 'pending_approval' : 'active',
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            showAlert('✅ Account created successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        showAlert(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
        registerBtn.classList.remove('loading');
        registerBtn.textContent = 'Create Account';
    }
});

// ============ INITIALIZATION ============
window.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    await initSupabase();

    // Check if user already logged in
    if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            window.location.href = 'login.html';
            return;
        }
    }

    console.log('✅ Registration page loaded');
});
