import React, { useEffect, useRef } from 'react';
import { Users, Target, Award, Building2, ChevronRight, MapPin, Clock, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import '../styles/about.css';
import Navbar from '../components/Navbar';

const About: React.FC = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const teamMembers = [
    {
      name: 'Dr. Muhammad Mannir Ahmad',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256',
      bio: 'Visionary leader with over 15 years of experience in technology and innovation.'
    },
    {
      name: 'Sarah Johnson',
      role: 'Technical Director',
      image: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=256',
      bio: 'Expert in software architecture and enterprise solutions.'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256',
      bio: 'Specializes in streamlining business processes and team management.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            About ASL Geofence Attendance
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Modern attendance tracking with location-based verification
          </p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-12">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Making attendance management simple, accurate and reliable
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <p className="text-gray-700 mb-4">
              ASL Geofence Attendance is a state-of-the-art attendance management system designed for modern workplaces. 
              Our platform combines geolocation technology with user-friendly interfaces to create a seamless attendance 
              tracking experience for both employees and administrators.
            </p>
            <p className="text-gray-700">
              With our geofence technology, organizations can define specific geographic boundaries for workplace attendance, 
              ensuring that employees are physically present at designated locations when clocking in or out. 
              This system eliminates buddy punching and provides accurate, verifiable attendance records.
            </p>
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Geofence Technology</h3>
              </div>
              <p className="text-gray-600">
                Define virtual boundaries for your workplace and ensure attendance is tracked only within those areas.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Real-time Tracking</h3>
              </div>
              <p className="text-gray-600">
                Monitor attendance in real-time with instant updates as employees clock in and out of work.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              </div>
              <p className="text-gray-600">
                Easily manage employees, departments, and roles with our intuitive admin dashboard.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Secure Authentication</h3>
              </div>
              <p className="text-gray-600">
                Protect your data with our robust authentication system and role-based access controls.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Attendance Verification</h3>
              </div>
              <p className="text-gray-600">
                Verify attendance with location data, ensuring accuracy and preventing time theft.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <AlertTriangle className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Attendance Anomalies</h3>
              </div>
              <p className="text-gray-600">
                Detect and flag unusual attendance patterns to help identify potential issues.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-700 rounded-lg shadow-xl overflow-hidden mb-16">
          <div className="px-6 py-12 md:px-12 text-center md:text-left">
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Ready to modernize your attendance system?
                </h2>
                <p className="mt-3 max-w-md mx-auto text-indigo-200 md:mx-0">
                  Get started with ASL Geofence Attendance today and streamline your organization's attendance process.
                </p>
              </div>
              <div className="mt-8 md:mt-0">
                <div className="rounded-md shadow">
                  <a
                    href="/contact"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Team</h2>
          <p className="max-w-2xl mx-auto text-gray-600 mb-12">
            We're a dedicated team of developers and designers passionate about creating intuitive tools
            that make workplace management more efficient and effective.
          </p>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">John Doe</h3>
                <p className="text-sm text-indigo-600 mb-2">Lead Developer</p>
                <p className="text-gray-600">
                  Full-stack developer with expertise in geolocation technologies and authentication systems.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Jane Smith</h3>
                <p className="text-sm text-indigo-600 mb-2">UI/UX Designer</p>
                <p className="text-gray-600">
                  Expert designer focused on creating intuitive, accessible interfaces for complex systems.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Alex Johnson</h3>
                <p className="text-sm text-indigo-600 mb-2">Project Manager</p>
                <p className="text-gray-600">
                  Seasoned manager with a background in HR solutions and workplace optimization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} ASL Geofence Attendance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About; 