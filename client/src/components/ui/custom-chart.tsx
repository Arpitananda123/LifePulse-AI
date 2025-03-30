import React from 'react';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { cn } from '@/lib/utils';

interface BaseChartProps {
  data: any[];
  className?: string;
  height?: number;
}

interface LineChartProps extends BaseChartProps {
  lines: Array<{
    dataKey: string;
    stroke: string;
    name?: string;
    strokeWidth?: number;
    dot?: boolean;
  }>;
  xAxisDataKey?: string;
  grid?: boolean;
  tooltip?: boolean;
  legend?: boolean;
}

export function CustomLineChart({
  data,
  lines,
  xAxisDataKey = 'name',
  grid = true,
  tooltip = true,
  legend = false,
  className,
  height = 300,
}: LineChartProps) {
  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          {grid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />}
          <XAxis
            dataKey={xAxisDataKey}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          {tooltip && <Tooltip />}
          {legend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth || 2}
              name={line.name || line.dataKey}
              dot={line.dot !== false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AreaChartProps extends BaseChartProps {
  areas: Array<{
    dataKey: string;
    fill: string;
    stroke: string;
    name?: string;
    stackId?: string;
  }>;
  xAxisDataKey?: string;
  grid?: boolean;
  tooltip?: boolean;
  legend?: boolean;
}

export function CustomAreaChart({
  data,
  areas,
  xAxisDataKey = 'name',
  grid = true,
  tooltip = true,
  legend = false,
  className,
  height = 300,
}: AreaChartProps) {
  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          {grid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />}
          <XAxis
            dataKey={xAxisDataKey}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          {tooltip && <Tooltip />}
          {legend && <Legend />}
          {areas.map((area, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={area.dataKey}
              fill={area.fill}
              stroke={area.stroke}
              name={area.name || area.dataKey}
              stackId={area.stackId}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarChartProps extends BaseChartProps {
  bars: Array<{
    dataKey: string;
    fill: string;
    name?: string;
    stackId?: string;
  }>;
  xAxisDataKey?: string;
  grid?: boolean;
  tooltip?: boolean;
  legend?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export function CustomBarChart({
  data,
  bars,
  xAxisDataKey = 'name',
  grid = true,
  tooltip = true,
  legend = false,
  className,
  height = 300,
  layout = 'horizontal',
}: BarChartProps) {
  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          {grid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />}
          <XAxis
            dataKey={xAxisDataKey}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          {tooltip && <Tooltip />}
          {legend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name || bar.dataKey}
              stackId={bar.stackId}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
