import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, User } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 rounded-full p-3 mr-4">
            <SettingsIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
        </div>
        
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="border-b pb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              Account Settings
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Admin Email</p>
                  <p className="text-sm text-gray-500">admin@esys.ng</p>
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-500">
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Password</p>
                  <p className="text-sm text-gray-500">Last changed: 3 months ago</p>
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-500">
                  Reset
                </button>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="border-b pb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-gray-500" />
              Notification Settings
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive daily attendance reports</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" id="email-notifications" className="sr-only" />
                  <label
                    htmlFor="email-notifications"
                    className="block h-6 w-10 rounded-full bg-gray-200 cursor-pointer transition-colors duration-200 ease-in-out"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">System Alerts</p>
                  <p className="text-sm text-gray-500">Critical system notifications</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" id="system-alerts" className="sr-only" defaultChecked />
                  <label
                    htmlFor="system-alerts"
                    className="block h-6 w-10 rounded-full bg-indigo-600 cursor-pointer transition-colors duration-200 ease-in-out"
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Security Settings */}
          <div className="border-b pb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-gray-500" />
              Security Settings
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" id="two-factor" className="sr-only" />
                  <label
                    htmlFor="two-factor"
                    className="block h-6 w-10 rounded-full bg-gray-200 cursor-pointer transition-colors duration-200 ease-in-out"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Session Timeout</p>
                  <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                </div>
                <select className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Data Management */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Database className="h-5 w-5 mr-2 text-gray-500" />
              Data Management
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Export Attendance Data</p>
                  <p className="text-sm text-gray-500">Download attendance records as CSV</p>
                </div>
                <button className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
                  Export
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Backup System Data</p>
                  <p className="text-sm text-gray-500">Create a backup of all system data</p>
                </div>
                <button className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
                  Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 