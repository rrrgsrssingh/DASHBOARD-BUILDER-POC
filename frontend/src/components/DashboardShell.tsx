import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import { DashboardState, WidgetConfig } from '../types';
import { WidgetRenderer } from './WidgetRegistry';

const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_KEY = 'dashboard_layout';

const INITIAL_LAYOUT: WidgetConfig[] = [
  { id: 'w-1', type: 'categorical', title: 'Categorical Breakdown', grid: { x: 0, y: 0, w: 6, h: 4 } },
  { id: 'w-2', type: 'temporal', title: 'Time-Series Vector Stream', grid: { x: 6, y: 0, w: 6, h: 4 } },
  { id: 'w-3', type: 'hierarchical', title: 'Corporate Hierarchy Treemap', grid: { x: 0, y: 4, w: 6, h: 4 } },
  { id: 'w-4', type: 'relational', title: 'Relational Node Scatter Data', grid: { x: 6, y: 4, w: 6, h: 4 } },
];

export const DashboardShell: React.FC = () => {
  const savedLayout = localStorage.getItem(LAYOUT_KEY);
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

      const dataMap: Record<string, any> = {};
      apiData.forEach((item: any) => {
        dataMap[item.widgetId] = item.data;
      });

      setState(prev => ({ ...prev, data: dataMap, loading: false, error: null }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const layouts = useMemo(
    () => ({
      lg: state.widgets.map((widget) => ({
        i: widget.id,
        x: widget.grid.x,
        y: widget.grid.y,
        w: widget.grid.w,
        h: widget.grid.h,
      })),
    }),
    [state.widgets]
  );

  const handleLayoutChange = useCallback(
    (currentLayout: Layout[]) => {
      const updatedWidgets = state.widgets.map((widget) => {
        const layoutItem = currentLayout.find((item) => item.i === widget.id);
        return layoutItem
          ? {
              ...widget,
              grid: { x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h },
            }
          : widget;
      });

      localStorage.setItem(LAYOUT_KEY, JSON.stringify(updatedWidgets));
      setState((prev) => ({ ...prev, widgets: updatedWidgets }));
    },
    [state.widgets]
  );

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

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 960, sm: 640 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={30}
        width={1200}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-handle"
        margin={[16, 16]}
        compactType="vertical"
      >
        {state.widgets.map((widget) => (
          <div key={widget.id} className="bg-gray-900/80 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="widget-handle cursor-move bg-gray-850 px-4 py-3 border-b border-gray-800 flex justify-between items-center">
              <div>
                <span className="text-[11px] uppercase tracking-[0.3em] text-cyan-400">{widget.type}</span>
                <h3 className="text-sm font-semibold text-gray-100 mt-1">{widget.title}</h3>
              </div>
            </div>
            <div className="p-4 min-h-[180px]">
              <WidgetRenderer type={widget.type} data={state.data[widget.id]} error={!state.data[widget.id]} />
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};