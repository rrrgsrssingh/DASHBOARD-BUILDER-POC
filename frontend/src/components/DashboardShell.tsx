import React, { useState, useEffect, useCallback } from 'react';
import { DashboardState, WidgetConfig } from '../types';
import { WidgetRenderer } from './WidgetRegistry';

const INITIAL_LAYOUT: WidgetConfig[] = [
  { id: 'w-1', type: 'categorical', title: 'Categorical Breakdown', grid: { x: 0, y: 0, w: 6, h: 4 } },
  { id: 'w-2', type: 'temporal', title: 'Time-Series Vector Stream', grid: { x: 6, y: 0, w: 6, h: 4 } },
  { id: 'w-3', type: 'hierarchical', title: 'Corporate Hierarchy Treemap', grid: { x: 0, y: 4, w: 6, h: 4 } },
  { id: 'w-4', type: 'relational', title: 'Relational Node Scatter Data', grid: { x: 6, y: 4, w: 6, h: 4 } },
];

export const DashboardShell: React.FC = () => {
  const savedLayout = localStorage.getItem('dashboard_layout');
  const initialWidgets = savedLayout ? JSON.parse(savedLayout) : INITIAL_LAYOUT;

  const [state, setState] = useState<DashboardState>({
    widgets: initialWidgets,
    data: {},
    loading: true,
    error: null,
  });

  // Load layout with local storage persistence
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/widgets/data');
      if (!response.ok) throw new Error('Network execution failure');
      const apiData = await response.json();
      
      // Transform list payload mapping cleanly to state dictionary
      const dataMap: Record<string, any> = {};
      apiData.forEach((item: any) => {
        dataMap[item.widgetId] = item.data;
      });

      setState(prev => ({ ...prev, data: dataMap, loading: false, error: null }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  // Performance Strategy: Prevent unnecessary parent bubble states during micro changes
  const handleResetLayout = useCallback(() => {
    // 1. Requirement: Layout Persistence (LocalStorage save)
    localStorage.setItem('dashboard_layout', JSON.stringify(INITIAL_LAYOUT));
    
    // 2. Requirement: Performance (Atomic State Update)
    setState((prev: DashboardState) => ({
      ...prev,
      widgets: INITIAL_LAYOUT,
    }));
  }, []);

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-gray-100">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Scalable Dashboard Architecture POC
          </h1>
          <p className="text-xs text-gray-500 mt-1">Registry Pattern Design Variant</p>
        </div>
        <button 
          onClick={handleResetLayout} 
          className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-md text-xs font-semibold hover:bg-gray-800 transition"
        >
          Reset Layout Local Storage
        </button>
      </div>

      {state.loading && <div className="text-center py-20 text-indigo-400 animate-pulse">Assembling dynamic pipelines...</div>}
      {state.error && <div className="text-center py-4 text-yellow-500 text-sm">{state.error} - Using cached layout</div>}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {state.widgets.map((widget) => (
          <div 
            key={widget.id} 
            className="md:col-span-6 bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition duration-200 shadow-xl flex flex-col justify-between"
          >
            <div className="mb-4">
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-500">{widget.type}</span>
              <h3 className="text-lg font-medium text-gray-200 mt-0.5">{widget.title}</h3>
            </div>
            <div className="flex-1 min-h-[150px]">
              <WidgetRenderer 
                type={widget.type} 
                data={state.data[widget.id]} 
                error={!state.data[widget.id]} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};