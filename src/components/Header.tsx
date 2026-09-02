/**
 * TruthTrace: Application Header
 * Navigation, Investigation Switcher, Search Trigger, Workspace Backups, Privacy Controls
 */

import React, { useState } from 'react';
import {
  Compass,
  Search,
  Shield,
  Plus,
  ChevronDown,
  Layers,
  FileText,
  GitGraph,
  Scale,
  FileCheck,
  History
} from 'lucide-react';
import { InvestigationProject, ActiveTab } from '../types';

interface HeaderProps {
  projects?: InvestigationProject[];
  investigations?: InvestigationProject[];
  activeProjectId?: string;
  activeInvestigationId?: string;
  onSelectProject?: (id: string) => void;
  onSelectInvestigation?: (id: string) => void;
  onCreateInvestigation?: () => void;
  onOpenSearch?: () => void;
  onOpenPrivacy?: () => void;
  onOpenPrivacyModal?: () => void;
  onExportWorkspace?: () => void;
  onImportWorkspace?: () => void;
  activeTab: ActiveTab | string;
  onTabChange?: (tab: ActiveTab) => void;
  onSelectTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  investigations,
  activeProjectId,
  activeInvestigationId,
  onSelectProject,
  onSelectInvestigation,
  onCreateInvestigation,
  onOpenSearch,
  onOpenPrivacy,
  onOpenPrivacyModal,
  activeTab,
  onTabChange,
  onSelectTab,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allProjects = projects || investigations || [];
  const currentId = activeProjectId || activeInvestigationId || allProjects[0]?.id;
  const activeInv = allProjects.find((i) => i.id === currentId) || allProjects[0];

  const handleTabClick = (tabId: string) => {
    if (onTabChange) onTabChange(tabId as ActiveTab);
    if (onSelectTab) onSelectTab(tabId);
  };

  const handleSelectProjectClick = (id: string) => {
    if (onSelectProject) onSelectProject(id);
    if (onSelectInvestigation) onSelectInvestigation(id);
    setDropdownOpen(false);
  };

  const handlePrivacyClick = () => {
    if (onOpenPrivacyModal) onOpenPrivacyModal();
    else if (onOpenPrivacy) onOpenPrivacy();
  };

  const tabs: { id: ActiveTab; label: string; icon: any; count?: number }[] = [
    { id: 'claim', label: 'Claim Decomposition', icon: Layers },
    { id: 'sources', label: 'Sources', icon: FileText, count: activeInv?.sources.length || 0 },
    { id: 'evidence', label: 'Evidence Ledger', icon: FileCheck, count: activeInv?.evidence.length || 0 },
    { id: 'graph', label: 'Evidence Map', icon: GitGraph },
    { id: 'comparison', label: 'Source Analysis', icon: Scale },
    { id: 'report', label: 'Research Report', icon: FileCheck },
    { id: 'history', label: 'Projects & Search', icon: History, count: allProjects.length },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0 no-print">
      {/* Main Top Header Bar (h-14) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3 sm:gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-xs">
              TT
            </div>
            <div className="flex items-center">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                TruthTrace
                <span className="text-slate-400 font-normal text-xs ml-1.5 hidden sm:inline">v1.2</span>
              </span>
            </div>
          </div>

          {/* Center / Search Input & Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl justify-end sm:justify-start">
            {/* Quick Search */}
            <div className="relative flex-1 max-w-xs hidden md:block">
              <input
                type="text"
                placeholder="Search claims & evidence..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (onOpenSearch && e.target.value.length > 0) {
                    onOpenSearch();
                  }
                }}
                onFocus={() => {
                  if (onOpenSearch) onOpenSearch();
                  else handleTabClick('history');
                }}
                className="w-full h-9 pl-9 pr-4 bg-slate-100 border border-transparent rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-slate-200 transition-all"
              />
              <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Investigation Switcher */}
            <div className="relative shrink-0">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-9 flex items-center gap-2 px-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-slate-800 max-w-[180px] sm:max-w-[240px] truncate"
              >
                <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate font-medium">
                  {activeInv?.claim.title || 'Select Investigation'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-1 w-80 sm:w-96 rounded-lg bg-white border border-slate-200 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Active Investigations
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {allProjects.map((inv) => (
                      <button
                        key={inv.id}
                        onClick={() => handleSelectProjectClick(inv.id)}
                        className={`w-full text-left px-3 py-2.5 text-xs hover:bg-slate-50 transition-colors flex items-start justify-between gap-2 ${
                          inv.id === currentId
                            ? 'bg-indigo-50/70 font-semibold text-indigo-950 border-l-2 border-indigo-600'
                            : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-medium truncate text-slate-900">{inv.claim.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{inv.claim.domain}</div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          {inv.sources.length} srcs
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (onCreateInvestigation) onCreateInvestigation();
                else handleTabClick('history');
              }}
              className="h-9 px-3.5 bg-slate-900 text-white text-xs font-medium rounded-md flex items-center gap-1.5 hover:bg-slate-800 active:bg-slate-950 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Claim</span>
            </button>

            <button
              onClick={handlePrivacyClick}
              className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-slate-200/60"
              title="Privacy settings & local-first data sovereignty"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-100 pt-0.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

