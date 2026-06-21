import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Bot, User, Loader2,
  Phone, Mail, CalendarCheck, AlertTriangle, UserCircle, ArrowRight,
} from "lucide-react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/sitePhones";
import { SITE_EMAIL, SITE_EMAIL_ALT } from "@/lib/siteBrand";

const API_BASE = import.meta.env.VITE_API_URL as string ?? "https://htr-group-llc-appliance-repair.replit.app";
const EMAIL_DISPLAY = `${SITE_EMAIL} · ${SITE_EMAIL_ALT}`;
const EMAIL_HREF = `mailto:${SITE_EMAIL}`;

interface Message { id: string; role: "user" | "assistant"; content: string; }
interface UserInfo { name: string; email: string; phone: string; }

const WELCOME: Record<"en" | "es", string> = {
  en: "Hi! I'm your appliance repair assistant. Describe your appliance problem and I'll help you diagnose it step by step.\n\nWhat appliance is giving you trouble?",
  es: "¡Hola! Soy tu asistente de reparación de electrodomésticos. Describe el problema y te ayudaré a diagnosticarlo paso a paso.\n\n¿Qué electrodoméstico te está dando problemas?",
};

const TR = {
  en: {
    title: "HTRGroup",
    subtitle: "AI Diagnostic Help",
    placeholder: "Describe your appliance problem…",
    send: "Send",
    poweredBy: "Powered by AI • Not a substitute for professional diagnosis",
    thinking: "Thinking…",
    urgentTitle: "Looks like a serious issue!",
    urgentBody: "Based on your description, this repair requires a certified technician. Contact us — we'll get it fixed fast.",
    urgentBook: "Book a Technician",
    urgentCall: "Call Now",
    urgentEmail: "Email Us",
    formTitle: "Before we start…",
    formSubtitle: "Please share your details so we can follow up if needed.",
    formName: "Full Name",
    formEmail: "Email (optional)",
    formPhone: "Phone Number",
    formStart: "Start Chat",
    formRequired: "Name and phone are required",
    formNamePh: "e.g. John Smith",
    formEmailPh: "e.g. john@example.com",
    formPhonePh: "e.g. (346) 555-0000",
  },
  es: {
    title: "HTRGroup",
    subtitle: "Diagnóstico con IA",
    placeholder: "Describe el problema con tu electrodoméstico…",
    send: "Enviar",
    poweredBy: "Impulsado por IA • No sustituye el diagnóstico profesional",
    thinking: "Pensando…",
    urgentTitle: "¡Parece un problema serio!",
    urgentBody: "Según su descripción, esta reparación requiere un técnico certificado. Contáctenos — lo solucionamos rápido.",
    urgentBook: "Reservar un Técnico",
    urgentCall: "Llamar Ahora",
    urgentEmail: "Escribirnos",
    formTitle: "Antes de comenzar…",
    formSubtitle: "Por favor comparte tus datos para que podamos contactarte si es necesario.",
    formName: "Nombre Completo",
    formEmail: "Correo electrónico (opcional)",
    formPhone: "Número de Teléfono",
    formStart: "Iniciar Chat",
    formRequired: "Nombre y teléfono son obligatorios",
    formNamePh: "ej. Juan García",
    formEmailPh: "ej. juan@ejemplo.com",
    formPhonePh: "ej. (346) 555-0000",
  },
} as const;

function formatText(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => (
    <span key={i}>{line}{i < text.split("\n").length - 1 && <br />}</span>
  ));
}

export default function ChatWidget({ lang = "en" }: { lang?: "en" | "es" }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"form" | "chat">("form");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: WELCOME[lang] },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const leadSentRef = useRef(false);
  const t = TR[lang];

  const userMsgCount = messages.filter((m) => m.role === "user").length;
  const showUrgent = userMsgCount >= 6;

  const resetChat = useCallback(() => {
    setOpen(false);
    setStage("form");
    setUserInfo(null);
    setFormData({ name: "", email: "", phone: "" });
    setFormError(false);
    setMessages([{ id: "welcome", role: "assistant", content: WELCOME[lang] }]);
    setInput("");
    setLoading(false);
    leadSentRef.current = false;
  }, [lang]);

  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open && stage === "chat") {
      setTimeout(() => inputRef.current?.focus(), 300);
      setPulse(false);
    }
  }, [open, stage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, showUrgent]);

  useEffect(() => {
    if (messages.length === 1) {
      setMessages([{ id: "welcome", role: "assistant", content: WELCOME[lang] }]);
    }
  }, [lang]);

  useEffect(() => {
    if (showUrgent && userInfo && !leadSentRef.current) {
      leadSentRef.current = true;
      const chatMessages = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      fetch(`${API_BASE}/api/chat-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          messages: chatMessages,
          lang,
        }),
      })
        .then((r) => {
          if (!r.ok) r.text().then((t) => console.error("[chat-lead] server error:", r.status, t));
          else console.log("[chat-lead] lead sent OK");
        })
        .catch((err) => console.error("[chat-lead] network error:", err));
    }
  }, [showUrgent, userInfo, messages, lang]);

  const handleFormSubmit = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError(true);
      return;
    }
    setFormError(false);
    setUserInfo({ name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone.trim() });
    setStage("chat");
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);
    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, lang }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { content?: string; error?: string };
      if (data.error) throw new Error(data.error);
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: data.content ?? "" } : m)
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: lang === "es"
                ? "Lo siento, ocurrió un error. Por favor llámenos al (346) 696-8751."
                : "Sorry, something went wrong. Please call us at (346) 696-8751." }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, lang]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button — LEFT on mobile, RIGHT on desktop */}
      <div className="fixed bottom-6 left-6 md:left-auto md:right-6 z-50 flex flex-col items-start md:items-end gap-2">
        <AnimatePresence>
          {!open && pulse && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-100 px-3 py-2 text-xs text-slate-700 max-w-[180px] text-center leading-snug"
            >
              {lang === "es" ? "¿Problema con un aparato? ¡Pregúntame!" : "Appliance problem? Ask me!"}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => setOpen((o) => !o)}
          whileTap={{ scale: 0.93 }}
          className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg, #1B6FE8, #0D47B0)" }}
          aria-label="Open chat"
        >
          <AnimatePresence mode="wait">
            {open
              ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={22} /></motion.span>
              : <motion.span key="chat"  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircle size={22} /></motion.span>
            }
          </AnimatePresence>
          {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />}
        </motion.button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 left-6 md:left-auto md:right-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            style={{ maxHeight: "min(580px, calc(100vh - 11rem))" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #1B6FE8, #0D47B0)" }}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">{t.title}</p>
                <p className="text-[11px] text-white/80 leading-tight">{t.subtitle}</p>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white transition-colors flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* ── FORM STAGE ── */}
            {stage === "form" && (
              <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg,#1B6FE8,#0D47B0)" }}>
                    <UserCircle size={26} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 text-center">{t.formTitle}</p>
                  <p className="text-xs text-slate-500 text-center mt-1 leading-relaxed">{t.formSubtitle}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">{t.formName} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder={t.formNamePh}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">{t.formPhone} <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder={t.formPhonePh}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">{t.formEmail}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder={t.formEmailPh}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  {formError && (
                    <p className="text-xs text-red-500 font-medium">{t.formRequired}</p>
                  )}
                  <button
                    onClick={handleFormSubmit}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white rounded-xl px-4 py-2.5 transition-all hover:opacity-90 mt-1"
                    style={{ background: "linear-gradient(135deg,#1B6FE8,#0D47B0)" }}
                  >
                    {t.formStart} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── CHAT STAGE ── */}
            {stage === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 items-end ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                        {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
                      </div>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm"
                      }`}>
                        {msg.content ? formatText(msg.content) : (
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Loader2 size={12} className="animate-spin" />{t.thinking}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Urgent CTA card after 6 user messages */}
                  {showUrgent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertTriangle size={15} className="text-orange-500 flex-shrink-0" />
                        <p className="text-sm font-bold text-orange-700">{t.urgentTitle}</p>
                      </div>
                      <p className="text-xs text-orange-700/90 leading-relaxed mb-3">{t.urgentBody}</p>
                      <a
                        href="#contact"
                        onClick={resetChat}
                        className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-white rounded-xl px-3 py-2 mb-2 transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#1B6FE8,#0D47B0)" }}
                      >
                        <CalendarCheck size={13} />{t.urgentBook}
                      </a>
                      <div className="flex gap-2">
                        <a href={PHONE_HREF} className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-2 py-1.5 hover:bg-blue-100 transition-colors">
                          <Phone size={11} />{t.urgentCall}
                        </a>
                        <a href={EMAIL_HREF} className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-2 py-1.5 hover:bg-blue-100 transition-colors">
                          <Mail size={11} />{t.urgentEmail}
                        </a>
                      </div>
                      <div className="mt-2 text-[10px] text-orange-600/80 text-center space-y-0.5">
                        <p>{PHONE_DISPLAY}</p>
                        <p>{EMAIL_DISPLAY}</p>
                      </div>
                    </motion.div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex-shrink-0 border-t border-slate-100 bg-white px-3 py-2">
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder={t.placeholder}
                      rows={1}
                      disabled={loading}
                      className="flex-1 resize-none text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 leading-snug"
                      style={{ maxHeight: 80, overflowY: "auto" }}
                      onInput={(e) => {
                        const el = e.target as HTMLTextAreaElement;
                        el.style.height = "auto";
                        el.style.height = Math.min(el.scrollHeight, 80) + "px";
                      }}
                    />
                    <button
                      onClick={send}
                      disabled={!input.trim() || loading}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #1B6FE8, #0D47B0)" }}
                      aria-label={t.send}
                    >
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">{t.poweredBy}</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
