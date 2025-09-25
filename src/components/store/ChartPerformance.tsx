import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Legend } from 'recharts';

interface Props {
  data: any[];
  products: { id: string; name: string }[];
  selectedProductId: 'all' | 'none' | string;
  selectedProductIdB: 'none' | string;
}

const ChartPerformance: React.FC<Props> = ({ data, products, selectedProductId, selectedProductIdB }) => {
  const resolveName = (id: 'all' | 'none' | string) => {
    if (id === 'all') return 'Todos';
    if (id === 'none') return '—';
    return products.find(p => p.id === id)?.name || 'Producto';
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(v: any) => `$${Number(v).toFixed(0)}`} />
        <Legend />
        <Line type="monotone" dataKey="a" name={resolveName(selectedProductId)} stroke="#111827" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="forecast" name="Ingresos Futuros" stroke="#6b7280" strokeWidth={2} strokeDasharray="6 6" dot={false} />
        {selectedProductIdB !== 'none' && (
          <Line type="monotone" dataKey="b" name={resolveName(selectedProductIdB)} stroke="#0ea5e9" strokeWidth={2} dot={false} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartPerformance;
