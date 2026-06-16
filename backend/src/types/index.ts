import { z } from 'zod';

// 1. Categorical (Key-Value)
export const CategoricalSchema = z.array(
  z.object({ key: z.string(), value: z.number() })
);

// 2. Temporal (Time-Series ISO-8601)
export const TemporalSchema = z.array(
  z.object({ timestamp: z.string().datetime(), value: z.number() })
);

// 3. Hierarchical (Nested Tree)
export type HierarchicalNode = {
  name: string;
  value?: number;
  children?: HierarchicalNode[];
};
export const HierarchicalSchema: z.ZodType<HierarchicalNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    value: z.number().optional(),
    children: z.array(HierarchicalSchema).optional(),
  })
);

// 4. Relational (Coordinates)
export const RelationalSchema = z.array(
  z.object({ x: z.number(), y: z.number(), size: z.number().optional() })
);

// Unified Response Type
export interface WidgetResponse {
  widgetId: string;
  type: 'categorical' | 'temporal' | 'hierarchical' | 'relational';
  data: any;
}