import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  yAxisLabel?: string;
  horizontal?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-renal-panel border border-renal-border rounded-lg p-3 shadow-xl">
        <p className="text-renal-text text-sm">{label}</p>
        <p className="text-rs-blue text-lg font-bold">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  title,
  yAxisLabel,
  horizontal = false,
}) => {
  return (
    <div className="w-full h-full min-h-[200px]">
      {title && (
        <h4 className="text-sm font-semibold text-renal-text mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
          <XAxis
            type={horizontal ? 'number' : 'category'}
            dataKey={horizontal ? undefined : 'name'}
            stroke="#9aa8bb"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#1e2a3a' }}
          />
          <YAxis
            type={horizontal ? 'category' : 'number'}
            dataKey={horizontal ? 'name' : undefined}
            stroke="#9aa8bb"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#1e2a3a' }}
            width={horizontal ? 120 : 60}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#9aa8bb', fontSize: 11 } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#2f7df6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};