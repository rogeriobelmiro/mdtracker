import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneOff, PhoneCall, Mic, MicOff, Volume2, VolumeX, 
  Grid, User, Clock, CheckCircle2, AlertCircle, X, ChevronDown, 
  ChevronUp, ShieldCheck, Sparkles, HelpCircle, PhoneIncoming
} from 'lucide-react';
import { Lead, LeadCall, CallOutcome, FunnelStage, Company, User as UserType } from '../types';
import { createLeadCall } from '../services/api';

interface VirtualDialerProps {
  leads: Lead[];
  currentCompany: Company | null;
  currentUser: UserType | null;
  activeCallTarget: { leadId: string; leadName: string; leadPhone: string } | null;
  onClearCallTarget: () => void;
  onCallCreated?: (call: LeadCall) => void;
  onLeadStageUpdated?: (leadId: string, newStage: FunnelStage) => void;
}

type CallState = 'idle' | 'calling' | 'connected' | 'outcome';

export const VirtualDialer: React.FC<VirtualDialerProps> = ({
  leads,
  currentCompany,
  currentUser,
  activeCallTarget,
  onClearCallTarget,
  onCallCreated,
  onLeadStageUpdated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Call in-progress states
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showKeypadInCall, setShowKeypadInCall] = useState(false);

  // Outcome modal states
  const [outcome, setOutcome] = useState<CallOutcome>('atendeu_positivo');
  const [callNotes, setCallNotes] = useState('');
  const [updateStageTo, setUpdateStageTo] = useState<FunnelStage | ''>('');
  const [isSavingOutcome, setIsSavingOutcome] = useState(false);

  const durationTimerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringOscillatorRef = useRef<any>(null);

  // Web Audio Context for DTMF & Ringing
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play realistic DTMF Beep
  const playDtmfTone = (digit: string) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const dtmfFrequencies: Record<string, [number, number]> = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
      };

      const freqs = dtmfFrequencies[digit];
      if (!freqs) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio fallback silent
    }
  };

  // Play realistic Ringback Tone while waiting
  const startRingTone = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = 440; // Ringback standard tone
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      ringOscillatorRef.current = { osc, gain };
    } catch (e) {}
  };

  const stopRingTone = () => {
    if (ringOscillatorRef.current) {
      try {
        ringOscillatorRef.current.osc.stop();
        ringOscillatorRef.current.osc.disconnect();
      } catch (e) {}
      ringOscillatorRef.current = null;
    }
  };

  // Handle external call trigger (Click-to-Call from CRM)
  useEffect(() => {
    if (activeCallTarget) {
      setPhoneNumber(activeCallTarget.leadPhone);
      const matched = leads.find(l => l.id === activeCallTarget.leadId) || null;
      setSelectedLead(matched);
      setIsOpen(true);
      setIsMinimized(false);
      startCall(activeCallTarget.leadPhone, matched);
      onClearCallTarget();
    }
  }, [activeCallTarget]);

  // Handle call timer
  useEffect(() => {
    if (callState === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }

    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  // Sync selected lead when phone number changes manually
  useEffect(() => {
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length >= 8) {
      const found = leads.find(l => (l.phone || '').replace(/\D/g, '').includes(clean) || clean.includes((l.phone || '').replace(/\D/g, '')));
      setSelectedLead(found || null);
    } else {
      setSelectedLead(null);
    }
  }, [phoneNumber, leads]);

  const handleKeyPress = (digit: string) => {
    playDtmfTone(digit);
    setPhoneNumber(prev => prev + digit);
  };

  const startCall = (numberToCall: string, leadTarget?: Lead | null) => {
    if (!numberToCall) return;
    setCallState('calling');
    setCallDuration(0);
    startRingTone();

    // Simulate answering after 3.2 seconds
    setTimeout(() => {
      stopRingTone();
      setCallState('connected');
    }, 3200);
  };

  const endCall = () => {
    stopRingTone();
    setCallState('outcome');
    // Default suggested stage if currently Novo Lead
    if (selectedLead?.stage === 'Novo Lead') {
      setUpdateStageTo('Contatado');
    } else {
      setUpdateStageTo('');
    }
  };

  const handleCancelCall = () => {
    stopRingTone();
    setCallState('idle');
    setCallDuration(0);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveOutcome = async () => {
    setIsSavingOutcome(true);
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      const leadId = selectedLead?.id || 'lead-guest-' + Date.now();
      const leadName = selectedLead?.name || (phoneNumber ? `Contato ${phoneNumber}` : 'Lead Telefônico');
      const leadPhone = phoneNumber;
      const userName = currentUser?.name || 'Lucas Atendente';
      const userId = currentUser?.id || 'usr-3';

      const newCall = await createLeadCall({
        companyId,
        leadId,
        leadName,
        leadPhone,
        userId,
        userName,
        durationSeconds: callDuration,
        outcome,
        notes: callNotes,
        recordingUrl: callDuration >= 5 ? 'https://actions.google.com/sounds/v1/office/office_ambient.ogg' : '',
        updateLeadStage: updateStageTo ? (updateStageTo as FunnelStage) : undefined
      });

      if (onCallCreated) onCallCreated(newCall);
      if (updateStageTo && selectedLead && onLeadStageUpdated) {
        onLeadStageUpdated(selectedLead.id, updateStageTo as FunnelStage);
      }

      // Reset
      setCallState('idle');
      setCallDuration(0);
      setCallNotes('');
      setPhoneNumber('');
      setSelectedLead(null);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar desfecho da chamada');
    } finally {
      setIsSavingOutcome(false);
    }
  };

  const outcomeOptions: Array<{ id: CallOutcome; label: string; badge: string; color: string }> = [
    { id: 'atendeu_positivo', label: 'Atendeu - Reunião Agendada / Positivo', badge: 'Positivo', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    { id: 'atendeu_objecao', label: 'Atendeu - Em Negociação / Dúvidas', badge: 'Negociação', color: 'bg-purple-50 text-purple-700 border-purple-300' },
    { id: 'retornar_depois', label: 'Pediu para Retornar Depois', badge: 'Reagendar', color: 'bg-amber-50 text-amber-700 border-amber-300' },
    { id: 'nao_atendeu', label: 'Não Atendeu / Chamou até cair', badge: 'Sem Resposta', color: 'bg-orange-50 text-orange-700 border-orange-300' },
    { id: 'ocupado', label: 'Linha Ocupada', badge: 'Ocupado', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { id: 'caixa_postal', label: 'Caiu na Caixa Postal', badge: 'Caixa Postal', color: 'bg-yellow-50 text-yellow-800 border-yellow-300' },
    { id: 'invalido', label: 'Número Inexistente / Erro', badge: 'Inválido', color: 'bg-red-50 text-red-700 border-red-300' }
  ];

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center gap-2.5 group border-2 border-white/20"
          title="Abrir Telefone Virtual / WebRTC"
        >
          <div className="relative">
            <Phone className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border border-white animate-ping" />
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Discador VoIP</span>
          <span className="bg-emerald-800/60 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/30">
            Ramal 104
          </span>
        </button>
      )}

      {/* Floating Softphone Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'bottom-6 right-6 w-72 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl p-3' 
            : 'bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden'
        }`}>
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  Telefone Virtual WebRTC
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono">VoIP</span>
                </h3>
                <p className="text-[10px] text-slate-400">Ramal 104 • BINA: (11) 4003-8920</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  if (callState === 'calling' || callState === 'connected') {
                    if (confirm('Deseja realmente desligar e fechar o discador?')) {
                      endCall();
                    }
                  } else {
                    setIsOpen(false);
                  }
                }}
                className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800 transition"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Minimized Content */}
          {isMinimized && (
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold truncate max-w-[150px]">
                  {selectedLead?.name || phoneNumber || 'Discador Ocioso'}
                </p>
                <p className="text-[10px] text-emerald-400">
                  {callState === 'connected' ? `Em chamada (${formatDuration(callDuration)})` : callState === 'calling' ? 'Discando...' : 'Pronto para ligar'}
                </p>
              </div>
              {callState === 'connected' && (
                <button
                  onClick={endCall}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
                  title="Desligar"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Expanded Content */}
          {!isMinimized && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 max-h-[550px] overflow-y-auto">
              
              {/* STATE: IDLE */}
              {callState === 'idle' && (
                <div className="space-y-4">
                  {/* Lead Info Banner if recognized */}
                  {selectedLead ? (
                    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-md">
                        {selectedLead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedLead.name}</h4>
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">{selectedLead.stage}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">{selectedLead.phone}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-2.5 flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        Ligação encriptada com gravação automática ativada.
                      </span>
                    </div>
                  )}

                  {/* Number Input Display */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-sm text-center">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full text-center text-xl font-bold font-mono text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder-slate-300 dark:placeholder-slate-600"
                    />
                    {phoneNumber && (
                      <button
                        onClick={() => setPhoneNumber(prev => prev.slice(0, -1))}
                        className="text-[11px] text-slate-400 hover:text-red-500 mt-1 transition"
                      >
                        Apagar dígito &larr;
                      </button>
                    )}
                  </div>

                  {/* DTMF Keypad Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { key: '1', sub: '' },
                      { key: '2', sub: 'ABC' },
                      { key: '3', sub: 'DEF' },
                      { key: '4', sub: 'GHI' },
                      { key: '5', sub: 'JKL' },
                      { key: '6', sub: 'MNO' },
                      { key: '7', sub: 'PQRS' },
                      { key: '8', sub: 'TUV' },
                      { key: '9', sub: 'WXYZ' },
                      { key: '*', sub: '' },
                      { key: '0', sub: '+' },
                      { key: '#', sub: '' }
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleKeyPress(item.key)}
                        className="h-13 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 shadow-sm"
                      >
                        <span className="text-base font-bold text-slate-800 dark:text-white leading-none">{item.key}</span>
                        {item.sub && (
                          <span className="text-[9px] font-semibold text-slate-400 tracking-wider mt-0.5">{item.sub}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Call Button */}
                  <button
                    onClick={() => startCall(phoneNumber, selectedLead)}
                    disabled={!phoneNumber.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                    Iniciar Ligação VoIP
                  </button>
                </div>
              )}

              {/* STATE: CALLING (RINGING) */}
              {callState === 'calling' && (
                <div className="py-8 text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-4 border-emerald-500 flex items-center justify-center mx-auto animate-pulse">
                      <PhoneCall className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                    </div>
                    <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedLead?.name || 'Discando...'}
                    </h4>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{phoneNumber}</p>
                    <span className="inline-block mt-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Chamando contato...
                    </span>
                  </div>

                  <button
                    onClick={handleCancelCall}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <PhoneOff className="w-4 h-4" />
                    Cancelar Ligação
                  </button>
                </div>
              )}

              {/* STATE: CONNECTED (IN-CALL) */}
              {callState === 'connected' && (
                <div className="py-4 space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg mb-2">
                      {selectedLead ? selectedLead.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedLead?.name || phoneNumber}
                    </h4>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {formatDuration(callDuration)}
                      </span>
                      <span className="text-[10px] text-slate-400">Gravando</span>
                    </div>
                  </div>

                  {/* In-Call Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                        isMuted 
                          ? 'bg-amber-500 text-white border-amber-600' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      <span className="text-[10px] font-semibold">{isMuted ? 'Mudo' : 'Microfone'}</span>
                    </button>

                    <button
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                        !isSpeakerOn 
                          ? 'bg-amber-500 text-white border-amber-600' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      <span className="text-[10px] font-semibold">{isSpeakerOn ? 'Áudio' : 'Mutado'}</span>
                    </button>

                    <button
                      onClick={() => setShowKeypadInCall(!showKeypadInCall)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                        showKeypadInCall 
                          ? 'bg-blue-600 text-white border-blue-700' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                      <span className="text-[10px] font-semibold">Teclado URA</span>
                    </button>
                  </div>

                  {/* DTMF Pad during call (for IVR/URA navigation) */}
                  {showKeypadInCall && (
                    <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {['1','2','3','4','5','6','7','8','9','*','0','#'].map(d => (
                        <button
                          key={d}
                          onClick={() => playDtmfTone(d)}
                          className="py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-200 rounded text-xs font-bold font-mono transition text-slate-800 dark:text-white"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hang Up Button */}
                  <button
                    onClick={endCall}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-98"
                  >
                    <PhoneOff className="w-5 h-5 fill-current" />
                    Encerrar Chamada
                  </button>
                </div>
              )}

              {/* STATE: OUTCOME (POST-CALL LOG & AUDIT) */}
              {callState === 'outcome' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Chamada Finalizada</p>
                      <h4 className="text-xs font-bold truncate">{selectedLead?.name || phoneNumber}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        {formatDuration(callDuration)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                      Qual foi o desfecho da ligação? *
                    </label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {outcomeOptions.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setOutcome(opt.id)}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
                            outcome === opt.id 
                              ? `${opt.color} ring-2 ring-blue-500 shadow-sm` 
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate pr-2">{opt.label}</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0">{opt.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Anotações da Conversa (Resumo Comercial)
                    </label>
                    <textarea
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Ex: Cliente demonstrou interesse no plano anual, pediu para enviar proposta por e-mail..."
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Update Stage if Lead is present */}
                  {selectedLead && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Avançar Lead no Funil CRM
                      </label>
                      <select
                        value={updateStageTo}
                        onChange={(e) => setUpdateStageTo(e.target.value as FunnelStage | '')}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold focus:outline-none"
                      >
                        <option value="">Manter etapa atual ({selectedLead.stage})</option>
                        <option value="Contatado">Mudar para &quot;Contatado&quot;</option>
                        <option value="Em Negociação">Mudar para &quot;Em Negociação&quot;</option>
                        <option value="Convertido">Mudar para &quot;Convertido&quot; (Venda Fechada)</option>
                        <option value="Perdido">Mudar para &quot;Perdido&quot;</option>
                      </select>
                    </div>
                  )}

                  {/* Save button */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleSaveOutcome}
                      disabled={isSavingOutcome}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isSavingOutcome ? 'Salvando...' : 'Salvar Registro da Chamada'}
                    </button>
                    <button
                      onClick={() => {
                        setCallState('idle');
                        setIsOpen(false);
                      }}
                      className="px-3 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </>
  );
};
