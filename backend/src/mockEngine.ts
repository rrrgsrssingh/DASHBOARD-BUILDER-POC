import { HierarchicalNode } from './types';

export const generateCategoricalData = () => [
  { key: 'SaaS Sales', value: 4500 },
  { key: 'Services', value: 2800 },
  { key: 'Marketing', value: 1800 },
  { key: 'Support', value: 900 }
];

export const generateTemporalData = () => {
  const data = [];
  const baseDate = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    data.push({
      timestamp: d.toISOString(),
      value: Math.floor(Math.random() * 1000) + 500
    });
  }
  return data;
};

export const generateHierarchicalData = (): HierarchicalNode => ({
  name: "Root Corp",
  children: [
    {
      name: "North America",
      children: [
        { name: "USA", value: 5000 },
        { name: "Canada", value: 3000 }
      ]
    },
    {
      name: "Europe",
      children: [
        { name: "Germany", value: 4000 },
        { name: "UK", value: 2500 }
      ]
    }
  ]
});

export const generateRelationalData = () => {
  return Array.from({ length: 15 }, () => ({
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    size: Math.floor(Math.random() * 50) + 10
  }));
};