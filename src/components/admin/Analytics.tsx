import React, { useState } from 'react';
import { Users, Clock, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Briefcase, ChevronDown } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

interface AnalyticsProps {
  stats: {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    averageAttendance: number;
    attendanceByDay?: {
      day: string;
      count: number;
    }[];
    departmentStats?: {
      name: string;
      attendance: number;
      total: number;
    }[];
  };
}

const Analytics: React.FC<AnalyticsProps> = ({ stats }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  
  // Sample attendance data for visualization
  const weeklyAttendanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Employees Present',
        data: [42, 45, 40, 46, 39, 25, 20],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };
  
  const monthlyAttendanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Employees Present',
        data: [150, 165, 155, 170],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };
  
  const departmentAttendanceData = {
    labels: ['IT', 'HR', 'Finance', 'Marketing', 'Operations'],
    datasets: [
      {
        label: 'Attendance Rate',
        data: [90, 85, 88, 82, 95],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const attendanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Attendance Rate',
        data: [78, 80, 83, 85, 89, 91],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(243, 244, 246, 1)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };
  
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-indigo-50 rounded-xl p-3 mr-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Total Employees</h3>
            </div>
            <div className="bg-green-50 text-green-700 text-xs py-1 px-2 rounded-full flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>4%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalEmployees}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span>Increased since last month</span>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-50 rounded-xl p-3 mr-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Present Today</h3>
            </div>
            <div className="bg-green-50 text-green-700 text-xs py-1 px-2 rounded-full flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>2%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.presentToday}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span className="text-green-600 font-medium">{Math.round((stats.presentToday / stats.totalEmployees) * 100)}%</span>
            <span className="ml-1">of total employees</span>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-red-50 rounded-xl p-3 mr-4">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Absent Today</h3>
            </div>
            <div className="bg-red-50 text-red-700 text-xs py-1 px-2 rounded-full flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              <span>3%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.absentToday}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span className="text-red-600 font-medium">{Math.round((stats.absentToday / stats.totalEmployees) * 100)}%</span>
            <span className="ml-1">of total employees</span>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-50 rounded-xl p-3 mr-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Avg. Attendance</h3>
            </div>
            <div className="bg-green-50 text-green-700 text-xs py-1 px-2 rounded-full flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>5%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.averageAttendance}%</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span>Last 30 days</span>
          </div>
        </div>
      </div>
      
      {/* Attendance Trend Chart */}
      <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3 sm:mb-0">Attendance Trends</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTimeRange('weekly')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                selectedTimeRange === 'weekly' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSelectedTimeRange('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                selectedTimeRange === 'monthly' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className="h-80">
          <Bar 
            data={selectedTimeRange === 'weekly' ? weeklyAttendanceData : monthlyAttendanceData} 
            options={chartOptions} 
          />
        </div>
      </div>
      
      {/* Department and Attendance Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3 sm:mb-0">Department Performance</h3>
            <div className="relative">
              <button 
                onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                className="flex items-center px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                {selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              
              {showDepartmentDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedDepartment('all');
                        setShowDepartmentDropdown(false);
                      }}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        selectedDepartment === 'all' ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All Departments
                    </button>
                    {departmentAttendanceData.labels.map((dept, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedDepartment(dept.toString());
                          setShowDepartmentDropdown(false);
                        }}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          selectedDepartment === dept ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="h-72">
            <Doughnut data={departmentAttendanceData} options={doughnutOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {departmentAttendanceData.labels.map((dept, index) => (
              <div key={index} className="text-center">
                <div 
                  className="h-3 w-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: departmentAttendanceData.datasets[0].backgroundColor[index] as string }}
                ></div>
                <p className="text-xs font-medium text-gray-700">{dept}</p>
                <p className="text-xs text-gray-500">{departmentAttendanceData.datasets[0].data[index]}%</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Attendance Trend Line Chart */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-6">Attendance Rate Trend</h3>
          <div className="h-80">
            <Line data={attendanceTrendData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Most Active Locations and Absent Staff Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Check-in Locations */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top Check-in Locations</h3>
          <div className="space-y-4">
            {[
              { location: 'Main Office Entrance', count: 28, percentage: 61 },
              { location: 'South Wing Gate', count: 10, percentage: 22 },
              { location: 'Remote Check-in', count: 5, percentage: 11 },
              { location: 'Visitor Entrance', count: 3, percentage: 6 }
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-12 text-center">
                  <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.location}</span>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Frequently Absent Staff */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Frequently Absent Staff</h3>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent Days
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { name: 'John Smith', department: 'IT', days: 5 },
                  { name: 'Mary Johnson', department: 'HR', days: 4 },
                  { name: 'Robert Brown', department: 'Finance', days: 3 },
                  { name: 'Sarah Miller', department: 'Marketing', days: 3 }
                ].map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.department}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {employee.days} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 