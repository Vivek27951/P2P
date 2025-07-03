import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Shield, Users, Star, ArrowRight, Package, Calendar, MessageCircle } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Easy Discovery',
      description: 'Find items near you with our smart search and filtering system.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure transactions with our integrated payment system.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect with neighbors and build trust through our rating system.'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Communicate instantly with item owners to arrange rentals.'
    }
  ];

  const categories = [
    { name: 'Tools', icon: '🔧', count: '150+' },
    { name: 'Electronics', icon: '📱', count: '200+' },
    { name: 'Furniture', icon: '🪑', count: '80+' },
    { name: 'Vehicles', icon: '🚗', count: '45+' },
    { name: 'Clothes', icon: '👕', count: '300+' },
    { name: 'Other', icon: '📦', count: '100+' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Rent. Share. Connect.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Your neighborhood marketplace for renting everything from tools to electronics. 
              Share what you have, rent what you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                <Search className="w-5 h-5 mr-2" />
                Start Browsing
              </Link>
              {isAuthenticated ? (
                <Link to="/add-item" className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                  <Package className="w-5 h-5 mr-2" />
                  List an Item
                </Link>
              ) : (
                <Link to="/register" className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                  Join Community
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RentIt?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make peer-to-peer rentals simple, secure, and social.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover what's available in your area across different categories.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/browse?category=${category.name.toLowerCase()}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow group"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.count} items
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. Just follow these easy steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Browse & Search
              </h3>
              <p className="text-gray-600">
                Find items near you using our search filters and location-based discovery.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Book & Pay
              </h3>
              <p className="text-gray-600">
                Select your dates, send a booking request, and pay securely through our platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Rate & Review
              </h3>
              <p className="text-gray-600">
                Complete your rental and leave feedback to help build community trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Renting?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already sharing and renting in their communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/browse" className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                  Browse Items
                </Link>
              </>
            ) : (
              <>
                <Link to="/browse" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Browse Items
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/add-item" className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                  List Your First Item
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;