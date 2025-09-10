"use client"
import { useState } from "react";
import { updateUserSettings, updateNotificationPreferences, updateSecuritySettings } from "@/services/settingsService";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/providers/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuthContext();
  
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
  
  // Account settings form state
  const [accountForm, setAccountForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: user?.companyName || "",
    jobTitle: user?.jobTitle || "",
    phone: user?.phone || ""
  });
  
  // Notification preferences form state
  const [notificationPrefs, setNotificationPrefs] = useState({
    securityAlerts: true,
    weeklyReports: true,
    productUpdates: false,
    marketingEmails: false
  });
  
  // Security settings form state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    ipRestriction: false,
    allowedIPs: ""
  });

  const handleAccountFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationPrefs(prev => ({ ...prev, [name]: checked }));
  };

  const handleSecuritySettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateUserSettings(accountForm);
      toast.success("Account settings updated successfully");
    } catch (error) {
      console.error("Error updating account settings:", error);
      toast.error("Failed to update account settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateNotificationPreferences(notificationPrefs);
      toast.success("Notification preferences updated successfully");
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error("Failed to update notification preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateSecuritySettings(securitySettings);
      toast.success("Security settings updated successfully");
    } catch (error) {
      console.error("Error updating security settings:", error);
      toast.error("Failed to update security settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and security preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="md:w-1/4">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg overflow-hidden">
            <nav className="flex flex-col">
              <button
                onClick={() => setActiveTab("account")}
                className={`px-4 py-3 text-left ${
                  activeTab === "account"
                    ? "bg-cyan-900/30 text-cyan-400 border-l-4 border-cyan-400"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                Account Settings
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-4 py-3 text-left ${
                  activeTab === "notifications"
                    ? "bg-cyan-900/30 text-cyan-400 border-l-4 border-cyan-400"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                Notification Preferences
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-4 py-3 text-left ${
                  activeTab === "security"
                    ? "bg-cyan-900/30 text-cyan-400 border-l-4 border-cyan-400"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                Security Settings
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={`px-4 py-3 text-left ${
                  activeTab === "billing"
                    ? "bg-cyan-900/30 text-cyan-400 border-l-4 border-cyan-400"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                Billing & Subscription
              </button>
              <button
                onClick={() => setActiveTab("api")}
                className={`px-4 py-3 text-left ${
                  activeTab === "api"
                    ? "bg-cyan-900/30 text-cyan-400 border-l-4 border-cyan-400"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                API Access
              </button>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="md:w-3/4">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
            {/* Account Settings */}
            {activeTab === "account" && (
              <div>
                <h2 className="text-xl font-medium mb-6">Account Settings</h2>
                <form onSubmit={handleAccountSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={accountForm.name}
                        onChange={handleAccountFormChange}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={accountForm.email}
                        onChange={handleAccountFormChange}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={accountForm.company}
                        onChange={handleAccountFormChange}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        value={accountForm.jobTitle}
                        onChange={handleAccountFormChange}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={accountForm.phone}
                        onChange={handleAccountFormChange}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-cyan-500 text-black px-4 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notification Preferences */}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-xl font-medium mb-6">Notification Preferences</h2>
                <form onSubmit={handleNotificationSubmit}>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="securityAlerts"
                          name="securityAlerts"
                          type="checkbox"
                          checked={notificationPrefs.securityAlerts}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="securityAlerts" className="font-medium text-gray-300">Security Alerts</label>
                        <p className="text-gray-400">Receive notifications about critical security events</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="weeklyReports"
                          name="weeklyReports"
                          type="checkbox"
                          checked={notificationPrefs.weeklyReports}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="weeklyReports" className="font-medium text-gray-300">Weekly Reports</label>
                        <p className="text-gray-400">Receive weekly summary reports of security activity</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="productUpdates"
                          name="productUpdates"
                          type="checkbox"
                          checked={notificationPrefs.productUpdates}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="productUpdates" className="font-medium text-gray-300">Product Updates</label>
                        <p className="text-gray-400">Receive notifications about new features and updates</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="marketingEmails"
                          name="marketingEmails"
                          type="checkbox"
                          checked={notificationPrefs.marketingEmails}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="marketingEmails" className="font-medium text-gray-300">Marketing Emails</label>
                        <p className="text-gray-400">Receive promotional offers and marketing communications</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-cyan-500 text-black px-4 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-xl font-medium mb-6">Security Settings</h2>
                <form onSubmit={handleSecuritySubmit}>
                  <div className="space-y-6 mb-6">
                    <div>
                      <div className="flex items-start mb-4">
                        <div className="flex items-center h-5">
                          <input
                            id="twoFactorAuth"
                            name="twoFactorAuth"
                            type="checkbox"
                            checked={securitySettings.twoFactorAuth}
                            onChange={handleSecuritySettingChange}
                            className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="twoFactorAuth" className="font-medium text-gray-300">Two-Factor Authentication</label>
                          <p className="text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      {securitySettings.twoFactorAuth && (
                        <div className="ml-7 mt-2 p-4 bg-gray-800/50 border border-gray-700 rounded-md">
                          <p className="text-sm text-gray-300 mb-2">
                            Two-factor authentication is enabled. You'll receive a verification code via SMS when signing in.
                          </p>
                          <button
                            type="button"
                            className="text-sm text-cyan-400 hover:text-cyan-300"
                            onClick={() => toast.success("Reconfiguration flow would start here")}
                          >
                            Reconfigure
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <select
                        id="sessionTimeout"
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecuritySettingChange}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="240">4 hours</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-400">
                        Your session will automatically expire after this period of inactivity
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-start mb-4">
                        <div className="flex items-center h-5">
                          <input
                            id="ipRestriction"
                            name="ipRestriction"
                            type="checkbox"
                            checked={securitySettings.ipRestriction}
                            onChange={handleSecuritySettingChange}
                            className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="ipRestriction" className="font-medium text-gray-300">IP Address Restriction</label>
                          <p className="text-gray-400">Limit access to your account from specific IP addresses</p>
                        </div>
                      </div>
                      {securitySettings.ipRestriction && (
                        <div className="ml-7 mt-2">
                          <label htmlFor="allowedIPs" className="block text-sm font-medium text-gray-300 mb-2">
                            Allowed IP Addresses
                          </label>
                          <textarea
                            id="allowedIPs"
                            name="allowedIPs"
                            value={securitySettings.allowedIPs}
                            onChange={handleSecuritySettingChange}
                            placeholder="Enter IP addresses, one per line (e.g., 192.168.1.1)"
                            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent h-24"
                          />
                          <p className="mt-1 text-sm text-gray-400">
                            Enter IP addresses or CIDR ranges, one per line
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-cyan-500 text-black px-4 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Security Settings"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Billing & Subscription */}
            {activeTab === "billing" && (
              <div>
                <h2 className="text-xl font-medium mb-6">Billing & Subscription</h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-md p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-cyan-400">Advanced Security Plan</h3>
                      <p className="text-sm text-gray-300 mt-1">$699/month, billed monthly</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Your next billing date is <span className="text-white">June 15, 2023</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Payment Method</h3>
                  <div className="flex items-center p-3 bg-gray-800/50 border border-gray-700 rounded-md">
                    <div className="bg-gray-700 p-2 rounded mr-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-gray-400">Expires 12/2024</p>
                    </div>
                    <button 
                      className="ml-auto text-sm text-cyan-400 hover:text-cyan-300"
                      onClick={() => toast.success("Payment method update would start here")}
                    >
                      Update
                    </button>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <button 
                      className="text-sm text-gray-400 hover:text-gray-300"
                      onClick={() => toast.success("Billing history would be shown here")}
                    >
                      View Billing History
                    </button>
                    <button 
                      className="text-sm text-red-400 hover:text-red-300"
                      onClick={() => toast.error("Subscription cancellation would start here")}
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API Access */}
            {activeTab === "api" && (
              <div>
                <h2 className="text-xl font-medium mb-6">API Access</h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-md p-4 mb-6">
                  <h3 className="font-medium mb-2">Your API Key</h3>
                  <div className="flex items-center">
                    <input
                      type="password"
                      value="••••••••••••••••••••••••••••••"
                      readOnly
                      className="flex-grow px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none font-mono text-sm"
                    />
                    <button 
                      className="ml-2 px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
                      onClick={() => toast.success("API key copied to clipboard")}
                    >
                      Copy
                    </button>
                    <button 
                      className="ml-2 px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
                      onClick={() => toast.success("API key regenerated")}
                    >
                      Regenerate
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    This key provides full access to the NexaSec API. Keep it secure and never share it publicly.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium mb-2">API Usage</h3>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-300">Requests this month</span>
                      <span className="text-sm font-medium">1,245 / 10,000</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: '12.45%' }}></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Your plan includes 10,000 API requests per month. Resets on June 1, 2023.
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <a 
                      href="#" 
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.success("API documentation would open here");
                      }}
                    >
                      View API Documentation →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 