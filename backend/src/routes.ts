import { Router, Request, Response } from 'express';
import {
  generateCategoricalData,
  generateTemporalData,
  generateHierarchicalData,
  generateRelationalData
} from './mockEngine';
import {
  CategoricalSchema,
  TemporalSchema,
  HierarchicalSchema,
  RelationalSchema
} from './types';

const router = Router();

router.get('/widgets/data', async (req: Request, res: Response) => {
  try {
    // Simulating parallel asynchronous operations (e.g., Promise.all for DB/API streams)
    const [categorical, temporal, hierarchical, relational] = await Promise.all([
      Promise.resolve(generateCategoricalData()),
      Promise.resolve(generateTemporalData()),
      Promise.resolve(generateHierarchicalData()),
      Promise.resolve(generateRelationalData())
    ]);

    // Validation Layer (Schema Enforcement)
    const payload = [
      { widgetId: 'w-1', type: 'categorical', data: CategoricalSchema.parse(categorical) },
      { widgetId: 'w-2', type: 'temporal', data: TemporalSchema.parse(temporal) },
      { widgetId: 'w-3', type: 'hierarchical', data: HierarchicalSchema.parse(hierarchical) },
      { widgetId: 'w-4', type: 'relational', data: RelationalSchema.parse(relational) }
    ];

    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ error: 'Schema validation failed or stream interrupted', details: error.errors });
  }
});

export default router;