'use client';

import { useState } from 'react';
import { Card, CardBody, Button, Input, Switch, Tabs, Tab, Select, SelectItem, Avatar, Chip } from '@heroui/react';
import { User, Lock, Bell, Palette, Database, Key, Shield, Download, Upload, Trash2, Crown, Clock, CheckCircle, Zap } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { geminiService } from '@/lib/gemini';

export function SettingsPage() {
  const { user, mode, setMode, logout, isTrialExpired, getTrialDaysLeft, updateSubscription } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reports: true,
    automations: true
  });
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: '',
    role: ''
  });
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    nanoBanana: '',
    instagram: '',
    facebook: ''
  });
  const [testingApi, setTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const trialDaysLeft = getTrialDaysLeft();
  const isExpired = isTrialExpired();
  const subscriptionType = user?.subscription?.type || 'free';

  const handleUpgradeToPro = () => {
    // In a real app, this would integrate with payment processing
    updateSubscription({
      type: 'pro',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    });
    alert('Upgraded to Pro! (This is a demo - no actual payment processed)');
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', profile);
    // In a real app, this would update the user profile
  };

  const handleTestGeminiApi = async () => {
    setTestingApi(true);
    setApiTestResult(null);
    
    try {
      const result = await geminiService.testConnection();
      setApiTestResult(result);
    } catch (error: any) {
      setApiTestResult({
        success: false,
        message: error.message || 'Failed to test API'
      });
    } finally {
      setTestingApi(false);
    }
  };

  const handleSaveApiKeys = () => {
    console.log('Saving API keys:', apiKeys);
    // In a real app, this would securely store the API keys
  };

  const handleExportData = () => {
    // Export user data
    const userData = {
      profile,
      settings: { notifications, theme, mode },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trigentai-data.json';
    a.click();
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Clear local data and logout
      localStorage.clear();
      logout();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      <Tabs aria-label="Settings options" className="w-full">
        {/* Subscription Tab */}
        <Tab key="subscription" title={
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>Subscription</span>
          </div>
        }>
          <Card className="p-6 mt-6">
            <CardBody className="p-0">
              <div className="space-y-6">
                {/* Current Plan */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Current Plan
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-3">
                      {subscriptionType === 'pro' ? (
                        <Crown className="w-6 h-6 text-yellow-500" />
                      ) : subscriptionType === 'trial' ? (
                        <Clock className="w-6 h-6 text-orange-500" />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {subscriptionType === 'pro' ? 'Pro Plan' : subscriptionType === 'trial' ? 'Free Trial' : 'Free Plan'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subscriptionType === 'pro' 
                            ? 'Full access to all features'
                            : subscriptionType === 'trial'
                            ? isExpired 
                              ? 'Trial has expired' 
                              : `${trialDaysLeft} days remaining`
                            : 'Limited features available'
                          }
                        </p>
                      </div>
                    </div>
                    {subscriptionType !== 'pro' && (
                      <Button
                        color="primary"
                        variant="flat"
                        startContent={<Crown className="w-4 h-4" />}
                        onClick={handleUpgradeToPro}
                      >
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                </div>

                {/* Features Comparison */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Features
                  </h3>
                  <div className="space-y-3">
                    {[
                      { feature: 'BI Agent Data Analysis', free: true, pro: true },
                      { feature: 'AI Agent Workflow Automation', free: true, pro: true },
                      { feature: 'GX Agent Growth Tracking', free: true, pro: true },
                      { feature: 'Advanced AI Models (Gemini)', free: false, pro: true },
                      { feature: 'Professional Image Generation', free: false, pro: true },
                      { feature: 'Social Media Publishing', free: false, pro: true },
                      { feature: 'Unlimited Automations', free: false, pro: true },
                      { feature: 'Priority Support', free: false, pro: true },
                      { feature: 'Team Collaboration', free: false, pro: true },
                    ].map((item) => (
                      <div key={item.feature} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.feature}</span>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Free</span>
                            {item.free ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 border border-gray-300 rounded"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Pro</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trial Information */}
                {subscriptionType === 'trial' && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="flex items-start space-x-2">
                      <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">
                          {isExpired ? 'Trial Expired' : 'Trial Active'}
                        </h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          {isExpired 
                            ? 'Your free trial has ended. Upgrade to Pro to continue using premium features.'
                            : `Your trial expires in ${trialDaysLeft} days. Upgrade now to keep all features.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* Profile Tab */}
        <Tab key="profile" title="Profile">
          <Card className="p-6 mt-6">
            <CardBody className="p-0">
              <div className="flex items-center space-x-6 mb-6">
                <Avatar
                  src={user?.avatar}
                  name={user?.name}
                  size="lg"
                  className="w-20 h-20"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <div className="flex items-center mt-2">
                    <div className={`w-2 h-2 rounded-full ${mode === 'local' ? 'bg-blue-500' : 'bg-green-500'} mr-2`} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {mode === 'local' ? 'Local Mode' : 'Cloud Mode'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    startContent={<User className="w-4 h-4 text-gray-400" />}
                  />
                  
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={mode === 'cloud'} // Email might be managed by auth provider
                  />
                </div>

                <div className="space-y-4">
                  <Input
                    label="Company"
                    placeholder="Enter your company name"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  />
                  
                  <Input
                    label="Role"
                    placeholder="Enter your role"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button color="primary" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* Preferences Tab */}
        <Tab key="preferences" title="Preferences">
          <div className="space-y-6 mt-6">
            {/* Mode Selection */}
            <Card className="p-6">
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Application Mode
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Local Mode</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Data stored locally on your device. No cloud sync.
                      </p>
                    </div>
                    <Switch
                      isSelected={mode === 'local'}
                      onValueChange={(checked) => setMode(checked ? 'local' : 'cloud')}
                      color="primary"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Cloud Mode</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Data synced with Supabase cloud. Accessible from anywhere.
                      </p>
                    </div>
                    <Switch
                      isSelected={mode === 'cloud'}
                      onValueChange={(checked) => setMode(checked ? 'cloud' : 'local')}
                      color="primary"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Theme Selection */}
            <Card className="p-6">
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Palette className="w-5 h-5 inline mr-2" />
                  Theme
                </h3>
                <Select
                  label="Choose theme"
                  selectedKeys={[theme || 'system']}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setTheme(selected);
                  }}
                  className="max-w-xs"
                >
                  <SelectItem key="light">Light</SelectItem>
                  <SelectItem key="dark">Dark</SelectItem>
                  <SelectItem key="system">System</SelectItem>
                </Select>
              </CardBody>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Bell className="w-5 h-5 inline mr-2" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      isSelected={notifications.email}
                      onValueChange={(checked) => 
                        setNotifications({ ...notifications, email: checked })
                      }
                      color="primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Browser push notifications
                      </p>
                    </div>
                    <Switch
                      isSelected={notifications.push}
                      onValueChange={(checked) => 
                        setNotifications({ ...notifications, push: checked })
                      }
                      color="primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Report Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Notify when reports are ready
                      </p>
                    </div>
                    <Switch
                      isSelected={notifications.reports}
                      onValueChange={(checked) => 
                        setNotifications({ ...notifications, reports: checked })
                      }
                      color="primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Automation Alerts</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Notify when automations complete
                      </p>
                    </div>
                    <Switch
                      isSelected={notifications.automations}
                      onValueChange={(checked) => 
                        setNotifications({ ...notifications, automations: checked })
                      }
                      color="primary"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* API Keys Tab */}
        <Tab key="api-keys" title="API Keys">
          <Card className="p-6 mt-6">
            <CardBody className="p-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Key className="w-5 h-5 inline mr-2" />
                API Configuration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Configure your API keys to enable AI features and social media integration.
              </p>

              <div className="space-y-6">
                {/* AI API Keys */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">AI Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="password"
                      label="Gemini API Key"
                      placeholder="Enter your Gemini API key"
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                      description="Get your API key from Google AI Studio"
                    />
                    
                    <Input
                      type="password"
                      label="Nano Banana API Key"
                      placeholder="Enter your Nano Banana API key"
                      value={apiKeys.nanoBanana}
                      onChange={(e) => setApiKeys({ ...apiKeys, nanoBanana: e.target.value })}
                      description="For AI image generation"
                    />
                  </div>
                  
                  {/* Model Configuration Display */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      Current Model Configuration
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Advanced Text Model:</p>
                        <p className="font-mono text-purple-600 dark:text-purple-400">
                          {geminiService.getModelInfo().textModel}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Lite Model:</p>
                        <p className="font-mono text-purple-600 dark:text-purple-400">
                          {geminiService.getModelInfo().liteModel}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Image Model:</p>
                        <p className="font-mono text-purple-600 dark:text-purple-400">
                          {geminiService.getModelInfo().imageModel}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${geminiService.getModelInfo().isConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
                        <p className="text-xs text-gray-500">
                          {geminiService.getModelInfo().isConfigured ? 'API Key Configured' : 'API Key Required'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Zap className="w-4 h-4" />}
                        onClick={handleTestGeminiApi}
                        isLoading={testingApi}
                        isDisabled={!geminiService.getModelInfo().isConfigured}
                      >
                        {testingApi ? 'Testing...' : 'Test API'}
                      </Button>
                    </div>
                    {apiTestResult && (
                      <div className={`mt-3 p-3 rounded-lg ${apiTestResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'}`}>
                        <div className="flex items-start space-x-2">
                          {apiTestResult.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                          ) : (
                            <Shield className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${apiTestResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                              {apiTestResult.success ? '✅ API Connection Successful!' : '❌ API Connection Failed'}
                            </p>
                            <p className={`text-xs mt-1 ${apiTestResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {apiTestResult.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media API Keys */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Social Media Integration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="password"
                      label="Instagram Access Token"
                      placeholder="Enter Instagram access token"
                      value={apiKeys.instagram}
                      onChange={(e) => setApiKeys({ ...apiKeys, instagram: e.target.value })}
                      description="From Instagram Basic Display API"
                    />
                    
                    <Input
                      type="password"
                      label="Facebook Access Token"
                      placeholder="Enter Facebook access token"
                      value={apiKeys.facebook}
                      onChange={(e) => setApiKeys({ ...apiKeys, facebook: e.target.value })}
                      description="From Facebook Graph API"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button color="primary" onClick={handleSaveApiKeys}>
                    Save API Keys
                  </Button>
                </div>
              </div>

              {/* API Setup Instructions */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Setup Instructions
                </h5>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p>• <strong>Gemini API:</strong> Visit Google AI Studio to get your API key</p>
                  <p>• <strong>Instagram:</strong> Create a Facebook Developer account and set up Instagram Basic Display API</p>
                  <p>• <strong>Facebook:</strong> Use Facebook Graph API with appropriate permissions</p>
                  <p>• <strong>Nano Banana:</strong> Contact support for image generation API access</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* Data & Privacy Tab */}
        <Tab key="privacy" title="Data & Privacy">
          <div className="space-y-6 mt-6">
            <Card className="p-6">
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Database className="w-5 h-5 inline mr-2" />
                  Data Management
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Export Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Download all your data in JSON format
                      </p>
                    </div>
                    <Button
                      variant="light"
                      startContent={<Download className="w-4 h-4" />}
                      onClick={handleExportData}
                    >
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Clear Local Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Remove all locally stored data and cache
                      </p>
                    </div>
                    <Button
                      variant="light"
                      color="warning"
                      startContent={<Trash2 className="w-4 h-4" />}
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all local data?')) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="p-6">
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Shield className="w-5 h-5 inline mr-2" />
                  Privacy & Security
                </h3>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Data Storage</h4>
                    <p className="text-sm">
                      In local mode, all data is stored on your device. In cloud mode, data is encrypted and stored securely with Supabase.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">AI Processing</h4>
                    <p className="text-sm">
                      AI processing uses Google's Gemini API. Data sent to AI services is processed according to their privacy policies.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Third-party Integrations</h4>
                    <p className="text-sm">
                      Social media integrations require API tokens that are stored securely and never shared with third parties.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="p-6 border-red-200 dark:border-red-800">
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                  Danger Zone
                </h3>
                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">Delete Account</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    color="danger"
                    variant="light"
                    startContent={<Trash2 className="w-4 h-4" />}
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
