import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { HiOutlineSparkles, HiOutlinePaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'Where did most of my money go this month?',
  'How can I save more on food expenses?',
  'Show me my spending pattern this week',
  'Am I spending too much on subscriptions?',
  'Give me tips to reduce unnecessary expenses',
  'Compare my spending this month vs last month'
];

const Assistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hi! I'm SpendLens AI 🤖 — your personal finance assistant. Ask me anything about your spending habits, and I'll give you data-backed insights. Try one of the suggestions below!",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiAPI.chat({ message: msg });
      setMessages(prev => [...prev, { role: 'ai', text: data.reply, time: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I had trouble processing that. Please make sure your Gemini API key is configured and try again.',
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-height) - 64px)' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <h1>AI Assistant</h1>
          <span style={{
            padding: '3px 10px', background: 'var(--gradient-brand)', color: 'white',
            fontSize: '0.65rem', fontWeight: 700, borderRadius: 'var(--radius-full)', letterSpacing: '0.05em'
          }}>BETA</span>
        </div>
        <p>Chat with AI about your spending habits</p>
      </div>

      {/* Chat Messages */}
      <div className="glass" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className="animate-in"
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animationDelay: `${i * 50}ms`
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: 'var(--space-md) var(--space-lg)',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(124, 58, 237, 0.15))'
                  : 'var(--surface)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(0, 212, 255, 0.2)' : 'var(--border)'}`,
              }}>
                {msg.role === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <HiOutlineSparkles style={{ color: 'var(--accent-cyan)', fontSize: '0.875rem' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>SpendLens AI</span>
                  </div>
                )}
                <p style={{
                  fontSize: '0.875rem', lineHeight: 1.6,
                  color: msg.role === 'user' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </p>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 6, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: 'var(--space-md) var(--space-lg)', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <div className="loader" style={{ width: 16, height: 16 }}></div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{
            padding: '0 var(--space-lg) var(--space-md)',
            display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)'
          }}>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="btn btn-sm"
                onClick={() => sendMessage(s)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: '0.75rem'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: 'var(--space-md) var(--space-lg)',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 'var(--space-sm)'
        }}>
          <input
            className="input"
            placeholder="Ask about your spending..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            id="ai-chat-input"
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            id="ai-chat-send"
          >
            <HiOutlinePaperAirplane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
