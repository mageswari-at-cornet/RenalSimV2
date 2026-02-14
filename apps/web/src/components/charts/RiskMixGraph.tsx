import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Card } from '../ui/Card';
import type { Patient } from '../../types';

interface RiskMixGraphProps {
  patients: Patient[];
}

// Seeded random number generator for consistent results
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const RiskMixGraph: React.FC<RiskMixGraphProps> = ({ patients }) => {
  // Generate histogram data using useMemo to avoid re-calculation on every render
  const { mortalityData, hospitalizationData, inflammationData } = useMemo(() => {
    const mortality = patients.map(p => p.mortalityRisk['90d']);
    const hospitalization = patients.map((_, idx) => seededRandom(idx + 100) * 40 + 5);
    const inflammation = patients.map((_, idx) => seededRandom(idx + 200) * 80 + 10);
    
    return {
      mortalityData: mortality,
      hospitalizationData: hospitalization,
      inflammationData: inflammation,
    };
  }, [patients]);

  // Calculate statistics
  const avgMortality = mortalityData.reduce((a, b) => a + b, 0) / mortalityData.length;
  
  const trace1 = {
    x: mortalityData,
    type: 'histogram',
    name: '90-day Mortality',
    marker: {
      color: 'rgba(239, 68, 68, 0.7)',
      line: {
        color: 'rgba(239, 68, 68, 1)',
        width: 1.5,
      },
    },
    nbinsx: 15,
    histnorm: 'probability density',
    hovertemplate: '<b>90-day Mortality</b><br>Risk: %{x:.1f}%<br>Density: %{y:.3f}<extra></extra>',
  };

  const trace2 = {
    x: hospitalizationData,
    type: 'histogram',
    name: '30-day Hospitalization',
    marker: {
      color: 'rgba(245, 158, 11, 0.7)',
      line: {
        color: 'rgba(245, 158, 11, 1)',
        width: 1.5,
      },
    },
    nbinsx: 15,
    histnorm: 'probability density',
    hovertemplate: '<b>30-day Hospitalization</b><br>Risk: %{x:.1f}%<br>Density: %{y:.3f}<extra></extra>',
  };

  const trace3 = {
    x: inflammationData,
    type: 'histogram',
    name: 'Inflammation Level',
    marker: {
      color: 'rgba(59, 130, 246, 0.7)',
      line: {
        color: 'rgba(59, 130, 246, 1)',
        width: 1.5,
      },
    },
    nbinsx: 15,
    histnorm: 'probability density',
    hovertemplate: '<b>Inflammation Level</b><br>Level: %{x:.1f}<br>Density: %{y:.3f}<extra></extra>',
  };

  const layout = {
    title: {
      text: '',
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    barmode: 'overlay' as const,
    font: {
      color: '#9aa8bb',
      family: 'Inter, sans-serif',
    },
    xaxis: {
      title: {
        text: 'Risk Percentage (%)',
        font: { color: '#6b7280', size: 12 },
      },
      gridcolor: 'rgba(30, 42, 58, 0.5)',
      tickfont: { color: '#9aa8bb', size: 10 },
      zerolinecolor: '#1e2a3a',
      showgrid: true,
    },
    yaxis: {
      title: {
        text: 'Probability Density',
        font: { color: '#6b7280', size: 12 },
      },
      gridcolor: 'rgba(30, 42, 58, 0.5)',
      tickfont: { color: '#9aa8bb', size: 10 },
      zerolinecolor: '#1e2a3a',
      showgrid: true,
    },
    legend: {
      orientation: 'h' as const,
      y: -0.25,
      x: 0.5,
      xanchor: 'center' as const,
      yanchor: 'top' as const,
      font: { color: '#9aa8bb', size: 10 },
      bgcolor: 'rgba(11, 18, 32, 0.9)',
      bordercolor: '#1e2a3a',
      borderwidth: 1,
    },
    margin: { t: 10, r: 20, b: 60, l: 60 },
    autosize: true,
    hovermode: 'x unified' as const,
    shapes: [
      // Add a vertical line at the average mortality risk
      {
        type: 'line' as const,
        x0: avgMortality,
        x1: avgMortality,
        y0: 0,
        y1: 1,
        yref: 'paper' as const,
        line: {
          color: 'rgba(239, 68, 68, 0.5)',
          width: 2,
          dash: 'dot' as const,
        },
      },
    ],
    annotations: [
      {
        x: avgMortality,
        y: 1,
        yref: 'paper' as const,
        text: `Avg: ${avgMortality.toFixed(1)}%`,
        showarrow: false,
        font: {
          color: '#ef4444',
          size: 10,
        },
        bgcolor: 'rgba(11, 18, 32, 0.9)',
        bordercolor: '#ef4444',
        borderwidth: 1,
        borderpad: 3,
      },
    ],
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  return (
    <Card className="h-full">
      {/* Title */}
      <h3 className="text-sm font-semibold text-renal-text mb-3">Risk Distribution Analysis</h3>
      
      {/* Chart */}
      <div className="h-72">
        <Plot
          data={[trace1, trace2, trace3]}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </Card>
  );
};