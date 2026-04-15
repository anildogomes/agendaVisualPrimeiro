
import React from 'react';
import { IconScissors, IconCheck, IconX, IconClock, IconDollarSign, IconShield, IconCalendar, IconSmartphone, IconLink } from '../constants';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-gold-500 selection:text-slate-900 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2">
          <div className="bg-gold-500 p-1.5 rounded-lg text-slate-900">
            <IconScissors className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">AgendaVisual</span>
        </div>
        <div className="flex items-center gap-4">
            <button
            onClick={() => window.location.hash = '#login'}
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block"
            >
            Já tenho conta
            </button>
            <button
            onClick={() => window.location.hash = '#login'}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all text-sm"
            >
            Entrar
            </button>
        </div>
      </nav>

      {/* --- HERO SECTION (Zero Atrito) --- */}
      <header className="relative pt-8 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-12 items-center relative z-10">
            
            {/* Text Content */}
            <div className="text-left col-span-1 z-20">
                <div className="inline-flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] sm:text-xs font-bold text-gold-400 mb-4 sm:mb-6 animate-fade-in-down">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Agendamento Sem Atrito
                </div>
                
                <h1 className="text-2xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight sm:leading-[1.1] mb-4 sm:mb-6 animate-slide-up">
                    Esqueça o <br className="sm:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">"Baixe nosso App".</span>
                </h1>
                
                <p className="text-xs sm:text-lg text-slate-400 max-w-xl mb-6 sm:mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Seu cliente quer apenas <strong>agendar</strong>. Seja cabelo, unhas, estética ou spa: o <strong>AgendaVisual</strong> elimina a barreira do aplicativo.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <button
                        onClick={() => window.location.hash = '#login'}
                        className="w-full sm:w-auto px-4 py-3 sm:px-8 sm:py-4 bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-xs sm:text-base whitespace-nowrap"
                    >
                    Teste 7 dias Grátis
                    <IconLink className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" />
                    </button>
                    <p className="text-[10px] sm:text-xs text-slate-500 text-center sm:text-left w-full sm:w-auto">Sem cartão de crédito.</p>
                </div>
            </div>

            {/* Visual Demo (The "Invisible" Tech) */}
            {/* Mobile: Scaled Down & Aligned Right. Desktop: Normal Scale. */}
            <div className="relative animate-slide-up col-span-1 flex justify-end" style={{ animationDelay: '0.3s' }}>
                
                {/* Wrapper to handle scaling space */}
                <div className="relative w-[140px] h-[280px] sm:w-[300px] sm:h-[600px]">
                    <div className="absolute top-0 right-0 origin-top-right transform scale-[0.45] sm:scale-100 w-[300px]">
                        {/* Phone Frame Mockup */}
                        <div className="relative w-[300px] mx-auto bg-slate-900 border-8 border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
                            
                            {/* Simulated Screen */}
                            <div className="bg-slate-50 h-[580px] w-full p-4 flex flex-col">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-6 mt-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-900"></div>
                                    <div>
                                        <div className="h-2 w-24 bg-slate-300 rounded mb-1"></div>
                                        <div className="h-2 w-16 bg-slate-200 rounded"></div>
                                    </div>
                                </div>
                                
                                {/* Service List Selection */}
                                <div className="space-y-3 mb-6">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 flex justify-between items-center ring-2 ring-gold-500">
                                        <div>
                                            <div className="h-2 w-20 bg-slate-800 rounded mb-1"></div>
                                            <div className="h-2 w-12 bg-slate-300 rounded"></div>
                                        </div>
                                        <div className="w-4 h-4 bg-gold-500 rounded-full"></div>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-between items-center opacity-50">
                                        <div>
                                            <div className="h-2 w-24 bg-slate-400 rounded mb-1"></div>
                                            <div className="h-2 w-10 bg-slate-200 rounded"></div>
                                        </div>
                                        <div className="w-4 h-4 border border-slate-300 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Button */}
                                <div className="mt-auto mb-8">
                                    <div className="w-full h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                                        Confirmar (Sem Login)
                                    </div>
                                </div>
                            </div>

                            {/* Notification Popover (Marketing Message) */}
                            <div className="absolute top-1/3 -right-16 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl w-48 animate-bounce" style={{ animationDuration: '3s' }}>
                                <div className="flex items-center gap-2 text-gold-400 mb-1">
                                    <IconClock className="w-4 h-4" />
                                    <span className="text-xs font-bold">15 Segundos</span>
                                </div>
                                <p className="text-xs text-white">Tempo médio para seu cliente agendar.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* --- COMPARISON SECTION (Nós x Eles) --- */}
      <section className="py-20 bg-slate-800/50 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">O problema dos "Clube de Assinatura"</h2>
            <p className="text-slate-400">Por que seus clientes desistem de agendar em outros sistemas?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-red-500/20 relative group">
              <div className="absolute top-0 right-0 px-4 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-bl-2xl rounded-tr-2xl border-l border-b border-red-500/20">
                O Jeito Antigo
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                    <IconSmartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-200">Apps de Marketplace</h3>
              </div>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-start gap-3">
                  <IconX className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span>Exige download (ocupa memória).</span>
                </li>
                <li className="flex items-start gap-3">
                  <IconX className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span>Cadastro longo (email, senha, CPF).</span>
                </li>
                <li className="flex items-start gap-3">
                  <IconX className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span>Seus concorrentes aparecem ao lado.</span>
                </li>
              </ul>
            </div>

            {/* The AgendaVisual Way */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-gold-500/30 relative shadow-2xl">
              <div className="absolute top-0 right-0 px-4 py-1 bg-gold-500 text-slate-900 text-xs font-bold rounded-bl-2xl rounded-tr-2xl">
                AgendaVisual
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500">
                    <IconLink className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Seu Site Exclusivo</h3>
              </div>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <IconCheck className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="font-medium text-white">Zero Download:</span> Acesso instantâneo.
                </li>
                <li className="flex items-start gap-3">
                  <IconCheck className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="font-medium text-white">Zero Cadastro:</span> Nome + Zap e pronto.
                </li>
                <li className="flex items-start gap-3">
                  <IconCheck className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="font-medium text-white">White Label:</span> Apenas a SUA marca aparece.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID (Gestão) --- */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Gestão Poderosa para Você.</h2>
            <p className="text-slate-400">Liberdade para o cliente, controle total para o dono.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-gold-500/50 transition-colors group">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-gold-500 mb-4">
                <IconClock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Recepção 24h</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Sua agenda preenche sozinha enquanto você dorme. Adeus mensagens no WhatsApp de madrugada.</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-gold-500/50 transition-colors group">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-gold-500 mb-4">
                <IconDollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Financeiro Automático</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Saiba exatamente quanto faturou no dia e no mês. O sistema soma tudo para você.</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-gold-500/50 transition-colors group">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-gold-500 mb-4">
                <IconShield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Anti-Falta</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Reduza o 'bolo' (No-Show). O cliente tem clareza do compromisso agendado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION (Anchor) --- */}
      <section className="py-24 bg-slate-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></div>
        <div className="absolute -right-20 bottom-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
            Menos que um corte de cabelo. ✂️
          </h2>
          
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-700 inline-block max-w-lg w-full relative shadow-2xl hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-shadow">
            
            <p className="text-slate-400 mb-2 font-medium uppercase tracking-widest text-xs">Assinatura Mensal</p>
            <div className="flex items-center justify-center gap-1 mb-6">
              <span className="text-2xl text-slate-500 mt-2">R$</span>
              <span className="text-7xl font-bold text-white tracking-tighter">14,99</span>
            </div>

            <div className="space-y-4 mb-10 text-left max-w-xs mx-auto">
              {[
                  "Agendamentos Ilimitados", 
                  "Clientes Ilimitados", 
                  "Link Personalizado", 
                  "Painel Financeiro"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500">
                        <IconCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => window.location.hash = '#login'}
              className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors text-lg"
            >
              Começar Teste de 7 Dias
            </button>
            <p className="text-xs text-slate-500 mt-4 px-4 leading-relaxed">
              Sem fidelidade. Cancele quando quiser. Não pedimos cartão para o teste.
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-slate-800 text-center bg-slate-900">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <IconScissors className="w-5 h-5" />
          <span className="font-bold">AgendaVisual</span>
        </div>
        <p className="text-slate-400 text-sm mb-8 font-medium">
          AgendaVisual, liberdade para o cliente, controle total para o empreendedor.
        </p>
        <div className="text-slate-600 text-xs flex flex-col sm:flex-row justify-center gap-4">
          <span>© {new Date().getFullYear()} AGSISTEMAS.</span>
          <span className="hidden sm:inline">•</span>
          <span>Todos os direitos reservados.</span>
        </div>
      </footer>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
