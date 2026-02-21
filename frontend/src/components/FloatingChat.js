import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TEXTS = {
  ru: { title: 'Чат с администратором', placeholder: 'Сообщение...', loginRequired: 'Войдите, чтобы написать' },
  en: { title: 'Chat with Admin', placeholder: 'Message...', loginRequired: 'Sign in to chat' },
  zh: { title: '与管理员聊天', placeholder: '消息...', loginRequired: '登录以聊天' },
};

export default function FloatingChat() {
  const { user, token } = useAuth();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const text = TEXTS[lang] || TEXTS.ru;

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/admin-chat`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setMessages(await res.json());
    } catch {}
  }, [token]);

  useEffect(() => {
    if (open && token) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [open, token, fetchMessages]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !token) return;
    setLoading(true);
    try {
      await fetch(`${API}/admin-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: input })
      });
      setInput('');
      fetchMessages();
    } catch {}
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          data-testid="floating-chat-btn"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(45,212,191,0.4)] hover:shadow-[0_4px_30px_rgba(45,212,191,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          data-testid="floating-chat-window"
          className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col overflow-hidden"
          style={{ maxHeight: '500px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              {text.title}
            </h3>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setOpen(false)} data-testid="chat-close-btn">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[350px]">
            {!user ? (
              <p className="text-center text-sm text-muted-foreground py-8">{text.loginRequired}</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {lang === 'en' ? 'No messages yet. Start a conversation!' : 'Нет сообщений. Начните общение!'}
              </p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.message_id}
                  className={`flex ${msg.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.sender_id === user?.user_id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}>
                    {msg.sender_role === 'admin' && msg.sender_id !== user?.user_id && (
                      <p className="text-xs font-semibold mb-1 opacity-70">Admin</p>
                    )}
                    <p>{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-60">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {user && (
            <div className="border-t border-border p-3 flex gap-2">
              <Input
                data-testid="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={text.placeholder}
                className="h-10 text-sm"
              />
              <Button
                size="sm"
                className="h-10 px-3 rounded-full"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                data-testid="chat-send-btn"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
