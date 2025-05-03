import React, { useEffect, useRef } from 'react';
import { 
  Code2, 
  Smartphone, 
  Globe, 
  Database, 
  Shield, 
  Users, 
  Cpu,
  BarChart,
  ChevronRight
} from 'lucide-react';
import '../styles/about.css';

const Services: React.FC = () => {
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

  const services = [
    {
      icon: <Code2 className="w-12 h-12" />,
      title: "Custom Software Development",
      description: "Tailored software solutions designed to meet your specific business needs and challenges.",
      features: ["Web Applications", "Desktop Software", "API Integration", "Legacy System Modernization"]
    },
    {
      icon: <Smartphone className="w-12 h-12" />,
      title: "Mobile App Development",
      description: "Native and cross-platform mobile applications that deliver exceptional user experiences.",
      features: ["iOS Development", "Android Development", "React Native", "Flutter Applications"]
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Web Development",
      description: "Modern, responsive websites and web applications built with cutting-edge technologies.",
      features: ["E-commerce Solutions", "Content Management", "Progressive Web Apps", "Website Optimization"]
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: "Database Management",
      description: "Robust database solutions to efficiently store, organize, and retrieve your data.",
      features: ["Database Design", "Performance Optimization", "Data Migration", "Database Administration"]
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Cybersecurity",
      description: "Comprehensive security solutions to protect your digital assets and sensitive information.",
      features: ["Security Audits", "Vulnerability Assessment", "Secure Development", "Security Training"]
    },
    {
      icon: <Cpu className="w-12 h-12" />,
      title: "IT Infrastructure",
      description: "Strategic IT infrastructure planning and implementation for optimal business operations.",
      features: ["Cloud Solutions", "Network Design", "System Integration", "Hardware Procurement"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="relative bg-indigo-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll opacity-0 transition-all duration-1000 delay-200">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-indigo-100 max-w-3xl">
              Comprehensive technology solutions tailored to drive your business forward
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50"></div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="animate-on-scroll opacity-0 transition-all duration-1000 bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transform hover:-translate-y-1 transition-all"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="text-indigo-600 mb-4">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-3">
                {service.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center text-gray-600">
                    <ChevronRight className="w-4 h-4 text-indigo-600 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll opacity-0 transition-all duration-1000 delay-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine technical expertise with industry knowledge to deliver exceptional results
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Team</h3>
                <p className="text-gray-600">Highly skilled professionals with diverse technical expertise</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <BarChart className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Results</h3>
                <p className="text-gray-600">Track record of successful project deliveries and satisfied clients</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assured</h3>
                <p className="text-gray-600">Rigorous quality control and testing processes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll opacity-0 transition-all duration-1000 delay-700">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Project?</h2>
              <p className="text-xl text-indigo-100 mb-8">
                Contact us today to discuss how we can help transform your business
              </p>
              <button className="inline-flex items-center bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                Get in Touch
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services; 