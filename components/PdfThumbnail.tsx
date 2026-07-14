'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  pdfUrl: string;
  fallbackIcon: React.ReactNode;
}

export default function PdfThumbnail({ pdfUrl, fallbackIcon }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!pdfUrl) {
      setLoading(false);
      setError(true);
      return;
    }

    const scriptId = 'pdfjs-loader-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderFirstPage = async () => {
      try {
        const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
        if (!pdfjsLib) {
          throw new Error('PDF.js not loaded on window');
        }

        // Configure the worker to match the major version
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (!active) return;

        const page = await pdf.getPage(1);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: 1.0 });
        
        // Render at a solid 400px width for high-density displays (Retina/etc.)
        const desiredWidth = 400;
        const scale = desiredWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        await page.render(renderContext).promise;
        if (active) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to render PDF thumbnail:', err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    const initPdfJs = () => {
      if ((window as any)['pdfjs-dist/build/pdf']) {
        renderFirstPage();
      } else {
        const interval = setInterval(() => {
          if ((window as any)['pdfjs-dist/build/pdf']) {
            clearInterval(interval);
            renderFirstPage();
          }
        }, 100);
        setTimeout(() => clearInterval(interval), 5000); // 5s timeout safety
      }
    };

    if (script) {
      initPdfJs();
    } else {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.async = true;
      script.onload = () => {
        initPdfJs();
      };
      script.onerror = () => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      active = false;
    };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className="pdf-thumb-state">
        <span className="pdf-thumb-spinner">⏳</span>
        <span style={{ fontSize: 11, marginTop: 4, color: 'var(--text-dim)' }}>Loading thumbnail...</span>
      </div>
    );
  }

  if (error) {
    return <>{fallbackIcon}</>;
  }

  return (
    <canvas
      ref={canvasRef}
      className="pdf-thumb-canvas"
    />
  );
}
