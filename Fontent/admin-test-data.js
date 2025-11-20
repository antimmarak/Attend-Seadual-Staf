// ============ ADMIN TEST DATA GENERATOR ============
// This file helps populate test data for the admin panel
// Run this in browser console or include it before admin.js to auto-populate

function generateTestData() {
    console.log('🔧 Generating test data for admin panel...');

    // Sample staff data
    const sampleStaffData = [
        {
            id: 1001,
            name: 'John Doe',
            staffId: 'STF-001',
            email: 'john@company.com',
            department: 'IT'
        },
        {
            id: 1002,
            name: 'Jane Smith',
            staffId: 'STF-002',
            email: 'jane@company.com',
            department: 'HR'
        },
        {
            id: 1003,
            name: 'Mike Johnson',
            staffId: 'STF-003',
            email: 'mike@company.com',
            department: 'Sales'
        },
        {
            id: 1004,
            name: 'Sarah Williams',
            staffId: 'STF-004',
            email: 'sarah@company.com',
            department: 'Marketing'
        },
        {
            id: 1005,
            name: 'Tom Brown',
            staffId: 'STF-005',
            email: 'tom@company.com',
            department: 'IT'
        }
    ];

    // Sample users data
    const sampleUsersData = [
        {
            name: 'Admin User',
            email: 'admin@attendance.com',
            role: 'Admin',
            lastLogin: new Date().toISOString()
        },
        {
            name: 'John Doe',
            email: 'john@company.com',
            role: 'Staff',
            lastLogin: new Date(Date.now() - 3600000).toISOString()
        },
        {
            name: 'Jane Smith',
            email: 'jane@company.com',
            role: 'Staff',
            lastLogin: new Date(Date.now() - 7200000).toISOString()
        }
    ];

    // Save to localStorage
    localStorage.setItem('staffData', JSON.stringify(sampleStaffData));
    localStorage.setItem('usersData', JSON.stringify(sampleUsersData));

    console.log('✅ Test data generated successfully!');
    console.log('Staff Members:', sampleStaffData.length);
    console.log('Users:', sampleUsersData.length);
    console.log('Reload the page to see the data');

    return {
        staffData: sampleStaffData,
        usersData: sampleUsersData
    };
}

// Auto-generate test data if not already present
window.addEventListener('DOMContentLoaded', () => {
    const existingStaffData = localStorage.getItem('staffData');
    const existingUsersData = localStorage.getItem('usersData');

    if (!existingStaffData || JSON.parse(existingStaffData).length === 0) {
        console.log('📌 No staff data found. Generating test data...');
        generateTestData();
    }

    if (!existingUsersData || JSON.parse(existingUsersData).length === 0) {
        console.log('📌 No users data found. Generating test data...');
        generateTestData();
    }
});

// Export function for manual use
window.generateAdminTestData = generateTestData;
