import React from 'react';

// Isolated Widget Definitions (Transforming payload structures into Visual UI)
const CategoricalWidget = ({ data }: { data: Array<{ key: string, value: number }> }) => (
  <div className="space-y-2">
    {data.map((item, idx) => (
      <div key={idx} className="flex justify-between items-center text-sm">
        <span className="text-gray-400">{item.key}</span>
        <span className="font-semibold text-indigo-400">${item.value}</span>
      </div>
    ))}
  </div>
);

const TemporalWidget = ({ data }: { data: Array<{ timestamp: string, value: number }> }) => (
  <div className="text-xs space-y-1">
    {data.map((item, idx) => (
      <div key={idx} className="flex justify-between border-b border-gray-800 pb-1">
        <span className="text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</span>
        <span className="text-emerald-400 font-mono">{item.value} units</span>
      </div>
    ))}
  </div>
);

const HierarchicalWidget = ({ data }: { data: any }) => {
  const renderTree = (node: any) => (
    <ul key={node.name} className="pl-4 list-disc text-sm text-gray-300">
      <li>
        {node.name} {node.value ? `(${node.value})` : ''}
        {node.children && node.children.map((child: any) => renderTree(child))}
      </li>
    </ul>
  );
  return <div className="overflow-auto max-h-48">{renderTree(data)}</div>;
};

const RelationalWidget = ({ data }: { data: Array<{ x: number, y: number, size?: number }> }) => (
  <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
    {data.slice(0, 10).map((pt, idx) => (
      <div key={idx} className="bg-gray-800 p-1 rounded text-cyan-400">
        ({pt.x}, {pt.y})
      </div>
    ))}
  </div>
);

// Map registry strings dynamically to functional components
const Registry: Record<string, React.ComponentType<{ data: any }>> = {
  categorical: CategoricalWidget,
  temporal: TemporalWidget,
  hierarchical: HierarchicalWidget,
  relational: RelationalWidget,
};

interface WidgetRendererProps {
  type: string;
  data: any;
  error: boolean;
}

// Resiliency Fallback Handling Layer
export const WidgetRenderer: React.FC<WidgetRendererProps> = React.memo(({ type, data, error }) => {
  if (error || !data) {
    return (
      <div className="p-4 bg-red-950/30 border border-red-900 rounded-lg text-red-400 text-sm">
        ⚠️ Failed to load visualization segment. Format mismatch or API error.
      </div>
    );
  }

  const Component = Registry[type];
  if (!Component) {
    return <div className="text-yellow-500 text-sm">Unknown Component Module Type</div>;
  }

  return <Component data={data} />;
});

WidgetRenderer.displayName = 'WidgetRenderer';