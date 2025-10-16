'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Progress, Chip, Tabs, Tab } from '@heroui/react';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Bot, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Building2,
  Newspaper,
  Zap,
  Users,
  Globe,
  Shield,
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import { useAuthStore, useAppStore } from '@/lib/store';

const revenueData = [
  { month: 'Jan', revenue: 4000, growth: 10, expenses: 2400 },
  { month: 'Feb', revenue: 4200, growth: 5, expenses: 2500 },
  { month: 'Mar', revenue: 5100, growth: 21, expenses: 2800 },
  { month: 'Apr', revenue: 5780, growth: 13, expenses: 2900 },
  { month: 'May', revenue: 6890, growth: 19, expenses: 3200 },
  { month: 'Jun', revenue: 7390, growth: 7, expenses: 3300 },
  { month: 'Jul', revenue: 8490, growth: 15, expenses: 3500 },
];

const agentUsage = [
  { name: 'BI Agent', value: 45, color: '#3B82F6', tasks: 156 },
  { name: 'AI Agent', value: 30, color: '#8B5CF6', tasks: 104 },
  { name: 'GX Agent', value: 25, color: '#10B981', tasks: 87 },
];

const competitorData = [
  { name: 'Your Company', share: 28, color: '#3B82F6' },
  { name: 'Competitor A', share: 35, color: '#EF4444' },
  { name: 'Competitor B', share: 22, color: '#F59E0B' },
  { name: 'Others', share: 15, color: '#6B7280' },
];

const activities = [
  { id: '1', action: 'SWOT Analysis Completed', agent: 'Strategic Planning', time: '1 hour ago', status: 'completed', type: 'success' },
  { id: '2', action: 'Competitor Report Generated', agent: 'Competitive Analysis', time: '2 hours ago', status: 'completed', type: 'success' },
  { id: '3', action: 'Automated Email Campaign', agent: 'AI Agent', time: '4 hours ago', status: 'completed', type: 'success' },
  { id: '4', action: 'Growth Strategy Update', agent: 'GX Agent', time: '6 hours ago', status: 'completed', type: 'success' },
  { id: '5', action: 'News Feed Updated', agent: 'News Feed', time: '8 hours ago', status: 'completed', type: 'info' },
];

export function DashboardOverview() {
  const { user } = useAuthStore();
  const { setActiveAgent } = useAppStore();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const [kpis, setKpis] = useState({
    revenue: 72390,
    revenueGrowth: 15.2,
    automations: 347,
    automationsGrowth: 12.8,
    growth: 28.5,
    growthGrowth: 5.3,
    efficiency: 92,
    efficiencyGrowth: 3.1,
    competitors: 8,
    swotItems: 24,
    newsArticles: 156
  });

  const handleQuickAction = (agent: string) => {
    setActiveAgent(agent);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Chip color="success" variant="flat" size="sm" startContent={<Clock className="w-3 h-3 sm:w-4 sm:h-4" />}>
            <span className="text-xs sm:text-sm">Real-time</span>
          </Chip>
          <Chip color="primary" variant="flat" size="sm" className="hidden sm:flex">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Chip>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700">
          <CardBody className="p-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  ${kpis.revenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-semibold ml-1">
                  +{kpis.revenueGrowth}%
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">vs last month</span>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700">
          <CardBody className="p-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Active Automations</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {kpis.automations}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold ml-1">
                  +{kpis.automationsGrowth}%
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">this week</span>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-2 border-purple-200 dark:border-purple-700">
          <CardBody className="p-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Growth Rate</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {kpis.growth}%
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                <span className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-semibold ml-1">
                  +{kpis.growthGrowth}%
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">vs target</span>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-700">
          <CardBody className="p-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Efficiency Score</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {kpis.efficiency}%
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-semibold ml-1">
                  +{kpis.efficiencyGrowth}%
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">improved</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickAction('competitive')}>
          <CardBody className="p-0 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{kpis.competitors}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Competitors Tracked</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </CardBody>
        </Card>

        <Card className="p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickAction('swot')}>
          <CardBody className="p-0 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{kpis.swotItems}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">SWOT Items</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </CardBody>
        </Card>

        <Card className="p-3 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickAction('news')}>
          <CardBody className="p-0 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{kpis.newsArticles}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">News Articles</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </CardBody>
        </Card>
      </div>

      <Tabs 
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        aria-label="Dashboard tabs"
        className="w-full"
        classNames={{
          tabList: "bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm",
          tab: "text-xs sm:text-sm"
        }}
      >
        <Tab key="overview" title="Overview">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
            {/* Revenue Trend Chart */}
            <Card className="lg:col-span-2 p-4 sm:p-6">
              <CardBody className="p-0">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Revenue & Expenses Trend
                  </h3>
                  <Chip size="sm" color="success" variant="flat">
                    <span className="flex items-center text-xs">
                      <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      +15.2%
                    </span>
                  </Chip>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" tick={{fontSize: 12}} />
                    <YAxis stroke="#6B7280" tick={{fontSize: 12}} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: '12px'}} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      fillOpacity={1}
                      fill="url(#colorRevenue)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#EF4444" 
                      fillOpacity={1}
                      fill="url(#colorExpenses)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardBody className="p-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Quick Actions
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <Button 
                    className="w-full justify-start h-10 sm:h-12 font-medium text-sm sm:text-base"
                    variant="flat"
                    color="primary"
                    startContent={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={() => handleQuickAction('bi-agent')}
                  >
                    Analyze Data
                  </Button>
                  <Button 
                    className="w-full justify-start h-10 sm:h-12 font-medium text-sm sm:text-base"
                    variant="flat"
                    color="secondary"
                    startContent={<Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={() => handleQuickAction('ai-agent')}
                  >
                    Create Automation
                  </Button>
                  <Button 
                    className="w-full justify-start h-10 sm:h-12 font-medium text-sm sm:text-base"
                    variant="flat"
                    color="success"
                    startContent={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={() => handleQuickAction('gx-agent')}
                  >
                    Growth Strategy
                  </Button>
                  <Button 
                    className="w-full justify-start h-10 sm:h-12 font-medium text-sm sm:text-base"
                    variant="flat"
                    color="warning"
                    startContent={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={() => handleQuickAction('swot')}
                  >
                    SWOT Analysis
                  </Button>
                  <Button 
                    className="w-full justify-start h-10 sm:h-12 font-medium text-sm sm:text-base"
                    variant="flat"
                    color="danger"
                    startContent={<Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={() => handleQuickAction('competitive')}
                  >
                    View Competitors
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="analytics" title="Analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            {/* Agent Usage */}
            <Card className="p-4 sm:p-6">
              <CardBody className="p-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Agent Usage Distribution
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={agentUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {agentUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 sm:mt-4 space-y-2">
                  {agentUsage.map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" 
                          style={{ backgroundColor: agent.color }}
                        />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {agent.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {agent.value}%
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {agent.tasks} tasks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Market Share */}
            <Card className="p-4 sm:p-6">
              <CardBody className="p-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Market Share Analysis
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={competitorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} tick={{fontSize: 10}} />
                    <YAxis tick={{fontSize: 10}} />
                    <Tooltip />
                    <Bar dataKey="share" radius={[8, 8, 0, 0]}>
                      {competitorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 sm:mt-4 flex items-center justify-center">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onClick={() => handleQuickAction('competitive')}
                    className="text-xs sm:text-sm"
                  >
                    View Full Analysis
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="activity" title="Activity">
          {/* Recent Activity */}
          <Card className="p-4 sm:p-6 mt-4 sm:mt-6">
            <CardBody className="p-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Recent Activity Feed
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                        activity.type === 'success' ? 'bg-green-500' : 
                        activity.type === 'info' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.action}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                          {activity.agent} • {activity.time}
                        </p>
                      </div>
                    </div>
                    <Chip 
                      size="sm" 
                      color="success"
                      variant="flat"
                      className="text-[10px] sm:text-xs flex-shrink-0"
                    >
                      {activity.status}
                    </Chip>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700">
          <CardBody className="p-0">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">SWOT Analysis</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Strategic analysis with AI-powered insights for your business
            </p>
            <Button 
              size="sm" 
              color="success" 
              variant="flat"
              onClick={() => handleQuickAction('swot')}
              endContent={<ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              className="text-xs sm:text-sm"
            >
              Start Analysis
            </Button>
          </CardBody>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-700">
          <CardBody className="p-0">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Competitor Tracking</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Monitor competitors from local to global markets
            </p>
            <Button 
              size="sm" 
              color="danger" 
              variant="flat"
              onClick={() => handleQuickAction('competitive')}
              endContent={<ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              className="text-xs sm:text-sm"
            >
              Track Now
            </Button>
          </CardBody>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700">
          <CardBody className="p-0">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <Newspaper className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Industry News</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Stay updated with latest industry trends and competitor news
            </p>
            <Button 
              size="sm" 
              color="primary" 
              variant="flat"
              onClick={() => handleQuickAction('news')}
              endContent={<ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              className="text-xs sm:text-sm"
            >
              Read News
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
