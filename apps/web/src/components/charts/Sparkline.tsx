import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number | string;
  height?: number;
  color?: string;
  showArea?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 30,
  color = '#2f7df6',
  showArea = true,
}) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Convert width to number for calculations
  const numericWidth = typeof width === 'string' ? 200 : width;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * numericWidth;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${numericWidth},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible" viewBox={`0 0 ${numericWidth} ${height}`} preserveAspectRatio="none">
      {showArea && (
        <polygon
          points={areaPoints}
          fill={color}
          fillOpacity={0.2}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};