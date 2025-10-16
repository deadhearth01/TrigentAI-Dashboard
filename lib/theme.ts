// Agent Theme Colors
export const agentThemes = {
  bi: {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'from-blue-100 to-cyan-100',
    accent: 'bg-blue-500',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    border: 'border-blue-200',
    background: 'bg-blue-50',
    dark: {
      primary: 'from-blue-600 to-cyan-600',
      secondary: 'from-blue-900/20 to-cyan-900/20',
      accent: 'bg-blue-600',
      text: 'text-blue-400',
      icon: 'text-blue-400',
      border: 'border-blue-700',
      background: 'bg-blue-900/10'
    }
  },
  ai: {
    primary: 'from-purple-500 to-violet-500',
    secondary: 'from-purple-100 to-violet-100',
    accent: 'bg-purple-500',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    border: 'border-purple-200',
    background: 'bg-purple-50',
    dark: {
      primary: 'from-purple-600 to-violet-600',
      secondary: 'from-purple-900/20 to-violet-900/20',
      accent: 'bg-purple-600',
      text: 'text-purple-400',
      icon: 'text-purple-400',
      border: 'border-purple-700',
      background: 'bg-purple-900/10'
    }
  },
  gx: {
    primary: 'from-emerald-500 to-teal-500',
    secondary: 'from-emerald-100 to-teal-100',
    accent: 'bg-emerald-500',
    text: 'text-emerald-600',
    icon: 'text-emerald-500',
    border: 'border-emerald-200',
    background: 'bg-emerald-50',
    dark: {
      primary: 'from-emerald-600 to-teal-600',
      secondary: 'from-emerald-900/20 to-teal-900/20',
      accent: 'bg-emerald-600',
      text: 'text-emerald-400',
      icon: 'text-emerald-400',
      border: 'border-emerald-700',
      background: 'bg-emerald-900/10'
    }
  }
};

export type AgentType = keyof typeof agentThemes;
