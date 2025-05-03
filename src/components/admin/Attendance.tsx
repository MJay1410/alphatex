import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Clock, Search, ChevronLeft, ChevronRight, MapPin, Info, X as XIcon } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, Timestamp, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  employeeId: string;
  phone: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  type: 'check-in' | 'check-out';
  timestamp: Timestamp;
  createdAt: string;
  latitude: number;
  longitude: number;
  timezone: string;
  deviceInfo?: {
    language: string;
    platform: string;
    userAgent: string;
  };
  userEmail?: string;
  userName?: string;
}

interface AttendanceProps {
  attendances?: AttendanceRecord[];
  employees: Employee[];
}

const AttendanceComponent: React.FC<AttendanceProps> = ({ employees }) => {
  const [filter, setFilter] = useState('all'); // all, check-in, check-out
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Effect to load attendance data when date filter changes
  useEffect(() => {
    let unsubscribe: () => void;

    const setupRealtimeListener = async () => {
      setLoading(true);
      try {
        let startDate = new Date(dateFilter);
        let endDate = new Date(dateFilter);
        
        if (viewMode === 'day') {
          // Keep startDate and endDate as is
        } else if (viewMode === 'week') {
          const day = startDate.getDay();
          const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
          startDate = new Date(startDate.setDate(diff));
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
        } else if (viewMode === 'month') {
          startDate.setDate(1);
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
        }
        
        // Set time to beginning of day for startDate and end of day for endDate
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        // Query asl_attendances collection with timestamp range
        const attendanceQuery = query(
          collection(db, 'asl_attendances'),
          where('timestamp', '>=', startTimestamp),
          where('timestamp', '<=', endTimestamp),
          orderBy('timestamp', 'desc')
        );
        
        // Set up real-time listener
        unsubscribe = onSnapshot(
          attendanceQuery, 
          async (snapshot) => {
            const attendanceData = await Promise.all(
              snapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data() as Omit<AttendanceRecord, 'id'>;
                // Get user info from asl_users collection based on userId
                try {
                  // First try to find user based on userId field
                  const userQuery = query(collection(db, 'asl_users'), where('userId', '==', data.userId));
                  const userSnapshot = await getDocs(userQuery);
                  
                  if (!userSnapshot.empty) {
                    const userData = userSnapshot.docs[0].data();
                    data.userEmail = userData.email;
                    data.userName = userData.name;
                  } else {
                    // Fallback: try to find user by document ID
                    const userDoc = await getDoc(doc(db, 'asl_users', data.userId));
                    if (userDoc.exists()) {
                      const userData = userDoc.data();
                      data.userEmail = userData.email;
                      data.userName = userData.name;
                    }
                  }
                } catch (error) {
                  console.error('Error fetching user details:', error);
                }
                return {
                  id: docSnapshot.id,
                  ...data
                } as AttendanceRecord;
              })
            );
            
            setAttendances(attendanceData);
            setLoading(false);
          }, 
          (error) => {
            console.error('Error in real-time listener:', error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up real-time listener:', error);
        setLoading(false);
      }
    };

    setupRealtimeListener();

    // Clean up listener when component unmounts or dependencies change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dateFilter, viewMode]);

  const getEmployeeName = (userId: string): string => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? employee.name : 'Unknown';
  };

  const getEmployeeEmail = (userId: string): string => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? employee.email : '';
  };

  const getEmployeeDepartment = (userId: string): string => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? employee.department : 'Unknown';
  };

  const formatTime = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return '–';
    try {
      const date = timestamp.toDate();
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '–';
    }
  };

  const formatDate = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return '–';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString();
    } catch {
      return '–';
    }
  };

  const getFilteredAttendances = () => {
    return attendances.filter(att => {
      // Filter by status
      if (filter === 'check-in' && att.type !== 'check-in') return false;
      if (filter === 'check-out' && att.type !== 'check-out') return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        
        // Search in userName or employeeName
        const employeeName = att.userName || getEmployeeName(att.userId);
        if (employeeName.toLowerCase().includes(searchLower)) return true;
        
        // Search in userEmail or employee email
        const email = att.userEmail || getEmployeeEmail(att.userId);
        if (email.toLowerCase().includes(searchLower)) return true;
        
        // Search in department
        const department = getEmployeeDepartment(att.userId);
        if (department.toLowerCase().includes(searchLower)) return true;
        
        // Search by device platform
        if (att.deviceInfo?.platform?.toLowerCase().includes(searchLower)) return true;
        
        // Search by employee ID (user ID)
        if (att.userId.toLowerCase().includes(searchLower)) return true;
        
        return false;
      }
      
      return true;
    });
  };

  const exportAttendance = () => {
    const filteredData = getFilteredAttendances();
    const csvData = [
      ['Date', 'Time', 'User ID', 'Email', 'Type', 'Latitude', 'Longitude', 'Platform'],
      ...filteredData.map(att => {
        const date = att.timestamp ? att.timestamp.toDate() : new Date();
        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          att.userId,
          att.userEmail || getEmployeeEmail(att.userId),
          att.type,
          att.latitude || '',
          att.longitude || '',
          att.deviceInfo?.platform || ''
        ];
      })
    ];

    // Create CSV content
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set download attributes
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${dateFilter}.csv`);
    link.style.visibility = 'hidden';
    
    // Append link, trigger click, remove link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttendances = getFilteredAttendances();
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAttendances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);

  // Navigate between pages
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Change date based on view mode
  const changeDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(dateFilter);
    
    if (viewMode === 'day') {
      currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      currentDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setDateFilter(currentDate.toISOString().split('T')[0]);
  };

  const getDateRangeLabel = () => {
    const startDate = new Date(dateFilter);
    
    if (viewMode === 'day') {
      return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(startDate);
      weekStart.setDate(diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (viewMode === 'month') {
      return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    return '';
  };

  // Count unique users who checked in for summary stats
  const getUniqueCheckIns = () => {
    const uniqueUserIds = new Set();
    attendances.forEach(att => {
      if (att.type === 'check-in') {
        uniqueUserIds.add(att.userId);
      }
    });
    return uniqueUserIds.size;
  };

  const openDetailsModal = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <h3 className="text-lg font-medium text-gray-900">Attendance Management</h3>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-grow max-w-md">
                  <input
                    type="text"
                    placeholder="Search by name, email or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                
                {/* View Mode Switcher */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-2 text-sm font-medium ${viewMode === 'day' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-2 text-sm font-medium ${viewMode === 'week' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-2 text-sm font-medium ${viewMode === 'month' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Month
                  </button>
                </div>
                
                {/* Filter dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className={`inline-flex items-center px-4 py-2 border ${filter !== 'all' 
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-300 bg-white text-gray-700'} 
                      rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {filter === 'all' ? 'All Records' : filter === 'check-in' ? 'Check In Only' : 'Check Out Only'}
                  </button>
                  {showFilter && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => { setFilter('all'); setShowFilter(false); }}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            filter === 'all' ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          All Records
                        </button>
                        <button
                          onClick={() => { setFilter('check-in'); setShowFilter(false); }}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            filter === 'check-in' ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Check In Only
                        </button>
                        <button
                          onClick={() => { setFilter('check-out'); setShowFilter(false); }}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            filter === 'check-out' ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Check Out Only
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Export */}
                <button
                  onClick={exportAttendance}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between border-b bg-gray-50">
              <button 
                onClick={() => changeDate('prev')}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Previous date range"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white px-4 py-2 rounded-md border border-gray-300 shadow-sm">
                  <Calendar className="h-5 w-5 text-indigo-500 mr-3" />
                  <span className="text-md font-medium">{getDateRangeLabel()}</span>
                </div>
                
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  aria-label="Select date"
                />
              </div>
              
              <button 
                onClick={() => changeDate('next')}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Next date range"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((attendance) => {
                      return (
                        <tr key={attendance.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(attendance.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTime(attendance.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {attendance.userName || getEmployeeName(attendance.userId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attendance.userEmail || getEmployeeEmail(attendance.userId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                attendance.type === 'check-in'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {attendance.type === 'check-in' ? 'Check In' : 'Check Out'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attendance.latitude && attendance.longitude ? (
                              <a 
                                href={`https://maps.google.com/?q=${attendance.latitude},${attendance.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-indigo-600 hover:text-indigo-900"
                              >
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{attendance.latitude.toFixed(6)}, {attendance.longitude.toFixed(6)}</span>
                              </a>
                            ) : '–'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attendance.deviceInfo?.platform || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => openDetailsModal(attendance)}
                              aria-label="View details"
                              title="View attendance details"
                            >
                              <Info className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                        No attendance records found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {filteredAttendances.length > itemsPerPage && (
              <div className="px-6 py-3 flex items-center justify-between border-t">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredAttendances.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredAttendances.length}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-lg border border-green-200 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-green-500 bg-opacity-20 rounded-full p-3 mr-4">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Employees Checked In</h4>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {getUniqueCheckIns()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-green-700">
                  {viewMode === 'day' ? 'Today' : viewMode === 'week' ? 'This week' : 'This month'}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-5 rounded-lg border border-yellow-200 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-yellow-500 bg-opacity-20 rounded-full p-3 mr-4">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Total Check-ins</h4>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">
                      {attendances.filter(a => a.type === 'check-in').length}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-yellow-700">
                  {viewMode === 'day' ? 'Today' : viewMode === 'week' ? 'This week' : 'This month'}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-blue-500 bg-opacity-20 rounded-full p-3 mr-4">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Total Check-outs</h4>
                    <p className="text-3xl font-bold text-blue-600 mt-1">
                      {attendances.filter(a => a.type === 'check-out').length}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-700">
                  {viewMode === 'day' ? 'Today' : viewMode === 'week' ? 'This week' : 'This month'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Attendance Details Modal */}
      {showDetailsModal && selectedAttendance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Attendance Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Employee</h4>
                  <p className="text-base">{selectedAttendance.userName || getEmployeeName(selectedAttendance.userId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="text-base">{selectedAttendance.userEmail || getEmployeeEmail(selectedAttendance.userId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">User ID</h4>
                  <p className="text-base text-gray-800">{selectedAttendance.userId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type</h4>
                  <p className="inline-flex items-center">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedAttendance.type === 'check-in'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedAttendance.type === 'check-in' ? 'Check In' : 'Check Out'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                  <p className="text-base">
                    {selectedAttendance.timestamp && 
                     `${formatDate(selectedAttendance.timestamp)} ${formatTime(selectedAttendance.timestamp)}`}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Timezone</h4>
                  <p className="text-base">{selectedAttendance.timezone || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                  <p className="text-base">{selectedAttendance.createdAt}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Location</h4>
              {selectedAttendance.latitude && selectedAttendance.longitude ? (
                <div>
                  <p className="text-base mb-2">
                    {selectedAttendance.latitude.toFixed(6)}, {selectedAttendance.longitude.toFixed(6)}
                  </p>
                  <a 
                    href={`https://maps.google.com/?q=${selectedAttendance.latitude},${selectedAttendance.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </a>
                </div>
              ) : (
                <p className="text-base text-gray-500">Location not available</p>
              )}
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Device Information</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Platform:</span>
                    <span className="ml-2 text-sm">{selectedAttendance.deviceInfo?.platform || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Language:</span>
                    <span className="ml-2 text-sm">{selectedAttendance.deviceInfo?.language || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">User Agent:</span>
                    <p className="mt-1 text-xs text-gray-600 break-words">{selectedAttendance.deviceInfo?.userAgent || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceComponent; 