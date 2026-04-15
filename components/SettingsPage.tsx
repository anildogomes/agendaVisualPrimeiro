
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from '../App';
import { BusinessInfo } from '../types';
import { 
    IconCheck, IconExternalLink, IconCreditCard,
    IconClock, IconMapPin, IconGlobe, PhoneInput, IconAlertTriangle, IconTrash, IconScissors, IconX, IconPlus, IconUser, IconCopy, IconSave, IconChevronRight, IconBell, IconMessageSquare
} from '../constants';

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const weekDaysPT: { [key: string]: string } = {
    monday: 'Segunda-feira', tuesday: 'Terça-feira', wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira', friday: 'Sexta-feira', saturday: 'Sábado', sunday: 'Domingo',
};
const weekDaysShort: { [key: string]: string } = {
    monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua',
    thursday: 'Qui', friday: 'Sex', saturday: 'Sáb', sunday: 'Dom',
};

// Helper to ensure external links have protocol
const getSafeUrl = (url: string) => {
    if (!url) return '#';
    let clean = url.replace(/['"]/g, '').trim();
    const lastProtocolIndex = clean.lastIndexOf('http');
    if (lastProtocolIndex > 0) {
         clean = clean.substring(lastProtocolIndex);
    }
    if (clean === '' || clean === '#') return '#';
    if (!clean.match(/^https?:\/\//)) {
        return `https://${clean}`;
    }
    return clean;
};

// --- IMAGE CROPPER MODAL COMPONENT ---
interface ImageCropperModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    onCropComplete: (croppedBase64: string) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen, imageSrc]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragStart({ x: clientX - position.x, y: clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSave = () => {
        if (!imgRef.current) return;
        const canvas = document.createElement('canvas');
        const size = 500;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        const visualSize = 250; 
        const scaleFactor = size / visualSize;

        ctx.translate(size / 2, size / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(position.x * scaleFactor, position.y * scaleFactor);
        ctx.translate(-size / 2, -size / 2);

        const img = imgRef.current;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let drawWidth = size;
        let drawHeight = size;

        if (imgAspect > 1) {
            drawHeight = size / imgAspect;
        } else {
            drawWidth = size * imgAspect;
        }

        const xOffset = (size - drawWidth) / 2;
        const yOffset = (size - drawHeight) / 2;

        ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        onCropComplete(base64);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-fade-in-down">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Ajustar Logo</h3>
                    <button onClick={onClose}><IconX className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="p-6 flex flex-col items-center">
                    <div 
                        ref={containerRef}
                        className="relative w-[250px] h-[250px] bg-slate-900 overflow-hidden cursor-move rounded-full touch-none shadow-inner border-4 border-slate-200 dark:border-slate-700"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                    >
                        <div 
                            className="absolute inset-0 flex items-center justify-center pointer-events-none origin-center transition-transform duration-75"
                            style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})` }}
                        >
                            <img ref={imgRef} src={imageSrc} alt="Crop target" className="max-w-[250px] max-h-[250px] object-contain select-none" draggable={false} />
                        </div>
                    </div>
                    <div className="w-full mt-6 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                            <span>Zoom</span>
                            <span>{(zoom * 100).toFixed(0)}%</span>
                        </label>
                        <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary-600" />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg dark:bg-white dark:text-slate-900">Salvar</button>
                </div>
            </div>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const [business, setBusiness] = useState<BusinessInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    // Tab State
    const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'hours' | 'notifications' | 'subscription'>('profile');

    // Form states
    const [businessName, setBusinessName] = useState('');
    const [fullName, setFullName] = useState('');
    const [slug, setSlug] = useState('');
    const [phone, setPhone] = useState('');
    const [cep, setCep] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [workHours, setWorkHours] = useState<BusinessInfo['work_hours']>({});
    const [logoUrl, setLogoUrl] = useState('');
    
    // Notification Settings
    const [reminderMinutes, setReminderMinutes] = useState<number>(60);
    const [reminderMessage, setReminderMessage] = useState('');

    // Crop State
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempCropImage, setTempCropImage] = useState<string | null>(null);

    const env = (import.meta as any).env || {};
    const STRIPE_PAYMENT_LINK = env.VITE_STRIPE_PAYMENT_LINK || "#";
    const STRIPE_PORTAL_LINK = env.VITE_STRIPE_CUSTOMER_PORTAL_LINK || "#";

    useEffect(() => {
        fetchBusinessInfo();
    }, []);

    const fetchBusinessInfo = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            addToast('Erro ao carregar configurações.', 'error');
        } else if (data) {
            setBusiness(data as BusinessInfo);
            setBusinessName(data.business_name || '');
            setFullName(data.full_name || '');
            setSlug(data.slug || '');
            setPhone(data.phone || '');
            setCep(data.zip_code || '');
            setStreet(data.street || '');
            setNumber(data.number || '');
            setNeighborhood(data.neighborhood || '');
            setCity(data.city || '');
            setState(data.state || '');
            setWorkHours(data.work_hours || {});
            setLogoUrl(data.logo_url || '');
            setReminderMinutes(data.reminder_minutes || 60);
            setReminderMessage(data.reminder_message || "Olá {nome}, passando para lembrar do seu agendamento hoje às {horario}.");
        }
        setLoading(false);
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                addToast('Sessão expirada. Faça login novamente.', 'error');
                setSaving(false);
                return;
            }

            const updates = {
                business_name: businessName,
                full_name: fullName,
                slug: slug,
                phone: phone,
                zip_code: cep,
                street: street,
                number: number,
                neighborhood: neighborhood,
                city: city,
                state: state,
                work_hours: workHours,
                logo_url: logoUrl,
                reminder_minutes: reminderMinutes,
                reminder_message: reminderMessage
            };

            const { error } = await supabase.from('businesses').update(updates).eq('id', user.id);

            if (error) {
                throw error;
            }

            addToast('Configurações salvas!', 'success');
            window.dispatchEvent(new Event('businessInfoUpdated'));
            setBusiness(prev => prev ? { ...prev, ...updates } : null);
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            addToast(`Erro ao salvar: ${error.message || 'Verifique se as colunas reminder_minutes/message existem no DB.'}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { 
                alert("Imagem muito grande (máx 5MB).");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setTempCropImage(reader.result as string);
                setIsCropperOpen(true);
                e.target.value = ''; 
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedBase64: string) => {
        setLogoUrl(croppedBase64);
        setIsCropperOpen(false);
        setTempCropImage(null);
    };

    const handleWorkHourChange = (day: string, type: 'start' | 'end', value: string) => {
        setWorkHours(prev => {
            const daySlots = prev[day] || [];
            if (daySlots.length === 0) {
                 if (value === '') return prev;
                 return { ...prev, [day]: [{ start: type === 'start' ? value : '09:00', end: type === 'end' ? value : '18:00' }] };
            }
            const newSlots = [...daySlots];
            newSlots[0] = { ...newSlots[0], [type]: value };
            return { ...prev, [day]: newSlots };
        });
    };

    const toggleDay = (day: string) => {
        setWorkHours(prev => {
            const isOpen = !!prev[day];
            if (isOpen) {
                const newState = { ...prev };
                delete newState[day];
                return newState;
            } else {
                return { ...prev, [day]: [{ start: '09:00', end: '18:00' }] };
            }
        });
    };

    const copyMondayToAll = () => {
        const mondaySlots = workHours['monday'];
        if (!mondaySlots) {
            addToast('Configure a Segunda-feira primeiro.', 'error');
            return;
        }
        
        const newHours = { ...workHours };
        ['tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
            newHours[day] = JSON.parse(JSON.stringify(mondaySlots));
        });
        setWorkHours(newHours);
        addToast('Horários copiados para Terça a Sexta.', 'success');
    };

    const handleManageSubscription = () => {
        const safePortalLink = getSafeUrl(STRIPE_PORTAL_LINK);
        if (safePortalLink && safePortalLink !== '#') {
             window.open(safePortalLink, '_blank');
        } else {
             addToast('Link de gerenciamento indisponível.', 'error');
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("TEM CERTEZA? Isso excluirá TUDO permanentemente.")) return;
        if (!confirm("Última chance. Clique em OK para excluir.")) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setLoading(true);
        const { error } = await supabase.from('businesses').delete().eq('id', user.id);

        if (error) {
            addToast(`Erro: ${error.message}`, 'error');
            setLoading(false);
        } else {
            await supabase.auth.signOut();
            window.location.href = '/';
        }
    };

    // Subscription Info
    const isExempt = business?.is_exempt || false;
    const planStatus = business?.subscription_status || 'trialing';
    const joinDate = new Date(business?.created_at || new Date());
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // UPDATED TO 7 DAYS
    const trialDaysLeft = Math.max(0, 7 - diffDays);
    
    const safePaymentLink = getSafeUrl(STRIPE_PAYMENT_LINK);

    if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Carregando configurações...</div>;

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: IconGlobe },
        { id: 'address', label: 'Endereço', icon: IconMapPin },
        { id: 'hours', label: 'Horários', icon: IconClock },
        { id: 'notifications', label: 'Notificações', icon: IconBell },
        { id: 'subscription', label: 'Assinatura', icon: IconCreditCard },
    ];

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            {/* Nav Tabs */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="flex overflow-x-auto no-scrollbar px-4 sm:px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-4 border-b-2 text-sm font-bold whitespace-nowrap transition-colors outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-700 ${
                                activeTab === tab.id 
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
                <div className="max-w-2xl mx-auto space-y-6">
                    
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-fade-in-down">
                            {/* Logo Section */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-600 shadow-md flex items-center justify-center overflow-hidden">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <IconScissors className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-primary-700 transition-colors">
                                        <IconPlus className="w-4 h-4" />
                                        <input type="file" onChange={handleFileSelect} accept="image/*" className="hidden" />
                                    </label>
                                </div>
                                <p className="mt-3 text-xs text-slate-400">Toque no + para alterar. (Máx 5MB)</p>
                            </div>

                            {/* Info Form */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nome da Barbearia</label>
                                    <input 
                                        type="text" 
                                        value={businessName} 
                                        onChange={e => setBusinessName(e.target.value)} 
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        placeholder="Ex: Barbearia do João"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Seu Nome (Proprietário)</label>
                                    <input 
                                        type="text" 
                                        value={fullName} 
                                        onChange={e => setFullName(e.target.value)} 
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Link Personalizado</label>
                                    <div className="flex rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-600">
                                        <span className="px-3 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs sm:text-sm border-r border-slate-200 dark:border-slate-600 whitespace-nowrap">
                                            agendavisual.com.br/#/
                                        </span>
                                        <input 
                                            type="text" 
                                            value={slug} 
                                            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} 
                                            className="flex-1 px-3 py-3 bg-white dark:bg-slate-900 dark:text-white outline-none text-sm font-medium min-w-0"
                                            placeholder="minha-loja"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <PhoneInput 
                                        label="Telefone Principal"
                                        value={phone}
                                        onChange={setPhone}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ADDRESS TAB */}
                    {activeTab === 'address' && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 animate-fade-in-down">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">CEP</label>
                                    <input 
                                        type="text" 
                                        value={cep} 
                                        onChange={e => setCep(e.target.value)} 
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Estado (UF)</label>
                                    <input 
                                        type="text" 
                                        maxLength={2}
                                        value={state} 
                                        onChange={e => setState(e.target.value.toUpperCase())} 
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Cidade</label>
                                <input 
                                    type="text" 
                                    value={city} 
                                    onChange={e => setCity(e.target.value)} 
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Bairro</label>
                                <input 
                                    type="text" 
                                    value={neighborhood} 
                                    onChange={e => setNeighborhood(e.target.value)} 
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Rua</label>
                                    <input 
                                        type="text" 
                                        value={street} 
                                        onChange={e => setStreet(e.target.value)} 
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nº</label>
                                    <input 
                                        type="text" 
                                        value={number} 
                                        onChange={e => setNumber(e.target.value)} 
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HOURS TAB */}
                    {activeTab === 'hours' && (
                        <div className="space-y-4 animate-fade-in-down">
                            {/* Header Info + Copy Button */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between border border-blue-100 dark:border-blue-900/50 gap-3">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                                        <IconClock className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 leading-snug">
                                        Defina o horário de funcionamento padrão.
                                    </p>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={copyMondayToAll}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-xl shadow-sm border border-blue-100 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <IconCopy className="w-4 h-4" />
                                    Copiar Seg
                                </button>
                            </div>

                            <div className="space-y-3">
                                {weekDays.map(day => {
                                    const isOpen = !!workHours[day] && workHours[day]!.length > 0;
                                    const slots = workHours[day] || [{start: '09:00', end: '18:00'}];
                                    const start = slots[0]?.start || '09:00';
                                    const end = slots[slots.length-1]?.end || '18:00';

                                    return (
                                        <div key={day} className={`p-4 rounded-xl border transition-all duration-200 ${!isOpen ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-700/50' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-600 shadow-sm'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${isOpen ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                                        {weekDaysShort[day]}
                                                    </div>
                                                    <div>
                                                        <span className={`block font-bold text-sm ${isOpen ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                                                            {weekDaysPT[day]}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                                                            {isOpen ? 'Aberto' : 'Fechado'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" checked={isOpen} onChange={() => toggleDay(day)} />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            
                                            {isOpen && (
                                                <div className="animate-fade-in-down pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-3">
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Abre</label>
                                                            <div className="relative">
                                                                <input 
                                                                    type="time" 
                                                                    value={start}
                                                                    onChange={(e) => handleWorkHourChange(day, 'start', e.target.value)}
                                                                    className="w-full pl-3 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-sm text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="pb-3 text-slate-400">
                                                            <IconChevronRight className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Fecha</label>
                                                            <div className="relative">
                                                                <input 
                                                                    type="time" 
                                                                    value={end}
                                                                    onChange={(e) => handleWorkHourChange(day, 'end', e.target.value)}
                                                                    className="w-full pl-3 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-sm text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 animate-fade-in-down">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <IconBell className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Lembretes Automáticos</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                        Configure alertas para não deixar seu cliente esquecer. O sistema avisará você para enviar a mensagem no WhatsApp.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Tempo de Antecedência
                                </label>
                                <div className="flex flex-wrap items-center gap-3">
                                    <input 
                                        type="number" 
                                        min="10"
                                        max="1440"
                                        value={reminderMinutes} 
                                        onChange={e => setReminderMinutes(Math.max(0, parseInt(e.target.value) || 0))} 
                                        className="w-32 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-bold text-center" 
                                    />
                                    <span className="text-sm text-slate-500 dark:text-slate-400">minutos antes do agendamento.</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <IconMessageSquare className="w-4 h-4"/> Modelo da Mensagem
                                </label>
                                <textarea 
                                    rows={4}
                                    value={reminderMessage}
                                    onChange={e => setReminderMessage(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none text-sm leading-relaxed"
                                    placeholder="Olá {nome}, lembrete do seu agendamento às {horario}..."
                                />
                                <p className="text-[10px] text-slate-400 mt-2">
                                    Variáveis disponíveis: <strong>{'{nome}'}</strong> (Nome do cliente), <strong>{'{horario}'}</strong> (Hora do agendamento).
                                </p>
                            </div>
                        </div>
                    )}

                    {/* SUBSCRIPTION TAB */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-6 animate-fade-in-down">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Seu Plano</p>
                                            <h3 className="text-2xl font-bold">
                                                {isExempt ? 'Vitalício VIP' : planStatus === 'active' ? 'Premium Mensal' : 'Período de Teste'}
                                            </h3>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${planStatus === 'active' || isExempt ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}>
                                            {planStatus === 'active' || isExempt ? 'Ativo' : 'Pendente'}
                                        </div>
                                    </div>

                                    {!isExempt && planStatus !== 'active' && (
                                        <div className="mb-6">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-slate-300">Tempo Restante</span>
                                                <span className="font-bold">{trialDaysLeft}/7 dias</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2">
                                                <div className="bg-gold-500 h-2 rounded-full transition-all" style={{width: `${(trialDaysLeft/7)*100}%`}}></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3">
                                        {(planStatus !== 'active' || (planStatus === 'active' && trialDaysLeft > 0)) && !isExempt && safePaymentLink !== "#" && (
                                            <a 
                                                href={safePaymentLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-bold text-center hover:bg-slate-100 transition-colors shadow-lg"
                                            >
                                                {planStatus === 'active' ? 'Renovar Agora' : 'Assinar R$14,99/mês'}
                                            </a>
                                        )}
                                        <button 
                                            onClick={handleManageSubscription}
                                            className="w-full py-3.5 bg-slate-700/50 text-white rounded-xl font-bold text-center hover:bg-slate-700 transition-colors border border-slate-600"
                                        >
                                            Gerenciar Faturas / Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 text-center">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <IconAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h4 className="text-red-700 dark:text-red-400 font-bold mb-1">Zona de Perigo</h4>
                                <p className="text-xs text-red-600/70 dark:text-red-300/70 mb-4">
                                    A exclusão da conta é irreversível.
                                </p>
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="text-xs font-bold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline"
                                >
                                    Excluir minha conta
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Floating Save Button */}
                    <div className="fixed bottom-24 right-4 sm:right-8 z-30">
                        <button 
                            onClick={(e) => handleSave(e as any)}
                            disabled={saving}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-70 disabled:scale-100"
                        >
                            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <IconSave className="w-6 h-6" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Modals */}
            {tempCropImage && (
                <ImageCropperModal
                    isOpen={isCropperOpen}
                    onClose={() => { setIsCropperOpen(false); setTempCropImage(null); }}
                    imageSrc={tempCropImage}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
};

export default SettingsPage;
