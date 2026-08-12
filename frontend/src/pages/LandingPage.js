import React, { useState, useEffect,useContext } from 'react';
import { Search, MessageCircle, Calendar, User, Bell, Menu, X, Star, Users, BookOpen, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';

export default function LatticeLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const { user, dispatch } = useContext(AuthContext);
   const [userProfile, setUserProfile] = useState(null);
   const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);
console.log("User from context:", user);

  const fetchUserProfile = async () => {
  try {
   const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/profile`, {
  headers: {
    'Authorization': `Bearer ${user.token}`  // or localStorage.getItem('userToken')
  }
});

    const profileData = await response.json();
    console.log('Fetched profile data:', profileData); // 👈 Add this

    // Update this line depending on your response shape
    setUserProfile(profileData); // or profileData.user
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};


  const handleLogout = () => {
    // Clear localStorage and dispatch logout action
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "UX Designer",
      content: "Lattice transformed how I learn new skills. I taught design basics and learned Python from amazing mentors!",
      rating: 5,
      avatar: "👩‍💻"
    },
    {
      name: "Marcus Johnson",
      role: "Data Scientist",
      content: "The collaborative learning approach is genius. I've built lasting connections while mastering new technologies.",
      rating: 5,
      avatar: "👨‍🔬"
    },
    {
      name: "Elena Rodriguez",
      role: "Marketing Specialist",
      content: "Found my perfect learning partner within hours. The matching system is incredibly smart and effective.",
      rating: 5,
      avatar: "👩‍💼"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Smart Matching",
      description: "AI-powered algorithm connects you with perfect learning partners based on skills, goals, and compatibility."
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Skill Exchange",
      description: "Trade knowledge seamlessly - teach what you know, learn what you need. Fair and balanced exchanges."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Flexible Scheduling",
      description: "Built-in calendar integration with smart scheduling that respects time zones and preferences."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Profiles",
      description: "Comprehensive verification system ensures quality connections and safe learning environment."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Visual progress indicators, milestone celebrations, and achievement badges keep you motivated."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Community",
      description: "Connect with learners worldwide, experience diverse perspectives and teaching styles."
    }
  ];

  const conversations = [
    {
      name: "Alex Chen",
      role: "Frontend Developer",
      message: "Hey! Ready for our React session? I prepared some advanced hooks examples.",
      time: "2 min ago",
      avatar: "👨‍💻",
      online: true
    },
    {
      name: "Maria Santos",
      role: "Spanish Tutor",
      message: "¡Hola! How did the conversation practice go yesterday?",
      time: "1 hour ago",
      avatar: "👩‍🏫",
      online: true
    },
    {
      name: "David Kim",
      role: "Photography Expert",
      message: "Those composition techniques you taught me are amazing! Want to schedule another session?",
      time: "3 hours ago",
      avatar: "📸",
      online: false
    },
    {
      name: "Sophie Turner",
      role: "Data Analyst",
      message: "The SQL queries tutorial was perfect. Can we dive into complex joins next time?",
      time: "5 hours ago",
      avatar: "👩‍💼",
      online: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/favicon.svg" alt="Lattice" className="w-10 h-10" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Lattice
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {/* <a href="/discover" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Discover</a> */}
               <Link to="/discover" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Discover</Link>
                            <Link to="/chat" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Community</Link>
                            <Link to="/sessions" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Sessions</Link>
            </div>

                <div className="hidden md:flex items-center space-x-4">
        {user ? (
          // Show when user is logged in
          <>
            <Link to="/profile">
              <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                My Profile
              </button>
            </Link>
            <button 
              onClick={handleLogout}
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Logout
            </button>
          <span className="ml-3 inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 font-semibold text-sm rounded-full shadow-sm border border-purple-300">
  <span>👋 Welcome,</span>
  <span className="font-bold">
    {userProfile?.firstName ? `${userProfile.firstName}` : 'User'}
  </span>
</span>

      
          </>
        ) : (
          // Show when user is not logged in
          <>
            <Link to="/login">
              <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Sign Up
              </button>
            </Link>
            <button 
              onClick={() => navigate('/discover')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium"
            >
              Start Learning
            </button>
          </>
        )}
      </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        
        
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-purple-100 text-purple-700 px-6 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Join 50,000+ Active Learners
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Learn Together,
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Grow Together
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Connect with passionate learners worldwide. Exchange skills, share knowledge, 
            and accelerate your growth through collaborative learning experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={() => setActiveTab('features')}
              className={`px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 ${
                activeTab === 'features' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-300'
              }`}
            >
              Explore Features
            </button>
            <button 
              onClick={() => setActiveTab('demo')}
              className={`px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 ${
                activeTab === 'demo' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-300'
              }`}
            >
              See It In Action
            </button>
          </div>

          {/* Dynamic Content Based on Tab */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
            {activeTab === 'features' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Why Choose Lattice?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-lg transition-all transform hover:-translate-y-1">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl mb-4">
                        {feature.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'demo' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Live Learning Dashboard</h3>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Messages Panel */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
                        Active Conversations
                      </h4>
                      <Bell className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    <div className="space-y-4">
                      {conversations.map((conv, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 hover:shadow-md transition-all cursor-pointer border border-purple-100">
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-xl flex items-center justify-center text-xl">
                                {conv.avatar}
                              </div>
                              {conv.online && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="font-semibold text-gray-900 text-sm">{conv.name}</h5>
                                <span className="text-xs text-gray-500">{conv.time}</span>
                              </div>
                              <p className="text-xs text-purple-600 mb-2">{conv.role}</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{conv.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Interface */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-xl flex items-center justify-center text-xl">
                        👨‍💻
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Alex Chen</h4>
                        <p className="text-sm text-purple-600">Frontend Developer</p>
                      </div>
                      <div className="ml-auto flex space-x-2">
                        <button className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-xs shadow-sm border border-purple-100">
                          <p className="text-sm text-gray-800">Hey! Ready for our React session? I prepared some advanced hooks examples.</p>
                          <span className="text-xs text-gray-500 mt-1 block">2:30 PM</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-xs shadow-sm">
                          <p className="text-sm">Perfect! I've been practicing useState and useEffect. Ready to learn useReducer!</p>
                          <span className="text-xs text-purple-200 mt-1 block">2:32 PM</span>
                        </div>
                      </div>

                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-xs shadow-sm border border-purple-100">
                          <p className="text-sm text-gray-800">Great! Let's start with a practical example. useReducer is perfect for complex state logic.</p>
                          <span className="text-xs text-gray-500 mt-1 block">2:35 PM</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input 
                        type="text" 
                        placeholder="Type your message..."
                        className="flex-1 bg-white border border-purple-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">What Our Community Says</h2>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8 mb-8">
            <div className="flex justify-center mb-4">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            
            <blockquote className="text-xl text-gray-700 italic mb-6 leading-relaxed">
              "{testimonials[currentTestimonial].content}"
            </blockquote>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-xl">
                {testimonials[currentTestimonial].avatar}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</p>
                <p className="text-purple-600 text-sm">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial 
                    ? 'bg-purple-600' 
                    : 'bg-purple-200 hover:bg-purple-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already growing together. 
            Find your perfect learning partner today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/discover')}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Learning Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/favicon.svg" alt="Lattice" className="w-8 h-8" />
                <span className="text-xl font-bold">Lattice</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering growth through collaborative learning and skill exchange.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Lattice. All rights reserved. Built with ❤️ for learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}