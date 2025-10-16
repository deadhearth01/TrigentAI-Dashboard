'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Tabs, Tab } from '@heroui/react';
import { Shield, AlertTriangle, Target, Zap, Plus, Edit, Trash2, Download, Save, TrendingUp } from 'lucide-react';
import { localDB } from '@/lib/local-db';
import { useAuthStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { agentThemes } from '@/lib/theme';
import { geminiService } from '@/lib/gemini';

interface SWOTItem {
  id: string;
  text: string;
  priority?: 'high' | 'medium' | 'low';
}

interface SWOTData {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

const categories = [
  { key: 'strengths', label: 'Strengths', icon: Shield, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-700' },
  { key: 'weaknesses', label: 'Weaknesses', icon: AlertTriangle, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-700' },
  { key: 'opportunities', label: 'Opportunities', icon: Target, color: 'from-blue-500 to-cyan-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-700' },
  { key: 'threats', label: 'Threats', icon: Zap, color: 'from-orange-500 to-amber-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-700' },
];

const priorityColors: { [key: string]: "default" | "primary" | "secondary" | "success" | "warning" | "danger" } = {
  high: 'danger',
  medium: 'warning',
  low: 'default'
};

export function SWOTAnalysis() {
  const [swotData, setSWOTData] = useState<SWOTData>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('strengths');
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState<{ category: string; item: SWOTItem } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyInfo, setCompanyInfo] = useState('');
  const { user, currentWorkspace } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isAIOpen, onOpen: onAIOpen, onOpenChange: onAIOpenChange } = useDisclosure();
  const theme = agentThemes.bi;

  useEffect(() => {
    loadSWOTData();
  }, [user]);

  const loadSWOTData = async () => {
    if (user) {
      const savedData = localStorage.getItem(`swot_${user.id}`);
      if (savedData) {
        setSWOTData(JSON.parse(savedData));
      }
    }
  };

  const saveSWOTData = async (data: SWOTData) => {
    if (user) {
      localStorage.setItem(`swot_${user.id}`, JSON.stringify(data));
      setSWOTData(data);
    }
  };

  const addItem = (category: string) => {
    if (!newItem.trim()) return;
    
    const updatedData = {
      ...swotData,
      [category]: [
        ...swotData[category as keyof SWOTData],
        { id: generateId(), text: newItem, priority: 'medium' }
      ]
    };
    
    saveSWOTData(updatedData);
    setNewItem('');
  };

  const updateItem = (category: string, itemId: string, updates: Partial<SWOTItem>) => {
    const updatedData = {
      ...swotData,
      [category]: swotData[category as keyof SWOTData].map((item: SWOTItem) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    };
    saveSWOTData(updatedData);
    setEditingItem(null);
  };

  const deleteItem = (category: string, itemId: string) => {
    const updatedData = {
      ...swotData,
      [category]: swotData[category as keyof SWOTData].filter((item: SWOTItem) => item.id !== itemId)
    };
    saveSWOTData(updatedData);
  };

  const generateAISWOT = async () => {
    if (!companyInfo.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const prompt = `
Perform a comprehensive SWOT analysis for the following company/business:

"${companyInfo}"

${currentWorkspace?.ai_instructions ? `Additional context: ${currentWorkspace.ai_instructions}` : ''}

Please respond with a JSON object in this exact format:
{
  "strengths": [
    { "id": "s1", "text": "Strength item", "priority": "high|medium|low" }
  ],
  "weaknesses": [
    { "id": "w1", "text": "Weakness item", "priority": "high|medium|low" }
  ],
  "opportunities": [
    { "id": "o1", "text": "Opportunity item", "priority": "high|medium|low" }
  ],
  "threats": [
    { "id": "t1", "text": "Threat item", "priority": "high|medium|low" }
  ]
}

Provide 4-6 items for each category. Be specific, actionable, and relevant to the business.
`;

      const response = await geminiService.generateText(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        saveSWOTData(aiData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('AI SWOT generation error:', error);
      // Fallback to sample data
      const fallbackData: SWOTData = {
        strengths: [
          { id: generateId(), text: 'Strong brand recognition', priority: 'high' },
          { id: generateId(), text: 'Experienced leadership team', priority: 'high' },
          { id: generateId(), text: 'Innovative product line', priority: 'medium' },
          { id: generateId(), text: 'Strong customer loyalty', priority: 'medium' }
        ],
        weaknesses: [
          { id: generateId(), text: 'Limited market reach', priority: 'high' },
          { id: generateId(), text: 'High operational costs', priority: 'medium' },
          { id: generateId(), text: 'Dependency on few suppliers', priority: 'medium' },
          { id: generateId(), text: 'Limited digital presence', priority: 'low' }
        ],
        opportunities: [
          { id: generateId(), text: 'Emerging markets expansion', priority: 'high' },
          { id: generateId(), text: 'Digital transformation', priority: 'high' },
          { id: generateId(), text: 'Strategic partnerships', priority: 'medium' },
          { id: generateId(), text: 'Product diversification', priority: 'medium' }
        ],
        threats: [
          { id: generateId(), text: 'Increasing competition', priority: 'high' },
          { id: generateId(), text: 'Economic uncertainty', priority: 'medium' },
          { id: generateId(), text: 'Regulatory changes', priority: 'medium' },
          { id: generateId(), text: 'Technological disruption', priority: 'low' }
        ]
      };
      saveSWOTData(fallbackData);
    }
    
    setIsGenerating(false);
    onAIOpenChange();
  };

  const exportSWOT = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      let csv = 'Category,Item,Priority\n';
      categories.forEach(cat => {
        swotData[cat.key as keyof SWOTData].forEach((item: SWOTItem) => {
          csv += `${cat.label},"${item.text}",${item.priority}\n`;
        });
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'swot-analysis.csv';
      a.click();
    }
  };

  const getTotalItems = () => {
    return categories.reduce((total, cat) => 
      total + swotData[cat.key as keyof SWOTData].length, 0
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${theme.primary} flex items-center justify-center`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SWOT Analysis</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Strategic analysis of Strengths, Weaknesses, Opportunities, and Threats
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            color="secondary"
            variant="flat"
            startContent={<Zap className="w-4 h-4" />}
            onClick={onAIOpen}
          >
            AI Generate
          </Button>
          <Button
            variant="light"
            startContent={<Download className="w-4 h-4" />}
            onClick={() => exportSWOT('csv')}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(cat => {
          const Icon = cat.icon;
          const count = swotData[cat.key as keyof SWOTData].length;
          return (
            <Card key={cat.key} className={`${cat.bgColor} border ${cat.borderColor}`}>
              <CardBody className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${cat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{cat.label}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* SWOT Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map(cat => {
          const Icon = cat.icon;
          const items = swotData[cat.key as keyof SWOTData];
          
          return (
            <Card key={cat.key} className={`${cat.bgColor} border-2 ${cat.borderColor}`}>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${cat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cat.label}
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    isIconOnly
                    variant="flat"
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      onOpen();
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No items added yet</p>
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => {
                          setSelectedCategory(cat.key);
                          onOpen();
                        }}
                        className="mt-2"
                      >
                        Add {cat.label.slice(0, -1)}
                      </Button>
                    </div>
                  ) : (
                    items.map((item: SWOTItem) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1 flex items-start space-x-2">
                          <div className="mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              item.priority === 'high' ? 'bg-red-500' :
                              item.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`} />
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                            {item.text}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Chip size="sm" color={priorityColors[item.priority || 'medium']} variant="flat">
                            {item.priority}
                          </Chip>
                          <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            onClick={() => setEditingItem({ category: cat.key, item })}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            color="danger"
                            onClick={() => deleteItem(cat.key, item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Add {categories.find(c => c.key === selectedCategory)?.label.slice(0, -1)}
              </ModalHeader>
              <ModalBody>
                <Textarea
                  placeholder="Enter item description..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
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
                    addItem(selectedCategory);
                    onClose();
                  }}
                  disabled={!newItem.trim()}
                >
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* AI Generation Modal */}
      <Modal isOpen={isAIOpen} onOpenChange={onAIOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>AI-Powered SWOT Analysis</ModalHeader>
              <ModalBody>
                <Textarea
                  label="Company/Business Description"
                  placeholder="Describe your company, products, market position, etc..."
                  value={companyInfo}
                  onChange={(e) => setCompanyInfo(e.target.value)}
                  minRows={5}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Provide details about your business to generate a comprehensive SWOT analysis using AI.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="secondary"
                  onPress={generateAISWOT}
                  isLoading={isGenerating}
                  disabled={!companyInfo.trim() || isGenerating}
                  startContent={!isGenerating && <Zap className="w-4 h-4" />}
                >
                  {isGenerating ? 'Generating...' : 'Generate SWOT'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Item Modal */}
      {editingItem && (
        <Modal isOpen={true} onOpenChange={() => setEditingItem(null)}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Edit Item</ModalHeader>
                <ModalBody>
                  <Textarea
                    value={editingItem.item.text}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, text: e.target.value }
                    })}
                    minRows={3}
                  />
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      color={editingItem.item.priority === 'high' ? 'danger' : 'default'}
                      onClick={() => setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, priority: 'high' }
                      })}
                    >
                      High Priority
                    </Button>
                    <Button
                      size="sm"
                      color={editingItem.item.priority === 'medium' ? 'warning' : 'default'}
                      onClick={() => setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, priority: 'medium' }
                      })}
                    >
                      Medium
                    </Button>
                    <Button
                      size="sm"
                      color={editingItem.item.priority === 'low' ? 'default' : 'default'}
                      onClick={() => setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, priority: 'low' }
                      })}
                    >
                      Low
                    </Button>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      updateItem(editingItem.category, editingItem.item.id, {
                        text: editingItem.item.text,
                        priority: editingItem.item.priority
                      });
                    }}
                  >
                    Save
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
