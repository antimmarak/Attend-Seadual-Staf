# 🧪 Quick Test Guide - Attendance System

## ⚡ Quick Start (Under 5 Minutes)

### Step 1: Open Login Page
1. Open `Fontent/login.html` in your browser
2. You should see the login form with role selection

### Step 2: Select Role & Login

#### 🔹 Test Admin Access
1. Click **Admin** button (left side)
2. Enter Email: `admin@attendance.com`
3. Enter Password: `admin123`
4. Click **Sign In**
5. ✅ You'll be redirected to **admin.html** (Admin Panel)

#### 🔹 Test Staff Access
1. Click **Staff** button (right side)
2. Enter Email: `staff@attendance.com`
3. Enter Password: `staff123`
4. Click **Sign In**
5. ✅ You'll be redirected to **index.html** (Main Dashboard)

---

## 🎯 Admin Panel Features to Test

Once logged in as admin, test these features:

### 1. Dashboard Tab
- [ ] See stats cards (Total Users, Active Today, Pending Actions)
- [ ] Stats should update as you add staff

### 2. Staff Management Tab
- [ ] Fill in staff form:
  - Name: John Doe
  - Staff ID: STF-001
  - Email: john@example.com
  - Department: IT
- [ ] Click "Add Staff"
- [ ] Confirm success message
- [ ] Staff appears in list below

### 3. Edit/Delete Staff
- [ ] Click Edit button on staff row
- [ ] Click Delete button to remove staff
- [ ] Confirm deletion with popup

### 4. Other Tabs
- [ ] User Accounts tab - Shows registered users
- [ ] Reports tab - Generate attendance reports
- [ ] Settings tab - System configuration
- [ ] Activity Logs tab - View system activity

### 5. Logout
- [ ] Click **🚪 Logout** button
- [ ] Confirm logout
- [ ] Redirected to login page

---

## 📊 Staff Dashboard Features to Test

Once logged in as staff, test these features:

### 1. Dashboard View
- [ ] See total staff count
- [ ] See today's attendance
- [ ] See attendance statistics

### 2. Add Staff (if available)
- [ ] Add new staff members
- [ ] Verify they appear in table

### 3. Entry Time Tracking
- [ ] View entry times
- [ ] Add/edit entry times

### 4. Schedule View
- [ ] See staff schedules
- [ ] View schedule details

### 5. Attendance Check-in/Out
- [ ] Select staff member
- [ ] Click Check-in time
- [ ] Click Check-out time
- [ ] Verify in attendance table

### 6. Logout
- [ ] Click **🚪 Logout** button
- [ ] Redirected to login page

---

## 📝 Registration Test

### Test New User Registration

1. From login page, click **"Create new account"** link
2. Fill in registration form:
   - Full Name: `Test User`
   - Email: `testuser@example.com`
   - Staff ID: `STF-100`
   - Department: `HR`
   - Password: `TestPass123!` (must have uppercase, number, special char)
   - Confirm Password: `TestPass123!`
   - Role: `Staff`
   - Check "I agree to Terms & Conditions"
3. Click **Create Account**
4. You should see success message
5. Redirected to login
6. Try logging in with new credentials

---

## 🔍 Browser Console Checks

Open browser console (F12) and look for:

✅ Good Signs:
- "✅ Supabase initialized successfully"
- "✅ Admin Panel loaded successfully"
- "Demo Credentials:" message
- "Current user:" showing your login

❌ Issues to Fix:
- Red error messages about Supabase
- "Cannot read property" errors
- "Session check error"

---

## 📱 Responsive Design Test

### Desktop
- [ ] All elements visible and properly sized
- [ ] Tables scroll horizontally if needed
- [ ] Buttons clickable and spaced

### Tablet (iPad)
- [ ] Responsive layout adapts
- [ ] Touch-friendly buttons
- [ ] Navigation accessible

### Mobile (iPhone/Android)
- [ ] Single column layout
- [ ] Buttons large enough to tap
- [ ] Navigation buttons accessible
- [ ] Tables scroll horizontally

---

## ✅ System Health Check

### Session Management
- [ ] Login creates session
- [ ] Logout clears session
- [ ] Page refresh maintains login (until logout)
- [ ] Direct URL access requires login

### Data Management
- [ ] Added staff saves to localStorage
- [ ] Data persists after refresh
- [ ] Delete removes data correctly
- [ ] Edit updates correctly

### Error Handling
- [ ] Invalid email shows error
- [ ] Wrong password shows error
- [ ] Missing fields shows error
- [ ] Errors auto-clear after 5 seconds

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank screen | Clear cache (Ctrl+Shift+Delete) and refresh |
| Can't login | Use demo credentials: admin@attendance.com / admin123 |
| Page redirects to login | Session expired, login again |
| Staff not showing | Add staff first, then check the table |
| No data appears | Check browser console for errors |
| Mobile layout broken | Try different screen size, refresh |

---

## 📊 Expected Behavior

### Login Page
- [ ] Opens without errors
- [ ] Shows role selection
- [ ] Accepts valid credentials
- [ ] Shows loading spinner during login
- [ ] Redirects based on role

### Admin Page
- [ ] Loads after admin login
- [ ] Shows user info in header
- [ ] Displays dashboard with stats
- [ ] Can add/edit/delete staff
- [ ] Logout button works

### Main Dashboard
- [ ] Loads after staff login
- [ ] Shows attendance interface
- [ ] Can check-in/out
- [ ] Can view schedules
- [ ] Logout button works

---

## 🎓 Test Scenarios

### Scenario 1: New Admin
1. Open login.html
2. Select Admin role
3. Login with admin@attendance.com / admin123
4. Add 3 staff members
5. Check dashboard stats update
6. Logout

### Scenario 2: New Staff
1. Open login.html
2. Select Staff role
3. Login with staff@attendance.com / staff123
4. Check-in first staff
5. Check-out after hour
6. Verify in attendance table
7. Logout

### Scenario 3: Registration Flow
1. Click "Create new account"
2. Register new staff member
3. Logout and try new credentials
4. Verify access

---

## 📞 Troubleshooting Steps

If something doesn't work:

1. **Check Console**: Press F12 → Console tab → Look for errors
2. **Clear Cache**: Ctrl+Shift+Delete → Clear all
3. **Refresh Page**: Ctrl+R (hard refresh: Ctrl+Shift+R)
4. **Try Demo Credentials**: admin@attendance.com / admin123
5. **Check Network**: Look for failed API calls in Network tab
6. **Check Session**: Open DevTools → Application → SessionStorage

---

## ✨ Success Indicators

You'll know the system is working when:

✅ Login works with demo credentials
✅ Admin can see admin.html
✅ Staff can see main dashboard
✅ Can add staff members
✅ Can track attendance
✅ Logout clears session
✅ No red errors in console
✅ Responsive on all devices

---

**Version**: 1.0
**Last Updated**: November 21, 2025
**Status**: ✅ Ready for Testing
