"use client"
import { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Always required
    functional: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already set cookie preferences
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (savedPreferences) {
      setCookiePreferences(JSON.parse(savedPreferences));
    } else {
      // Only show the banner if no preferences are saved
      setIsVisible(true);
    }
  }, []);

  const acceptAllCookies = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    localStorage.setItem('cookiesAccepted', 'true');
    setCookiePreferences(allAccepted);
    setIsVisible(false);
  };

  const rejectAllCookies = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyNecessary));
    localStorage.setItem('cookiesAccepted', 'false');
    setCookiePreferences(onlyNecessary);
    setIsVisible(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    localStorage.setItem('cookiesAccepted', 'custom');
    setShowCustomize(false);
    setIsVisible(false);
  };

  const handleToggle = (cookieType: keyof typeof cookiePreferences) => {
    if (cookieType === 'necessary') return; // Can't toggle necessary cookies
    setCookiePreferences({
      ...cookiePreferences,
      [cookieType]: !cookiePreferences[cookieType],
    });
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 shadow-lg">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">We value your privacy</h3>
            <p className="text-sm text-gray-300">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <button
              onClick={() => setShowCustomize(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
            >
              Customize
            </button>
            <button
              onClick={rejectAllCookies}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={acceptAllCookies}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Settings className="mr-2 h-5 w-5 text-cyan-400" />
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowCustomize(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 border border-gray-800 rounded-md bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Necessary Cookies</h4>
                    <p className="text-sm text-gray-400">Required for the website to function properly</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={cookiePreferences.necessary} 
                      disabled
                      className="sr-only"
                    />
                    <div className="w-10 h-5 bg-cyan-600 rounded-full shadow-inner"></div>
                    <div className="dot absolute left-1 top-0 bg-white w-3 h-3 rounded-full transition"></div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border border-gray-800 rounded-md hover:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Functional Cookies</h4>
                    <p className="text-sm text-gray-400">Enable personalized features and preferences</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={cookiePreferences.functional} 
                      onChange={() => handleToggle('functional')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="p-3 border border-gray-800 rounded-md hover:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Analytics Cookies</h4>
                    <p className="text-sm text-gray-400">Help us improve our website by collecting anonymous data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={cookiePreferences.analytics} 
                      onChange={() => handleToggle('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="p-3 border border-gray-800 rounded-md hover:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Marketing Cookies</h4>
                    <p className="text-sm text-gray-400">Allow us to provide personalized ads and content</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={cookiePreferences.marketing} 
                      onChange={() => handleToggle('marketing')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCustomize(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 