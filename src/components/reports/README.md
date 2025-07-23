# Report Card System

This folder contains components for generating student report cards.

## Installation

To enable PDF generation, you need to install the following dependencies:

```bash
npm install @react-pdf/renderer
```

## Components

- `ReportCardPDF`: Generates a PDF report card for a student
- More components will be added as needed

## Usage

```jsx
import { ReportCardPDF } from '../components/reports';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Inside your component
return (
  <PDFDownloadLink
    document={<ReportCardPDF report={reportData} schoolSettings={schoolSettings} />}
    fileName={`Report_${studentName}.pdf`}
  >
    {({ loading }) => (
      <Button disabled={loading}>
        {loading ? 'Loading...' : 'Download Report'}
      </Button>
    )}
  </PDFDownloadLink>
);
```