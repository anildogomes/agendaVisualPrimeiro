
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { IconSettings, IconLogout, IconHome, IconUsers, IconScissors, IconBriefcase, IconBlock, IconShare, IconSun, IconMoon, IconChevronsLeft, IconCalendar, IconAlertTriangle, IconX, IconWhatsApp, IconChart } from '../constants';
import { BusinessInfo } from '../types';
import ClientsPage from './ClientsPage';
import ServicesPage from './ServicesPage';
import ProfessionalsPage from './ProfessionalsPage';
import SettingsPage from './SettingsPage';
import AppointmentsPage from './AppointmentsPage';
import ScheduleBlocksPage from './ScheduleBlocksPage';
import ReportsPage from './ReportsPage';
import { useTheme, useToast } from '../App';
import { supabase } from '../supabaseClient';

// Helper to ensure external links have protocol and are clean, handling copy-paste errors
const getSafeUrl = (url: string) => {
    if (!url) return '#';
    // Remove quotes (single or double) and trim whitespace
    let clean = url.replace(/['"]/g, '').trim();
    
    // Fix common copy-paste error: double protocol/domain
    // e.g. https://buy.stripe.com/https://buy.stripe.com/...
    // If we find http/https more than once, we take the last occurrence as the start
    const lastProtocolIndex = clean.lastIndexOf('http');
    if (lastProtocolIndex > 0) {
         clean = clean.substring(lastProtocolIndex);
    }
    
    if (clean === '' || clean === '#') return '#';
    
    // Ensure protocol
    if (!clean.match(/^https?:\/\//)) {
        return `https://${clean}`;
    }
    return clean;
};

// --- COMPONENT: RESTRICTED ACCESS OVERLAY ---
const RestrictedAccessView = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in-down">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
                <IconAlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">Acesso Temporariamente Restrito</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                Sua assinatura está pendente ou o período de teste expirou. O acesso às funções de agendamento e gestão está bloqueado.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                    onClick={() => window.location.hash = 'settings'}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors dark:bg-white dark:text-slate-900"
                >
                    Ir para Configurações / Regularizar
                </button>
            </div>
            <p className="mt-6 text-xs text-slate-400">
                Você pode excluir sua conta ou gerenciar sua assinatura na aba Configurações.
            </p>
        </div>
    );
};

// --- COMPONENT: SHARE MODAL ---
const ShareModal = ({ isOpen, onClose, url }: { isOpen: boolean; onClose: () => void; url: string; }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copiar URL');
    const { addToast } = useToast();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}`;

    const copyUrlToClipboard = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopyButtonText('Copiado!');
            addToast('Link copiado para a área de transferência!', 'success');
            setTimeout(() => setCopyButtonText('Copiar URL'), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            setCopyButtonText('Erro ao copiar');
            addToast('Erro ao copiar link.', 'error');
        });
    };

    const downloadQrCode = async () => {
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'qrcode-agendavisual.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            addToast('QR Code baixado com sucesso!', 'success');
        } catch (error) {
            console.error('Failed to download QR code:', error);
            addToast('Não foi possível baixar o QR Code.', 'error');
        }
    };

    const shareViaWhatsApp = () => {
        const message = `Agende seu horário online: ${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 relative text-center">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                    <IconX className="w-6 h-6" />
                </button>
                
                <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">Compartilhe sua Página</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Seus clientes podem agendar online usando o link ou QR Code.</p>
                
                <div className="mb-6 p-3 bg-white inline-block rounded-xl shadow-sm border border-slate-100">
                    <img src={qrCodeUrl} alt="QR Code" className="mx-auto rounded-lg" width="200" height="200" />
                </div>
                
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={downloadQrCode} className="w-full px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
                            Baixar QR Code
                        </button>
                        <button onClick={copyUrlToClipboard} className="w-full px-4 py-3 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-lg dark:bg-white dark:text-slate-900">
                            {copyButtonText}
                        </button>
                    </div>
                    
                    <button onClick={shareViaWhatsApp} className="w-full px-4 py-3 text-sm font-bold text-white bg-[#25D366] rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg flex items-center justify-center gap-2">
                        <IconWhatsApp className="w-5 h-5" />
                        Enviar no WhatsApp
                    </button>
                </div>

                <div className="mt-6">
                    <label htmlFor="booking-url" className="sr-only">URL de Agendamento</label>
                    <input 
                        id="booking-url"
                        type="text" 
                        readOnly 
                        value={url} 
                        className="w-full text-center text-sm bg-slate-50 text-slate-600 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
                    />
                </div>
            </div>
        </div>
    );
};

interface DashboardProps {
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [activeView, setActiveView] = useState(window.location.hash.substring(1) || 'inicio');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
    const mobileNavRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();
    const { addToast } = useToast();

    // Access Env Vars
    const env = (import.meta as any).env || {};
    const STRIPE_PAYMENT_LINK = env.VITE_STRIPE_PAYMENT_LINK;

    // Trial Calculation & Lock Logic
    const { trialDaysLeft, isLocked } = useMemo(() => {
        if (!businessInfo) return { trialDaysLeft: null, isLocked: false };
        
        const isExempt = businessInfo.is_exempt;
        const isActive = businessInfo.subscription_status === 'active';
        
        const joinDate = new Date(businessInfo.created_at || new Date());
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - joinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const left = 7 - diffDays; // Updated to 7 days
        
        const trialLeft = left >= 0 ? left : 0;
        
        // Locked if: NOT active subscription AND NOT exempt AND Trial expired
        const locked = !isActive && !isExempt && trialLeft <= 0;

        return { trialDaysLeft: trialLeft, isLocked: locked };
    }, [businessInfo]);

    const navItems = useMemo(() => {
        const fullItems = [
            { id: 'inicio', label: 'Agenda', icon: IconCalendar },
            { id: 'clients', label: 'Clientes', icon: IconUsers },
            { id: 'services', label: 'Serviços', icon: IconScissors },
            { id: 'professionals', label: 'Profissionais', icon: IconBriefcase },
            { id: 'blocks', label: 'Bloqueios', icon: IconBlock },
            { id: 'reports', label: 'Relatórios', icon: IconChart },
            { id: 'settings', label: 'Configurações', icon: IconSettings },
        ];

        // If locked, restrict navigation to only Settings
        if (isLocked) {
            return [
                { id: 'settings', label: 'Configurações', icon: IconSettings }
            ];
        }
        return fullItems;
    }, [isLocked]);

    // Restore business info fetching for public URL and header display
    const fetchBusinessInfo = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
            
            if (data) {
                setBusinessInfo(data as BusinessInfo);
            }
        }
    }, []);

    useEffect(() => {
        fetchBusinessInfo();
        // Listen for updates
        window.addEventListener('businessInfoUpdated', fetchBusinessInfo);
        return () => window.removeEventListener('businessInfoUpdated', fetchBusinessInfo);
    }, [fetchBusinessInfo]);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (navItems.find(item => item.id === hash)) {
                setActiveView(hash);
            } else if (isLocked && hash !== 'settings') {
                // Redirect to settings if locked
                setActiveView('settings');
                window.location.hash = 'settings';
            } else if (!hash || hash === '') {
                 setActiveView(isLocked ? 'settings' : 'inicio');
            }
        };

        handleHashChange(); // Check on mount
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [navItems, isLocked]);

    const renderContent = () => {
        if (isLocked && activeView !== 'settings') {
            return <RestrictedAccessView />;
        }

        switch (activeView) {
            case 'inicio': return <AppointmentsPage />;
            case 'appointments': return <AppointmentsPage />; // Fallback for old links
            case 'clients': return <ClientsPage />;
            case 'services': return <ServicesPage />;
            case 'professionals': return <ProfessionalsPage />;
            case 'blocks': return <ScheduleBlocksPage />;
            case 'reports': return <ReportsPage />;
            case 'settings': return <SettingsPage />;
            default: return isLocked ? <RestrictedAccessView /> : <AppointmentsPage />;
        }
    };

    const activeLabel = navItems.find(item => item.id === activeView)?.label || (isLocked ? 'Acesso Restrito' : 'Painel');

    const publicUrl = useMemo(() => {
      if (!businessInfo || !businessInfo.slug) return '';
      const PRODUCTION_DOMAIN = 'https://agendavisual.com.br';
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocal ? window.location.origin : PRODUCTION_DOMAIN;
      return `${baseUrl}/#/${businessInfo.slug}`;
    }, [businessInfo]);

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans overflow-hidden">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">AgendaVisual</h1>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => window.location.hash = item.id}
                            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                activeView === item.id
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${activeView === item.id ? 'text-gold-500 dark:text-slate-900' : 'text-slate-400'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <button onClick={onLogout} className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50 transition-colors">
                        <IconLogout className="w-5 h-5 mr-3" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                
                {/* Unified Header (Desktop & Mobile) */}
                <header className="h-16 sm:h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{activeLabel}</h2>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Theme Toggle */}
                        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                             {theme === 'light' ? <IconMoon className="w-5 h-5" /> : <IconSun className="w-5 h-5" />}
                        </button>

                        {/* Share Button (Only if not locked or on allowed pages) */}
                        {!isLocked && publicUrl && (
                            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors" title="Compartilhar">
                               <IconShare className="w-5 h-5" />
                               <span className="hidden sm:inline text-sm font-medium">Compartilhar</span>
                            </button>
                        )}

                        {/* "Meu Site" Link (Only if not locked) */}
                        {!isLocked && publicUrl && (
                            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-gold-600 dark:text-slate-300 dark:hover:text-gold-400 transition-colors whitespace-nowrap" title="Ver Meu Site">
                               Meu Site
                            </a>
                        )}
                        
                        {/* Logout (Mobile only) */}
                        <button onClick={onLogout} className="md:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                             <IconLogout className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Trial Banner - Subtler darker design (Only show if not locked) */}
                {trialDaysLeft !== null && !isLocked && (
                    <div className={`text-white px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-2 z-10 shrink-0 shadow-sm transition-colors duration-500 bg-slate-800 border-b border-slate-700
                    `}>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-200">
                                {trialDaysLeft === 0 
                                    ? "Último dia do seu Teste Grátis. Regularize para evitar bloqueio."
                                    : `Período de Teste: ${trialDaysLeft} dias restantes.`
                                }
                            </span>
                        </div>
                        <button 
                            onClick={() => {
                                const safePaymentLink = getSafeUrl(STRIPE_PAYMENT_LINK);
                                if (safePaymentLink && safePaymentLink !== '#') {
                                    window.open(safePaymentLink, '_blank');
                                } else {
                                    window.location.hash = 'settings';
                                }
                            }}
                            className="px-3 py-1 rounded-lg font-bold text-xs transition-colors whitespace-nowrap bg-white text-slate-900 hover:bg-slate-200"
                        >
                            Assinar
                        </button>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto pb-24 md:pb-0 bg-slate-50 dark:bg-slate-900 flex flex-col">
                    <div className="flex-1">
                         {renderContent()}
                    </div>
                    <footer className="p-4 text-center text-xs text-slate-400 dark:text-slate-600 mt-auto">
                        © {new Date().getFullYear()} AGSISTEMAS. Todos os direitos reservados.
                    </footer>
                </main>

                {/* Mobile Bottom Navigation (Hidden if locked to simplify UI) */}
                {!isLocked && (
                    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-50 h-20 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div ref={mobileNavRef} className="flex items-center w-full overflow-x-auto no-scrollbar h-full gap-6 px-2">
                            {navItems.map(item => {
                                const isActive = activeView === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => window.location.hash = item.id}
                                        className={`
                                            flex-shrink-0 transition-all duration-300 ease-in-out whitespace-nowrap
                                            ${isActive 
                                                ? 'flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                                                : 'flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 gap-1'
                                            }
                                        `}
                                    >
                                        <item.icon className={`${isActive ? 'w-6 h-6 text-gold-500 dark:text-slate-900' : 'w-6 h-6'}`} />
                                        {!isActive && (
                                            <span className="text-[11px] font-medium leading-none">
                                                {item.label}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                             <button
                                onClick={() => {
                                    if (mobileNavRef.current) {
                                        mobileNavRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                                    }
                                    window.location.hash = 'inicio';
                                }}
                                className="flex-shrink-0 flex items-center justify-center text-slate-300 border-l border-slate-200 dark:border-slate-700 pl-4 ml-2 h-full"
                            >
                                <IconChevronsLeft className="w-6 h-6 stroke-1.5" />
                            </button>
                        </div>
                    </nav>
                )}
            </div>
            
             <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                url={publicUrl}
            />
        </div>
    );
};

export default Dashboard;
