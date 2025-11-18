# Attendance Scheduling System

A fully functional web application for managing staff attendance and schedules. Built with vanilla HTML, CSS, and JavaScript.

## Features
### 1. **Dashboard**
- View total staff count
- Monitor today's attendance summary (Present, Absent, On Leave)
- Quick view of today's attendance records
- Real-time statistics with beautiful stat cards

### 2. **Add Staff**
- Add new staff members to the system
- Manage staff details (Name, ID, Email, Department, Position)
- View all staff members in a table
- Delete staff members
- Data validation to prevent duplicate staff IDs

### 3. **Schedule Management**
- Create work schedules for staff members
- Support for multiple shifts:
  - Morning (9 AM - 1 PM)
  - Afternoon (1 PM - 5 PM)
  - Evening (5 PM - 9 PM)
  - Full Day (9 AM - 5 PM)
- View all scheduled shifts
- Delete schedules as needed

### 4. **Entry Time Tracking** ⏰ NEW!
- Track staff entry (In) and exit (Out) times
- Record specific times for each entry/exit
- View entry/exit records with filtering
- Calculate total hours worked per day
- Track on-duty status in real-time
- Summary view of today's entry/exit records
- Calculate duration worked (hours and minutes)
- All data saved locally in browser

### 5. **Mark Attendance**
- Mark staff attendance with different statuses:
  - Present
  - Absent
  - On Leave
  - Late
  - Half Day (NEW!)
  - Work From Home (NEW!)
- Record check-in times
- View all attendance records
- Filter attendance by date
- Update existing attendance records
- Delete attendance records

### 6. **Reports & Analytics**
- Generate comprehensive attendance reports
- Filter reports by individual staff members or view all staff
- View attendance summary statistics
- Detailed attendance history
- Download reports as CSV files
- Track presence, absence, and leave statistics

## File Structure

```
├── index.html       # Main HTML file with all UI elements
├── styles.css       # Complete styling with responsive design
├── script.js        # JavaScript logic and functionality
└── README.md        # Documentation (this file)
```

## How to Use

### Getting Started

1. **Open the Application**
   - Double-click `index.html` in your file explorer, or
   - Right-click `index.html` and select "Open with" your preferred browser

2. **Add Staff Members**
   - Navigate to the "Add Staff" tab
   - Fill in the staff details (Name, ID, Email, Department, Position)
   - Click "Add Staff"
   - You'll see the staff member added to the list

3. **Create Schedules**
   - Go to the "Schedule" tab
   - Select a staff member, date, and shift
   - Click "Schedule"
   - View all scheduled shifts in the list

4. **Track Entry/Exit Times** (NEW!)
   - Go to the "Entry Time" tab
   - Select date, staff member, and entry type (In/Out)
   - Record the time
   - Click "Record Time"
   - View today's entry/exit summary with total hours worked

5. **Mark Attendance**
   - Go to the "Attendance" tab
   - Select the date, staff member, and attendance status (Present, Absent, Leave, Late, Half Day, WFH)
   - (Optional) Add check-in time
   - Click "Mark Attendance"
   - Update existing records by marking attendance for the same date again

6. **View Dashboard**
   - The "Dashboard" tab shows real-time statistics
   - See today's attendance at a glance
   - View present, absent, and on-leave counts

7. **Generate Reports**
   - Go to the "Reports" tab
   - Select a staff member or view all staff
   - Review attendance summary and detailed history
   - Download report as CSV file for external use

## Data Storage

- All data is stored in **browser's localStorage**
- Data persists even after closing the browser
- Each user has their own separate data
- No server or database required

## Features Details

### Attendance Status Types
- **Present**: Staff member attended
- **Absent**: Staff member did not attend
- **On Leave**: Staff member was on approved leave
- **Late**: Staff member arrived late
- **Half Day**: Staff member worked half day
- **Work From Home (WFH)**: Staff member worked remotely

### Entry/Exit Types
- **Entry (In)**: Staff member checked in/entered office
- **Exit (Out)**: Staff member checked out/left office

### Entry/Exit Time Tracking - FIXED & OPTIMIZED ✅
- ✅ **Entry Time Display** - Entry times now display correctly with debugging
- ✅ **Exit Time Display** - Exit times now display correctly with debugging  
- ✅ **Time Pairing** - Entry and exit times properly grouped by staff and date
- ✅ **Hours Calculation** - Total hours worked calculated accurately (Xh Ym format)
- ✅ **Overnight Shifts** - Supports staff working past midnight with correct calculations
- ✅ **Debug Logging** - Console logs show data flow: recording → grouping → rendering
- ✅ **Error Handling** - Comprehensive try-catch blocks prevent crashes
- ✅ **Data Validation** - Automatic validation on startup removes corrupted entries
- ✅ **Form Validation** - All inputs validated before saving to localStorage
- ✅ **Real-time Summary** - Today's entry/exit summary with status indicators

### Departments
- Human Resources
- Information Technology
- Sales
- Marketing
- Finance
- Operations

### Shifts
- Morning (9 AM - 1 PM)
- Afternoon (1 PM - 5 PM)
- Evening (5 PM - 9 PM)
- Full Day (9 AM - 5 PM)

## Technical Highlights

### Frontend Technologies
- **HTML5**: Semantic markup for better structure
- **CSS3**: Modern styling with gradients, flexbox, and grid layouts
- **Vanilla JavaScript**: No dependencies required

### Responsive Design
- Works perfectly on desktop, tablet, and mobile devices
- Adaptive layouts for different screen sizes
- Mobile-friendly navigation and forms

### User Experience
- Smooth tab transitions with animations
- Real-time data updates
- Confirmation dialogs for destructive actions
- Alert messages for user feedback
- Date and time input helpers

### Data Management
- LocalStorage-based persistence
- Automatic data synchronization
- Data validation and error prevention
- CSV export functionality

## Browser Compatibility

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Opera (Latest)

## Future Enhancements

Possible improvements for future versions:
- User authentication and multi-user support
- Database integration for cloud storage
- Email notifications for attendance
- Biometric integration for check-in
- Advanced analytics and charts
- Holiday calendar management
- Shift swap requests
- Mobile app version

## Customization

### Changing Colors
Edit `styles.css` and modify the gradient colors:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adding More Departments
In `index.html`, add options to the department select:
```html
<option value="Department Name">Department Name</option>
```

### Modifying Shifts
Edit the shifts in `index.html`:
```html
<option value="Shift Name">Shift Description</option>
```

## Tips & Tricks

1. **Quick Dashboard View**: Always check the Dashboard tab for a quick overview
2. **Bulk Operations**: You can update attendance for multiple staff at once by visiting the Attendance tab multiple times
3. **Reports Export**: Download reports regularly for record keeping
4. **Data Backup**: The data is stored locally, so ensure you export reports as backup

## Support

For issues or questions:
1. Clear your browser cache and reload
2. Check browser console for error messages (F12)
3. Ensure you're using a modern web browser
4. Try a different browser if issues persist

## License

This project is provided as-is for educational and personal use.

---

**Version**: 1.0
**Last Updated**: November 2025
