import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { clsx } from 'clsx';

// Initialize mermaid with default config
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'strict',
  fontFamily: 'Inter, system-ui, sans-serif',
});

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className={clsx('rounded-lg border border-red-200 bg-red-50 p-4', className)}>
        <p className="text-sm text-red-600">Diagram error: {error}</p>
        <pre className="mt-2 text-xs text-gray-600">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        'my-4 flex justify-center overflow-x-auto rounded-lg border border-gray-200 bg-white p-4',
        className
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
