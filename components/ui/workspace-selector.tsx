'use client';

import { useState } from 'react';
import { 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  useDisclosure,
  Chip
} from '@heroui/react';
import { Plus, Folder, ChevronDown, Bot, BarChart3, TrendingUp, Palette } from 'lucide-react';
import { useAuthStore, Workspace } from '@/lib/store';

const workspaceColors = [
  { key: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { key: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { key: 'green', label: 'Green', color: 'bg-green-500' },
  { key: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { key: 'red', label: 'Red', color: 'bg-red-500' },
  { key: 'pink', label: 'Pink', color: 'bg-pink-500' },
];

const agentTypes = [
  { key: 'all', label: 'All Agents', icon: Folder },
  { key: 'bi', label: 'BI Agent Only', icon: BarChart3 },
  { key: 'ai', label: 'AI Agent Only', icon: Bot },
  { key: 'gx', label: 'GX Agent Only', icon: TrendingUp },
];

export function WorkspaceSelector() {
  const { currentWorkspace, workspaces, setCurrentWorkspace, addWorkspace } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    color: 'blue',
    agent_type: 'all' as 'bi' | 'ai' | 'gx' | 'all',
    ai_instructions: 'Provide clear, actionable insights and recommendations tailored to this workspace.'
  });

  const handleCreateWorkspace = () => {
    if (!newWorkspace.name.trim()) return;

    const workspace: Workspace = {
      id: 'workspace-' + Date.now(),
      name: newWorkspace.name,
      description: newWorkspace.description,
      color: newWorkspace.color,
      agent_type: newWorkspace.agent_type,
      ai_instructions: newWorkspace.ai_instructions,
      created_at: new Date().toISOString(),
      user_id: useAuthStore.getState().user?.id || ''
    };

    addWorkspace(workspace);
    setNewWorkspace({
      name: '',
      description: '',
      color: 'blue',
      agent_type: 'all',
      ai_instructions: 'Provide clear, actionable insights and recommendations tailored to this workspace.'
    });
    onOpenChange();
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
    };
    return colorMap[color] || 'bg-blue-500';
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="flat" 
            className="justify-between min-w-[200px]"
            endContent={<ChevronDown className="w-4 h-4" />}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getColorClass(currentWorkspace?.color || 'blue')}`} />
              <span className="truncate">{currentWorkspace?.name || 'Select Workspace'}</span>
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Workspace selection"
          className="min-w-[250px]"
          items={[
            ...workspaces.map(workspace => ({
              id: workspace.id,
              workspace
            })),
            { id: 'create', workspace: null }
          ]}
        >
          {(item: any) => {
            if (item.id === 'create') {
              return (
                <DropdownItem
                  key="create"
                  onPress={onOpen}
                  className="border-t border-gray-200 dark:border-gray-700 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create New Workspace</span>
                  </div>
                </DropdownItem>
              );
            }

            const workspace = item.workspace;
            return (
              <DropdownItem
                key={workspace.id}
                onPress={() => setCurrentWorkspace(workspace)}
                className="py-2"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getColorClass(workspace.color)}`} />
                    <div>
                      <p className="font-medium">{workspace.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">
                        {workspace.description}
                      </p>
                    </div>
                  </div>
                  {workspace.agent_type !== 'all' && (
                    <Chip size="sm" variant="flat">
                      {workspace.agent_type?.toUpperCase()}
                    </Chip>
                  )}
                </div>
              </DropdownItem>
            );
          }}
        </DropdownMenu>
      </Dropdown>

      {/* Create Workspace Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold">Create New Workspace</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organize your AI agents and data by use case or project
                </p>
              </ModalHeader>
              <ModalBody className="space-y-4">
                <Input
                  label="Workspace Name"
                  placeholder="e.g., Marketing Campaign, Sales Analytics, Product Development"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({...newWorkspace, name: e.target.value})}
                  isRequired
                  startContent={<Folder className="w-4 h-4 text-gray-400" />}
                />

                <Textarea
                  label="Description"
                  placeholder="Brief description of this workspace purpose..."
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace({...newWorkspace, description: e.target.value})}
                  minRows={2}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {workspaceColors.map((color) => (
                        <button
                          key={color.key}
                          type="button"
                          onClick={() => setNewWorkspace({...newWorkspace, color: color.key})}
                          className={`w-8 h-8 rounded-full ${color.color} border-2 ${
                            newWorkspace.color === color.key 
                              ? 'border-gray-900 dark:border-white' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <Select
                    label="Focus Agent"
                    placeholder="Select primary agent"
                    selectedKeys={[newWorkspace.agent_type]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as 'bi' | 'ai' | 'gx' | 'all';
                      setNewWorkspace({...newWorkspace, agent_type: selected});
                    }}
                    items={agentTypes}
                  >
                    {(type: any) => (
                      <SelectItem key={type.key}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    )}
                  </Select>
                </div>

                <Textarea
                  label="AI Instructions"
                  description="These instructions guide how AI agents behave in this workspace"
                  placeholder="e.g., Focus on marketing metrics, use casual tone, prioritize ROI insights..."
                  value={newWorkspace.ai_instructions}
                  onChange={(e) => setNewWorkspace({...newWorkspace, ai_instructions: e.target.value})}
                  minRows={3}
                  startContent={<Bot className="w-4 h-4 text-gray-400 mt-1" />}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleCreateWorkspace}
                  isDisabled={!newWorkspace.name.trim()}
                >
                  Create Workspace
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
