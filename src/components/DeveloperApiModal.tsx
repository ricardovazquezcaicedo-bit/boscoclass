import React, { useState } from 'react';
import {
  X,
  Code2,
  Key,
  Copy,
  Check,
  Play,
  Send,
  Webhook,
  ExternalLink,
  Layers,
  Terminal,
  Cpu,
  Globe,
  Radio,
  FileCode,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface DeveloperApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionName?: string;
}

export const DeveloperApiModal: React.FC<DeveloperApiModalProps> = ({
  isOpen,
  onClose,
  institutionName = 'Colegio San Juan Bosco',
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'code' | 'sandbox' | 'webhooks'>('quickstart');
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'curl' | 'iframe'>('javascript');
  
  // API Key state persisted in localStorage
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('bosco_dev_api_key');
      if (saved) return saved;
    } catch {}
    const fresh = `bosco_sec_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    try {
      localStorage.setItem('bosco_dev_api_key', fresh);
    } catch {}
    return fresh;
  });

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Sandbox state
  const [sandboxPrompt, setSandboxPrompt] = useState('¿Cómo se resuelve una ecuación de segundo grado por factorización?');
  const [sandboxLevel, setSandboxLevel] = useState('Bachillerato / Preparatoria');
  const [sandboxStream, setSandboxStream] = useState(false);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxStatus, setSandboxStatus] = useState<number | null>(null);

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState('https://mi-otra-app.com/api/webhooks/bosco');
  const [webhookEvent, setWebhookEvent] = useState('tarea.completada');
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com';
  const apiEndpointUrl = `${currentOrigin}/api/v1/chat`;
  const embedUrl = `${currentOrigin}/?embed=true`;

  const handleGenerateNewKey = () => {
    const fresh = `bosco_sec_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    setApiKey(fresh);
    try {
      localStorage.setItem('bosco_dev_api_key', fresh);
    } catch {}
  };

  const copyToClipboard = (text: string, type: 'key' | 'code' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Run Sandbox Request
  const handleRunSandbox = async () => {
    setSandboxLoading(true);
    setSandboxResponse(null);
    setSandboxStatus(null);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          message: sandboxPrompt,
          academicLevel: sandboxLevel,
          institutionName: institutionName,
          stream: sandboxStream,
        }),
      });

      setSandboxStatus(res.status);

      if (sandboxStream) {
        if (!res.body) throw new Error('Sin cuerpo de respuesta.');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const dataStr = line.slice(5).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.delta) {
                  accumulated += parsed.delta;
                  setSandboxResponse(accumulated);
                }
              } catch {}
            }
          }
        }
      } else {
        const data = await res.json();
        setSandboxResponse(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setSandboxResponse(JSON.stringify({ error: err?.message || 'Error al conectar' }, null, 2));
    } finally {
      setSandboxLoading(false);
    }
  };

  // Test Webhook
  const handleTestWebhook = async () => {
    setWebhookLoading(true);
    setWebhookResult(null);

    try {
      const res = await fetch('/api/v1/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          eventType: webhookEvent,
        }),
      });
      const data = await res.json();
      setWebhookResult(data);
    } catch (err: any) {
      setWebhookResult({ success: false, error: err?.message || 'Error de red' });
    } finally {
      setWebhookLoading(false);
    }
  };

  // Code templates
  const codeSnippets = {
    javascript: `// Conexión con BoscoIA desde tu aplicación JavaScript / TypeScript / React / Next.js
async function consultarBoscoIA(pregunta) {
  const url = '${apiEndpointUrl}';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${apiKey}',
    },
    body: JSON.stringify({
      message: pregunta,
      academicLevel: 'Bachillerato',
      institutionName: '${institutionName}',
      stream: false // O true si prefieres streaming Server-Sent Events
    }),
  });

  const data = await response.json();
  console.log('Respuesta pedagógica:', data.response);
  return data.response;
}

// Ejemplo de uso:
consultarBoscoIA('¿Por qué el discriminante de una cuadrática nos dice el número de raíces?');`,

    python: `# Conexión con BoscoIA desde tu app en Python (FastAPI, Flask, Django o scripts)
import requests

def consultar_bosco_ia(pregunta: str) -> str:
    url = "${apiEndpointUrl}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer ${apiKey}"
    }
    payload = {
        "message": pregunta,
        "academicLevel": "Bachillerato",
        "institutionName": "${institutionName}",
        "stream": False
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    data = response.json()
    return data.get("response")

# Ejemplo de uso:
if __name__ == "__main__":
    respuesta = consultar_bosco_ia("Explícame la ley de gravitación universal")
    print(respuesta)`,

    curl: `# Ejecuta esta llamada directamente en tu terminal o impórtala en Postman / Insomnia
curl -X POST "${apiEndpointUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "message": "Explícame cómo resolver fracciones complejas paso a paso",
    "academicLevel": "Secundaria / Bachillerato",
    "institutionName": "${institutionName}",
    "stream": false
  }'`,

    iframe: `<!-- Opción A: Embeber el tutor interactivo completo dentro de tu app -->
<div style="width: 100%; max-width: 900px; height: 650px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
  <iframe 
    src="${embedUrl}" 
    title="Tutor BoscoIA Integrado"
    width="100%" 
    height="100%" 
    style="border: none;"
    allow="microphone"
  ></iframe>
</div>

<!-- Opción B: Ventana modal emergente con JavaScript en tu otra app -->
<button onclick="window.open('${embedUrl}', 'BoscoIA', 'width=500,height=700')">
  Abrir Asistente BoscoIA
</button>`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0e1714] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1d352b] overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1a2d25] flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Conectar con Otra App
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                  REST API v1
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  CORS Habilitado
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Utiliza la inteligencia y didáctica de BoscoIA dentro de cualquier otra aplicación tuya.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#152520] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-2 border-b border-slate-200 dark:border-[#1a2d25] bg-slate-50/70 dark:bg-[#0b1310] flex gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'quickstart'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Claves & Endpoints
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Código para tu App
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sandbox'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Probador en Vivo (Sandbox)
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'webhooks'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Webhook className="w-3.5 h-3.5" />
            Webhooks & Eventos
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: QUICKSTART & CREDENTIALS */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6 animate-fade-in">
              {/* How it works banner */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1.5">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                      ¿Cómo funciona la conexión con tu otra aplicación?
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      BoscoIA expone un punto de enlace HTTP REST público con cabeceras <strong>CORS abiertas</strong>. Tu otra aplicación (ya sea una página web, React, Vue, app móvil en Flutter o backend en Python/Node) puede enviar preguntas por método <code>POST</code> y recibir la respuesta didáctica formateada o embeber el tutor como un widget.
                    </p>
                  </div>
                </div>
              </div>

              {/* Endpoint URLs */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  URL Base del Endpoint REST
                </label>
                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-[#14231e] rounded-xl border border-slate-200 dark:border-[#1e342b]">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex-1 truncate">
                    {apiEndpointUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(apiEndpointUrl, 'url')}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-[#1c3029] hover:bg-slate-200 dark:hover:bg-[#253f36] border border-slate-300 dark:border-[#2a463b] text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* API Key Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tu Clave de Autenticación (API Key)
                  </label>
                  <button
                    onClick={handleGenerateNewKey}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Regenerar Clave
                  </button>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-[#14231e] rounded-xl border border-slate-200 dark:border-[#1e342b]">
                  <Key className="w-4 h-4 text-amber-500 shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={apiKey}
                    className="bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 flex-1 outline-none truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(apiKey, 'key')}
                    className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors font-medium"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copiada' : 'Copiar Clave'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pasa esta clave en la cabecera HTTP: <code>Authorization: Bearer {apiKey}</code> o <code>x-api-key: {apiKey}</code>.
                </p>
              </div>

              {/* Quick specs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121f1a] border border-slate-200 dark:border-[#1a2f26]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" />
                    Formatos
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    JSON síncrono estándar o Streaming en tiempo real (Server-Sent Events).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121f1a] border border-slate-200 dark:border-[#1a2f26]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    CORS
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Permite llamadas desde <code>localhost</code>, dominios de producción o aplicaciones web externas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121f1a] border border-slate-200 dark:border-[#1a2f26]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    Matemáticas & LaTeX
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Respuestas con fórmulas matemáticas y fracciones formateadas en LaTeX estándar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE EXAMPLES */}
          {activeTab === 'code' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#121f1b] rounded-xl border border-slate-200 dark:border-[#1b3027]">
                  <button
                    onClick={() => setSelectedLanguage('javascript')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLanguage === 'javascript'
                        ? 'bg-white dark:bg-[#1a2d26] text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    JavaScript / TypeScript
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('python')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLanguage === 'python'
                        ? 'bg-white dark:bg-[#1a2d26] text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('curl')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLanguage === 'curl'
                        ? 'bg-white dark:bg-[#1a2d26] text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    cURL / HTTP
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('iframe')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLanguage === 'iframe'
                        ? 'bg-white dark:bg-[#1a2d26] text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Iframe / Widget Embebible
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(codeSnippets[selectedLanguage], 'code')}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Código Copiado' : 'Copiar Código'}</span>
                </button>
              </div>

              {/* Code viewer */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#070d0b] text-slate-200">
                <div className="px-4 py-2 border-b border-slate-800/80 bg-[#0b1411] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">
                    {selectedLanguage === 'javascript' && 'boscoClient.js'}
                    {selectedLanguage === 'python' && 'bosco_client.py'}
                    {selectedLanguage === 'curl' && 'terminal.sh'}
                    {selectedLanguage === 'iframe' && 'embed.html'}
                  </span>
                  <span className="text-emerald-400 font-semibold text-[10px]">Listo para producción</span>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-emerald-300/90 whitespace-pre">
                  {codeSnippets[selectedLanguage]}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SANDBOX / TESTER */}
          {activeTab === 'sandbox' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2.5">
                <Play className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  Prueba la API en vivo aquí mismo. Esto ejecuta una llamada HTTP real contra <code>/api/v1/chat</code> para verificar que tu otra app recibirá los datos correctamente.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Request Configuration */}
                <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-[#121f1a] border border-slate-200 dark:border-[#1b3127]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Cuerpo de la Petición (Request Body)
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Pregunta / Mensaje (message)
                    </label>
                    <textarea
                      rows={3}
                      value={sandboxPrompt}
                      onChange={(e) => setSandboxPrompt(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-[#203a2f] bg-white dark:bg-[#0c1613] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Nivel Académico
                      </label>
                      <select
                        value={sandboxLevel}
                        onChange={(e) => setSandboxLevel(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-[#203a2f] bg-white dark:bg-[#0c1613] text-slate-800 dark:text-slate-200"
                      >
                        <option>Primaria / Básico</option>
                        <option>Secundaria</option>
                        <option>Bachillerato / Preparatoria</option>
                        <option>Universidad / Superior</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Modo Streaming (SSE)
                      </label>
                      <button
                        onClick={() => setSandboxStream(!sandboxStream)}
                        className={`w-full text-xs p-2 rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                          sandboxStream
                            ? 'bg-emerald-500 text-white border-emerald-600 font-semibold'
                            : 'bg-white dark:bg-[#0c1613] border-slate-300 dark:border-[#203a2f] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sandboxStream ? 'Streaming Activado' : 'JSON Síncrono'}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleRunSandbox}
                    disabled={sandboxLoading || !sandboxPrompt.trim()}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    {sandboxLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Consultando API...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Enviar Petición de Prueba</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Response Viewer */}
                <div className="space-y-2 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col text-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-400">Respuesta del Servidor</span>
                    {sandboxStatus && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          sandboxStatus === 200 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        HTTP {sandboxStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-[190px] max-h-[260px] overflow-y-auto">
                    {sandboxResponse ? (
                      <pre className="text-[11px] font-mono text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
                        {sandboxResponse}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                        Haz clic en &quot;Enviar Petición de Prueba&quot; para ver la respuesta aquí.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEBHOOKS & NOTIFICATIONS */}
          {activeTab === 'webhooks' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-3">
                <Webhook className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Envía eventos desde BoscoIA hacia tu otra aplicación</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Si tu otra aplicación tiene un backend (Node, Python, PHP, Go, etc.), puedes registrar una URL de Webhook. Cada vez que un estudiante complete un taller, responda un quiz o gane puntos de experiencia, BoscoIA enviará un <code>POST</code> con el payload JSON a tu sistema.
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-[#121f1a] border border-slate-200 dark:border-[#1b3127]">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    URL de Webhook en tu otra aplicación
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://mi-otra-app.com/api/webhooks/bosco"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-[#203a2f] bg-white dark:bg-[#0c1613] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tipo de Evento para Probar
                    </label>
                    <select
                      value={webhookEvent}
                      onChange={(e) => setWebhookEvent(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-[#203a2f] bg-white dark:bg-[#0c1613] text-slate-800 dark:text-slate-200"
                    >
                      <option value="tarea.completada">tarea.completada (Taller escolar finalizado)</option>
                      <option value="quiz.respondido">quiz.respondido (Calificación de ejercicio)</option>
                      <option value="xp.ganado">xp.ganado (Gamificación / Logro alcanzado)</option>
                      <option value="test.ping">test.ping (Prueba de conectividad)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleTestWebhook}
                      disabled={webhookLoading || !webhookUrl.trim()}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {webhookLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Despachando evento...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Evento de Prueba a tu App</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Webhook Result Preview */}
                {webhookResult && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
                      <span className="font-semibold text-slate-300">Resultado del Despacho</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          webhookResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {webhookResult.success ? 'Enviado con Éxito' : 'Diagnóstico'}
                      </span>
                    </div>
                    <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(webhookResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-[#1a2d25] bg-slate-50/80 dark:bg-[#0b1310] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Endpoint activo en <strong>/api/v1/chat</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
