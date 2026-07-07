import { useState, useRef, useEffect } from 'react';
import { XIcon } from './icons';
import { sendChatMessage } from '../services/api';
import type { ChatMessage } from '../services/api';

const WELCOME: ChatMessage = {
  role: 'model',
  text: '¡Hola! 👋 Soy el asistente del quiosco. Puedo recomendarte qué pedir, decirte precios y ayudarte a usar la app. ¿En qué te ayudo?',
};

const SUGGESTIONS = [
  '¿Qué me recomiendas pedir?',
  '¿Cuánto cuesta la pizza?',
  '¿Cómo hago un pedido?',
];

/* Iconos locales del widget */
const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-4a8 8 0 1 1 18-7Z" />
    <path d="M8 11h.01M12 11h.01M16 11h.01" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12 20 4l-4 16-4-6-8-2Z" />
  </svg>
);

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // El historial que enviamos al backend son solo los turnos reales (sin el saludo inicial).
    const history = messages.filter((m) => m !== WELCOME);
    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const { reply, error } = await sendChatMessage(trimmed, history);
    setMessages((prev) => [
      ...prev,
      { role: 'model', text: reply ?? `⚠️ ${error ?? 'No pude responder ahora mismo.'}` },
    ]);
    setLoading(false);
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand hover:bg-brand-dark text-white shadow-lg flex items-center justify-center transition-colors"
      >
        {open ? <XIcon className="w-6 h-6" /> : <ChatIcon className="w-7 h-7" />}
      </button>

      {/* Panel del chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Encabezado */}
          <div className="bg-gray-900 text-white px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center">
              <ChatIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-serif font-bold leading-tight">Asistente del Quiosco</p>
              <p className="text-xs text-gray-300">Aquí para ayudarte 🍔</p>
            </div>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-brand text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-400 px-4 py-3 rounded-2xl rounded-bl-sm text-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" />
                  </span>
                </div>
              </div>
            )}

            {/* Sugerencias (solo al inicio) */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-white border border-gray-200 hover:border-brand hover:text-brand text-gray-600 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Entrada */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-3 border-t border-gray-100 flex items-center gap-2 flex-shrink-0 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              maxLength={500}
              className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              className="w-10 h-10 rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
