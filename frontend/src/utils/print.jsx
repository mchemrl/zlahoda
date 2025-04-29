import React from 'react';

export const initializePrintStyle = () => {
  if (!document.getElementById('print-stylesheet')) {
    const style = document.createElement("style");
    style.id = 'print-stylesheet';
    style.textContent = `
      @media print {
        
        body * {
          visibility: hidden;
        }
        
        #print-content, #print-content * {
          visibility: visible;
        }
        
        #print-header, #print-header * {
          color: black;
          visibility: visible !important;
          display: block !important;
        }
        
        #print-content {
          position: absolute;
          left: 0;
          top: 130px; 
          width: 100%;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          margin-bottom: 80px; /* Add space at bottom for footer */
        }
        
        table { page-break-inside: auto; }
        tr    { page-break-inside: avoid; page-break-after: auto; }
        
        #print-content {
          width: 100%;
          border-collapse: collapse;
          background-color: white !important;
          color: black !important;
        }
        
        #print-content th, #print-content td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
          color: black !important;
          background-color: white !important;
        }
        
        #print-content th {
          font-weight: bold;
          border-bottom: 2px solid #ddd;
        }
        
        #print-header {
          display: block !important;
          position: fixed;
          top: 20mm;
          left: 0;
          width: 100%;
          text-align: center;
          font-size: 14pt;
          padding: 10px 0;
          border-bottom: 1px solid #ddd;
          background-color: white !important;
          visibility: visible !important;
        }
        
        @page {
          margin: 1.8cm 1cm 20mm 1cm;
          counter-increment: page;
          @bottom-center {
            content: "Page " counter(page) " of " counter(pages);
          }
          
        }
      }
      
      #print-header {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }
};


export const getCurrentDate = () => {
  const date = new Date();
  return date.toLocaleDateString();
};


export const handlePrint = () => {
  window.print();
};

export const PrintHeader = ({ title = "Report" }) => {
  return (
    <div id="print-header">
      <h1>{title}</h1>
      <p>Date: {getCurrentDate()}</p>
    </div>
  );
};


export const usePrintStyles = () => {
  React.useEffect(() => {
    initializePrintStyle();
  }, []);
};

export default {
  initializePrintStyle,
  getCurrentDate,
  handlePrint,
  PrintHeader,
  usePrintStyles
};