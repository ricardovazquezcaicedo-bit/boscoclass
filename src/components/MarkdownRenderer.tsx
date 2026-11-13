import React, { useMemo } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

const customRenderer = new marked.Renderer();
customRenderer.image = ({ href, title, text }: any) => {
  const cleanHref = href || '';
  const cleanAlt = text || 'Ilustración Didáctica Creada por IA';
  return `<figure class="my-4 rounded-2xl overflow-hidden border border-red-900/20 dark:border-red-900/40 bg-slate-950/5 dark:bg-black/40 shadow-lg">
    <div class="relative group">
      <span class="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
        ✨ Creado por BoscoIA
      </span>
      <img src="${cleanHref}" alt="${cleanAlt}" class="w-full h-auto max-h-[520px] object-contain mx-auto bg-[#0b1320] rounded-t-2xl transition-transform" loading="lazy" />
      <div class="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        <a href="${cleanHref}" download="boscoia_ilustracion.svg" class="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[11px] font-bold backdrop-blur-xs transition-colors shadow-sm">
          ⬇️ Descargar
        </a>
        <a href="${cleanHref}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-bold backdrop-blur-xs transition-colors shadow-sm">
          🔍 Ver en grande
        </a>
      </div>
    </div>
    <figcaption class="px-4 py-2.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800">
      ${cleanAlt}
    </figcaption>
  </figure>`;
};

marked.use({ renderer: customRenderer });

function normalizeMathFractions(math: string): string {
  if (math.includes('\\frac')) return math;
  return math
    .replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}')
    .replace(/\(([^()]+)\)\s*\/\s*([0-9a-zA-Z]+)/g, '\\frac{$1}{$2}')
    .replace(/([0-9a-zA-Z]+)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
}

/**
 * Preprocess markdown to render LaTeX math expressions with KaTeX
 * before passing to marked, while preserving code blocks.
 */
function renderMathInMarkdown(text: string): string {
  if (!text) return '';

  // 1. Preserve code blocks (triple and single backticks)
  const codeBlocks: string[] = [];
  let sanitized = text.replace(/(```[\s\S]*?```|`[^`\n]*?`)/g, (match) => {
    const id = `%%MATH_CODE_BLOCK_${codeBlocks.length}%%`;
    codeBlocks.push(match);
    return id;
  });

  // 2. Render Display/Block Math: $$...$$
  sanitized = sanitized.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const trimmed = math.trim();
    if (!trimmed) return '';
    try {
      const normalized = normalizeMathFractions(trimmed);
      return `<div class="katex-display-wrapper my-3 overflow-x-auto text-center">${katex.renderToString(normalized, {
        displayMode: true,
        throwOnError: false,
      })}</div>`;
    } catch {
      return `$$${math}$$`;
    }
  });

  // 3. Render Inline Math: $...$
  sanitized = sanitized.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (match, math) => {
    const trimmed = math.trim();
    if (!trimmed) return match;
    try {
      const normalized = normalizeMathFractions(trimmed);
      return katex.renderToString(normalized, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return match;
    }
  });

  // 4. Render raw \frac{...}{...} if present outside $...$ delimiters
  sanitized = sanitized.replace(/(\\frac\{[^{}]+\}\{[^{}]+\})/g, (match) => {
    try {
      return katex.renderToString(match, { displayMode: false, throwOnError: false });
    } catch {
      return match;
    }
  });

  // 5. Restore preserved code blocks
  sanitized = sanitized.replace(/%%MATH_CODE_BLOCK_(\d+)%%/g, (_, idx) => {
    return codeBlocks[Number(idx)] || '';
  });

  return sanitized;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Convert markdown and KaTeX equations to HTML
  const html = useMemo(() => {
    try {
      const withMath = renderMathInMarkdown(content || '');
      return marked.parse(withMath) as string;
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className="markdown-body text-slate-800 dark:text-slate-100"
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={(e) => {
        // Allow copy button inside pre/code blocks if user clicks
        const target = e.target as HTMLElement;
        const copyBtn = target.closest('.code-copy-btn');
        if (copyBtn) {
          const codeEl = copyBtn.parentElement?.querySelector('code');
          if (codeEl) {
            navigator.clipboard.writeText(codeEl.innerText);
            copyBtn.textContent = '¡Copiado!';
            setTimeout(() => {
              copyBtn.textContent = 'Copiar';
            }, 2000);
          }
        }
      }}
    />
  );
};

export const CodeBlockWithCopy: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-emerald-900/30 bg-slate-900 text-slate-100 text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-slate-400">
        <span className="text-[11px] font-semibold uppercase">{language || 'código'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
          title="Copiar código"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};
