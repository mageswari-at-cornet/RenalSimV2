import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface TrendChartProps {
  data: { x: string | number; y: number }[];
  title?: string;
  targetValue?: number;
  warningValue?: number;
  criticalValue?: number;
  yAxisLabel?: string;
  color?: string;
  showTargetBand?: boolean;
  targetMin?: number;
  targetMax?: number;
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
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  targetValue,
  warningValue,
  criticalValue,
  yAxisLabel,
  color = '#2f7df6',
  showTargetBand,
  targetMin,
  targetMax,
}) => {
  return (
    <div className="w-full h-full min-h-[200px]">
      {title && (
        <h4 className="text-sm font-semibold text-renal-text mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
          <XAxis
            dataKey="x"
            stroke="#9aa8bb"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#1e2a3a' }}
          />
          <YAxis
            stroke="#9aa8bb"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#1e2a3a' }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#9aa8bb', fontSize: 11 } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {showTargetBand && targetMin !== undefined && targetMax !== undefined && (
            <>
              <ReferenceLine y={targetMin} stroke="#23d18b" strokeDasharray="3 3" />
              <ReferenceLine y={targetMax} stroke="#23d18b" strokeDasharray="3 3" />
            </>
          )}
          {targetValue !== undefined && (
            <ReferenceLine y={targetValue} stroke="#23d18b" strokeDasharray="5 5" />
          )}
          {warningValue !== undefined && (
            <ReferenceLine y={warningValue} stroke="#ffb020" strokeDasharray="5 5" />
          )}
          {criticalValue !== undefined && (
            <ReferenceLine y={criticalValue} stroke="#ff4d4f" strokeDasharray="5 5" />
          )}
          <Area
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
            dot={{ fill: color, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};