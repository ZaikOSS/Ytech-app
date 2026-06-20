import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckoutModal from './CheckoutModal';
import ChatBot from './ChatBot';

const LandingPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('');

  const { login } = useContext(AuthContext);

  const handleGetStarted = (pkgName = null, pkgPrice = null) => {
    if (isAuthenticated) {
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'MANAGER') navigate('/manager');
      else {
        if (pkgName && pkgPrice) {
          setSelectedPackage({ name: pkgName, price: pkgPrice });
          setShowCheckoutModal(true);
        } else {
          navigate('/client');
        }
      }
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        setShowLoginModal(false);
        if (data.user.role === 'ADMIN') navigate('/admin');
        else if (data.user.role === 'MANAGER') navigate('/manager');
        else navigate('/client');
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during login');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Using email as username for consistency with login
        body: JSON.stringify({ username, password, full_name: fullName })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        setShowLoginModal(false);
        // We do NOT navigate away here so the user can scroll to pricing and choose a package
      } else {
        alert('Signup failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during signup');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('Submitting...');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage })
      });
      const data = await response.json();
      if (response.ok) {
        setContactStatus('Success! We will get back to you shortly.');
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } else {
        setContactStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setContactStatus('Network error occurred.');
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased overflow-x-hidden min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-container-max mx-auto px-margin-x flex justify-between items-center h-20">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-green-500/30">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
            <span className="font-['Outfit'] text-2xl font-black text-gray-900 tracking-tight">YTECH<span className="text-[#10B981]">.</span></span>
          </div>
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            {isAuthenticated ? 'Dashboard' : 'Get Started'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-stack-lg">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-x flex flex-col items-center text-center mt-8 mb-20">
          <h1 className="font-['Outfit'] font-black text-5xl md:text-7xl text-gray-900 max-w-4xl mb-8 leading-tight tracking-tight">
            Next-Generation Web Experiences for Growing Businesses
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-stack-lg">
            Secure, scalable, and beautifully designed web applications engineered specifically for forward-thinking SMEs. We build the digital infrastructure your business needs to scale effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a className="bg-[#10B981] text-white px-8 py-4 rounded-full font-button text-button hover:bg-secondary transition-colors inline-block text-center" href="#pricing">
              Explore Packages
            </a>
            <a className="border border-outline-variant text-primary px-8 py-4 rounded-full font-button text-button hover:bg-surface-container-low transition-colors inline-block text-center" href="#contact">
              Talk to Sales
            </a>
          </div>
        </section>

        {/* Pricing Grid */}
        <section className="max-w-container-max mx-auto px-margin-x py-stack-lg bg-surface-container-low rounded-[40px] mb-24" id="pricing">
          <div className="text-center mb-stack-lg">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Transparent Pricing Packs</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Tailored solutions for every stage of your digital journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

            {/* Card 1 */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 ambient-shadow ambient-shadow-hover flex flex-col">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Pack Showcase / Vitrine</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 border-b border-surface-container-high pb-6">Perfect for establishing a strong, professional online presence.</p>
              <ul className="flex-grow space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Responsive Static Design</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">SEO Optimization Setup</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Contact Form Integration</span>
                </li>
              </ul>
              <button className="w-full border border-primary-container text-primary-container px-6 py-3 rounded-full font-button text-button hover:bg-surface-container-low transition-colors" onClick={() => handleGetStarted('Pack Showcase / Vitrine', 500)}>
                Order Showcase
              </button>
            </div>

            {/* Card 2 (Featured) */}
            <div className="bg-surface-container-lowest rounded-2xl border-2 border-[#10B981] p-8 ambient-shadow ambient-shadow-hover flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#10B981] text-white px-4 py-1 rounded-full font-label-sm text-label-sm">Most Popular</div>
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Pack E-Commerce</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 border-b border-surface-container-high pb-6">Full-featured online store to drive digital sales.</p>
              <ul className="flex-grow space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Complete Storefront Setup</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Payment Gateway Integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Inventory Management</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Advanced Analytics</span>
                </li>
              </ul>
              <button className="w-full bg-[#10B981] text-white px-6 py-3 rounded-full font-button text-button hover:bg-secondary transition-colors" onClick={() => handleGetStarted('Pack E-Commerce', 1500)}>
                Order E-Commerce
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 ambient-shadow ambient-shadow-hover flex flex-col">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Pack Custom & Maint.</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 border-b border-surface-container-high pb-6">Bespoke internal tools and ongoing technical support.</p>
              <ul className="flex-grow space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Custom Web App Development</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">API Integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-sm mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Monthly Security Updates</span>
                </li>
              </ul>
              <button className="w-full border border-primary-container text-primary-container px-6 py-3 rounded-full font-button text-button hover:bg-surface-container-low transition-colors" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
                Contact for Custom
              </button>
            </div>

          </div>
        </section>

        {/* Contact Section */}
        <section className="max-w-container-max mx-auto px-margin-x py-stack-lg" id="contact">
          <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 md:p-12 ambient-shadow">
            <div className="text-center mb-8">
              <h2 className="font-headline-md text-headline-md text-primary mb-2">Start Your Project</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Tell us about your needs and we'll get back to you within 24 hours.</p>
            </div>
            {contactStatus && (
              <div className={`mb-6 p-4 rounded-lg font-body-md text-center ${contactStatus.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
                {contactStatus}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-sm text-label-sm text-primary mb-2" htmlFor="name">Full Name</label>
                  <input required value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-surface-container-lowest" id="name" placeholder="Jane Doe" type="text" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-primary mb-2" htmlFor="email">Corporate Email</label>
                  <input required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-surface-container-lowest" id="email" placeholder="jane@company.com" type="email" />
                </div>
              </div>
              <div className="relative">
                <label className="block font-label-sm text-label-sm text-primary mb-2" htmlFor="message">Message / Project Scope</label>
                <textarea maxLength={1000} required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 pb-8 font-body-md text-body-md text-on-surface focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-surface-container-lowest" id="message" placeholder="Describe your web project requirements..." rows="4"></textarea>
                <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                  {contactMessage.length}/1000
                </div>
              </div>
              <button className="w-full bg-primary-container text-white px-8 py-4 rounded-full font-button text-button hover:bg-tertiary transition-colors" type="submit">
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full pt-16 pb-8 bg-[#091426] text-white">
        <div className="max-w-container-max mx-auto px-margin-x">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-gray-800 pb-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                </div>
                <span className="font-['Outfit'] text-2xl font-black text-white tracking-tight">YTECH<span className="text-[#10B981]">.</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
                Building scalable, secure, and beautiful digital experiences for forward-thinking companies worldwide.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#10B981] hover:text-white transition-colors text-gray-400">
                  <span className="material-symbols-outlined text-sm">public</span>
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#10B981] hover:text-white transition-colors text-gray-400">
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold mb-4">Solutions</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">Web Development</a></li>
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">E-Commerce</a></li>
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">Custom Dashboards</a></li>
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">API Integrations</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">Case Studies</a></li>
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">Contact</a></li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-[#10B981] transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2026 YTECH Solutions. All rights reserved.</p>
            <p>Made with <span className="text-[#10B981]">♥</span> By Zaikos.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {isSignupMode ? (
              /* --- SIGN UP MODAL --- */
              <>
                <div className="px-8 pt-10 pb-6 text-center">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-4">person_add</span>
                  <h2 className="font-headline-md text-headline-md text-primary">Create Your Account</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">Get access to premium web packages</p>
                </div>
                <div className="px-8 pb-8">
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                      <label className="block font-label-sm text-label-sm text-primary mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-surface-container-lowest"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-primary mb-2">Corporate Email</label>
                      <input
                        type="email"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-surface-container-lowest"
                        placeholder="name@company.com"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-primary mb-2">Company Name</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-surface-container-lowest"
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-primary mb-2">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-surface-container-lowest"
                        placeholder="••••••••"
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#10B981] text-white py-3 rounded-full font-button hover:bg-secondary transition-colors mt-2">
                      Create Account
                    </button>
                  </form>
                </div>
                <div className="px-8 py-6 bg-surface-container-low border-t border-slate-200 text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Already have an account?
                    <button onClick={() => setIsSignupMode(false)} className="ml-1 font-label-sm text-label-sm text-[#10B981] hover:opacity-80 transition-opacity font-bold">Log in</button>
                  </p>
                </div>
              </>
            ) : (
              /* --- LOGIN MODAL --- */
              <>
                <div className="p-10">
                  <div className="text-center mb-8">
                    <span className="material-symbols-outlined text-secondary text-4xl mb-4">lock</span>
                    <h2 className="font-headline-md text-headline-md text-primary">Welcome Back</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2">Sign in to Ytech Solutions</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block font-label-sm text-label-sm text-primary mb-2">Username or Email</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-surface-container-lowest"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-primary mb-2">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-surface-container-lowest"
                        placeholder="••••••••"
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#10B981] text-white py-3 rounded-full font-button hover:bg-secondary transition-colors">
                      Sign In
                    </button>

                    <div className="text-center mt-6">
                      <p className="font-label-sm text-label-sm text-outline">
                        Demo: admin/admin123, sarah/sarah123, client1/client123
                      </p>
                    </div>
                  </form>
                </div>
                <div className="px-8 py-6 bg-surface-container-low border-t border-slate-200 text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Don't have an account?
                    <button onClick={() => setIsSignupMode(true)} className="ml-1 font-label-sm text-label-sm text-[#10B981] hover:opacity-80 transition-opacity font-bold">Sign up</button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && selectedPackage && (
        <CheckoutModal
          packageDetails={selectedPackage}
          onClose={() => {
            setShowCheckoutModal(false);
            setSelectedPackage(null);
          }}
          onCheckoutSuccess={() => {
            setShowCheckoutModal(false);
            navigate('/client');
          }}
        />
      )}

      <ChatBot />
    </div>
  );
};

export default LandingPage;
