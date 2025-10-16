'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Textarea, Switch, Tabs, Tab, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Alert, CircularProgress } from '@heroui/react';
import { Play, Pause, Settings, Copy, Image, RefreshCw, Send, Zap, Bot, Sparkles, Camera, Share2, Download, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { localDB } from '@/lib/local-db';
import { useAuthStore } from '@/lib/store';
import { agentThemes } from '@/lib/theme';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { geminiService } from '@/lib/gemini';
import { imageService } from '@/lib/image-generation';
import { imagenService } from '@/lib/imagen';

const workflowTemplates = [
  {
    id: '1',
    name: 'Email Marketing Campaign',
    description: 'Automated email sequences for customer engagement',
    steps: ['Create email content', 'Segment audience', 'Schedule sending', 'Track performance']
  },
  {
    id: '2',
    name: 'Customer Onboarding',
    description: 'Welcome new customers with automated workflow',
    steps: ['Send welcome email', 'Create account setup', 'Schedule follow-ups', 'Collect feedback']
  },
  {
    id: '3',
    name: 'Report Generation',
    description: 'Automatically generate and distribute reports',
    steps: ['Collect data', 'Generate report', 'Format document', 'Send to stakeholders']
  }
];

export function AIAgent() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [workflowInput, setWorkflowInput] = useState('');
  const [socialTopic, setSocialTopic] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentImageGeneration, setCurrentImageGeneration] = useState<string | null>(null);
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const { user, currentWorkspace } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const theme = agentThemes.ai;

  useEffect(() => {
    loadAutomations();
    loadSocialPosts();
  }, [user]);

  const loadAutomations = async () => {
    if (user) {
      const userAutomations = await localDB.getAutomations(user.id);
      setAutomations(userAutomations);
    }
  };

  const loadSocialPosts = async () => {
    if (user) {
      const posts = await localDB.getSocialPosts(user.id);
      setGeneratedPosts(posts);
    }
  };

  const generateWorkflow = async (template?: any) => {
    setIsGeneratingWorkflow(true);
    
    const description = template?.description || workflowInput || 'Custom Workflow';
    
    try {
      // Use Gemini API to generate detailed workflow with workspace context
      const workflowData = await geminiService.generateWorkflow(
        description, 
        currentWorkspace?.ai_instructions
      );
      
      const automation = await localDB.createAutomation({
        user_id: user?.id,
        name: workflowData.name,
        description: workflowData.description,
        steps: workflowData.steps.map((step: any) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          type: step.type,
          estimated_time: step.estimated_time,
          requirements: step.requirements
        })),
        difficulty: workflowData.difficulty,
        estimated_time: workflowData.estimated_total_time,
        tags: workflowData.tags,
        logs: [{
          timestamp: new Date().toISOString(),
          message: `Workflow created using ${geminiService.isConfigured() ? 'Gemini AI' : 'fallback generator'}`,
          status: 'success'
        }]
      });

      setAutomations(prev => [automation, ...prev]);
      setWorkflowInput('');
    } catch (error) {
      console.error('Workflow generation error:', error);
      // Still create a basic automation entry
      const automation = await localDB.createAutomation({
        user_id: user?.id,
        name: workflowInput || template?.name || 'Custom Workflow',
        description: template?.description || 'AI-generated workflow based on your requirements',
        steps: template?.steps || [
          { id: 'step-1', title: 'Initialize process', description: 'Set up the initial process', type: 'trigger' },
          { id: 'step-2', title: 'Process data', description: 'Process the incoming data', type: 'action' },
          { id: 'step-3', title: 'Execute actions', description: 'Execute the defined actions', type: 'action' },
          { id: 'step-4', title: 'Monitor results', description: 'Monitor and log results', type: 'action' }
        ],
        logs: [{
          timestamp: new Date().toISOString(),
          message: 'Workflow created with fallback generator',
          status: 'warning'
        }]
      });

      setAutomations(prev => [automation, ...prev]);
      setWorkflowInput('');
    }
    
    setIsGeneratingWorkflow(false);
  };

  const toggleAutomation = async (id: string, status: 'active' | 'inactive') => {
    await localDB.updateAutomation(id, { status });
    setAutomations(prev => prev.map(auto => 
      auto.id === id ? { ...auto, status } : auto
    ));
  };

  const generateSocialPost = async () => {
    if (!socialTopic.trim()) return;
    
    setIsGeneratingPost(true);
    setCurrentImageGeneration(`Analyzing topic: ${socialTopic}`);
    setImageOptions([]);
    setSelectedImageIndex(0);
    
    try {
      // Use Gemini to generate better social media content with workspace context
      const postData = await geminiService.generateSocialMediaPost(
        socialTopic, 
        currentWorkspace?.ai_instructions
      );
      
      setCurrentImageGeneration(`Generating 3 image options with Imagen 4.0...`);
      setIsGeneratingImage(true);
      
      // Generate 3 images using Imagen 4.0
      const imageResults = await imagenService.generateSocialMediaImages(
        postData.imagePrompt,
        'instagram', // Default platform
        3 // Generate 3 options
      );
      
      if (imageResults.images && imageResults.images.length > 0) {
        setImageOptions(imageResults.images);
        setCurrentImageGeneration(`Generated ${imageResults.images.length} image options - choose your favorite!`);
      } else {
        throw new Error('No images generated');
      }
      
      // Don't save yet - let user choose first
      setIsGeneratingImage(false);
      setIsGeneratingPost(false);
      
      // Store the post data temporarily for when user selects an image
      (window as any)._pendingPostData = {
        user_id: user?.id,
        topic: socialTopic,
        text: postData.text,
        description: postData.description,
        hashtags: postData.hashtags.map((tag: string) => `#${tag}`)
      };
      
    } catch (error) {
      console.error('Social post generation error:', error);
      
      // Fallback to old image service if Imagen fails
      const fallbackPost = {
        text: `🚀 Exciting developments in ${socialTopic}! Discover how this innovation can transform your business strategy and drive meaningful growth. What's your experience? #Innovation #Business`,
        hashtags: ['#Innovation', '#Business', '#Growth', '#Strategy'],
        description: `Engaging post about ${socialTopic} with business focus`
      };
      
      setCurrentImageGeneration(`Generating fallback image...`);
      const imageResult = await imageService.generateImage(`${socialTopic} business professional`, 'professional');
      
      const savedPost = await localDB.createSocialPost({
        user_id: user?.id,
        topic: socialTopic,
        text: fallbackPost.text,
        image_url: imageResult.image_url || '',
        description: fallbackPost.description,
        hashtags: fallbackPost.hashtags
      });
      
      setGeneratedPosts(prev => [savedPost, ...prev]);
      setIsGeneratingImage(false);
      setCurrentImageGeneration(null);
      setSocialTopic('');
      setIsGeneratingPost(false);
      setImageOptions([]);
    }
  };

  const selectImageAndSavePost = async (imageIndex: number) => {
    const pendingData = (window as any)._pendingPostData;
    if (!pendingData || !imageOptions[imageIndex]) return;

    setSelectedImageIndex(imageIndex);
    
    // Save the post with selected image
    const savedPost = await localDB.createSocialPost({
      ...pendingData,
      image_url: imageOptions[imageIndex]
    });
    
    setGeneratedPosts(prev => [savedPost, ...prev]);
    setCurrentImageGeneration(null);
    setSocialTopic('');
    setImageOptions([]);
    delete (window as any)._pendingPostData;
  };

  const copyPost = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const publishToSocialMedia = (post: any, platform: 'instagram' | 'facebook') => {
    // This would integrate with actual social media APIs
    console.log(`Publishing to ${platform}:`, post);
    // For Instagram: You'd need Instagram Basic Display API + Instagram Graph API
    // For Facebook: You'd need Facebook Graph API
    alert(`Feature coming soon! This would publish to ${platform}`);
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open image in new tab
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${theme.primary} flex items-center justify-center`}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Agent</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Automation Intelligence & Social Media Management
          </p>
        </div>
      </div>

      {/* API Configuration Status */}
      {!geminiService.isConfigured() || !imageService.isConfigured() ? (
        <Alert 
          color="warning" 
          variant="flat"
          startContent={<Info className="w-5 h-5" />}
        >
          <div className="space-y-2">
            <h4 className="font-semibold">API Configuration Required</h4>
            <div className="text-sm space-y-1">
              {!geminiService.isConfigured() && (
                <p>• Add NEXT_PUBLIC_GEMINI_API_KEY for AI workflow generation</p>
              )}
              {!imageService.isConfigured() && (
                <p>• Add NEXT_PUBLIC_NANO_BANANA_API_KEY for professional image generation</p>
              )}
              <p className="text-xs mt-2 text-gray-600">
                The system will work with fallback generators, but API integration provides better results.
              </p>
            </div>
          </div>
        </Alert>
      ) : (
        <Alert 
          color="success" 
          variant="flat"
          startContent={<CheckCircle className="w-5 h-5" />}
        >
          <div>
            <h4 className="font-semibold">AI Services Configured</h4>
            <p className="text-sm">Gemini AI and image generation services are ready.</p>
          </div>
        </Alert>
      )}

      {/* Progress Indicator for Image Generation */}
      <ProgressIndicator 
        isActive={isGeneratingImage}
        title="Generating AI Images"
        description={currentImageGeneration || 'Creating professional images for your content...'}
        duration={3000}
        color="secondary"
        onComplete={() => {
          setIsGeneratingImage(false);
          setCurrentImageGeneration(null);
        }}
      />

      <Tabs aria-label="AI Agent Options" className="w-full"
        classNames={{
          tabList: `bg-gradient-to-r ${theme.secondary} dark:${theme.dark.secondary} p-1 rounded-lg`,
          tab: "data-[selected=true]:text-white",
          tabContent: `data-[selected=true]:bg-gradient-to-r data-[selected=true]:${theme.primary} text-gray-600 dark:text-gray-400`,
        }}
      >
        {/* Workflow Automation Tab */}
        <Tab key="automation" title={
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Workflow Automation</span>
          </div>
        }>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Create Automation */}
            <Card className={`p-6 border ${theme.border} dark:${theme.dark.border} ${theme.background} dark:${theme.dark.background}`}>
              <CardBody className="p-0">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className={`w-5 h-5 ${theme.icon} dark:${theme.dark.icon}`} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create Automation
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe the workflow you want to automate (e.g., 'Send welcome emails to new customers and follow up after 3 days')"
                    value={workflowInput}
                    onChange={(e) => setWorkflowInput(e.target.value)}
                    minRows={3}
                    classNames={{
                      input: `focus:border-purple-500`,
                    }}
                  />
                  
                  <Button
                    className={`w-full bg-gradient-to-r ${theme.primary} text-white font-medium hover:opacity-90`}
                    onClick={() => generateWorkflow()}
                    isLoading={isGeneratingWorkflow}
                    disabled={isGeneratingWorkflow || !workflowInput.trim()}
                    startContent={!isGeneratingWorkflow && <Zap className="w-4 h-4" />}
                  >
                    {isGeneratingWorkflow ? 'Generating Workflow...' : 'Generate Automation'}
                  </Button>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Quick Templates
                  </h4>
                  <div className="space-y-2">
                    {workflowTemplates.map((template) => (
                      <Button
                        key={template.id}
                        variant="light"
                        size="sm"
                        className={`w-full justify-start text-left hover:${theme.background} dark:hover:${theme.dark.background} ${theme.text} dark:${theme.dark.text}`}
                        onClick={() => {
                          setSelectedTemplate(template);
                          onOpen();
                        }}
                      >
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {template.description}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Active Automations */}
            <Card className="p-6">
              <CardBody className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Active Automations
                </h3>
                
                <div className="space-y-3">
                  {automations.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No automations yet. Create your first workflow!
                      </p>
                    </div>
                  ) : (
                    automations.map((automation) => (
                      <div key={automation.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {automation.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Chip
                              size="sm"
                              color={automation.status === 'active' ? 'success' : 'default'}
                              variant="flat"
                            >
                              {automation.status}
                            </Chip>
                            <Switch
                              size="sm"
                              isSelected={automation.status === 'active'}
                              onValueChange={(checked) => 
                                toggleAutomation(automation.id, checked ? 'active' : 'inactive')
                              }
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {automation.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {automation.steps?.length || 0} steps • 
                          Created {new Date(automation.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* Social Media Agent Tab */}
        <Tab key="social" title={
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Social Media Agent</span>
          </div>
        }>
          <div className="space-y-6 mt-6">
            {/* Content Generation Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Generate Posts */}
              <div className="lg:col-span-2">
                <Card className={`p-6 border ${theme.border} dark:${theme.dark.border} ${theme.background} dark:${theme.dark.background}`}>
                  <CardBody className="p-0">
                    <div className="flex items-center space-x-2 mb-4">
                      <Sparkles className={`w-5 h-5 ${theme.icon} dark:${theme.dark.icon}`} />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        AI Content Generator
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Content Topic
                        </label>
                        <Input
                          placeholder="e.g., 'sustainable business practices', 'team productivity tips'"
                          value={socialTopic}
                          onChange={(e) => setSocialTopic(e.target.value)}
                          startContent={<Sparkles className="w-4 h-4 text-gray-400" />}
                          onKeyPress={(e) => e.key === 'Enter' && generateSocialPost()}
                          classNames={{
                            input: `focus:border-purple-500`,
                          }}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Be specific for better AI-generated content and images
                        </p>
                      </div>
                      
                      <Button
                        className={`w-full bg-gradient-to-r ${theme.primary} text-white font-medium hover:opacity-90 h-12`}
                        onClick={generateSocialPost}
                        isLoading={isGeneratingPost}
                        disabled={isGeneratingPost || !socialTopic.trim()}
                        startContent={!isGeneratingPost && <Bot className="w-5 h-5" />}
                      >
                        {isGeneratingPost ? 'Creating Content...' : 'Generate Post + Image'}
                      </Button>
                      
                      {/* Image Generation Progress */}
                      {isGeneratingImage && currentImageGeneration && (
                        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                          <div className="flex items-center space-x-4">
                            <CircularProgress 
                              size="md"
                              color="secondary"
                              aria-label="Generating image..."
                              classNames={{
                                svg: "w-8 h-8",
                                indicator: "stroke-purple-600",
                                track: "stroke-purple-200 dark:stroke-purple-800",
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                Generating Image
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400 truncate">
                                {currentImageGeneration}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Selection - 3 Options */}
                      {imageOptions.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              Choose Your Favorite Image (Imagen 4.0)
                            </h4>
                            <Chip size="sm" color="secondary" variant="flat">
                              {imageOptions.length} options
                            </Chip>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            {imageOptions.map((imageUrl, index) => (
                              <div
                                key={index}
                                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                                  selectedImageIndex === index
                                    ? 'ring-4 ring-purple-500 scale-105'
                                    : 'ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-purple-300'
                                }`}
                                onClick={() => setSelectedImageIndex(index)}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Option ${index + 1}`}
                                  className="w-full h-40 object-cover"
                                />
                                
                                {selectedImageIndex === index && (
                                  <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                )}
                                
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                  <p className="text-xs text-white font-medium text-center">
                                    Option {index + 1}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium hover:opacity-90"
                            onClick={() => selectImageAndSavePost(selectedImageIndex)}
                            startContent={<CheckCircle className="w-4 h-4" />}
                          >
                            Use Selected Image & Create Post
                          </Button>
                          
                          <Alert
                            color="secondary"
                            variant="flat"
                            className="text-xs"
                            description="Images generated using Google's Imagen 4.0 AI model for professional quality"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            AI-Powered Content Creation
                          </p>
                          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                            <li>• Gemini AI creates engaging post text</li>
                            <li>• Imagen 4.0 generates 3 professional image options</li>
                            <li>• Choose your favorite from AI-generated variations</li>
                            <li>• Hashtags and descriptions included</li>
                            <li>• One-click social media publishing</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Quick Topic Suggestions */}
              <div>
                <Card className="p-4">
                  <CardBody className="p-0">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Image className="w-4 h-4 mr-2" />
                      Quick Topics
                    </h4>
                    <div className="space-y-2">
                      {[
                        'Team productivity tips',
                        'Industry insights',
                        'Company culture',
                        'Product updates',
                        'Customer success stories',
                        'Market trends'
                      ].map((topic) => (
                        <Button
                          key={topic}
                          size="sm"
                          variant="light"
                          className="w-full justify-start text-left text-xs"
                          onClick={() => setSocialTopic(topic)}
                        >
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Generated Posts Display */}
            <Card className="p-6">
              <CardBody className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Generated Content
                  </h3>
                  <Chip size="sm" variant="flat">
                    {generatedPosts.length} posts
                  </Chip>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <Image className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No posts generated yet. Create your first social media content!
                      </p>
                    </div>
                  ) : (
                    generatedPosts.map((post) => (
                      <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start space-x-3 mb-3">
                          <img
                            src={post.image_url}
                            alt="Generated"
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/64x64?text=IMG';
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white mb-2">
                              {post.text}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {post.hashtags?.map((tag: string, index: number) => (
                                <Chip key={index} size="sm" variant="flat" color="primary">
                                  {tag}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => copyPost(post.text)}
                              startContent={<Copy className="w-3 h-3" />}
                              className={`hover:${theme.background} dark:hover:${theme.dark.background} ${theme.text} dark:${theme.dark.text}`}
                            >
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => downloadImage(post.image_url, `social-post-${post.id}.jpg`)}
                              startContent={<Download className="w-3 h-3" />}
                              className={`hover:${theme.background} dark:hover:${theme.dark.background} ${theme.text} dark:${theme.dark.text}`}
                            >
                              Save
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              onClick={() => publishToSocialMedia(post, 'instagram')}
                              startContent={<Camera className="w-3 h-3" />}
                            >
                              Instagram
                            </Button>
                            <Button
                              size="sm"
                              color="primary"
                              variant="light"
                              onClick={() => publishToSocialMedia(post, 'facebook')}
                              startContent={<Share2 className="w-3 h-3" />}
                            >
                              Facebook
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Generated {new Date(post.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Social Media Integration Info */}
          <Card className="p-6 mt-6">
            <CardBody className="p-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Social Media Integration Setup
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">📸 Instagram Integration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    To publish directly to Instagram, you'll need:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                    <li>• Instagram Business Account</li>
                    <li>• Facebook Developer Account</li>
                    <li>• Instagram Basic Display API access</li>
                    <li>• Instagram Graph API permissions</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">📘 Facebook Integration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    To publish directly to Facebook, you'll need:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                    <li>• Facebook Business Account</li>
                    <li>• Facebook Developer Account</li>
                    <li>• Facebook Graph API access</li>
                    <li>• Pages permissions for posting</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Template Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedTemplate?.name}
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedTemplate?.description}
                </p>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Workflow Steps:
                  </h4>
                  <ul className="space-y-1">
                    {selectedTemplate?.steps.map((step: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    generateWorkflow(selectedTemplate);
                    onClose();
                  }}
                >
                  Create Automation
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
