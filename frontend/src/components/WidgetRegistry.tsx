import React, { useMemo } from 'react';

const CategoricalWidget = ({ data }: { data: Array<{ key: string; value: number }> }) => {
  const maxValue = useMemo(() => Math.max(...data.map((item) => item.value), 1), [data]);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="space-y-3 flex-1">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300 truncate">{item.key}</span>
              <span className="text-xs font-semibold text-cyan-400 ml-2">{item.value}</span>
            </div>
            <div className="h-2 rounded bg-gray-700/50 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                style={{ width: `${(item.value / maxValue) * 100}%`, transition: 'width 0.3s ease' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TemporalWidget = ({ data }: { data: Array<{ timestamp: string; value: number }> }) => {
  const chartData = useMemo(() => {
    return data.map((item, idx) => ({
      date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: item.value,
      percentage: idx,
    }));
  }, [data]);

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="text-xs text-gray-400 font-semibold">7-Day Trend</div>
      <div className="flex-1 flex items-end justify-around gap-2 bg-gray-950/50 rounded-lg p-3 border border-gray-800/50">
        {chartData.map((item, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div className="text-xs text-gray-500">{item.value}</div>
            <div
              className="w-full bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-sm"
              style={{
                height: `${((item.value - minValue) / range) * 100 + 20}%`,
                minHeight: '8px',
                transition: 'height 0.3s ease',
              }}
            />
            <div className="text-[10px] text-gray-600">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HierarchicalWidget = ({ data }: { data: any }) => {
  const renderTree = (node: any, depth = 0) => (
    <div
      key={`${node.name}-${depth}`}
      style={{ paddingLeft: depth > 0 ? depth * 12 : 0 }}
      className="py-1"
    >
      <div className="flex items-center gap-2 text-sm">
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-cyan-400" />
        <span className="text-gray-200 font-medium">{node.name}</span>
        {node.value !== undefined && (
          <span className="text-gray-500 text-xs">({node.value})</span>
        )}
      </div>
      {node.children && (
        <div className="space-y-0">
          {node.children.map((child: any) => renderTree(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-2 overflow-auto max-h-full">
      {renderTree(data)}
    </div>
  );
};

const RelationalWidget = ({ data }: { data: Array<{ x: number; y: number; size?: number }> }) => {
  const maxX = useMemo(() => Math.max(...data.map((item) => item.x), 100), [data]);
  const maxY = useMemo(() => Math.max(...data.map((item) => item.y), 100), [data]);

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="text-xs text-gray-400 font-semibold">Point Distribution</div>
      <div className="flex-1 grid grid-cols-7 gap-1 bg-gray-950/50 rounded-lg p-4 border border-gray-800/50">
        {data.map((point, idx) => {
          const xPercent = (point.x / maxX) * 100;
          const yPercent = (point.y / maxY) * 100;
          return (
            <div
              key={idx}
              className="relative"
              title={`(${point.x}, ${point.y})`}
            >
              <div
                className="rounded-full bg-cyan-500 border border-cyan-400"
                style={{
                  width: Math.max(point.size ?? 6, 4) * 2,
                  height: Math.max(point.size ?? 6, 4) * 2,
                  position: 'absolute',
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 flex justify-between">
        <span>X: 0-{maxX}</span>
        <span>Y: 0-{maxY}</span>
      </div>
    </div>
  );
};

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

export const WidgetRenderer: React.FC<WidgetRendererProps> = React.memo(({ type, data, error }) => {
  if (error || !data) {
    return (
      <div className="p-4 bg-red-950/30 border border-red-900 rounded-lg text-red-400 text-sm">
        ⚠️ Failed to load visualization. Data or format mismatch.
      </div>
    );
  }

  const Component = Registry[type];
  if (!Component) {
    return <div className="text-yellow-500 text-sm">Unknown visualization type</div>;
  }

  return <Component data={data} />;
});

WidgetRenderer.displayName = 'WidgetRenderer';