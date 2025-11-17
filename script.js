// Data Storage
let staffData = JSON.parse(localStorage.getItem('staffData')) || [];
let scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || [];
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
let entryTimeData = JSON.parse(localStorage.getItem('entryTimeData')) || [];

// Device detection
const isMobile = window.innerWidth <= 768;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setTodayDate();
    initializeMobileOptimizations();
});

// Initialize mobile optimizations
function initializeMobileOptimizations() {
    // Add touch-friendly padding to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        if (isMobile) {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        }
    });

    // Make tables scrollable on mobile
    const tables = document.querySelectorAll('.attendance-table');
    tables.forEach(table => {
        if (isMobile) {
            const wrapper = document.createElement('div');
            wrapper.style.overflowX = 'auto';
            wrapper.style.marginBottom = '10px';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

// Initialize the app
function initializeApp() {
    renderStaffList();
    renderScheduleDropdowns();
    renderEntryTimeDropdown();
    updateDashboard();
    renderScheduleList();
    renderAttendanceList();
    // Validate and clean entry time data before rendering
    validateAndCleanEntryTimeData();
    renderEntryTimeList();
    updateReportSelects();
    updateEntrySummary();
}

// Validate and clean entry time data
function validateAndCleanEntryTimeData() {
    entryTimeData = entryTimeData.filter(entry => {
        // Check if entry has required fields
        if (!entry.id || !entry.date || entry.staffId === undefined || !entry.staffName || !entry.entryType || !entry.time) {
            console.warn('Invalid entry record removed:', entry);
            return false;
        }
        // Validate time format (HH:MM)
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(entry.time)) {
            console.warn('Invalid time format:', entry.time);
            return false;
        }
        // Validate entryType
        if (!['Entry', 'Exit'].includes(entry.entryType)) {
            console.warn('Invalid entry type:', entry.entryType);
            return false;
        }
        return true;
    });
    if (entryTimeData.length > 0) {
        saveData();
    }
}

// Set today's date in date inputs
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;
    document.getElementById('schedule-date').value = today;
    document.getElementById('entry-date').value = today;
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('staffData', JSON.stringify(staffData));
    localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    localStorage.setItem('entryTimeData', JSON.stringify(entryTimeData));
}

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Refresh dashboard when switching to it
    if (tabName === 'dashboard') {
        updateDashboard();
    }

    // Refresh reports when switching to it
    if (tabName === 'reports') {
        generateReport();
    }
}

// ============ ADD STAFF ============
document.getElementById('add-staff-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const newStaff = {
        id: Date.now(),
        name: document.getElementById('staff-name').value,
        staffId: document.getElementById('staff-id').value,
        email: document.getElementById('staff-email').value,
        department: document.getElementById('staff-department').value,
        position: document.getElementById('staff-position').value,
        dateAdded: new Date().toLocaleDateString()
    };

    // Check if staff ID already exists
    if (staffData.some(staff => staff.staffId === newStaff.staffId)) {
        showAlert('Staff ID already exists!', 'error');
        return;
    }

    staffData.push(newStaff);
    saveData();
    renderStaffList();
    renderScheduleDropdowns();
    updateReportSelects();
    document.getElementById('add-staff-form').reset();
    showAlert('Staff member added successfully!', 'success');
});

// Render staff list
function renderStaffList() {
    const staffListBody = document.getElementById('staff-list');
    
    if (staffData.length === 0) {
        staffListBody.innerHTML = '<tr><td colspan="6">No staff members added yet</td></tr>';
        return;
    }

    staffListBody.innerHTML = staffData.map(staff => `
        <tr>
            <td>${staff.name}</td>
            <td>${staff.staffId}</td>
            <td>${staff.email}</td>
            <td>${staff.department}</td>
            <td>${staff.position}</td>
            <td>
                <button class="btn btn-success" onclick="openEditModal(${staff.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteStaff(${staff.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Delete staff
function deleteStaff(staffId) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        staffData = staffData.filter(staff => staff.id !== staffId);
        // Also remove related schedules and attendance records
        scheduleData = scheduleData.filter(s => s.staffId !== staffId);
        attendanceData = attendanceData.filter(a => a.staffId !== staffId);
        entryTimeData = entryTimeData.filter(e => e.staffId !== staffId);
        saveData();
        renderStaffList();
        renderScheduleDropdowns();
        renderEntryTimeDropdown();
        renderScheduleList();
        updateReportSelects();
        showAlert('Staff member deleted successfully!', 'success');
    }
}

// Open edit modal
function openEditModal(staffId) {
    const staff = staffData.find(s => s.id === staffId);
    if (!staff) return;

    document.getElementById('edit-staff-id').value = staff.id;
    document.getElementById('edit-staff-name').value = staff.name;
    document.getElementById('edit-staff-id-field').value = staff.staffId;
    document.getElementById('edit-staff-email').value = staff.email;
    document.getElementById('edit-staff-department').value = staff.department;
    document.getElementById('edit-staff-position').value = staff.position;

    document.getElementById('edit-staff-modal').style.display = 'block';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-staff-modal').style.display = 'none';
}

// Save edited staff
document.getElementById('edit-staff-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const staffId = parseInt(document.getElementById('edit-staff-id').value);
    const staffIndex = staffData.findIndex(s => s.id === staffId);

    if (staffIndex === -1) {
        showAlert('Staff member not found!', 'error');
        return;
    }

    staffData[staffIndex] = {
        ...staffData[staffIndex],
        name: document.getElementById('edit-staff-name').value,
        email: document.getElementById('edit-staff-email').value,
        department: document.getElementById('edit-staff-department').value,
        position: document.getElementById('edit-staff-position').value
    };

    saveData();
    renderStaffList();
    renderScheduleDropdowns();
    renderEntryTimeDropdown();
    updateReportSelects();
    closeEditModal();
    showAlert('Staff member updated successfully!', 'success');
});

// ============ SCHEDULE ============
document.getElementById('schedule-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const staffId = parseInt(document.getElementById('schedule-staff').value);
    const staff = staffData.find(s => s.id === staffId);

    if (!staff) {
        showAlert('Please select a valid staff member', 'error');
        return;
    }

    const newSchedule = {
        id: Date.now(),
        staffId: staffId,
        staffName: staff.name,
        date: document.getElementById('schedule-date').value,
        shift: document.getElementById('schedule-shift').value
    };

    scheduleData.push(newSchedule);
    saveData();
    renderScheduleList();
    document.getElementById('schedule-form').reset();
    showAlert('Schedule created successfully!', 'success');
});

// Render schedule dropdowns
function renderScheduleDropdowns() {
    const scheduleSelect = document.getElementById('schedule-staff');
    const attendanceSelect = document.getElementById('attendance-staff');

    if (staffData.length === 0) {
        scheduleSelect.innerHTML = '<option value="">No staff available</option>';
        attendanceSelect.innerHTML = '<option value="">No staff available</option>';
        return;
    }

    const optionsHtml = '<option value="">Choose staff member</option>' + 
        staffData.map(staff => `<option value="${staff.id}">${staff.name} (${staff.staffId})</option>`).join('');

    scheduleSelect.innerHTML = optionsHtml;
    attendanceSelect.innerHTML = optionsHtml;
}

// Render schedule list
function renderScheduleList() {
    const scheduleListBody = document.getElementById('schedule-list');

    if (scheduleData.length === 0) {
        scheduleListBody.innerHTML = '<tr><td colspan="4">No schedules created yet</td></tr>';
        return;
    }

    // Sort by date
    const sortedSchedules = [...scheduleData].sort((a, b) => new Date(a.date) - new Date(b.date));

    scheduleListBody.innerHTML = sortedSchedules.map(schedule => `
        <tr>
            <td>${formatDate(schedule.date)}</td>
            <td>${schedule.staffName}</td>
            <td>${schedule.shift}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteSchedule(${schedule.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Delete schedule
function deleteSchedule(scheduleId) {
    if (confirm('Delete this schedule?')) {
        scheduleData = scheduleData.filter(s => s.id !== scheduleId);
        saveData();
        renderScheduleList();
        showAlert('Schedule deleted successfully!', 'success');
    }
}

// ============ ATTENDANCE ============
document.getElementById('attendance-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const staffId = parseInt(document.getElementById('attendance-staff').value);
    const staff = staffData.find(s => s.id === staffId);

    if (!staff) {
        showAlert('❌ Please select a valid staff member', 'error');
        return;
    }

    const checkInTime = document.getElementById('attendance-time').value || '--';
    const checkOutTime = document.getElementById('attendance-checkout').value || '--';

    if (!checkInTime && !checkOutTime) {
        showAlert('⚠️ Please enter at least Check-in or Check-out time', 'error');
        return;
    }

    const newAttendance = {
        id: Date.now(),
        staffId: staffId,
        staffName: staff.name,
        date: document.getElementById('attendance-date').value,
        status: document.getElementById('attendance-status').value,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime
    };

    // Check if attendance already recorded for this date
    const existingIndex = attendanceData.findIndex(a => 
        a.staffId === staffId && a.date === newAttendance.date
    );

    if (existingIndex !== -1) {
        attendanceData[existingIndex] = newAttendance;
        showAlert('✅ Attendance updated successfully!', 'success');
    } else {
        attendanceData.push(newAttendance);
        showAlert('✅ Attendance marked successfully!', 'success');
    }

    saveData();
    renderAttendanceList();
    updateDashboard();
    document.getElementById('attendance-form').reset();
    setTodayDate();
});

// Render attendance list
function renderAttendanceList() {
    const attendanceListBody = document.getElementById('attendance-list');

    if (attendanceData.length === 0) {
        attendanceListBody.innerHTML = '<tr><td colspan="6">No attendance records found</td></tr>';
        return;
    }

    const sortedAttendance = [...attendanceData].sort((a, b) => new Date(b.date) - new Date(a.date));

    attendanceListBody.innerHTML = sortedAttendance.map(record => {
        const checkIn = convertTo12Hour(record.checkInTime || '--');
        const checkOut = convertTo12Hour(record.checkOutTime || '--');
        
        return `
            <tr>
                <td data-label="Date">${formatDate(record.date)}</td>
                <td data-label="Staff Name">${record.staffName}</td>
                <td data-label="Status"><span class="status-badge status-${record.status.toLowerCase()}">${record.status}</span></td>
                <td data-label="Office-in"><strong>${checkIn}</strong></td>
                <td data-label="Office-out"><strong>${checkOut}</strong></td>
                <td data-label="Action">
                    <button class="btn btn-danger" onclick="deleteAttendance(${record.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Delete attendance
function deleteAttendance(attendanceId) {
    if (confirm('Delete this attendance record?')) {
        attendanceData = attendanceData.filter(a => a.id !== attendanceId);
        saveData();
        renderAttendanceList();
        updateDashboard();
        showAlert('Attendance record deleted!', 'success');
    }
}

// Filter attendance
function filterAttendance() {
    const filterDate = document.getElementById('filter-date').value;
    const attendanceListBody = document.getElementById('attendance-list');

    if (!filterDate) {
        renderAttendanceList();
        return;
    }

    const filtered = attendanceData.filter(a => a.date === filterDate);

    if (filtered.length === 0) {
        attendanceListBody.innerHTML = '<tr><td colspan="6">No records found for this date</td></tr>';
        return;
    }

    attendanceListBody.innerHTML = filtered.map(record => {
        const checkIn = convertTo12Hour(record.checkInTime || '--');
        const checkOut = convertTo12Hour(record.checkOutTime || '--');
        
        return `
            <tr>
                <td data-label="Date">${formatDate(record.date)}</td>
                <td data-label="Staff Name">${record.staffName}</td>
                <td data-label="Status"><span class="status-badge status-${record.status.toLowerCase()}">${record.status}</span></td>
                <td data-label="Office-in"><strong>${checkIn}</strong></td>
                <td data-label="Office-out"><strong>${checkOut}</strong></td>
                <td data-label="Action">
                    <button class="btn btn-danger" onclick="deleteAttendance(${record.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============ ENTRY TIME TRACKING ============
document.getElementById('entry-time-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const staffIdValue = document.getElementById('entry-staff').value;
    const dateValue = document.getElementById('entry-date').value;
    const entryTypeValue = document.getElementById('entry-type').value;
    const timeValue = document.getElementById('entry-time').value;

    // Validate all fields
    if (!staffIdValue || !staffIdValue.trim()) {
        showAlert('⚠️ Please select a staff member', 'error');
        return;
    }

    if (!dateValue || !dateValue.trim()) {
        showAlert('⚠️ Please select a date', 'error');
        return;
    }

    if (!entryTypeValue || !entryTypeValue.trim()) {
        showAlert('⚠️ Please select Entry or Exit', 'error');
        return;
    }

    if (!timeValue || !timeValue.trim()) {
        showAlert('⚠️ Please enter a time', 'error');
        return;
    }

    const staffId = parseInt(staffIdValue);
    const staff = staffData.find(s => s.id === staffId);

    if (!staff) {
        showAlert('❌ Invalid staff member selected', 'error');
        return;
    }

    // Validate time format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)) {
        showAlert('❌ Invalid time format. Please use HH:MM', 'error');
        return;
    }

    const newEntry = {
        id: Date.now(),
        staffId: staffId,
        staffName: staff.name,
        date: dateValue,
        entryType: entryTypeValue,
        time: timeValue
    };

    console.log('📝 Recording new entry:', newEntry);

    try {
        entryTimeData.push(newEntry);
        console.log('✅ Entry added. Total entries:', entryTimeData.length);
        saveData();
        console.log('💾 Data saved to localStorage');
        console.log('📊 All entries:', entryTimeData);
        renderEntryTimeList();
        updateEntrySummary();
        document.getElementById('entry-time-form').reset();
        setTodayDate();
        showAlert('✅ Entry/Exit time recorded successfully!', 'success');
    } catch (error) {
        console.error('Error recording entry time:', error);
        showAlert('❌ Error recording entry time. Please try again.', 'error');
    }
});

// Render entry time dropdown
function renderEntryTimeDropdown() {
    const entrySelect = document.getElementById('entry-staff');

    if (staffData.length === 0) {
        entrySelect.innerHTML = '<option value="">No staff available</option>';
        return;
    }

    entrySelect.innerHTML = '<option value="">Choose staff member</option>' + 
        staffData.map(staff => `<option value="${staff.id}">${staff.name} (${staff.staffId})</option>`).join('');
}

// Render entry time list
function renderEntryTimeList() {
    const entryListBody = document.getElementById('entry-time-list');

    if (!entryListBody) {
        console.error('Entry time list element not found');
        return;
    }

    console.log('🔄 Rendering entry time list. Total entries:', entryTimeData.length);

    if (entryTimeData.length === 0) {
        console.log('ℹ️ No entries to display');
        entryListBody.innerHTML = '<tr><td colspan="7">No entry records found</td></tr>';
        return;
    }

    try {
        // Group entries by date and staff to calculate entry/exit and hours
        const groupedData = {};
        
        entryTimeData.forEach(entry => {
            try {
                // Log each entry being processed
                console.log('Processing entry:', {
                    id: entry.id,
                    date: entry.date,
                    staffId: entry.staffId,
                    staffName: entry.staffName,
                    type: entry.entryType,
                    time: entry.time
                });
                
                // Validate entry object
                if (!entry.date || entry.staffId === undefined || entry.staffId === null) {
                    console.warn('⚠️ Skipping invalid entry (missing date or staffId):', entry);
                    return;
                }

                const key = `${entry.date}-${entry.staffId}`;
                if (!groupedData[key]) {
                    groupedData[key] = {
                        date: entry.date,
                        staffId: entry.staffId,
                        staffName: entry.staffName || 'Unknown',
                        entryTime: null,
                        exitTime: null,
                        entries: []
                    };
                }
                groupedData[key].entries.push(entry);
                
                // Assign entry or exit time - FIXED: Check if time exists and is valid
                if (entry.entryType === 'Entry' && entry.time) {
                    groupedData[key].entryTime = entry.time;
                    console.log(`📝 Entry time set for ${key}: ${entry.time}`);
                } else if (entry.entryType === 'Exit' && entry.time) {
                    groupedData[key].exitTime = entry.time;
                    console.log(`📝 Exit time set for ${key}: ${entry.time}`);
                } else {
                    console.warn(`⚠️ No time found for ${entry.entryType}:`, entry.time);
                }
            } catch (err) {
                console.error('Error processing entry:', entry, err);
            }
        });

        console.log('📊 Grouped data:', groupedData);
        console.log('Total groups:', Object.keys(groupedData).length);

        // Sort by date descending
        const sortedData = Object.values(groupedData).sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('📋 Sorted entries count:', sortedData.length);

        if (sortedData.length === 0) {
            console.warn('⚠️ No sorted data to display');
            entryListBody.innerHTML = '<tr><td colspan="7">No entry records found</td></tr>';
            return;
        }

        const rows = sortedData.map((data, index) => {
            try {
                const entryTime = data.entryTime ? String(data.entryTime).trim() : '--';
                const exitTime = data.exitTime ? String(data.exitTime).trim() : '--';
                
                console.log(`Row ${index}: Staff=${data.staffName}, Entry=${entryTime}, Exit=${exitTime}`);
                
                let totalHours = '--';
                let duration = '--';

                if (data.entryTime && data.exitTime && entryTime !== '--' && exitTime !== '--') {
                    try {
                        const entryParts = entryTime.split(':');
                        const exitParts = exitTime.split(':');

                        if (entryParts.length === 2 && exitParts.length === 2) {
                            const entryHour = parseInt(entryParts[0]);
                            const entryMin = parseInt(entryParts[1]);
                            const exitHour = parseInt(exitParts[0]);
                            const exitMin = parseInt(exitParts[1]);

                            if (!isNaN(entryHour) && !isNaN(entryMin) && !isNaN(exitHour) && !isNaN(exitMin)) {
                                const entryMinutes = entryHour * 60 + entryMin;
                                const exitMinutes = exitHour * 60 + exitMin;
                                const diffMinutes = exitMinutes - entryMinutes;

                                if (diffMinutes > 0) {
                                    const hours = Math.floor(diffMinutes / 60);
                                    const mins = diffMinutes % 60;
                                    totalHours = `${hours}h ${mins}m`;
                                    duration = `${diffMinutes} min`;
                                } else if (diffMinutes < 0) {
                                    // Handle overnight shift
                                    const totalMinutes = (24 * 60 - entryMinutes) + exitMinutes;
                                    const hours = Math.floor(totalMinutes / 60);
                                    const mins = totalMinutes % 60;
                                    totalHours = `${hours}h ${mins}m`;
                                    duration = `${totalMinutes} min (overnight)`;
                                } else if (diffMinutes === 0) {
                                    totalHours = '0h 0m';
                                    duration = '0 min';
                                }
                            }
                        }
                    } catch (calcError) {
                        console.warn('❌ Error calculating time:', calcError);
                    }
                }

                const firstEntryId = data.entries && data.entries.length > 0 ? data.entries[0].id : null;
                if (!firstEntryId) {
                    console.warn('⚠️ No valid entry ID found');
                    return '';
                }

                return `
                    <tr>
                        <td>${formatDate(data.date)}</td>
                        <td>${data.staffName || 'Unknown'}</td>
                        <td><strong>${entryTime}</strong></td>
                        <td><strong>${exitTime}</strong></td>
                        <td><strong class="hours-highlight">${totalHours}</strong></td>
                        <td><span class="duration-badge">${duration}</span></td>
                        <td class="action-buttons">
                            <button class="btn btn-sm btn-edit" onclick="openEditEntryModal(${firstEntryId})" title="Edit record">✏️</button>
                            <button class="btn btn-sm btn-delete" onclick="deleteEntryTime(${firstEntryId})" title="Delete record">🗑️</button>
                        </td>
                    </tr>
                `;
            } catch (rowError) {
                console.error('Error rendering row:', data, rowError);
                return '';
            }
        }).filter(row => row !== '');

        entryListBody.innerHTML = rows.length > 0 ? rows.join('') : '<tr><td colspan="7">No records to display</td></tr>';
        console.log('✅ Entry list rendered. Total rows:', rows.length);
    } catch (error) {
        console.error('Error rendering entry time list:', error);
        entryListBody.innerHTML = '<tr><td colspan="7">Error loading entry records</td></tr>';
    }
}

// Delete entry time (delete both entry and exit for the day)
function deleteEntryTime(entryId) {
    try {
        const entryToDelete = entryTimeData.find(e => e.id === entryId);
        if (!entryToDelete) {
            showAlert('❌ Entry record not found!', 'error');
            return;
        }

        if (!entryToDelete.date || entryToDelete.staffId === undefined) {
            showAlert('❌ Invalid entry record structure!', 'error');
            return;
        }
        
        if (confirm('Delete all entry/exit times for this day?')) {
            const beforeLength = entryTimeData.length;
            // Remove all entries matching this date and staff (both entry and exit)
            entryTimeData = entryTimeData.filter(e => !(e.date === entryToDelete.date && e.staffId === entryToDelete.staffId));
            
            const deletedCount = beforeLength - entryTimeData.length;
            saveData();
            renderEntryTimeList();
            updateEntrySummary();
            showAlert(`✅ Deleted ${deletedCount} entry/exit record(s) successfully!`, 'success');
        }
    } catch (error) {
        console.error('Error deleting entry time:', error);
        showAlert('❌ Error deleting entry record. Please try again.', 'error');
    }
}

// Open edit entry modal
function openEditEntryModal(entryId) {
    try {
        const entry = entryTimeData.find(e => e.id === entryId);
        if (!entry) {
            showAlert('❌ Entry record not found!', 'error');
            return;
        }

        if (!entry.date || !entry.staffName || !entry.entryType || !entry.time) {
            showAlert('❌ Entry record has missing information!', 'error');
            return;
        }

        const dateField = document.getElementById('edit-entry-date-field');
        const staffNameField = document.getElementById('edit-entry-staff-name');
        const typeField = document.getElementById('edit-entry-type-field');
        const timeField = document.getElementById('edit-entry-time-field');
        const idField = document.getElementById('edit-entry-id');
        const modal = document.getElementById('edit-entry-modal');

        if (!dateField || !staffNameField || !typeField || !timeField || !idField || !modal) {
            console.error('Edit modal fields not found');
            showAlert('❌ Error opening edit dialog', 'error');
            return;
        }

        idField.value = entry.id || '';
        dateField.value = entry.date || '';
        staffNameField.value = entry.staffName || '';
        typeField.value = entry.entryType || '';
        timeField.value = entry.time || '';
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showAlert('❌ Error opening edit dialog. Please try again.', 'error');
    }
}

// Close edit entry modal
function closeEditEntryModal() {
    document.getElementById('edit-entry-modal').style.display = 'none';
}

// Save edited entry time
document.getElementById('edit-entry-form').addEventListener('submit', (e) => {
    e.preventDefault();

    try {
        const entryIdValue = document.getElementById('edit-entry-id').value;
        const dateValue = document.getElementById('edit-entry-date-field').value;
        const typeValue = document.getElementById('edit-entry-type-field').value;
        const timeValue = document.getElementById('edit-entry-time-field').value;

        // Validate all fields
        if (!entryIdValue || !dateValue || !typeValue || !timeValue) {
            showAlert('⚠️ All fields are required!', 'error');
            return;
        }

        // Validate time format
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)) {
            showAlert('❌ Invalid time format. Please use HH:MM', 'error');
            return;
        }

        const entryId = parseInt(entryIdValue);
        const entryIndex = entryTimeData.findIndex(e => e.id === entryId);

        if (entryIndex === -1) {
            showAlert('❌ Entry record not found!', 'error');
            return;
        }

        entryTimeData[entryIndex] = {
            ...entryTimeData[entryIndex],
            date: dateValue,
            entryType: typeValue,
            time: timeValue
        };

        saveData();
        renderEntryTimeList();
        updateEntrySummary();
        closeEditEntryModal();
        showAlert('✅ Entry/Exit time updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating entry time:', error);
        showAlert('❌ Error updating entry time. Please try again.', 'error');
    }
});

// Filter entry time
function filterEntryTime() {
    try {
        const filterDate = document.getElementById('filter-entry-date').value;
        const entryListBody = document.getElementById('entry-time-list');

        if (!entryListBody) {
            console.error('Entry time list element not found');
            return;
        }

        if (!filterDate) {
            renderEntryTimeList();
            return;
        }

        const filtered = entryTimeData.filter(e => e.date === filterDate && e.date && e.staffId !== undefined);

        if (filtered.length === 0) {
            entryListBody.innerHTML = '<tr><td colspan="7">No records found for this date</td></tr>';
            return;
        }

        // Group entries by staff for the filtered date
        const groupedData = {};
        filtered.forEach(entry => {
            try {
                if (!entry.date || entry.staffId === undefined) return;
                
                const key = `${entry.date}-${entry.staffId}`;
                if (!groupedData[key]) {
                    groupedData[key] = {
                        date: entry.date,
                        staffId: entry.staffId,
                        staffName: entry.staffName || 'Unknown',
                        entryTime: null,
                        exitTime: null,
                        entries: []
                    };
                }
                groupedData[key].entries.push(entry);
                if (entry.entryType === 'Entry' && entry.time) {
                    groupedData[key].entryTime = entry.time;
                } else if (entry.entryType === 'Exit' && entry.time) {
                    groupedData[key].exitTime = entry.time;
                }
            } catch (err) {
                console.error('Error processing filtered entry:', entry, err);
            }
        });

        entryListBody.innerHTML = Object.values(groupedData).map(data => {
            try {
                const entryTime = data.entryTime ? String(data.entryTime).trim() : '--';
                const exitTime = data.exitTime ? String(data.exitTime).trim() : '--';
                let totalHours = '--';
                let duration = '--';

                if (data.entryTime && data.exitTime && entryTime !== '--' && exitTime !== '--') {
                    try {
                        const entryParts = entryTime.split(':');
                        const exitParts = exitTime.split(':');

                        if (entryParts.length === 2 && exitParts.length === 2) {
                            const entryHour = parseInt(entryParts[0]);
                            const entryMin = parseInt(entryParts[1]);
                            const exitHour = parseInt(exitParts[0]);
                            const exitMin = parseInt(exitParts[1]);

                            if (!isNaN(entryHour) && !isNaN(entryMin) && !isNaN(exitHour) && !isNaN(exitMin)) {
                                const entryMinutes = entryHour * 60 + entryMin;
                                const exitMinutes = exitHour * 60 + exitMin;
                                const diffMinutes = exitMinutes - entryMinutes;

                                if (diffMinutes > 0) {
                                    const hours = Math.floor(diffMinutes / 60);
                                    const mins = diffMinutes % 60;
                                    totalHours = `${hours}h ${mins}m`;
                                    duration = `${diffMinutes} min`;
                                } else if (diffMinutes < 0) {
                                    const totalMinutes = (24 * 60 - entryMinutes) + exitMinutes;
                                    const hours = Math.floor(totalMinutes / 60);
                                    const mins = totalMinutes % 60;
                                    totalHours = `${hours}h ${mins}m`;
                                    duration = `${totalMinutes} min (overnight)`;
                                } else if (diffMinutes === 0) {
                                    totalHours = '0h 0m';
                                    duration = '0 min';
                                }
                            }
                        }
                    } catch (calcError) {
                        console.warn('Error calculating filtered time:', calcError);
                    }
                }

                const firstEntryId = data.entries && data.entries.length > 0 ? data.entries[0].id : null;
                if (!firstEntryId) return '';

                return `
                    <tr>
                        <td>${formatDate(data.date)}</td>
                        <td>${data.staffName || 'Unknown'}</td>
                        <td><strong>${entryTime}</strong></td>
                        <td><strong>${exitTime}</strong></td>
                        <td><strong class="hours-highlight">${totalHours}</strong></td>
                        <td><span class="duration-badge">${duration}</span></td>
                        <td class="action-buttons">
                            <button class="btn btn-sm btn-edit" onclick="openEditEntryModal(${firstEntryId})" title="Edit record">✏️</button>
                            <button class="btn btn-sm btn-delete" onclick="deleteEntryTime(${firstEntryId})" title="Delete record">🗑️</button>
                        </td>
                    </tr>
                `;
            } catch (rowError) {
                console.error('Error rendering filtered row:', data, rowError);
                return '';
            }
        }).filter(row => row !== '').join('');
    } catch (error) {
        console.error('Error in filterEntryTime:', error);
        showAlert('❌ Error filtering entry records. Please try again.', 'error');
    }
}

// Update entry summary for today
function updateEntrySummary() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const summarybody = document.getElementById('entry-summary');

        if (!summarybody) {
            console.error('Entry summary element not found');
            return;
        }

        // Get all entry records for today
        const todayEntries = entryTimeData.filter(e => e.date === today && e.staffId !== undefined);
        
        if (todayEntries.length === 0) {
            summarybody.innerHTML = '<tr><td colspan="5">No entry records for today</td></tr>';
            return;
        }

        // Group by staff
        const staffEntries = {};
        todayEntries.forEach(entry => {
            try {
                if (entry.staffId === undefined || !entry.staffName) return;
                
                if (!staffEntries[entry.staffId]) {
                    staffEntries[entry.staffId] = {
                        staffName: entry.staffName,
                        entry: null,
                        exit: null
                    };
                }
                if (entry.entryType === 'Entry' && entry.time) {
                    staffEntries[entry.staffId].entry = entry.time;
                } else if (entry.entryType === 'Exit' && entry.time) {
                    staffEntries[entry.staffId].exit = entry.time;
                }
            } catch (err) {
                console.error('Error processing summary entry:', entry, err);
            }
        });

        // Calculate hours worked
        const rows = Object.values(staffEntries).map(staff => {
            try {
                let totalHours = '--';
                if (staff.entry && staff.exit && typeof staff.entry === 'string' && typeof staff.exit === 'string') {
                    try {
                        const entryParts = staff.entry.split(':');
                        const exitParts = staff.exit.split(':');
                        
                        if (entryParts.length === 2 && exitParts.length === 2) {
                            const entryHour = parseInt(entryParts[0]);
                            const entryMin = parseInt(entryParts[1]);
                            const exitHour = parseInt(exitParts[0]);
                            const exitMin = parseInt(exitParts[1]);
                            
                            if (!isNaN(entryHour) && !isNaN(entryMin) && !isNaN(exitHour) && !isNaN(exitMin)) {
                                const entryMinutes = entryHour * 60 + entryMin;
                                const exitMinutes = exitHour * 60 + exitMin;
                                const diffMinutes = exitMinutes - entryMinutes;
                                
                                if (diffMinutes > 0) {
                                    const hours = Math.floor(diffMinutes / 60);
                                    const mins = diffMinutes % 60;
                                    totalHours = `${hours}h ${mins}m`;
                                } else if (diffMinutes < 0) {
                                    const totalMinutes = (24 * 60 - entryMinutes) + exitMinutes;
                                    const hours = Math.floor(totalMinutes / 60);
                                    const mins = totalMinutes % 60;
                                    totalHours = `${hours}h ${mins}m`;
                                } else {
                                    totalHours = '0h 0m';
                                }
                            }
                        }
                    } catch (calcError) {
                        console.warn('Error calculating summary hours:', calcError);
                    }
                }

                const status = staff.exit ? '✅ Checked Out' : '⏳ On Duty';

                return `
                    <tr>
                        <td>${staff.staffName || 'Unknown'}</td>
                        <td><strong>${staff.entry || '--'}</strong></td>
                        <td><strong>${staff.exit || '--'}</strong></td>
                        <td>${totalHours}</td>
                        <td>${status}</td>
                    </tr>
                `;
            } catch (rowError) {
                console.error('Error rendering summary row:', staff, rowError);
                return '';
            }
        }).filter(row => row !== '');

        summarybody.innerHTML = rows.length > 0 ? rows.join('') : '<tr><td colspan="5">No entry records for today</td></tr>';
    } catch (error) {
        console.error('Error updating entry summary:', error);
        const summarybody = document.getElementById('entry-summary');
        if (summarybody) {
            summarybody.innerHTML = '<tr><td colspan="5">Error loading summary data</td></tr>';
        }
    }
}

// ============ DASHBOARD ============
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];

    // Total staff
    document.getElementById('total-staff').textContent = staffData.length;

    // Today's attendance
    const todayAttendance = attendanceData.filter(a => a.date === today);
    const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
    const absentCount = todayAttendance.filter(a => a.status === 'Absent').length;
    const leaveCount = todayAttendance.filter(a => a.status === 'Leave').length;

    document.getElementById('present-today').textContent = presentCount;
    document.getElementById('absent-today').textContent = absentCount;
    document.getElementById('on-leave').textContent = leaveCount;

    // Today's attendance table
    renderTodayAttendance(today, todayAttendance);
}

function renderTodayAttendance(today, todayAttendance) {
    const todayAttendanceBody = document.getElementById('today-attendance');

    if (todayAttendance.length === 0) {
        todayAttendanceBody.innerHTML = '<tr><td colspan="5">No attendance records for today</td></tr>';
        return;
    }
    todayAttendanceBody.innerHTML = todayAttendance.map(record => {
        const checkIn = convertTo12Hour(record.checkInTime || '--');
        const checkOut = convertTo12Hour(record.checkOutTime || '--');
        
        return `
            <tr>
                <td data-label="Staff Name">${record.staffName}</td>
                <td data-label="Status"><span class="status-badge status-${record.status.toLowerCase()}">${record.status}</span></td>
                <td data-label="Office-in">🔓 <strong>${checkIn}</strong></td>
                <td data-label="Office-out">🔒 <strong>${checkOut}</strong></td>
                <td data-label="Action"><button class="btn btn-small" onclick="openEditAttendanceModal(${record.id})">✏️ Edit</button></td>
            </tr>
        `;
    }).join('');
}

// ============ REPORTS ============
function updateReportSelects() {
    const reportSelect = document.getElementById('report-staff');

    reportSelect.innerHTML = '<option value="">All Staff</option>' + 
        staffData.map(staff => `<option value="${staff.id}">${staff.name}</option>`).join('');
}

function generateReport() {
    const selectedStaffId = document.getElementById('report-staff').value;
    let reportData;

    if (selectedStaffId === '') {
        reportData = attendanceData;
    } else {
        reportData = attendanceData.filter(a => a.staffId === parseInt(selectedStaffId));
    }

    // Calculate summary
    const totalDays = reportData.length;
    const presentCount = reportData.filter(a => a.status === 'Present').length;
    const absentCount = reportData.filter(a => a.status === 'Absent').length;
    const leaveCount = reportData.filter(a => a.status === 'Leave').length;

    document.getElementById('report-total-days').textContent = totalDays;
    document.getElementById('report-present').textContent = presentCount;
    document.getElementById('report-absent').textContent = absentCount;
    document.getElementById('report-leave').textContent = leaveCount;

    // Render detailed report
    const reportDetails = document.getElementById('report-details');

    if (reportData.length === 0) {
        reportDetails.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        generateTimeAnalyticsReport(reportData);
        return;
    }

    const sortedReport = [...reportData].sort((a, b) => new Date(b.date) - new Date(a.date));

    reportDetails.innerHTML = sortedReport.map(record => {
        const checkIn = convertTo12Hour(record.checkInTime || '--');
        const checkOut = convertTo12Hour(record.checkOutTime || '--');
        return `
        <tr>
            <td data-label="Date">${formatDate(record.date)}</td>
            <td data-label="Staff Name">${record.staffName}</td>
            <td data-label="Status"><span class="status-badge status-${record.status.toLowerCase()}">${record.status}</span></td>
            <td data-label="Office-in">🔓 <strong>${checkIn}</strong></td>
            <td data-label="Office-out">🔒 <strong>${checkOut}</strong></td>
        </tr>
    `;
    }).join('');

    // Generate Time Analytics Report
    generateTimeAnalyticsReport(reportData);
}

// Generate Time Analytics Report with AM/PM times and hours worked
function generateTimeAnalyticsReport(reportData) {
    const timeAnalyticsBody = document.getElementById('time-analytics-report');

    if (!reportData || reportData.length === 0) {
        timeAnalyticsBody.innerHTML = '<tr><td colspan="5">No data to display</td></tr>';
        return;
    }

    // Sort by staff name and date for better grouping
    const sortedData = [...reportData].sort((a, b) => {
        if (a.staffName !== b.staffName) {
            return a.staffName.localeCompare(b.staffName);
        }
        return new Date(b.date) - new Date(a.date);
    });

    timeAnalyticsBody.innerHTML = sortedData.map(record => {
        const checkIn = convertTo12Hour(record.checkInTime || '--');
        const checkOut = convertTo12Hour(record.checkOutTime || '--');
        const hoursWorked = calculateHoursWorked(record.checkInTime, record.checkOutTime);
        
        return `
            <tr>
                <td><strong>${record.staffName}</strong></td>
                <td><span class="status-badge status-${record.status.toLowerCase()}">${record.status}</span></td>
                <td>🔓 <strong>${checkIn}</strong></td>
                <td>🔒 <strong>${checkOut}</strong></td>
                <td><span class="hours-badge">⏱️ ${hoursWorked}</span></td>
            </tr>
        `;
    }).join('');
}


// Download Report as CSV
function downloadReport() {
    const selectedStaffId = document.getElementById('report-staff').value;
    let reportData;

    if (selectedStaffId === '') {
        reportData = attendanceData;
    } else {
        reportData = attendanceData.filter(a => a.staffId === parseInt(selectedStaffId));
    }

    if (reportData.length === 0) {
        showAlert('No data to download', 'info');
        return;
    }

    // Create CSV content
    let csv = 'Date,Staff Name,Status,Office-in Time (AM/PM),Office-out Time (AM/PM)\n';
    reportData.forEach(record => {
        const checkIn = convertTo12Hour(record.checkInTime || '--');
        const checkOut = convertTo12Hour(record.checkOutTime || '--');
        csv += `${record.date},${record.staffName},${record.status},${checkIn},${checkOut}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showAlert('Report downloaded successfully!', 'success');
}

// ============ UTILITIES ============
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    // Insert at the top of the current tab
    const activeTab = document.querySelector('.tab-content.active');
    activeTab.insertBefore(alert, activeTab.firstChild);

    // Remove after 3 seconds
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Export functions for global access
window.deleteStaff = deleteStaff;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.deleteSchedule = deleteSchedule;
window.deleteAttendance = deleteAttendance;
window.deleteEntryTime = deleteEntryTime;
window.openEditEntryModal = openEditEntryModal;
window.closeEditEntryModal = closeEditEntryModal;
window.filterAttendance = filterAttendance;
window.filterEntryTime = filterEntryTime;
window.generateReport = generateReport;
window.downloadReport = downloadReport;

// Close modal when clicking outside
window.onclick = function(event) {
    const editStaffModal = document.getElementById('edit-staff-modal');
    const editEntryModal = document.getElementById('edit-entry-modal');
    const editAttendanceModal = document.getElementById('edit-attendance-modal');
    
    if (event.target === editStaffModal) {
        editStaffModal.style.display = 'none';
    }
    if (event.target === editEntryModal) {
        editEntryModal.style.display = 'none';
    }
    if (event.target === editAttendanceModal) {
        editAttendanceModal.style.display = 'none';
    }
};

// ============ EDIT ATTENDANCE ============
function openEditAttendanceModal(recordId) {
    const record = attendanceData.find(a => a.id === recordId);
    if (!record) {
        console.error('❌ Record not found:', recordId);
        return;
    }

    console.log('📝 Opening edit attendance modal for record:', record);
    
    document.getElementById('edit-attendance-id').value = record.id;
    document.getElementById('edit-attendance-date').value = record.date;
    document.getElementById('edit-attendance-staff').value = record.staffName;
    document.getElementById('edit-attendance-status').value = record.status;
    document.getElementById('edit-attendance-checkin').value = record.checkInTime || '';
    document.getElementById('edit-attendance-checkout').value = record.checkOutTime || '';
    
    document.getElementById('edit-attendance-modal').style.display = 'block';
}

function closeEditAttendanceModal() {
    document.getElementById('edit-attendance-modal').style.display = 'none';
}

// Handle edit attendance form submission
document.addEventListener('DOMContentLoaded', function() {
    const editAttendanceForm = document.getElementById('edit-attendance-form');
    if (editAttendanceForm) {
        editAttendanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                const recordId = parseInt(document.getElementById('edit-attendance-id').value);
                const status = document.getElementById('edit-attendance-status').value;
                const checkInTime = document.getElementById('edit-attendance-checkin').value;
                const checkOutTime = document.getElementById('edit-attendance-checkout').value;
                
                // Validation: at least one time should be provided
                if (!checkInTime && !checkOutTime) {
                    alert('⚠️ Please provide at least Check-in or Check-out time');
                    return;
                }
                
                // Find and update the record
                const recordIndex = attendanceData.findIndex(a => a.id === recordId);
                if (recordIndex === -1) {
                    alert('❌ Record not found');
                    return;
                }
                
                attendanceData[recordIndex].status = status;
                attendanceData[recordIndex].checkInTime = checkInTime;
                attendanceData[recordIndex].checkOutTime = checkOutTime;
                
                // Save to localStorage
                localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
                
                console.log('✅ Attendance record updated:', attendanceData[recordIndex]);
                alert('✅ Attendance record updated successfully!');
                
                closeEditAttendanceModal();
                displayAttendance();
                
            } catch (error) {
                console.error('❌ Error updating attendance:', error);
                alert('❌ Error updating attendance record');
            }
        });
    }
});

// ============ TIME FORMATTING UTILITIES ============
/**
 * Convert 24-hour time format (HH:MM) to 12-hour format (HH:MM AM/PM)
 * @param {string} time24 - Time in 24-hour format (e.g., "14:30")
 * @returns {string} Time in 12-hour format (e.g., "2:30 PM")
 */
function convertTo12Hour(time24) {
    if (!time24 || time24 === '--') return '--';
    
    try {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const minute = parseInt(minutes);
        
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        
        return `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`;
    } catch (error) {
        console.error('❌ Error converting time:', error, time24);
        return time24;
    }
}

/**
 * Calculate total hours worked between office-in and office-out times
 * @param {string} checkInTime - Office-in time in 24-hour format
 * @param {string} checkOutTime - Office-out time in 24-hour format
 * @returns {string} Total hours worked (e.g., "8h 30m")
 */
function calculateHoursWorked(checkInTime, checkOutTime) {
    if (!checkInTime || !checkOutTime || checkInTime === '--' || checkOutTime === '--') {
        return '--';
    }
    
    try {
        const [inHours, inMinutes] = checkInTime.split(':').map(Number);
        const [outHours, outMinutes] = checkOutTime.split(':').map(Number);
        
        let inTotalMinutes = inHours * 60 + inMinutes;
        let outTotalMinutes = outHours * 60 + outMinutes;
        
        // Handle overnight shifts (if out time is earlier than in time, assume next day)
        if (outTotalMinutes < inTotalMinutes) {
            outTotalMinutes += 24 * 60;
        }
        
        const diffMinutes = outTotalMinutes - inTotalMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        
        if (hours === 0) {
            return `${minutes}m`;
        } else if (minutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${minutes}m`;
        }
    } catch (error) {
        console.error('❌ Error calculating hours:', error);
        return '--';
    }
}
