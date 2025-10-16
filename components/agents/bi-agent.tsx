'use client';

import { useState, useCallback } from 'react';
import { Card, CardBody, Button, Input, Spinner, Tabs, Tab, CircularProgress } from '@heroui/react';
import { Upload, FileText, Download, BarChart3, Trash2, Eye, Search, Database, TrendingUp, PieChart } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { localDB } from '@/lib/local-db';
import { useAuthStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { agentThemes } from '@/lib/theme';
import { ProgressIndicator } from '@/components/ui/progress-indicator';

const samplePrompts = [
  "Show me revenue trend for last 6 months",
  "Compare customer churn rate vs acquisition rate",
  "What are the top 3 performing products?",
  "Analyze sales performance by region",
  "Generate monthly growth report"
];

const sampleData = [
  { month: 'Jan', revenue: 4000, sales: 240, customers: 140 },
  { month: 'Feb', revenue: 3000, sales: 139, customers: 120 },
  { month: 'Mar', revenue: 2000, sales: 980, customers: 160 },
  { month: 'Apr', revenue: 2780, sales: 390, customers: 180 },
  { month: 'May', revenue: 1890, sales: 480, customers: 190 },
  { month: 'Jun', revenue: 2390, sales: 380, customers: 200 },
];

export function BIAgent() {
  const [files, setFiles] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const { user } = useAuthStore();
  const theme = agentThemes.bi;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploaded'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);

    // Simulate saving to local DB
    for (const fileData of newFiles) {
      await localDB.createUpload({
        user_id: user?.id,
        file_url: fileData.name, // In real app, this would be a URL
        type: fileData.type.includes('csv') ? 'csv' : 
              fileData.type.includes('sheet') ? 'excel' : 'pdf',
        name: fileData.name,
        size: fileData.size
      });
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf']
    }
  });

  const analyzeData = async (prompt?: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAnalysis = {
      summary: prompt || query || "Revenue analysis shows positive growth trend with 15% increase over the last quarter. Customer acquisition is up 12% while churn rate decreased by 3%.",
      insights: [
        "Q4 revenue increased by 25% compared to Q3",
        "Customer satisfaction improved by 18%",
        "Top performing product category: Electronics (45% of total sales)"
      ],
      recommendations: [
        "Focus marketing efforts on the electronics category",
        "Implement customer retention programs",
        "Expand into emerging markets"
      ],
      data: sampleData,
      charts: {
        revenue: sampleData,
        trends: sampleData
      }
    };
    
    setAnalysis(mockAnalysis);
    
    // Save report to local DB
    const report = await localDB.createReport({
      user_id: user?.id,
      agent: 'BI',
      content: JSON.stringify(mockAnalysis),
      title: prompt || query || 'Revenue Analysis Report'
    });
    
    setReports(prev => [report, ...prev]);
    setIsAnalyzing(false);
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    if (!analysis) return;
    
    if (format === 'csv') {
      const csv = analysis.data.map((row: any) => Object.values(row).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bi-report.csv';
      a.click();
    } else {
      // For PDF export, you would use jsPDF here
      console.log('PDF export functionality would be implemented here');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${theme.primary} flex items-center justify-center`}>
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BI Agent</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Business Intelligence & Data Analysis
          </p>
        </div>
      </div>

      {/* Progress Indicator for Analysis */}
      <ProgressIndicator 
        isActive={isAnalyzing}
        title="Analyzing Data"
        description="Processing your data and generating insights..."
        duration={3000}
        color="primary"
        onComplete={() => setIsAnalyzing(false)}
      />

      <Tabs aria-label="BI Agent Options" className="w-full"
        classNames={{
          tabList: `bg-gradient-to-r ${theme.secondary} dark:${theme.dark.secondary} p-1 rounded-lg`,
          tab: "data-[selected=true]:text-white",
          tabContent: `data-[selected=true]:bg-gradient-to-r data-[selected=true]:${theme.primary} text-gray-600 dark:text-gray-400`,
        }}
      >
        <Tab key="upload" title={
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Data Upload & Analysis</span>
          </div>
        }>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* File Upload */}
            <Card className={`p-6 border ${theme.border} dark:${theme.dark.border} ${theme.background} dark:${theme.dark.background}`}>
              <CardBody className="p-0">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className={`w-5 h-5 ${theme.icon} dark:${theme.dark.icon}`} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upload Data Files
                  </h3>
                </div>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? `border-blue-500 ${theme.background} dark:${theme.dark.background}` 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  {isDragActive ? (
                    <p className={`${theme.text} dark:${theme.dark.text}`}>Drop the files here...</p>
                  ) : (
                    <>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Drag & drop files here, or click to select
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Supports CSV, Excel, and PDF files
                      </p>
                    </>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Uploaded Files</h4>
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Query Interface */}
            <Card className="p-6">
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Ask Questions
                </h3>
                
                <div className="space-y-4">
                  <Input
                    placeholder="What insights would you like from your data?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    startContent={<Search className="w-4 h-4 text-gray-400" />}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeData()}
                  />
                  
                  <Button
                    color="primary"
                    onClick={() => analyzeData()}
                    isLoading={isAnalyzing}
                    disabled={isAnalyzing}
                    className="w-full"
                    startContent={!isAnalyzing && <BarChart3 className="w-4 h-4" />}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
                  </Button>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Quick Prompts
                  </h4>
                  <div className="space-y-2">
                    {samplePrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="light"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => analyzeData(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="results" title="Analysis Results">
          <div className="mt-6">
            {isAnalyzing && (
              <Card className="p-8">
                <CardBody className="p-0 text-center">
                  <Spinner size="lg" />
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    Analyzing your data with AI...
                  </p>
                </CardBody>
              </Card>
            )}

            {analysis && !isAnalyzing && (
              <div className="space-y-6">
                {/* Summary */}
                <Card className="p-6">
                  <CardBody className="p-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Analysis Summary
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => exportReport('csv')}
                          startContent={<Download className="w-4 h-4" />}
                        >
                          Export CSV
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => exportReport('pdf')}
                          startContent={<Download className="w-4 h-4" />}
                        >
                          Export PDF
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{analysis.summary}</p>
                  </CardBody>
                </Card>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <CardBody className="p-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analysis.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="revenue" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <Card className="p-6">
                    <CardBody className="p-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Growth</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analysis.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="customers" stroke="#10B981" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>
                </div>

                {/* Insights and Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <CardBody className="p-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h4>
                      <ul className="space-y-2">
                        {analysis.insights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-400">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>

                  <Card className="p-6">
                    <CardBody className="p-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h4>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-400">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {!analysis && !isAnalyzing && (
              <Card className="p-8">
                <CardBody className="p-0 text-center">
                  <BarChart3 className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload data files and ask questions to get started with AI-powered insights.
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
