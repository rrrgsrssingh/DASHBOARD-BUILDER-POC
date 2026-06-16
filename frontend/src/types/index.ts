export type WidgetType = 'categorical' | 'temporal' | 'hierarchical' | 'relational';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  grid: { x: number; y: number; w: number; h: number };
}

export interface DashboardState {
  widgets: WidgetConfig[];
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
}