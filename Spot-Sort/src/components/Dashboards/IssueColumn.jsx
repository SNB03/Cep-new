// src/components/Dashboards/IssueColumn.jsx
import React from 'react';
import IssueCard from './IssueCard';

const IssueColumn = ({ 
  title, 
  issues, 
  isDayTheme, 
  onStatusUpdate, 
  count, 
  titleColor = 'text-teal-400', // Default color
  separatorColor = 'border-teal-500' // Default color
}) => {
  
  const columnBgClass = isDayTheme ? 'bg-gray-100' : 'bg-gray-800';
  const textClass = isDayTheme ? 'text-gray-600' : 'text-gray-400';
  // Dynamically switch text color for day/night themes
  const titleTextClass = isDayTheme ? titleColor.replace('text-teal-400', 'text-teal-600').replace('text-red-400', 'text-red-700') : titleColor;
  const separatorClass = isDayTheme ? separatorColor.replace('border-teal-500', 'border-teal-600').replace('border-red-500', 'border-red-600') : separatorColor;

  return (
    // 1. The main column wrapper (the gray box)
    <div className={`rounded-xl p-4 ${columnBgClass}`}>
      
      {/* 2. Column Header */}
      <div className="mb-4">
        <h2 className={`text-xl font-bold ${titleTextClass}`}>
          {title}
        </h2>
        <p className={`text-sm ${textClass}`}>{count} Issues</p>
      </div>

      {/* 3. Separator Line */}
      <hr className={`border-dashed mb-4 ${separatorClass}`} />

      {/* 4. List of Issues (with scrollbar) */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-400px)] custom-scrollbar pr-2">
        {issues.length === 0 ? (
          <div className="text-center py-10">
            <p className={textClass}>No issues in this category.</p>
            {title.includes('In Progress') && (
              <p className={`text-sm ${textClass} mt-1`}>Great job! Time for the next column.</p>
            )}
          </div>
        ) : (
          issues.map(issue => (
            <IssueCard
              key={issue.ticketId}
              issue={issue}
              isDayTheme={isDayTheme}
              onStatusUpdate={onStatusUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default IssueColumn;