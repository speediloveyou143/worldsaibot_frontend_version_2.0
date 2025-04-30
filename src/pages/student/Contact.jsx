import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from '../../components/Footer';
import { BACKEND_URL } from '../../../config/constant';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactLoading, setContactLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const [contactInfo, setContactInfo] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100);
  };

  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  useEffect(() => {
    if (alert) {
      const duration = 3000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            dismissAlert();
            clearInterval(timer);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [alert]);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/all-contacts`, {
          withCredentials: true,
        });
        const data = response.data;
        if (data && Array.isArray(data) && data[0]) {
          setContactInfo({
            email: data[0].email || 'support@example.com',
            number: data[0].number || '+1 (123) 456-7890',
            address: data[0].address || '123 Tech Street, Innovation City, IC 12345',
            insta: data[0].insta || 'https://instagram.com',
            linkedin: data[0].linkedin || 'https://linkedin.com',
            youtube: data[0].youtube || 'https://youtube.com',
            channel: data[0].channel || 'https://twitter.com',
            maps:
              data[0].maps ||
              'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.8354345093747!2d144.9537353153166!3d-37.816279742021665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577d2a6c8f4f4f4!2s123%20Tech%20Street%2C%20Innovation%20City%2C%20IC%2012345!5e0!3m2!1sen!2sus!4v1622549400000!5m2!1sen!2sus',
          });
        } else {
          showAlert('Invalid contact data received.', 'error');
        }
      } catch (error) {
        showAlert(
          error.response?.data?.message || 'Failed to fetch contact information.',
          'error'
        );
      } finally {
        setContactLoading(false);
      }
    };

    fetchContactData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\+?[\d\s-]{10,}$/;
    if (!emailRegex.test(formData.email)) {
      showAlert('Please enter a valid email address.', 'error');
      return false;
    }
    if (!mobileRegex.test(formData.mobile)) {
      showAlert('Please enter a valid mobile number.', 'error');
      return false;
    }
    if (!formData.name || !formData.message) {
      showAlert('Please fill in all required fields.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!contactInfo || !contactInfo.email) {
      showAlert('Contact email not available. Please try again later.', 'error');
      return;
    }

    setIsSubmitting(true);
    const emailRecipient = contactInfo.email;
    const emailSubject = encodeURIComponent('User Report');
    const emailBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nMobile: ${formData.mobile}\n\nMessage:\n${formData.message}`
    );
    const mailtoLink = `mailto:${emailRecipient}?subject=${emailSubject}&body=${emailBody}`;

    try {
      window.location.href = mailtoLink;
      showAlert('Email prepared successfully! Please send it from your email client.', 'success');
      setFormData({ name: '', email: '', mobile: '', message: '' });
    } catch (error) {
      showAlert('Failed to open email client. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-950 text-white">
      {/* Alert Component */}
      {alert && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${
            alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } flex flex-col w-80`}
        >
          <div className="flex items-center space-x-2">
            <span className="flex-1">{alert.message}</span>
            <button
              onClick={dismissAlert}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Dismiss alert"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="w-full h-1 mt-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="relative py-10 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2a004730,transparent)] animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-10 sm:mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Contact Us
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
            <div className="p-4 sm:p-8 rounded-xl bg-gray-900/50 border border-blue-800/30 hover:border-blue-600/50 transition-all">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Get in Touch
              </h3>
              <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-8">
                Have questions or need assistance? We're here to help! Fill out the form below, and it will open your email client to send us a message.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-blue-900/30 border border-blue-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Name"
                    required
                    aria-required="true"
                    aria-describedby="name-error"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-blue-900/30 border border-blue-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                    required
                    aria-required="true"
                    aria-describedby="email-error"
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-xs sm:text-sm font-medium text-gray-300">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-blue-900/30 border border-blue-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (123) 456-7890"
                    required
                    aria-required="true"
                    aria-describedby="mobile-error"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-blue-900/30 border border-blue-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your message..."
                    required
                    aria-required="true"
                    aria-describedby="message-error"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || contactLoading || !contactInfo}
                    className="w-full px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all transform hover:scale-105 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    {isSubmitting ? 'Preparing...' : contactLoading ? 'Loading...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>

            <div className="p-4 sm:p-8 rounded-xl bg-gray-900/50 border border-blue-800/30 hover:border-blue-600/50 transition-all">
              {contactLoading ? (
                <p className="text-gray-300 text-center">Loading contact information...</p>
              ) : contactInfo ? (
                <>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Our Information
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50">
                        <i className="bi bi-geo-alt text-white text-xl"></i>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-white">Address</p>
                        <p className="text-gray-300 text-sm sm:text-base">{contactInfo.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50">
                        <i className="bi bi-telephone text-white text-xl"></i>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-white">Phone</p>
                        <p className="text-gray-300 text-sm sm:text-base">{contactInfo.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50">
                        <i className="bi bi-envelope text-white text-xl"></i>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-white">Email</p>
                        <p className="text-gray-300 text-sm sm:text-base">{contactInfo.email}</p>
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8">
                      <h4 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Follow Us
                      </h4>
                      <div className="flex space-x-3 sm:space-x-4">
                        <a
                          href={contactInfo.insta}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all"
                          aria-label="Follow us on Instagram"
                        >
                          <i className="bi bi-instagram text-[#E1306C] text-xl"></i>
                        </a>
                        <a
                          href={contactInfo.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all"
                          aria-label="Follow us on YouTube"
                        >
                          <i className="bi bi-youtube text-[#FF0000] text-xl"></i>
                        </a>
                        <a
                          href={contactInfo.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all"
                          aria-label="Follow us on LinkedIn"
                        >
                          <i className="bi bi-linkedin text-[#0A66C2] text-xl"></i>
                        </a>
                        <a
                          href={contactInfo.channel}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-900/30 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all"
                          aria-label="Follow us on Twitter"
                        >
                          <i className="bi bi-twitter-x text-white text-xl"></i>
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8">
                      <h4 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Visit Us
                      </h4>
                      <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden">
                        <iframe
                          src={contactInfo.maps}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          title="Our Location"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-300 text-center">Failed to load contact information.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;