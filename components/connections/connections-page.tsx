'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Switch, Badge, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input } from '@heroui/react';
import { Link as LinkIcon, CheckCircle, AlertCircle, Settings, Plus, RefreshCw } from 'lucide-react';

const availableConnections = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect Gmail for email automation and analytics',
    icon: '📧',
    category: 'Email',
    status: 'disconnected',
    setupInstructions: [
      'Go to Google Cloud Console',
      'Enable Gmail API',
      'Create OAuth 2.0 credentials',
      'Add your domain to authorized origins'
    ],
    requiredFields: [
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' }
    ]
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync with Notion for documentation and project management',
    icon: '📝',
    category: 'Productivity',
    status: 'disconnected',
    setupInstructions: [
      'Go to Notion Developers',
      'Create a new integration',
      'Get your integration token',
      'Share your Notion pages with the integration'
    ],
    requiredFields: [
      { key: 'api_key', label: 'Integration Token', type: 'password' }
    ]
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Integrate with Trello for task and project management',
    icon: '📋',
    category: 'Project Management',
    status: 'disconnected',
    setupInstructions: [
      'Visit Trello Developer Portal',
      'Get your API Key',
      'Generate a Token',
      'Note your board IDs for integration'
    ],
    requiredFields: [
      { key: 'api_key', label: 'API Key', type: 'text' },
      { key: 'token', label: 'Token', type: 'password' }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and updates to Slack channels',
    icon: '💬',
    category: 'Communication',
    status: 'disconnected',
    setupInstructions: [
      'Create a Slack App',
      'Add OAuth permissions',
      'Install app to workspace',
      'Get OAuth access token'
    ],
    requiredFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'text' }
    ]
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect to Salesforce CRM for customer data sync',
    icon: '🏢',
    category: 'CRM',
    status: 'disconnected',
    setupInstructions: [
      'Create Connected App in Salesforce',
      'Enable OAuth settings',
      'Get Consumer Key and Secret',
      'Set up appropriate permissions'
    ],
    requiredFields: [
      { key: 'consumer_key', label: 'Consumer Key', type: 'text' },
      { key: 'consumer_secret', label: 'Consumer Secret', type: 'password' },
      { key: 'username', label: 'Username', type: 'text' },
      { key: 'password', label: 'Password + Security Token', type: 'password' }
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Integrate with Shopify for e-commerce analytics',
    icon: '🛒',
    category: 'E-commerce',
    status: 'disconnected',
    setupInstructions: [
      'Go to Shopify Partners',
      'Create a new app',
      'Get API credentials',
      'Install app on your store'
    ],
    requiredFields: [
      { key: 'store_url', label: 'Store URL', type: 'text' },
      { key: 'access_token', label: 'Access Token', type: 'password' }
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connect HubSpot for marketing automation and CRM',
    icon: '🎯',
    category: 'Marketing',
    status: 'disconnected',
    setupInstructions: [
      'Go to HubSpot Developer Portal',
      'Create a private app',
      'Configure scopes and permissions',
      'Generate access token'
    ],
    requiredFields: [
      { key: 'access_token', label: 'Private App Access Token', type: 'password' }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Connect Stripe for payment and revenue analytics',
    icon: '💳',
    category: 'Payments',
    status: 'disconnected',
    setupInstructions: [
      'Log in to Stripe Dashboard',
      'Go to Developers > API Keys',
      'Copy your publishable and secret keys',
      'Enable webhooks if needed'
    ],
    requiredFields: [
      { key: 'publishable_key', label: 'Publishable Key', type: 'text' },
      { key: 'secret_key', label: 'Secret Key', type: 'password' }
    ]
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with Zapier for advanced automation workflows',
    icon: '⚡',
    category: 'Automation',
    status: 'disconnected',
    setupInstructions: [
      'Create a Zapier webhook',
      'Get the webhook URL',
      'Configure trigger conditions',
      'Test the connection'
    ],
    requiredFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'text' }
    ]
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Sync data with Airtable for flexible database management',
    icon: '🗃️',
    category: 'Database',
    status: 'disconnected',
    setupInstructions: [
      'Go to Airtable account settings',
      'Generate API key',
      'Find your base ID',
      'Set up appropriate permissions'
    ],
    requiredFields: [
      { key: 'api_key', label: 'API Key', type: 'password' },
      { key: 'base_id', label: 'Base ID', type: 'text' }
    ]
  }
];

export function ConnectionsPage() {
  const [connections, setConnections] = useState(availableConnections);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [connectionData, setConnectionData] = useState<any>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const categories = [...new Set(connections.map(conn => conn.category))];

  const handleConnect = (connection: any) => {
    setSelectedConnection(connection);
    setConnectionData({});
    onOpen();
  };

  const handleSaveConnection = async () => {
    if (!selectedConnection) return;
    
    setIsConnecting(true);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update connection status
    setConnections(prev => prev.map(conn => 
      conn.id === selectedConnection.id 
        ? { ...conn, status: 'connected', credentials: connectionData }
        : conn
    ));
    
    setIsConnecting(false);
    onOpenChange();
  };

  const handleDisconnect = (connectionId: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'disconnected', credentials: undefined }
          : conn
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'error': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'error': return AlertCircle;
      default: return LinkIcon;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Connections</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect TrigentAI with your favorite business tools and services
          </p>
        </div>
        <Button
          color="primary"
          startContent={<RefreshCw className="w-4 h-4" />}
          onClick={() => {
            // Refresh connections status
            console.log('Refreshing connections...');
          }}
        >
          Refresh Status
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <CardBody className="p-0 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {connections.filter(c => c.status === 'connected').length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
          </CardBody>
        </Card>
        <Card className="p-4">
          <CardBody className="p-0 text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {connections.filter(c => c.status === 'disconnected').length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
          </CardBody>
        </Card>
        <Card className="p-4">
          <CardBody className="p-0 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {categories.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
          </CardBody>
        </Card>
        <Card className="p-4">
          <CardBody className="p-0 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {connections.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          </CardBody>
        </Card>
      </div>

      {/* Connections by Category */}
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {category}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections
              .filter(conn => conn.category === category)
              .map((connection) => {
                const StatusIcon = getStatusIcon(connection.status);
                return (
                  <Card key={connection.id} className="p-6 hover:shadow-lg transition-shadow">
                    <CardBody className="p-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{connection.icon}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {connection.name}
                            </h3>
                            <div className="flex items-center space-x-1">
                              <StatusIcon className="w-3 h-3" />
                              <Badge
                                color={getStatusColor(connection.status)}
                                variant="flat"
                                size="sm"
                              >
                                {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {connection.description}
                      </p>
                      
                      <div className="flex space-x-2">
                        {connection.status === 'connected' ? (
                          <>
                            <Button
                              size="sm"
                              variant="light"
                              startContent={<Settings className="w-4 h-4" />}
                              onClick={() => handleConnect(connection)}
                            >
                              Configure
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              onClick={() => handleDisconnect(connection.id)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            color="primary"
                            startContent={<Plus className="w-4 h-4" />}
                            onClick={() => handleConnect(connection)}
                            className="w-full"
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}

      {/* Connection Setup Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedConnection?.icon}</span>
                  <div>
                    <h3>Connect {selectedConnection?.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      {selectedConnection?.description}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  {/* Setup Instructions */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Setup Instructions
                    </h4>
                    <ol className="space-y-2">
                      {selectedConnection?.setupInstructions.map((step: string, index: number) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Configuration Fields */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Configuration
                    </h4>
                    <div className="space-y-4">
                      {selectedConnection?.requiredFields.map((field: any) => (
                        <Input
                          key={field.key}
                          type={field.type}
                          label={field.label}
                          placeholder={`Enter your ${field.label.toLowerCase()}`}
                          value={connectionData[field.key] || ''}
                          onChange={(e) => setConnectionData({
                            ...connectionData,
                            [field.key]: e.target.value
                          })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveConnection}
                  isLoading={isConnecting}
                  disabled={
                    isConnecting || 
                    !selectedConnection?.requiredFields.every((field: any) => 
                      connectionData[field.key]?.trim()
                    )
                  }
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
