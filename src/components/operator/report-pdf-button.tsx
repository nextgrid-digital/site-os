'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ReportPdfButton({
  targetSelector = '.typeset.typeset-docs',
  filename = 'audit-report.pdf',
  backgroundColor = '#0a0a0b',
}: {
  targetSelector?: string;
  filename?: string;
  backgroundColor?: string;
} = {}) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const { jsPDF } = await import('jspdf');

      const reportEl = document.querySelector(targetSelector) as HTMLElement | null;
      if (!reportEl) return;

      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        backgroundColor,
        scrollX: 0,
        scrollY: -window.scrollY,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } finally {
      setGenerating(false);
    }
  }, [backgroundColor, filename, targetSelector]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={generating}
      data-no-print
      className="gap-1.5"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {generating ? 'Generating…' : 'Download PDF'}
    </Button>
  );
}
