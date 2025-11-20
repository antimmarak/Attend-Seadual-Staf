# 🔐 Supabase Setup Guide for Attendance System

## Current Configuration Status
✅ **Supabase Credentials Already Set**
- URL: `https://zqylkepwzwtiozmqbtlj.supabase.co`
- Anon Key: `sb_publishable_z7T1CDBKRArikgs_R1nvTg_-SSimhK3`

These credentials are already configured in:
- `Fontent/login.js` (Lines 3-4)
- `Fontent/admin.js` (Lines 2-3)
- `Fontent/register.js` (Lines 2-3)

---

## 🚀 Quick Start (Demo Mode)

The system works in **demo mode** without Supabase setup. Test with these credentials:

### Admin Login
- Email: `admin@attendance.com`
- Password: `admin123`

### Staff Login
- Email: `staff@attendance.com`
- Password: `staff123`

---

## 📋 Step-by-Step Supabase Setup

### Step 1: Create Supabase Tables

1. Go to your Supabase project: https://app.supabase.com
2. Click **SQL Editor** in the left menu
3. Run these SQL commands one by one:

#### Create Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    staff_id TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_staff_id ON users(staff_id);
```

#### Create Staff Table
```sql
CREATE TABLE IF NOT EXISTS staff (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    staffId TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_id ON staff(staffId);
```

#### Create Attendance Table
```sql
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT PRIMARY KEY,
    staffId TEXT NOT NULL REFERENCES staff(staffId),
    date DATE NOT NULL,
    checkInTime TIME,
    checkOutTime TIME,
    status TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_staff_date ON attendance(staffId, date);
```

#### Create Activity Logs Table
```sql
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_email);
```

---

### Step 2: Enable Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Go to **Email Templates** → **Confirm signup** → Enable email confirmation if needed

---

### Step 3: Set Row Level Security (RLS) - Optional but Recommended

1. Click on **Authentication** → **Policies**
2. Select the `users` table
3. Click **New Policy** → **For SELECT** → **Using authenticated users can view their own data**

Example policy:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" 
ON users 
FOR SELECT 
USING (auth.uid() = id);
```

---

### Step 4: Create Test Users (Optional)

You can create test users in Supabase:

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Fill in:
   - Email: `admin@test.com`
   - Password: Create a strong password
4. Click **Create user**

---

## 🧪 Testing the System

### Test Flow:
1. **Open**: `Fontent/login.html`
2. **Select Role**: Admin or Staff
3. **Enter Credentials**: Use demo credentials above
4. **Click Login**: You'll see "Demo login successful"
5. **Admin Redirect**: Goes to `admin.html`
6. **Staff Redirect**: Goes to `index.html`

### Features to Test:
- ✅ Demo login without Supabase
- ✅ Admin panel with staff management
- ✅ Attendance tracking
- ✅ Logout functionality
- ✅ Session persistence

---

## 🔧 Troubleshooting

### Issue: "Supabase not initialized"
**Solution**: 
- Check browser console for errors
- Verify credentials are correct
- Wait for page to fully load (check console messages)

### Issue: Can't login
**Solution**:
- Demo mode is always available
- Check if you're using correct demo credentials
- Clear browser cache: `Ctrl+Shift+Delete`

### Issue: Admin panel not loading
**Solution**:
- Make sure you logged in as admin
- Check browser console for errors
- Try demo credentials first

### Issue: Staff data not syncing
**Solution**:
- System uses localStorage by default
- Supabase sync is automatic when configured
- Refresh page to reload latest data

---

## 📱 Features Available

### 🔓 Login System
- Email/Password authentication
- Role-based access (Admin/Staff)
- Remember me functionality
- Demo mode fallback

### 👨‍💼 Admin Panel
- Dashboard with statistics
- Staff management (Add, Edit, Delete)
- User accounts management
- Activity logs
- System settings
- Quick logout

### 📊 Staff Dashboard
- Attendance tracking
- Check-in/Check-out
- Schedule viewing
- Entry time tracking
- Personal reports
- Quick logout

### 📝 Registration System
- New user registration
- Password strength indicator
- Department selection
- Email validation
- Approval workflow

---

## 🔐 Security Tips

1. **Change Credentials**: Replace Supabase keys if exposed
2. **Enable RLS**: Always enable Row Level Security in production
3. **CORS Settings**: Configure CORS in Supabase settings
4. **Email Verification**: Enable email verification in Authentication settings
5. **Session Timeout**: Implement automatic logout (currently 24 hours)

---

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Review Supabase documentation: https://supabase.com/docs
3. Check database tables exist with correct schemas
4. Verify authentication is enabled

---

## ✅ Configuration Checklist

- [x] Supabase credentials configured
- [x] Login system working
- [x] Demo mode available
- [x] Admin panel functional
- [x] Staff dashboard working
- [x] Logout implemented
- [x] Session checking active
- [ ] Supabase tables created (if using production)
- [ ] RLS policies configured (if using production)
- [ ] Email verification enabled (optional)

---

**Last Updated**: November 21, 2025
**System Status**: ✅ Ready for Testing
