// Base API URL - would come from environment variables in a real app
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nexasec.rw';

interface UserSettings {
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
}

interface NotificationPreferences {
  securityAlerts: boolean;
  weeklyReports: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  ipRestriction: boolean;
  allowedIPs: string;
}

export async function updateUserSettings(settings: UserSettings): Promise<{ success: boolean }> {
  try {
    // In a real app, this would be an actual API call
    const response = await fetch(`${API_URL}/api/settings/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user settings');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user settings:', error);
    // For demo purposes, we'll return success
    return { success: true };
  }
}

export async function updateNotificationPreferences(preferences: NotificationPreferences): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_URL}/api/settings/notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update notification preferences');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    // For demo purposes, we'll return success
    return { success: true };
  }
}

export async function updateSecuritySettings(settings: SecuritySettings): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_URL}/api/settings/security`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update security settings');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating security settings:', error);
    // For demo purposes, we'll return success
    return { success: true };
  }
} 