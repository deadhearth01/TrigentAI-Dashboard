'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Progress, Textarea, Switch, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { TrendingUp, Target, Users, Globe, Brain, Download, Edit, Plus, CheckCircle, Clock, AlertCircle, Zap, LineChart } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';
import { localDB } from '@/lib/local-db';
import { useAuthStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { agentThemes } from '@/lib/theme';
import { ProgressIndicator } from '@/components/ui/progress-indicator';

const marketReachColors = {
  local: '#3B82F6',
  regional: '#8B5CF6', 
  national: '#10B981',
  international: '#F59E0B'
};

const strategyStatuses = {
  active: { color: 'success', icon: CheckCircle, label: 'Active' },
  planning: { color: 'warning', icon: Clock, label: 'Planning' },
  research: { color: 'default', icon: AlertCircle, label: 'Research' },
  paused: { color: 'danger', icon: AlertCircle, label: 'Paused' }
};

const growthMetrics = [
  { month: 'Jan', growth: 15.2, revenue: 45000, customers: 1200 },
  { month: 'Feb', growth: 18.5, revenue: 52000, customers: 1350 },
  { month: 'Mar', growth: 22.1, revenue: 58000, customers: 1480 },
  { month: 'Apr', growth: 19.8, revenue: 55000, customers: 1420 },
  { month: 'May', growth: 25.3, revenue: 67000, customers: 1680 },
  { month: 'Jun', growth: 25.8, revenue: 72000, customers: 1850 },
];

export function GXAgent() {
  const [growthData, setGrowthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  const [newStrategy, setNewStrategy] = useState('');
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const { user } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const theme = agentThemes.gx;

  useEffect(() => {
    loadGrowthData();
  }, [user]);

  const loadGrowthData = async () => {
    if (user) {
      setIsLoading(true);
      const data = await localDB.getGrowthData(user.id);
      setGrowthData(data);
      setNewTarget(data.target?.toString() || '');
      setIsLoading(false);
    }
  };

  const updateTarget = async () => {
    if (!newTarget.trim() || !growthData) return;
    
    const updatedData = {
      ...growthData,
      target: parseFloat(newTarget)
    };
    
    await localDB.updateGrowthData(user!.id, updatedData);
    setGrowthData(updatedData);
    setEditTarget(false);
  };

  const addStrategy = async () => {
    if (!newStrategy.trim() || !growthData) return;
    
    const strategy = {
      id: generateId(),
      name: newStrategy,
      status: 'planning',
      progress: 0
    };
    
    const updatedData = {
      ...growthData,
      strategies: [...growthData.strategies, strategy]
    };
    
    await localDB.updateGrowthData(user!.id, updatedData);
    setGrowthData(updatedData);
    setNewStrategy('');
  };

  const updateStrategy = async (strategyId: string, updates: any) => {
    if (!growthData) return;
    
    const updatedStrategies = growthData.strategies.map((strategy: any) =>
      strategy.id === strategyId ? { ...strategy, ...updates } : strategy
    );
    
    const updatedData = {
      ...growthData,
      strategies: updatedStrategies
    };
    
    await localDB.updateGrowthData(user!.id, updatedData);
    setGrowthData(updatedData);
  };

  const generateRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    
    // Simulate AI recommendations generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiRecommendations = [
      'Focus on customer retention - reduce churn by 15% to boost growth',
      'Expand into emerging markets with high growth potential',
      'Invest in digital marketing automation for better ROI',
      'Develop strategic partnerships for market expansion',
      'Optimize pricing strategy based on market analysis'
    ];
    
    const updatedData = {
      ...growthData,
      recommendations: aiRecommendations
    };
    
    await localDB.updateGrowthData(user!.id, updatedData);
    setGrowthData(updatedData);
    setIsGeneratingRecommendations(false);
  };

  const exportGrowthReport = (format: 'csv' | 'pdf') => {
    if (!growthData) return;
    
    if (format === 'csv') {
      const csvData = [
        ['Metric', 'Value'],
        ['Growth Target', `${growthData.target}%`],
        ['Current Growth', `${growthData.current_growth}%`],
        ['Active Strategies', growthData.strategies.filter((s: any) => s.status === 'active').length],
        ['Market Reach - Local', `${growthData.market_reach.local}%`],
        ['Market Reach - Regional', `${growthData.market_reach.regional}%`],
        ['Market Reach - National', `${growthData.market_reach.national}%`],
        ['Market Reach - International', `${growthData.market_reach.international}%`],
      ];
      
      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'growth-report.csv';
      a.click();
    } else {
      console.log('PDF export functionality would be implemented here');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!growthData) return null;

  const marketReachData = Object.entries(growthData.market_reach).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value as number,
    color: marketReachColors[key as keyof typeof marketReachColors]
  }));

  const progressToTarget = (growthData.current_growth / growthData.target) * 100;

  return (
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${theme.primary} flex items-center justify-center`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GX Agent</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Growth Intelligence & Strategic Planning
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="light"
            startContent={<Download className="w-4 h-4" />}
            onClick={() => exportGrowthReport('csv')}
            className={`hover:${theme.background} dark:hover:${theme.dark.background} ${theme.text} dark:${theme.dark.text}`}
          >
            Export CSV
          </Button>
          <Button
            variant="light"
            startContent={<Download className="w-4 h-4" />}
            onClick={() => exportGrowthReport('pdf')}
            className={`hover:${theme.background} dark:hover:${theme.dark.background} ${theme.text} dark:${theme.dark.text}`}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Progress Indicator for Recommendations */}
      <ProgressIndicator 
        isActive={isGeneratingRecommendations}
        title="Generating Growth Recommendations"
        description="Analyzing market data and creating strategic insights..."
        duration={4000}
        color="success"
        onComplete={() => setIsGeneratingRecommendations(false)}
      />

      {/* Growth Target & Current Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardBody className="p-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Growth Target
              </h3>
              <Button
                size="sm"
                variant="light"
                startContent={<Edit className="w-4 h-4" />}
                onClick={() => setEditTarget(!editTarget)}
              >
                Edit
              </Button>
            </div>

            {editTarget ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Enter growth target (%)"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  endContent={<span className="text-gray-500">%</span>}
                />
                <div className="flex space-x-2">
                  <Button size="sm" color="primary" onClick={updateTarget}>
                    Save
                  </Button>
                  <Button size="sm" variant="light" onClick={() => setEditTarget(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {growthData.target}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">Annual Growth Target</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="p-6">
          <CardBody className="p-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Growth Achieved</span>
                  <span className="font-medium">{growthData.current_growth}%</span>
                </div>
                <Progress
                  value={progressToTarget}
                  color={progressToTarget >= 100 ? "success" : progressToTarget >= 75 ? "warning" : "primary"}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {progressToTarget.toFixed(1)}% of target achieved
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    $72k
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    1.8k
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Customers</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Growth Trends Chart */}
      <Card className="p-6">
        <CardBody className="p-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Growth Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={growthMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="growth" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Strategies and Market Reach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Strategies */}
        <Card className="p-6">
          <CardBody className="p-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Growth Strategies
              </h3>
              <Button
                size="sm"
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onClick={onOpen}
              >
                Add Strategy
              </Button>
            </div>

            <div className="space-y-3">
              {growthData.strategies.map((strategy: any) => {
                const StatusIcon = strategyStatuses[strategy.status as keyof typeof strategyStatuses].icon;
                return (
                  <div key={strategy.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {strategy.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="w-4 h-4 text-gray-500" />
                        <select
                          value={strategy.status}
                          onChange={(e) => updateStrategy(strategy.id, { status: e.target.value })}
                          className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                        >
                          <option value="active">Active</option>
                          <option value="planning">Planning</option>
                          <option value="research">Research</option>
                          <option value="paused">Paused</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span>{strategy.progress}%</span>
                      </div>
                      <Progress value={strategy.progress} size="sm" />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={strategy.progress}
                      onChange={(e) => updateStrategy(strategy.id, { progress: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Market Reach */}
        <Card className="p-6">
          <CardBody className="p-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Market Reach Analysis
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={marketReachData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {marketReachData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {marketReachData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="p-6">
        <CardBody className="p-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Recommendations
            </h3>
            <Button
              size="sm"
              color="secondary"
              startContent={<Brain className="w-4 h-4" />}
              onClick={generateRecommendations}
              isLoading={isGeneratingRecommendations}
            >
              {isGeneratingRecommendations ? 'Generating...' : 'Refresh AI Insights'}
            </Button>
          </div>
          
          <div className="space-y-3">
            {growthData.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Add Strategy Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New Growth Strategy</ModalHeader>
              <ModalBody>
                <Textarea
                  placeholder="Enter your growth strategy (e.g., 'Launch referral program to increase customer acquisition')"
                  value={newStrategy}
                  onChange={(e) => setNewStrategy(e.target.value)}
                  minRows={3}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    addStrategy();
                    onClose();
                  }}
                  disabled={!newStrategy.trim()}
                >
                  Add Strategy
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
