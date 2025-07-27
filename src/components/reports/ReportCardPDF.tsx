import React from 'react';
// PDF rendering will be implemented when @react-pdf/renderer is installed
// For now, we'll create a mock component
import type { Report, SubjectReport } from '../../types';

// This is a mock component until @react-pdf/renderer is installed

interface ReportCardPDFProps {
  report: any;
  schoolSettings: any;
}

const ReportCardPDF: React.FC<ReportCardPDFProps> = ({ report, schoolSettings }) => {
  return (
    <div className="p-4 border rounded">
      <h2>Report Card Preview</h2>
      <p>Student: {report.student?.firstName} {report.student?.lastName}</p>
      <p>Term: {report.term}</p>
      <p>Academic Year: {report.academicYear}</p>
      <p>This is a placeholder. Install @react-pdf/renderer to enable PDF generation.</p>
    </div>
  );
};

export default ReportCardPDF;