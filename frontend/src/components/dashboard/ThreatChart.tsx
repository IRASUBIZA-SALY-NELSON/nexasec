"use client"
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import CyberLoader from '@/components/ui/CyberLoader';
import { TrendDataPoint } from '@/types/dashboard';

Chart.register(...registerables);

interface ThreatChartProps {
  data: TrendDataPoint[];
  isLoading: boolean;
}

export default function ThreatChart({ data, isLoading }: ThreatChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (isLoading || !data || data.length === 0) return;

    // Group data by date and severity
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0
        };
      }
      acc[item.date][item.severity] = item.count;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // Sort dates
    const sortedDates = Object.keys(groupedData).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    // Prepare datasets
    const datasets = [
      {
        label: 'Critical',
        data: sortedDates.map(date => groupedData[date].critical || 0),
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        borderColor: 'rgba(255, 0, 0, 1)',
        borderWidth: 1
      },
      {
        label: 'High',
        data: sortedDates.map(date => groupedData[date].high || 0),
        backgroundColor: 'rgba(255, 165, 0, 0.5)',
        borderColor: 'rgba(255, 165, 0, 1)',
        borderWidth: 1
      },
      {
        label: 'Medium',
        data: sortedDates.map(date => groupedData[date].medium || 0),
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
        borderColor: 'rgba(255, 255, 0, 1)',
        borderWidth: 1
      },
      {
        label: 'Low',
        data: sortedDates.map(date => groupedData[date].low || 0),
        backgroundColor: 'rgba(0, 128, 0, 0.5)',
        borderColor: 'rgba(0, 128, 0, 1)',
        borderWidth: 1
      }
    ];

    if (chartRef.current) {
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: sortedDates,
            datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              },
              y: {
                stacked: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: 'rgba(255, 255, 255, 1)',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                displayColors: true
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, isLoading]);

  if (isLoading) {
    return <CyberLoader />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No threat data available</p>
      </div>
    );
  }

  return <canvas ref={chartRef} />;
}