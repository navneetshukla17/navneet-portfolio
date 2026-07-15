'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  pdfUrl: string;
  fallbackIcon: React.ReactNode;
}

type PdfJsLib = any;

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

const CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const LOAD_TIMEOUT = 15000;

function loadPdfJs(): Promise<PdfJsLib> {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
      resolve(window.pdfjsLib);
      return;
    }

    const timer = setTimeout(() => reject(new Error('Timed out loading pdf.js from CDN')), LOAD_TIMEOUT);

    const script = document.createElement('script');
    script.src = CDN_URL;
    script.onload = () => {
      clearTimeout(timer);
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('pdf.js loaded but pdfjsLib not found on window'));
      }
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Failed to load pdf.js script from CDN'));
    };
    document.head.appendChild(script);
  });
}

export default function PdfThumbnail({ pdfUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!pdfUrl) {
      setLoading(false);
      setErrorMsg('No PDF URL provided');
      return;
    }

    const renderFirstPage = async () => {
      try {
        const pdfjsLib = await loadPdfJs();
        if (!active) return;

        const proxiedUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
        const loadingTask = pdfjsLib.getDocument(proxiedUrl);
        const pdf = await loadingTask.promise;
        if (!active) return;

        const page = await pdf.getPage(1);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: 1.0 });

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
      } catch (err: any) {
        console.error('Failed to render PDF thumbnail:', err);
        if (active) {
          setErrorMsg(err?.message || err?.stack || String(err) || 'Unknown error');
          setLoading(false);
        }
      }
    };

    renderFirstPage();

    return () => {
      active = false;
    };
  }, [pdfUrl]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        className="pdf-thumb-canvas"
        style={{ display: loading || errorMsg ? 'none' : 'block' }}
      />

      {loading && (
        <div className="pdf-thumb-state">
          <span className="pdf-thumb-spinner">⏳</span>
          <span style={{ fontSize: 11, marginTop: 4, color: 'var(--text-dim)' }}>
            Loading thumbnail...
          </span>
        </div>
      )}

      {errorMsg && (
        <div
          className="pdf-thumb-state"
          style={{
            color: 'red',
            fontSize: '12px',
            padding: '10px',
            wordBreak: 'break-all',
            overflowY: 'auto',
            textAlign: 'left',
          }}
        >
          <strong>Error rendering PDF:</strong>
          <br />
          {errorMsg}
        </div>
      )}
    </div>
  );
}