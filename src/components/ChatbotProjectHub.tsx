import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderPlus,
  Plus,
  Play,
  GitFork,
  Clock,
  Zap,
  Tag,
  Edit3,
  Trash2,
  Copy,
  Search,
  ArrowRight,
  ExternalLink,
  Bot,
  Layers,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Filter,
  Check,
  X,
  Flame,
  LayoutGrid,
  List,
  ArrowUp,
  ArrowDown,
  Hash,
  Link2
} from 'lucide-react';
import {
  ChatbotProject,
  ChatbotFlow,
  Company,
  IntegrationSettings
} from '../types';

interface ChatbotProjectHubProps {
  currentCompany: Company;
  settings: IntegrationSettings;
  projects: ChatbotProject[];
  onSaveProjects: (projects: ChatbotProject[], activeProjectId?: string, activeFlowId?: string) => Promise<void>;
  onOpenFlow: (projectId: string, flowId: string) => void;
  onBackToPromptMode: () => void;
}

export const COLOR_MAP: Record<NonNullable<ChatbotProject['color']>, {
  badge: string;
  bg: string;
  border: string;
  text: string;
  ring: string;
  gradient: string;
}> = {
  blue: {
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    ring: 'focus:ring-blue-500',
    gradient: 'from-blue-600/20 to-indigo-600/10'
  },
  emerald: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    ring: 'focus:ring-emerald-500',
    gradient: 'from-emerald-600/20 to-teal-600/10'
  },
  purple: {
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    ring: 'focus:ring-purple-500',
    gradient: 'from-purple-600/20 to-pink-600/10'
  },
  amber: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    ring: 'focus:ring-amber-500',
    gradient: 'from-amber-600/20 to-orange-600/10'
  },
  rose: {
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    ring: 'focus:ring-rose-500',
    gradient: 'from-rose-600/20 to-red-600/10'
  },
  cyan: {
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    ring: 'focus:ring-cyan-500',
    gradient: 'from-cyan-600/20 to-blue-600/10'
  }
};

export const ChatbotProjectHub: React.FC<ChatbotProjectHubProps> = ({
  currentCompany,
  settings,
  projects,
  onSaveProjects,
  onOpenFlow,
  onBackToPromptMode
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modais de Criação / Edição
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ChatbotProject | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectColor, setProjectColor] = useState<ChatbotProject['color']>('blue');

  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowSubtitle, setNewFlowSubtitle] = useState('');
  const [newFlowTargetProjectId, setNewFlowTargetProjectId] = useState<string>('');

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Métricas gerais
  const totalFlows = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.flows?.length || 0), 0);
  }, [projects]);

  const activeFlowsCount = useMemo(() => {
    return projects.reduce((acc, p) => {
      return acc + (p.flows || []).filter(f => f.active).length;
    }, 0);
  }, [projects]);

  const proactiveFlowsCount = useMemo(() => {
    return projects.reduce((acc, p) => {
      return acc + (p.flows || []).filter(f => {
        const startNode = f.nodes?.find(n => n.type === 'start');
        return startNode?.config?.triggerConfig?.type === 'proactive_time';
      }).length;
    }, 0);
  }, [projects]);

  // Filtragem de fluxos
  const filteredFlows = useMemo(() => {
    if (!activeProject) return [];
    if (!searchQuery.trim()) return activeProject.flows || [];
    const q = searchQuery.toLowerCase();
    return (activeProject.flows || []).filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.subtitle && f.subtitle.toLowerCase().includes(q))
    );
  }, [activeProject, searchQuery]);

  // Criar ou Salvar Projeto
  const handleSaveProjectModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    if (editingProject) {
      const updated = projects.map(p =>
        p.id === editingProject.id
          ? {
              ...p,
              name: projectName.trim(),
              description: projectDescription.trim(),
              color: projectColor || 'blue',
              updatedAt: new Date().toISOString()
            }
          : p
      );
      await onSaveProjects(updated, editingProject.id);
      setEditingProject(null);
    } else {
      const newProjId = `proj-${Date.now().toString().slice(-6)}`;
      const newProject: ChatbotProject = {
        id: newProjId,
        name: projectName.trim(),
        description: projectDescription.trim(),
        color: projectColor || 'blue',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        flows: []
      };
      const updated = [...projects, newProject];
      await onSaveProjects(updated, newProjId);
      setSelectedProjectId(newProjId);
    }

    setIsNewProjectModalOpen(false);
    setProjectName('');
    setProjectDescription('');
  };

  // Excluir Projeto
  const handleDeleteProject = async (projectId: string) => {
    if (projects.length <= 1) {
      alert('Você precisa manter pelo menos 1 projeto.');
      return;
    }
    const target = projects.find(p => p.id === projectId);
    if (!confirm(`Tem certeza que deseja excluir o projeto "${target?.name}" e todos os seus fluxos?`)) {
      return;
    }
    const updated = projects.filter(p => p.id !== projectId);
    await onSaveProjects(updated, updated[0].id);
    setSelectedProjectId(updated[0].id);
  };

  // Duplicar Projeto
  const handleDuplicateProject = async (proj: ChatbotProject) => {
    const newProjId = `proj-${Date.now().toString().slice(-6)}`;
    const duplicated: ChatbotProject = {
      ...proj,
      id: newProjId,
      name: `${proj.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      flows: (proj.flows || []).map(f => ({
        ...f,
        id: `flow-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substring(2, 6)}`,
        projectId: newProjId,
        name: `${f.name} (Cópia)`
      }))
    };
    const updated = [...projects, duplicated];
    await onSaveProjects(updated, newProjId);
    setSelectedProjectId(newProjId);
  };

  // Criar Novo Fluxo dentro do Projeto
  const handleCreateNewFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlowName.trim()) return;

    const targetProjId = newFlowTargetProjectId || selectedProjectId;
    const newFlowId = `flow-${Date.now().toString().slice(-6)}`;

    const newFlow: ChatbotFlow = {
      id: newFlowId,
      projectId: targetProjId,
      name: newFlowName.trim(),
      subtitle: newFlowSubtitle.trim() || 'Novo fluxo de atendimento e conversão',
      active: true,
      updatedAt: new Date().toISOString(),
      connections: [],
      nodes: [
        {
          id: 'node-start',
          type: 'start',
          title: 'Começo do fluxo',
          badge: 'Início',
          content: 'Olá! Sou o assistente virtual da ' + currentCompany.name + '.\n\nComo posso te ajudar hoje?',
          x: 60,
          y: 240,
          config: {
            triggerConfig: {
              type: 'instant_reply'
            }
          }
        },
        {
          id: 'node-router',
          type: 'condition',
          title: 'Se o lead responder',
          content: 'Separa o caminho de resposta do lead',
          x: 380,
          y: 190,
          options: [
            { id: 'opt-1', label: 'Tenho interesse em um produto', color: '#10b981' },
            { id: 'opt-2', label: 'Quero falar com um atendente', color: '#3b82f6' }
          ]
        }
      ]
    };

    const updatedProjects = projects.map(p => {
      if (p.id === targetProjId) {
        return {
          ...p,
          flows: [...(p.flows || []), newFlow],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    await onSaveProjects(updatedProjects, targetProjId, newFlowId);
    setIsNewFlowModalOpen(false);
    setNewFlowName('');
    setNewFlowSubtitle('');

    // Abre direto no visual builder
    onOpenFlow(targetProjId, newFlowId);
  };

  // Toggle Ativo / Pausado no Fluxo
  const handleToggleFlowActive = async (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          flows: (p.flows || []).map(f => f.id === flowId ? { ...f, active: !f.active } : f),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    await onSaveProjects(updatedProjects, activeProject.id);
  };

  // Duplicar Fluxo
  const handleDuplicateFlow = async (flow: ChatbotFlow, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProject) return;

    const duplicated: ChatbotFlow = {
      ...flow,
      id: `flow-${Date.now().toString().slice(-6)}`,
      name: `${flow.name} (Cópia)`,
      updatedAt: new Date().toISOString()
    };

    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          flows: [...(p.flows || []), duplicated],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    await onSaveProjects(updatedProjects, activeProject.id, duplicated.id);
  };

  // Excluir Fluxo
  const handleDeleteFlow = async (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProject) return;
    if (activeProject.flows.length <= 1) {
      alert('Você precisa manter pelo menos 1 fluxo neste projeto.');
      return;
    }
    const target = activeProject.flows.find(f => f.id === flowId);
    if (!confirm(`Tem certeza que deseja excluir o fluxo "${target?.name}"?`)) {
      return;
    }

    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          flows: p.flows.filter(f => f.id !== flowId),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    await onSaveProjects(updatedProjects, activeProject.id);
  };

  // Reordenar Fluxo na Sequência (Mover para Cima ou para Baixo)
  const handleMoveFlow = async (flowId: string, direction: 'up' | 'down', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeProject || !activeProject.flows) return;
    const flows = [...activeProject.flows];
    const index = flows.findIndex(f => f.id === flowId);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= flows.length) return;

    // Troca as posições dos dois fluxos
    const temp = flows[index];
    flows[index] = flows[targetIndex];
    flows[targetIndex] = temp;

    const updatedProjects = projects.map(p =>
      p.id === activeProject.id
        ? { ...p, flows, updatedAt: new Date().toISOString() }
        : p
    );

    await onSaveProjects(updatedProjects, activeProject.id);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070b12] text-slate-100 overflow-hidden select-none">
      
      {/* 1. BARRA SUPERIOR DO HUB */}
      <div className="h-16 bg-[#0c121e] border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Projetos & Fluxos de Atendimento
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Multi-Projetos
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Organize seus fluxos em projetos estratégicos (Vendas, Upsell, Recuperação e Pós-Venda)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToPromptMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition"
            title="Voltar para a Configuração 1 (Atendente com IA)"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Config 1: Atendente com IA</span>
          </button>

          <button
            onClick={() => {
              setEditingProject(null);
              setProjectName('');
              setProjectDescription('');
              setProjectColor('blue');
              setIsNewProjectModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* 2. ÁREA PRINCIPAL SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* 2.1 ESTATÍSTICAS RÁPIDAS NO TOPO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projetos Ativos</p>
              <p className="text-2xl font-black text-white mt-1">{projects.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Fluxos</p>
              <p className="text-2xl font-black text-white mt-1">{totalFlows}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <GitFork className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fluxos em Operação</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{activeFlowsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gatilhos Proativos</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{proactiveFlowsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 2.2 SELETOR DE ABAS DE PROJETOS */}
        <div className="bg-[#0e1422] border border-slate-800/90 rounded-2xl p-2 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {projects.map(proj => {
              const isSelected = proj.id === activeProject?.id;
              const colorInfo = COLOR_MAP[proj.color || 'blue'];
              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-lg border border-slate-700 ring-1 ring-cyan-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${colorInfo.text} bg-current`}></span>
                  <span>{proj.name}</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {proj.flows?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Busca de fluxos */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar fluxo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 2.3 CABEÇALHO DO PROJETO SELECIONADO & AÇÕES */}
        {activeProject && (
          <div className="bg-gradient-to-r from-[#0d1627] via-[#0f172a] to-[#0c1424] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${COLOR_MAP[activeProject.color || 'blue'].badge}`}>
                    Projeto Ativo
                  </span>
                  <span className="text-xs text-slate-500">
                    Criado em: {new Date(activeProject.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Folder className={`w-5 h-5 ${COLOR_MAP[activeProject.color || 'blue'].text}`} />
                  <span>{activeProject.name}</span>
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  {activeProject.description || 'Sem descrição cadastrada para este projeto.'}
                </p>
              </div>

              {/* Botões do Projeto */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setEditingProject(activeProject);
                    setProjectName(activeProject.name);
                    setProjectDescription(activeProject.description || '');
                    setProjectColor(activeProject.color || 'blue');
                    setIsNewProjectModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition flex items-center gap-1.5"
                  title="Editar informações do projeto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Projeto</span>
                </button>

                <button
                  onClick={() => handleDuplicateProject(activeProject)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition flex items-center gap-1.5"
                  title="Duplicar projeto com todos os fluxos"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicar Projeto</span>
                </button>

                {projects.length > 1 && (
                  <button
                    onClick={() => handleDeleteProject(activeProject.id)}
                    className="p-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 transition"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setNewFlowTargetProjectId(activeProject.id);
                    setNewFlowName('');
                    setNewFlowSubtitle('');
                    setIsNewFlowModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Criar Fluxo neste Projeto</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2.4 SEQUÊNCIA DE FLUXOS DO PROJETO (CARDS VS LISTA SEQUENCIAL) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] border border-slate-800/80 rounded-2xl p-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <GitFork className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span>Sequência de Fluxos do Projeto</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                    {filteredFlows.length} fluxos
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Ordem em que os fluxos acontecem e se encadeiam no projeto
                </p>
              </div>
            </div>

            {/* Alternância de Modo de Visualização: Cards vs Lista Sequencial */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualizar como Grade de Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualizar como Lista Sequencial da Esteira"
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista Sequencial</span>
              </button>
            </div>
          </div>

          {filteredFlows.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0c121e]/80 border border-slate-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
                <GitFork className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Nenhum fluxo encontrado</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Este projeto ainda não possui fluxos de atendimento criados. Crie o primeiro fluxo para desenhar sua árvore de decisão.
              </p>
              <button
                onClick={() => {
                  setNewFlowTargetProjectId(activeProject.id);
                  setNewFlowName('');
                  setNewFlowSubtitle('');
                  setIsNewFlowModalOpen(true);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeiro Fluxo</span>
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* ============================================================ */
            /* 2.4.A VISUALIZAÇÃO EM LISTA SEQUENCIAL */
            /* ============================================================ */
            <div className="space-y-2.5">
              {filteredFlows.map((flow, index) => {
                const sequenceNum = index + 1;
                const startNode = flow.nodes?.find(n => n.type === 'start');
                const trigger = startNode?.config?.triggerConfig;
                const isProactive = trigger?.type === 'proactive_time';
                const isKeyword = trigger?.type === 'keyword_match';

                let triggerBadge = '⚡ Resposta Imediata';
                let triggerColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                if (isProactive) {
                  triggerColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                  if (trigger?.previousProjectName || trigger?.previousFlowName) {
                    const origin = trigger.previousFlowName 
                      ? `${trigger.previousProjectName ? `${trigger.previousProjectName} → ` : ''}${trigger.previousFlowName}`
                      : trigger.previousProjectName;
                    triggerBadge = trigger.timingMode === 'immediate'
                      ? `⚡ Imediato após "${origin}"`
                      : `⏰ ${trigger.delayAmount || 2} ${trigger.delayUnit === 'hours' ? 'h' : 'dias'} após "${origin}"`;
                  } else {
                    triggerBadge = `⏰ Chama sozinho em ${trigger?.delayAmount || 2} ${trigger?.delayUnit === 'hours' ? 'h' : 'dias'}`;
                  }
                } else if (isKeyword) {
                  triggerColor = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
                  triggerBadge = `🏷️ Palavras: ${(trigger?.keywords || []).slice(0, 2).join(', ') || 'termo'}`;
                }

                const crmActionsCount = (flow.nodes || []).filter(n => n.type === 'crm_action').length;
                const linkNodesCount = (flow.nodes || []).filter(n => n.config?.linkUrl).length;

                return (
                  <div
                    key={flow.id}
                    onClick={() => onOpenFlow(activeProject.id, flow.id)}
                    className="group bg-[#0f172a]/90 hover:bg-[#131d33] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 shadow-lg transition-all duration-150 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Esquerda: Número Sequencial + Informações do Fluxo */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Número Sequencial e Reordenação */}
                      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-sm shadow-xs">
                          #{sequenceNum}
                        </span>

                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={e => handleMoveFlow(flow.id, 'up', e)}
                            disabled={index === 0}
                            className={`p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition ${
                              index === 0 ? 'opacity-20 cursor-not-allowed' : ''
                            }`}
                            title="Mover para cima na sequência"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={e => handleMoveFlow(flow.id, 'down', e)}
                            disabled={index === filteredFlows.length - 1}
                            className={`p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition ${
                              index === filteredFlows.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
                            }`}
                            title="Mover para baixo na sequência"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Nome e Descrição */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                            {flow.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                            (Sequência {sequenceNum} de {filteredFlows.length})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {flow.subtitle || 'Fluxo visual com árvore de decisão'}
                        </p>
                      </div>
                    </div>

                    {/* Meio: Sequenciamento / Gatilho */}
                    <div className="shrink-0">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${triggerColor}`}>
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[280px]">{triggerBadge}</span>
                      </span>
                    </div>

                    {/* Direita: Métricas, Status e Ações */}
                    <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                      {/* Métricas Rápidas */}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span title="Total de Blocos">
                          <strong className="text-white">{flow.nodes?.length || 0}</strong> blocos
                        </span>
                        <span className="text-slate-700">•</span>
                        <span title="Ações no CRM">
                          <strong className="text-pink-400">{crmActionsCount}</strong> CRM
                        </span>
                        <span className="text-slate-700">•</span>
                        <span title="Links Externos">
                          <strong className="text-cyan-400">{linkNodesCount}</strong> links
                        </span>
                      </div>

                      {/* Status Toggle */}
                      <button
                        onClick={e => handleToggleFlowActive(flow.id, e)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition shrink-0 ${
                          flow.active
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                        title={flow.active ? 'Fluxo ativo (clique para pausar)' : 'Fluxo pausado (clique para ativar)'}
                      >
                        {flow.active ? '● Ativo' : '○ Pausado'}
                      </button>

                      {/* Botões de Ação */}
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => handleDuplicateFlow(flow, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Duplicar fluxo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => handleDeleteFlow(flow.id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition"
                          title="Excluir fluxo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenFlow(activeProject.id, flow.id)}
                          className="ml-1 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Abrir</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ============================================================ */
            /* 2.4.B VISUALIZAÇÃO EM GRADE DE CARDS (COM NÚMERO SEQUENCIAL) */
            /* ============================================================ */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredFlows.map((flow, index) => {
                const sequenceNum = index + 1;
                const startNode = flow.nodes?.find(n => n.type === 'start');
                const trigger = startNode?.config?.triggerConfig;
                const isProactive = trigger?.type === 'proactive_time';
                const isKeyword = trigger?.type === 'keyword_match';

                // Badges de gatilho
                let triggerBadge = '⚡ Resposta Imediata';
                let triggerColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                if (isProactive) {
                  triggerColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                  if (trigger?.previousProjectName || trigger?.previousFlowName) {
                    const origin = trigger.previousFlowName 
                      ? `${trigger.previousProjectName ? `${trigger.previousProjectName} → ` : ''}${trigger.previousFlowName}`
                      : trigger.previousProjectName;
                    triggerBadge = trigger.timingMode === 'immediate'
                      ? `⚡ Imediato após "${origin}"`
                      : `⏰ ${trigger.delayAmount || 2} ${trigger.delayUnit === 'hours' ? 'horas' : 'dias'} após "${origin}"`;
                  } else {
                    triggerBadge = `⏰ Chama sozinho em ${trigger?.delayAmount || 2} ${trigger?.delayUnit === 'hours' ? 'horas' : 'dias'}`;
                  }
                } else if (isKeyword) {
                  triggerColor = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
                  triggerBadge = `🏷️ Palavras: ${(trigger?.keywords || []).slice(0, 2).join(', ') || 'termo'}`;
                }

                const crmActionsCount = (flow.nodes || []).filter(n => n.type === 'crm_action').length;
                const linkNodesCount = (flow.nodes || []).filter(n => n.config?.linkUrl).length;

                return (
                  <div
                    key={flow.id}
                    onClick={() => onOpenFlow(activeProject.id, flow.id)}
                    className="group bg-[#0f172a]/90 hover:bg-[#131d33] border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top card info */}
                    <div className="space-y-3">
                      {/* BARRA SUPERIOR DE SEQUÊNCIA (#1, #2, #3...) E REORDENAÇÃO */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 font-black text-xs shadow-xs flex items-center gap-1">
                            <Hash className="w-3 h-3 text-cyan-400" />
                            <span>{sequenceNum}</span>
                            <span className="text-[10px] font-semibold text-slate-400 ml-0.5 lowercase">na sequência</span>
                          </span>
                        </div>

                        {/* Reordenar na sequência */}
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={e => handleMoveFlow(flow.id, 'up', e)}
                            disabled={index === 0}
                            className={`p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition ${
                              index === 0 ? 'opacity-20 cursor-not-allowed' : ''
                            }`}
                            title="Mover para cima na sequência"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleMoveFlow(flow.id, 'down', e)}
                            disabled={index === filteredFlows.length - 1}
                            className={`p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition ${
                              index === filteredFlows.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
                            }`}
                            title="Mover para baixo na sequência"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                            <GitFork className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                              {flow.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {flow.subtitle || 'Fluxo visual com árvore de decisão'}
                            </p>
                          </div>
                        </div>

                        {/* Status Toggle Switch */}
                        <button
                          onClick={e => handleToggleFlowActive(flow.id, e)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition shrink-0 ${
                            flow.active
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                          title={flow.active ? 'Fluxo ativo (clique para pausar)' : 'Fluxo pausado (clique para ativar)'}
                        >
                          {flow.active ? '● Ativo' : '○ Pausado'}
                        </button>
                      </div>

                      {/* Gatilho Badge */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-xl border ${triggerColor}`}>
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[280px]">{triggerBadge}</span>
                        </span>
                      </div>

                      {/* Resumo de Componentes do Fluxo */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-center">
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Blocos</p>
                          <p className="text-xs font-bold text-white mt-0.5">{flow.nodes?.length || 0}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Ações CRM</p>
                          <p className="text-xs font-bold text-pink-400 mt-0.5">{crmActionsCount}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Links Ext.</p>
                          <p className="text-xs font-bold text-cyan-400 mt-0.5">{linkNodesCount}</p>
                        </div>
                      </div>
                    </div>

                    {/* Botão de ação inferior */}
                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={e => handleDuplicateFlow(flow, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Duplicar fluxo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => handleDeleteFlow(flow.id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition"
                          title="Excluir fluxo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition">
                        <span>Abrir no Construtor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL: NOVO / EDITAR PROJETO */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProjectModal}
            className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-cyan-400" />
                <span>{editingProject ? 'Editar Projeto' : 'Criar Novo Projeto de Fluxos'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Projeto:</label>
              <input
                type="text"
                required
                placeholder="Ex: Projeto 2: Upsell & Pós-Venda"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição / Objetivo do Projeto:</label>
              <textarea
                rows={3}
                placeholder="Ex: Disparar ofertas complementares e follow-up 5 dias após o lead fechar uma compra no projeto principal."
                value={projectDescription}
                onChange={e => setProjectDescription(e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cor do Projeto:</label>
              <div className="grid grid-cols-6 gap-2 mt-1.5">
                {(['blue', 'emerald', 'purple', 'amber', 'rose', 'cyan'] as const).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setProjectColor(color)}
                    className={`h-8 rounded-xl border flex items-center justify-center transition ${COLOR_MAP[color].bg} ${COLOR_MAP[color].border} ${
                      projectColor === color ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {projectColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg transition"
              >
                {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. MODAL: NOVO FLUXO DENTRO DO PROJETO */}
      {isNewFlowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewFlow}
            className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitFork className="w-4 h-4 text-cyan-400" />
                <span>Criar Novo Fluxo Visual</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewFlowModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Projeto de Destino:</label>
              <select
                value={newFlowTargetProjectId || selectedProjectId}
                onChange={e => setNewFlowTargetProjectId(e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Fluxo:</label>
              <input
                type="text"
                required
                placeholder="Ex: Oferta de Upsell / Serviço Adicional"
                value={newFlowName}
                onChange={e => setNewFlowName(e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Subtítulo / Objetivo:</label>
              <input
                type="text"
                placeholder="Ex: 5 dias após compra para apresentar produto premium"
                value={newFlowSubtitle}
                onChange={e => setNewFlowSubtitle(e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewFlowModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg transition"
              >
                Criar e Abrir no Construtor Visual
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
