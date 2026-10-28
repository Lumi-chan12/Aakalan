import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Check,
  Radio,
  Square,
  Globe,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';

export type VoiceState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error'
  | 'unsupported';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  navigationPath?: string | null;
  navigationLabel?: string | null;
  isSpoken?: boolean;
}

export const VoiceAssistant: React.FC = () => {
  const { user, role, navigate } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste! I am your Aakalan Regulatory Assistant. Ask me about overall application pendency, regional bottlenecks, overdue deadlines, or workflow routes.',
      timestamp: new Date().toISOString(),
    },
  ]);

  // Audio & Web Speech refs
  const recognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceState]);

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setVoiceState('unsupported');
      }
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      stopAudioCapture();
    };
  }, []);

  // Stop session if user logs out or closes
  const stopAudioCapture = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  // Close session
  const handleCloseSession = () => {
    stopAudioCapture();
    setVoiceState('idle');
    setIsOpen(false);
  };

  // Speak text using SpeechSynthesis
  const speakResponse = (text: string, langCode: string = 'en') => {
    if (isMuted || !synthRef.current || typeof window === 'undefined') {
      setVoiceState('idle');
      return;
    }

    // Cancel any previous speech
    synthRef.current.cancel();

    // Clean text of markdown characters
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Language selection
    if (langCode === 'hi' || language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.onstart = () => {
      setVoiceState('speaking');
    };

    utterance.onend = () => {
      setVoiceState('idle');
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis event:', e);
      setVoiceState('idle');
    };

    synthRef.current.speak(utterance);
  };

  // Request Microphone Permission explicitly
  const requestMicPermission = async (): Promise<boolean> => {
    try {
      setVoiceState('connecting');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setMicPermission('granted');
      return true;
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setMicPermission('denied');
      setVoiceState('error');
      setErrorMessage(
        'Microphone permission denied. You can still use the text chat fallback below.'
      );
      return false;
    }
  };

  // Process Query via Server Intelligence API
  const processQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Add user message to transcript
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');
    setVoiceState('processing');

    try {
      const res = await ApiService.sendVoiceQuery(queryText, language);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.responseText,
        timestamp: new Date().toISOString(),
        navigationPath: res.navigationPath,
        navigationLabel: res.navigationLabel,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If navigation action is detected, execute smoothly
      if (res.navigationPath) {
        setTimeout(() => {
          navigate(res.navigationPath!);
        }, 1500);
      }

      // Speak response aloud
      speakResponse(res.responseText, language);
    } catch (err: any) {
      console.error('Voice query error:', err);
      setVoiceState('error');
      setErrorMessage(err.message || 'Could not process voice query.');
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the central compliance engine. Please try again or type your question below.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  // Start Voice Listening Session
  const startListening = async () => {
    setErrorMessage(null);

    // If speaking, stop speaking
    if (voiceState === 'speaking' && synthRef.current) {
      synthRef.current.cancel();
      setVoiceState('idle');
      return;
    }

    // Check speech recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceState('unsupported');
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use text chat.'
      );
      return;
    }

    // Check mic permission
    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setVoiceState('listening');
      };

      recognition.onresult = (event: any) => {
        const transcriptText = event.results[0][0].transcript;
        if (transcriptText) {
          processQuery(transcriptText);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setVoiceState('error');
          setErrorMessage(`Audio capture error: ${event.error}`);
        } else {
          setVoiceState('idle');
        }
      };

      recognition.onend = () => {
        if (voiceState === 'listening') {
          setVoiceState('idle');
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setVoiceState('error');
      setErrorMessage(err.message || 'Could not initialize microphone input.');
    }
  };

  const handleStopListening = () => {
    stopAudioCapture();
    setVoiceState('idle');
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    processQuery(textInput);
  };

  // Quick prompt questions
  const quickPrompts = [
    'Overall pendency summary',
    'Western region bottlenecks',
    'Show overdue cases',
    'Workflow route rules',
    'Navigate to EVC Oversight',
    'कॉलम पेंडेंसी की स्थिति क्या है?',
  ];

  const getStateBadge = () => {
    switch (voiceState) {
      case 'idle':
        return { label: 'Idle', color: 'bg-[#E9EAEE] text-[#77727E]' };
      case 'connecting':
        return { label: 'Connecting...', color: 'bg-[#FFF8EB] text-[#C58A16]' };
      case 'listening':
        return { label: 'Listening...', color: 'bg-[#F2B544] text-[#321B35] font-extrabold animate-pulse' };
      case 'processing':
        return { label: 'Analyzing Data...', color: 'bg-[#EFF6FF] text-[#1E40AF]' };
      case 'speaking':
        return { label: 'Speaking Response', color: 'bg-[#ECFDF5] text-[#27845A] font-bold' };
      case 'error':
        return { label: 'Error', color: 'bg-[#FDE8E8] text-[#C44949]' };
      case 'unsupported':
        return { label: 'Unsupported Browser', color: 'bg-gray-200 text-gray-700' };
      default:
        return { label: 'Ready', color: 'bg-[#E9EAEE] text-[#77727E]' };
    }
  };

  const stateBadge = getStateBadge();

  return (
    <>
      {/* Floating Microphone Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-4 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${
            isOpen || voiceState === 'listening'
              ? 'bg-[#F2B544] text-[#321B35] ring-4 ring-[#F2B544]/30'
              : 'bg-[#321B35] text-white hover:bg-[#46264A] ring-2 ring-[#F2B544]/50'
          }`}
          title="Aakalan Voice Assistant (Click to open)"
        >
          {voiceState === 'listening' ? (
            <Radio className="w-6 h-6 animate-pulse" />
          ) : voiceState === 'speaking' ? (
            <Volume2 className="w-6 h-6 animate-bounce" />
          ) : (
            <Mic className="w-6 h-6" />
          )}

          {/* Glowing pulse ring if speaking or listening */}
          {(voiceState === 'listening' || voiceState === 'speaking') && (
            <span className="absolute -inset-1 rounded-full bg-[#F2B544]/40 animate-ping" />
          )}

          {/* Small status dot */}
          <span
            className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              voiceState === 'listening'
                ? 'bg-[#27845A]'
                : voiceState === 'speaking'
                ? 'bg-[#F2B544]'
                : 'bg-emerald-500'
            }`}
          />
        </button>
      </div>

      {/* Elegant Voice Assistant Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[85vh] h-[580px] bg-white rounded-2xl shadow-2xl border border-[#D9D8DE] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#321B35] text-white flex items-center justify-between border-b border-[#46264A]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F2B544] text-[#321B35] flex items-center justify-center font-extrabold text-sm shadow-inner">
                वाक्
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                  Aakalan Voice Assistant
                  <Sparkles className="w-3.5 h-3.5 text-[#F2B544]" />
                </h3>
                <span className="text-[10px] text-[#E9EAEE]/70 font-mono block">
                  AICTE Intelligence Engine
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="flex items-center bg-[#241326] p-0.5 rounded-lg border border-[#46264A] text-[10px] font-bold">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === 'en' ? 'bg-[#F2B544] text-[#321B35]' : 'text-[#E9EAEE]/70'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === 'hi' ? 'bg-[#F2B544] text-[#321B35]' : 'text-[#E9EAEE]/70'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLanguage('hinglish')}
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === 'hinglish' ? 'bg-[#F2B544] text-[#321B35]' : 'text-[#E9EAEE]/70'
                  }`}
                >
                  Hinglish
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={handleCloseSession}
                className="p-1 rounded-md text-[#E9EAEE]/80 hover:text-white hover:bg-[#46264A] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status & Audio Indicator Bar */}
          <div className="px-4 py-2 bg-[#F8F9FA] border-b border-[#E9EAEE] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#77727E]">Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stateBadge.color}`}>
                {stateBadge.label}
              </span>
            </div>

            {/* Visual sound wave animation when active */}
            {(voiceState === 'listening' || voiceState === 'speaking') && (
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-[#F2B544] rounded-full animate-bounce" />
                <span className="w-1 h-5 bg-[#321B35] rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-4 bg-[#27845A] rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-1 h-2 bg-[#F2B544] rounded-full animate-bounce [animation-delay:0.45s]" />
              </div>
            )}
          </div>

          {/* Microphone Permission Banner if needed */}
          {micPermission === 'prompt' && voiceState === 'idle' && (
            <div className="p-3 bg-[#FFF8EB] border-b border-[#F7D488] text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#8A5B00]">
                <Mic className="w-4 h-4 text-[#C58A16] shrink-0" />
                <span>Microphone access needed for live voice queries.</span>
              </div>
              <button
                onClick={requestMicPermission}
                className="px-2.5 py-1 bg-[#321B35] text-white font-bold rounded text-[11px] hover:bg-[#46264A] shrink-0"
              >
                Allow Mic
              </button>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-[#FDE8E8] border-b border-[#F8B4B4] text-xs text-[#C44949] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-[#C44949] hover:underline font-bold">
                Dismiss
              </button>
            </div>
          )}

          {/* Conversation Transcript Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E9EAEE]/30">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-xs ${
                      isUser
                        ? 'bg-[#321B35] text-white rounded-tr-xs'
                        : 'bg-white text-[#27232C] border border-[#D9D8DE] rounded-tl-xs'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#F2B544] mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Aakalan Intelligence</span>
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                    {/* Navigation Suggestion Action Chip */}
                    {m.navigationPath && (
                      <div className="mt-2.5 pt-2 border-t border-[#E9EAEE]">
                        <button
                          onClick={() => {
                            navigate(m.navigationPath!);
                            handleCloseSession();
                          }}
                          className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#F4F5F8] hover:bg-[#E9EAEE] text-[#321B35] font-bold text-[11px] border border-[#D9D8DE] transition"
                        >
                          <span className="flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#F2B544]" />
                            {m.navigationLabel || 'Open Page'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#321B35]" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#77727E] mt-0.5 px-1 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-white border-t border-[#E9EAEE] overflow-x-auto">
            <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px]">
              <span className="text-[10px] font-bold text-[#77727E] uppercase tracking-wider">
                Ask:
              </span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => processQuery(prompt)}
                  disabled={voiceState === 'processing'}
                  className="px-2 py-0.5 rounded-full bg-[#F4F5F8] hover:bg-[#E9EAEE] text-[#321B35] border border-[#D9D8DE] font-medium transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Audio Controls & Text Fallback */}
          <div className="p-3 bg-white border-t border-[#D9D8DE] space-y-2">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2">
              {/* Voice Trigger / Stop Button */}
              {voiceState === 'listening' ? (
                <button
                  onClick={handleStopListening}
                  className="flex-1 py-2 px-3 bg-[#C44949] hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Listening</span>
                </button>
              ) : voiceState === 'speaking' ? (
                <button
                  onClick={() => {
                    synthRef.current?.cancel();
                    setVoiceState('idle');
                  }}
                  className="flex-1 py-2 px-3 bg-[#321B35] hover:bg-[#46264A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Audio Response</span>
                </button>
              ) : (
                <button
                  onClick={startListening}
                  disabled={voiceState === 'processing' || voiceState === 'unsupported'}
                  className="flex-1 py-2 px-3 bg-[#321B35] hover:bg-[#46264A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
                >
                  <Mic className="w-4 h-4 text-[#F2B544]" />
                  <span>Tap to Speak (EN / HI)</span>
                </button>
              )}

              {/* Mute/Unmute Toggle */}
              <button
                onClick={() => {
                  if (!isMuted && synthRef.current) {
                    synthRef.current.cancel();
                  }
                  setIsMuted(!isMuted);
                }}
                className={`p-2 rounded-xl border transition ${
                  isMuted
                    ? 'bg-[#FDE8E8] text-[#C44949] border-[#F8B4B4]'
                    : 'bg-[#F4F5F8] text-[#77727E] border-[#D9D8DE] hover:text-[#27232C]'
                }`}
                title={isMuted ? 'Audio response muted (Click to unmute)' : 'Audio response active (Click to mute)'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Text Chat Fallback Input Field */}
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  language === 'hi'
                    ? 'यहाँ प्रश्न लिखें (जैसे: लंबित मामलों की संख्या)...'
                    : 'Type a question or navigation command...'
                }
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={voiceState === 'processing'}
                className="flex-1 px-3 py-1.5 bg-[#F4F5F8] border border-[#D9D8DE] rounded-xl text-xs focus:ring-1 focus:ring-[#321B35] focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || voiceState === 'processing'}
                className="p-1.5 bg-[#F2B544] hover:bg-[#E5A734] text-[#321B35] rounded-xl transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
