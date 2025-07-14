// import React from 'react';
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../utils';
// import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';

// // Define the props type for TypeScript (optional, remove if using plain JavaScript)
// interface ChartProps {
//   data: Array<{ [key: string]: any }>; // Data array for the chart
//   xKey: string; // Key for X-axis (e.g., 'name')
//   yKey: string; // Key for Y-axis (e.g., 'value')
//   chartType?: 'area' | 'bar'; // Chart type: 'area' or 'bar'
//   title?: string; // Optional chart title
// }

// // Reusable Chart Component
// const CustomChart: React.FC<ChartProps> = ({
//   data,
//   xKey,
//   yKey,
//   chartType = 'bar',
//   title,
// }) => {
//   // Common chart styles
//   const chartConfig = {
//     [yKey]: {
//       label: yKey.charAt(0).toUpperCase() + yKey.slice(1), // Capitalize Y-axis label
//       color: '#3b82f6', // Blue color, works for light/dark themes
//     },
//   };

//   return (
//     <div className="w-full">
//       {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
//       <ChartContainer config={chartConfig}>
//         {chartType === 'area' ? (
//           <AreaChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey={xKey} />
//             <YAxis />
//             <ChartTooltip content={<ChartTooltipContent />} />
//             <Area
//               type="monotone"
//               dataKey={yKey}
//               stroke={chartConfig[yKey].color}
//               fill={chartConfig[yKey].color}
//               fillOpacity={0.3}
//             />
//           </AreaChart>
//         ) : (
//           <BarChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey={xKey} />
//             <YAxis />
//             <ChartTooltip content={<ChartTooltipContent />} />
//             <Bar dataKey={yKey} fill={chartConfig[yKey].color} />
//           </BarChart>
//         )}
//       </ChartContainer>
//     </div>
//   );
// };

// export default CustomChart;