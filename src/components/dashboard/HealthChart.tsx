"use client"

import { Download } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';

const data = [
  { month: 'Jan', value: 25 },
  { month: 'Feb', value: 30 },
  { month: 'Mar', value: 45 },
  { month: 'Apr', value: 55 },
  { month: 'May', value: 70 },
  { month: 'Jun', value: 80 },
  { month: 'Jul', value: 85 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm shadow-lg">
        <p className="text-xs text-gray-400 mb-0.5">
          {payload[0].payload.month} 2022
        </p>
        <p className="font-semibold">{payload[0].value} mood score</p>
      </div>
    );
  }
  return null;
};

const HealthChart = () => {
  // Download PDF report
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129); // Primary green
    doc.text('Mood Health Report', 20, 25);
    
    // Subtitle with date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, 35);
    
    // Divider line
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 42, 190, 42);
    
    // Summary section
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('Monthly Mood Scores', 20, 55);
    
    // Data table header
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text('Month', 20, 70);
    doc.text('Mood Score', 80, 70);
    doc.text('Status', 130, 70);
    
    // Data rows
    doc.setTextColor(17, 24, 39);
    let yPos = 80;
    
    data.forEach((item) => {
      doc.setFontSize(11);
      doc.text(item.month, 20, yPos);
      doc.text(item.value.toString(), 80, yPos);
      
      // Status based on score
      let status = 'Low';
      if (item.value >= 70) status = 'Excellent';
      else if (item.value >= 50) status = 'Good';
      else if (item.value >= 30) status = 'Fair';
      
      // Color code status
      if (status === 'Excellent') doc.setTextColor(16, 185, 129);
      else if (status === 'Good') doc.setTextColor(59, 130, 246);
      else if (status === 'Fair') doc.setTextColor(245, 158, 11);
      else doc.setTextColor(239, 68, 68);
      
      doc.text(status, 130, yPos);
      doc.setTextColor(17, 24, 39);
      
      yPos += 10;
    });
    
    // Summary stats
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('Summary Statistics', 20, yPos);
    
    yPos += 12;
    doc.setFontSize(11);
    
    const avgScore = Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length);
    const maxScore = Math.max(...data.map(d => d.value));
    const minScore = Math.min(...data.map(d => d.value));
    
    doc.setTextColor(107, 114, 128);
    doc.text('Average Score:', 20, yPos);
    doc.setTextColor(17, 24, 39);
    doc.text(avgScore.toString(), 70, yPos);
    
    yPos += 8;
    doc.setTextColor(107, 114, 128);
    doc.text('Highest Score:', 20, yPos);
    doc.setTextColor(16, 185, 129);
    doc.text(maxScore.toString() + ' (Jul)', 70, yPos);
    
    yPos += 8;
    doc.setTextColor(107, 114, 128);
    doc.text('Lowest Score:', 20, yPos);
    doc.setTextColor(239, 68, 68);
    doc.text(minScore.toString() + ' (Jan)', 70, yPos);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('Unwind - Your Mental Wellness Companion', 20, 280);
    
    // Download
    doc.save('mood-health-report.pdf');
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Mood Health Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            Mood Health
          </h3>
          <button 
            onClick={downloadPDF}
            className="text-primary text-sm font-medium inline-flex items-center gap-2 cursor-pointer hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <HugeiconsIcon icon={Download}/>
            Download report
          </button>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 13 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 14 }}
                ticks={[0, 25, 50, 100]}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10B981', strokeWidth: 2 }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
                activeDot={{ r: 6, fill: '#10a170ff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HealthChart;