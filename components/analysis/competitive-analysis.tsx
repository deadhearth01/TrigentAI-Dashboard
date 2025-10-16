'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Select, SelectItem, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Progress, Tabs, Tab } from '@heroui/react';
import { MapPin, Search, TrendingUp, Building2, Users, DollarSign, Star, Plus, Eye, Download, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { useAuthStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { geminiService } from '@/lib/gemini';

interface Competitor {
  id: string;
  name: string;
  location: string;
  region: string;
  marketShare: number;
  revenue: string;
  employees: string;
  strengths: string[];
  weaknesses: string[];
  rating: number;
  website?: string;
  founded?: string;
}

const regions = [
  { value: 'local', label: 'Local (City/County)' },
  { value: 'regional', label: 'Regional (State/Province)' },
  { value: 'national', label: 'National' },
  { value: 'global', label: 'Global' }
];

export function CompetitiveAnalysis() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({
    region: 'local',
    rating: 3
  });
  const { user } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onOpenChange: onDetailOpenChange } = useDisclosure();

  useEffect(() => {
    loadCompetitors();
  }, [user]);

  const loadCompetitors = () => {
    if (user) {
      const saved = localStorage.getItem(`competitors_${user.id}`);
      if (saved) {
        setCompetitors(JSON.parse(saved));
      } else {
        // Sample data
        const sampleCompetitors: Competitor[] = [
          {
            id: generateId(),
            name: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            region: 'national',
            marketShare: 25,
            revenue: '$50M+',
            employees: '200-500',
            strengths: ['Strong brand', 'Large customer base', 'Innovation'],
            weaknesses: ['High prices', 'Customer service'],
            rating: 4.2,
            website: 'techcorp.com',
            founded: '2015'
          },
          {
            id: generateId(),
            name: 'Local Solutions LLC',
            location: 'Downtown Area',
            region: 'local',
            marketShare: 15,
            revenue: '$5M-10M',
            employees: '50-100',
            strengths: ['Local presence', 'Personalized service'],
            weaknesses: ['Limited resources', 'Small team'],
            rating: 4.0,
            founded: '2018'
          },
          {
            id: generateId(),
            name: 'Global Innovations Ltd',
            location: 'Multiple Locations',
            region: 'global',
            marketShare: 35,
            revenue: '$200M+',
            employees: '1000+',
            strengths: ['Global reach', 'Technology leadership', 'Capital'],
            weaknesses: ['Slow decision making', 'Less flexible'],
            rating: 4.5,
            website: 'globalinnovations.com',
            founded: '2010'
          }
        ];
        setCompetitors(sampleCompetitors);
        saveCompetitors(sampleCompetitors);
      }
    }
  };

  const saveCompetitors = (data: Competitor[]) => {
    if (user) {
      localStorage.setItem(`competitors_${user.id}`, JSON.stringify(data));
      setCompetitors(data);
    }
  };

  const addCompetitor = () => {
    if (!newCompetitor.name || !newCompetitor.location) return;
    
    const competitor: Competitor = {
      id: generateId(),
      name: newCompetitor.name,
      location: newCompetitor.location,
      region: newCompetitor.region || 'local',
      marketShare: newCompetitor.marketShare || 0,
      revenue: newCompetitor.revenue || 'Unknown',
      employees: newCompetitor.employees || 'Unknown',
      strengths: newCompetitor.strengths || [],
      weaknesses: newCompetitor.weaknesses || [],
      rating: newCompetitor.rating || 3,
      website: newCompetitor.website,
      founded: newCompetitor.founded
    };
    
    saveCompetitors([...competitors, competitor]);
    setNewCompetitor({ region: 'local', rating: 3 });
    onOpenChange();
  };

  const viewCompetitor = (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    onDetailOpen();
  };

  const deleteCompetitor = (id: string) => {
    saveCompetitors(competitors.filter(c => c.id !== id));
  };

  const analyzeCompetitors = async () => {
    setIsAnalyzing(true);
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  const filteredCompetitors = competitors.filter(c => {
    const matchesRegion = selectedRegion === 'all' || c.region === selectedRegion;
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const marketShareData = filteredCompetitors.map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    share: c.marketShare
  }));

  const comparisonData = selectedCompetitor ? [
    {
      metric: 'Market Share',
      value: selectedCompetitor.marketShare,
      fullMark: 100
    },
    {
      metric: 'Brand Strength',
      value: selectedCompetitor.rating * 20,
      fullMark: 100
    },
    {
      metric: 'Innovation',
      value: selectedCompetitor.strengths.length * 20,
      fullMark: 100
    },
    {
      metric: 'Customer Base',
      value: Math.random() * 100,
      fullMark: 100
    },
    {
      metric: 'Resources',
      value: Math.random() * 100,
      fullMark: 100
    }
  ] : [];

  const exportAnalysis = () => {
    const csv = [
      ['Name', 'Location', 'Region', 'Market Share', 'Revenue', 'Employees', 'Rating'].join(','),
      ...filteredCompetitors.map(c => 
        [c.name, c.location, c.region, c.marketShare, c.revenue, c.employees, c.rating].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'competitive-analysis.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Competitive Analysis
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Location-based and global competitor intelligence
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onClick={onOpen}
          >
            Add Competitor
          </Button>
          <Button
            variant="light"
            startContent={<Download className="w-4 h-4" />}
            onClick={exportAnalysis}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search competitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="md:w-1/2"
            />
            <div className="flex gap-2">
              {regions.map(region => (
                <Button
                  key={region.value}
                  size="sm"
                  variant={selectedRegion === region.value ? 'solid' : 'light'}
                  color={selectedRegion === region.value ? 'primary' : 'default'}
                  onClick={() => setSelectedRegion(region.value)}
                >
                  {region.label}
                </Button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredCompetitors.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Competitors</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(filteredCompetitors.reduce((sum, c) => sum + c.marketShare, 0))}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Market Share</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(filteredCompetitors.map(c => c.location)).size}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Unique Locations</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(filteredCompetitors.reduce((sum, c) => sum + c.rating, 0) / filteredCompetitors.length || 0).toFixed(1)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Rating</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Market Share Chart */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Market Share Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marketShareData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Market Share (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="share" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Competitors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCompetitors.length === 0 ? (
          <Card className="lg:col-span-2">
            <CardBody className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Competitors Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start tracking your competition by adding competitors
              </p>
              <Button color="primary" onClick={onOpen}>
                Add First Competitor
              </Button>
            </CardBody>
          </Card>
        ) : (
          filteredCompetitors.map(competitor => (
            <Card key={competitor.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {competitor.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{competitor.location}</span>
                    </div>
                  </div>
                  <Chip size="sm" color="primary" variant="flat">
                    {competitor.region}
                  </Chip>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Market Share</span>
                      <span className="font-medium">{competitor.marketShare}%</span>
                    </div>
                    <Progress value={competitor.marketShare} size="sm" color="secondary" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {competitor.revenue}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Employees</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {competitor.employees}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(competitor.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      {competitor.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={() => viewCompetitor(competitor)}
                    startContent={<Eye className="w-4 h-4" />}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    onClick={() => deleteCompetitor(competitor.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Add Competitor Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New Competitor</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    placeholder="Enter company name"
                    value={newCompetitor.name || ''}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                  />
                  <Input
                    label="Location"
                    placeholder="City, State/Country"
                    value={newCompetitor.location || ''}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, location: e.target.value })}
                  />
                  <Select
                    label="Region"
                    selectedKeys={[newCompetitor.region || 'local']}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, region: e.target.value })}
                  >
                    {regions.map(region => (
                      <SelectItem key={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Market Share %"
                    type="number"
                    placeholder="0-100"
                    value={newCompetitor.marketShare?.toString() || ''}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, marketShare: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    label="Revenue"
                    placeholder="e.g., $10M-50M"
                    value={newCompetitor.revenue || ''}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, revenue: e.target.value })}
                  />
                  <Input
                    label="Employees"
                    placeholder="e.g., 50-100"
                    value={newCompetitor.employees || ''}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, employees: e.target.value })}
                  />
                  <Input
                    label="Website"
                    placeholder="example.com"
                    value={newCompetitor.website || ''}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                  />
                  <Input
                    label="Founded Year"
                    placeholder="2020"
                    value={newCompetitor.founded || ''}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, founded: e.target.value })}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    addCompetitor();
                    onClose();
                  }}
                  disabled={!newCompetitor.name || !newCompetitor.location}
                >
                  Add Competitor
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Competitor Detail Modal */}
      {selectedCompetitor && (
        <Modal isOpen={isDetailOpen} onOpenChange={onDetailOpenChange} size="3xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>{selectedCompetitor.name} - Detailed Analysis</ModalHeader>
                <ModalBody>
                  <Tabs>
                    <Tab key="overview" title="Overview">
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                            <p className="font-medium">{selectedCompetitor.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Region</p>
                            <Chip size="sm" color="primary">{selectedCompetitor.region}</Chip>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Market Share</p>
                            <p className="font-medium">{selectedCompetitor.marketShare}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                            <p className="font-medium">{selectedCompetitor.revenue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Employees</p>
                            <p className="font-medium">{selectedCompetitor.employees}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(selectedCompetitor.rating)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab>
                    <Tab key="comparison" title="Comparison">
                      <div className="pt-4">
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={comparisonData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar
                              name={selectedCompetitor.name}
                              dataKey="value"
                              stroke="#8B5CF6"
                              fill="#8B5CF6"
                              fillOpacity={0.6}
                            />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </Tab>
                    <Tab key="swot" title="SWOT">
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {selectedCompetitor.strengths.map((s, i) => (
                              <li key={i} className="text-sm flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                            Weaknesses
                          </h4>
                          <ul className="space-y-1">
                            {selectedCompetitor.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm flex items-start">
                                <span className="text-red-500 mr-2">×</span>
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Tab>
                  </Tabs>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
