
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Professional, Service, ServiceCategory, BusinessInfo } from '../types';
import { 
    IconPlus, IconEdit, IconX, ConfirmationModal, IconAlertTriangle, 
    PhoneInput, IconCheck, IconClock, IconTrash, 
    IconUser, IconBriefcase, IconScissors, IconCamera
} from '../constants';
import { supabase } from '../supabaseClient';
import { useToast } from '../App';

// --- Types & Interfaces ---

type UiWorkingDay = {
    active: boolean;
    shiftStart: string;
    shiftEnd: string;
    hasBreak: boolean;
    breakStart: string;
    breakEnd: string;
};

type UiWorkingHours = { [key: string]: UiWorkingDay };

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const weekDaysPT: { [key: string]: string } = {
    monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta',
    thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo',
};
const weekDaysShort: { [key: string]: string } = {
    monday: 'S', tuesday: 'T', wednesday: 'Q',
    thursday: 'Q', friday: 'S', saturday: 'S', sunday: 'D',
};

// --- Helpers ---

const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// --- Components ---

// 1. Professional Card Component
const ProfessionalCard: React.FC<{
    professional: Professional;
    onEdit: (p: Professional) => void;
    onDelete: (p: Professional) => void;
    getServiceName: (id: number) => string | undefined;
}> = ({ professional, onEdit, onDelete, getServiceName }) => {
    
    // Calculate active days for display
    const activeDays = weekDays.map(day => ({
        day,
        label: weekDaysShort[day],
        isActive: !!professional.work_hours[day] && professional.work_hours[day]!.length > 0
    }));

    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300 overflow-hidden flex flex-col h-full">
            
            {/* Header / Cover feel - Buttons only visible on Desktop Hover */}
            <div className="h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 relative">
                <div className="hidden md:flex absolute top-2 right-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                     <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(professional); }}
                        className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 shadow-sm backdrop-blur-sm transition-colors"
                        title="Editar"
                    >
                        <IconEdit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(professional); }}
                        className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-xl text-slate-600 dark:text-slate-300 hover:text-red-600 shadow-sm backdrop-blur-sm transition-colors"
                        title="Excluir"
                    >
                        <IconTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <div className="px-5 pb-5 flex-1 flex flex-col relative">
                {/* Avatar */}
                <div className="-mt-10 mb-3 self-start">
                    <div className="w-20 h-20 rounded-2xl p-1 bg-white dark:bg-slate-800 shadow-md">
                        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative border border-slate-100 dark:border-slate-600">
                            {professional.avatar_url ? (
                                <img src={professional.avatar_url} alt={professional.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-bold text-slate-400 dark:text-slate-500">{getInitials(professional.name)}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{professional.name}</h3>
                    {professional.whatsapp_phone ? (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {professional.whatsapp_phone}
                        </p>
                    ) : (
                        <p className="text-xs font-medium text-slate-400 mt-1 italic">Sem contato</p>
                    )}
                </div>

                {/* Services Tags (Limited view) */}
                <div className="mb-6 flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center gap-1">
                        <IconScissors className="w-3 h-3" /> Especialidades
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {professional.service_ids.length > 0 ? (
                            professional.service_ids.slice(0, 3).map(id => (
                                <span key={id} className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-600">
                                    {getServiceName(id) || 'Serviço'}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-slate-400 italic">Nenhum serviço vinculado</span>
                        )}
                        {professional.service_ids.length > 3 && (
                            <span className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-400 text-[11px] font-medium border border-dashed border-slate-300">
                                +{professional.service_ids.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                {/* Weekly Schedule Mini-View */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-center px-1">
                        {activeDays.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5 group/day" title={weekDaysPT[d.day]}>
                                <span className={`text-[10px] font-bold ${d.isActive ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>
                                    {d.label}
                                </span>
                                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${d.isActive ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Mobile Actions (Visible only on small screens) */}
                <div className="md:hidden flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(professional); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-600 active:scale-95 transition-transform"
                    >
                        <IconEdit className="w-4 h-4" />
                        Editar
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(professional); }}
                        className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold border border-red-100 dark:border-red-900/30 active:scale-95 transition-transform"
                        aria-label="Excluir"
                    >
                        <IconTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Modal Component
type ProfessionalFormModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (professional: Omit<Professional, 'id' | 'business_id'> & { id?: number }) => void;
    professionalToEdit: Professional | null;
    businessWorkHours: BusinessInfo['work_hours'] | null;
};

const ProfessionalFormModal: React.FC<ProfessionalFormModalProps> = ({ isOpen, onClose, onSave, professionalToEdit, businessWorkHours }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'schedule'>('profile');
    
    // Form State
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState('');
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [uiWorkingHours, setUiWorkingHours] = useState<UiWorkingHours>({});
    
    // Aux Data
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const { addToast } = useToast();

    // Reset/Init
    useEffect(() => {
        if (!isOpen) return;
        
        setActiveTab('profile'); // Always start on profile

        // Load Services/Categories
        const fetchAuxData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const [sRes, cRes] = await Promise.all([
                supabase.from('services').select('*').eq('business_id', user.id).order('name'),
                supabase.from('service_categories').select('*').eq('business_id', user.id).order('name')
            ]);
            if (sRes.data) setAllServices(sRes.data as Service[]);
            if (cRes.data) setCategories(cRes.data as ServiceCategory[]);
        };
        fetchAuxData();

        // Helper to parse working hours
        const getUiDayData = (day: string, profSlots: { start: string; end: string }[] | null | undefined): UiWorkingDay => {
            const businessDaySlots = businessWorkHours ? businessWorkHours[day] : null;
            const isBusinessOpen = businessDaySlots && businessDaySlots.length > 0;
            
            // Defaults based on Business Hours (Restrictive Logic)
            let bStart = '09:00';
            let bEnd = '18:00';

            if (isBusinessOpen && businessDaySlots) {
                const sorted = [...businessDaySlots].sort((a, b) => a.start.localeCompare(b.start));
                bStart = sorted[0].start;
                bEnd = sorted[sorted.length - 1].end;
            }

            let isActive = false;
            let hasBreak = false;
            let breakStart = '12:00';
            let breakEnd = '13:00';
            let pStart = bStart;
            let pEnd = bEnd;

            if (profSlots && profSlots.length > 0) {
                isActive = true;
                const sortedProf = [...profSlots].sort((a, b) => a.start.localeCompare(b.start));
                pStart = sortedProf[0].start;
                pEnd = sortedProf[sortedProf.length - 1].end;

                if (profSlots.length >= 2) {
                    hasBreak = true;
                    breakStart = sortedProf[0].end;
                    breakEnd = sortedProf[1].start;
                }
            } else if (!professionalToEdit && isBusinessOpen) {
                isActive = true; // New professionals default to active if shop is open
            }

            return { active: isActive, shiftStart: pStart, shiftEnd: pEnd, hasBreak, breakStart, breakEnd };
        };

        if (professionalToEdit) {
            setName(professionalToEdit.name);
            setAvatarUrl(professionalToEdit.avatar_url);
            setWhatsappPhone(professionalToEdit.whatsapp_phone || '');
            setSelectedServices(professionalToEdit.service_ids);
            
            const hours = Object.fromEntries(weekDays.map(day => [day, getUiDayData(day, professionalToEdit.work_hours[day])]));
            setUiWorkingHours(hours);
        } else {
            setName('');
            setAvatarUrl('');
            setWhatsappPhone('');
            setSelectedServices([]);
            const hours = Object.fromEntries(weekDays.map(day => [day, getUiDayData(day, null)]));
            setUiWorkingHours(hours);
        }

    }, [isOpen, professionalToEdit, businessWorkHours]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation: Max 2MB
            if (file.size > 2 * 1024 * 1024) {
                addToast('A imagem deve ter no máximo 2MB para não sobrecarregar o sistema.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => setAvatarUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleServiceToggle = (id: number) => {
        setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const handleHoursChange = (day: string, field: keyof UiWorkingDay, value: any) => {
        setUiWorkingHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Build JSONB structure
        const finalHours = Object.fromEntries(weekDays.map(day => {
            const ui = uiWorkingHours[day];
            const biz = businessWorkHours ? businessWorkHours[day] : null;
            
            // Rule: If business closed OR user unchecked day -> null
            // Also validate against business hours just in case
            if (!ui.active || !biz || biz.length === 0) return [day, null];

            let slots = [];
            // Basic validation to ensure start < end
            const cleanShiftStart = ui.shiftStart < ui.shiftEnd ? ui.shiftStart : '09:00';
            const cleanShiftEnd = ui.shiftStart < ui.shiftEnd ? ui.shiftEnd : '18:00';

            if (ui.hasBreak && ui.breakStart < ui.breakEnd) {
                // Ensure break is within shift
                if (cleanShiftStart < ui.breakStart && ui.breakEnd < cleanShiftEnd) {
                    slots = [{ start: cleanShiftStart, end: ui.breakStart }, { start: ui.breakEnd, end: cleanShiftEnd }];
                } else {
                    slots = [{ start: cleanShiftStart, end: cleanShiftEnd }];
                }
            } else {
                slots = [{ start: cleanShiftStart, end: cleanShiftEnd }];
            }
            return [day, slots];
        }));

        onSave({
            id: professionalToEdit?.id,
            name, avatar_url: avatarUrl, whatsapp_phone: whatsappPhone,
            service_ids: selectedServices, work_hours: finalHours
        });
    };

    // Services Grouping Logic
    const groupedServices = useMemo(() => {
        const grouped: Record<number, Service[]> = {};
        const uncategorized: Service[] = [];
        allServices.forEach(s => {
            if (s.category_id) {
                if (!grouped[s.category_id]) grouped[s.category_id] = [];
                grouped[s.category_id].push(s);
            } else uncategorized.push(s);
        });
        return { grouped, uncategorized };
    }, [allServices]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="bg-white dark:bg-slate-800 w-full sm:max-w-lg h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col relative z-10 animate-slide-up sm:animate-fade-in-down overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0">
                    <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
                        {professionalToEdit ? 'Editar Profissional' : 'Novo Profissional'}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 transition-colors"><IconX className="w-5 h-5"/></button>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-2 pb-0 flex border-b border-slate-100 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800 gap-6 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'profile', label: 'Perfil', icon: IconUser },
                        { id: 'services', label: 'Serviços', icon: IconScissors },
                        { id: 'schedule', label: 'Horários', icon: IconClock },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-3 border-b-2 text-sm font-bold whitespace-nowrap transition-colors outline-none ${
                                activeTab === tab.id 
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
                    <form id="prof-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* TAB: PROFILE */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-fade-in-down">
                                {/* Image Uploader */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-28 h-28 rounded-2xl bg-slate-200 dark:bg-slate-700 shadow-inner flex items-center justify-center relative overflow-hidden group border-2 border-dashed border-slate-300 dark:border-slate-600">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <IconUser className="w-12 h-12 text-slate-400" />
                                        )}
                                        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                                            <IconCamera className="w-6 h-6 mb-1"/>
                                            Trocar
                                            <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <label className="text-primary-600 dark:text-primary-400 text-sm font-bold cursor-pointer hover:underline inline-flex items-center gap-1">
                                            {avatarUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                                            <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                                        </label>
                                        <p className="text-[10px] text-slate-400 mt-1">Máx 2MB (JPG, PNG)</p>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                                        <input 
                                            type="text" 
                                            value={name} 
                                            onChange={e => setName(e.target.value)} 
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                                            placeholder="Ex: João da Silva"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">WhatsApp</label>
                                        <PhoneInput 
                                            value={whatsappPhone} 
                                            onChange={setWhatsappPhone} 
                                            placeholder="(00) 00000-0000"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                            <IconCheck className="w-3 h-3 text-green-500" />
                                            Usado para links de agendamento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: SERVICES */}
                        {activeTab === 'services' && (
                            <div className="space-y-6 animate-fade-in-down">
                                {allServices.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p className="mb-2">Nenhum serviço cadastrado na loja.</p>
                                        <button type="button" onClick={onClose} className="text-primary-600 font-bold text-sm hover:underline">Ir para Serviços e criar um.</button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 px-1">
                                            Selecione quais serviços <strong>{name || 'este profissional'}</strong> pode realizar.
                                        </p>
                                        
                                        <div className="space-y-4">
                                            {categories.map(cat => groupedServices.grouped[cat.id]?.length > 0 && (
                                                <div key={cat.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                        {cat.name}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {groupedServices.grouped[cat.id].map(service => (
                                                            <button
                                                                key={service.id}
                                                                type="button"
                                                                onClick={() => handleServiceToggle(service.id)}
                                                                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 ${
                                                                    selectedServices.includes(service.id)
                                                                    ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-[1.02]'
                                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {service.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {groupedServices.uncategorized.length > 0 && (
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                        Outros
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {groupedServices.uncategorized.map(service => (
                                                            <button
                                                                key={service.id}
                                                                type="button"
                                                                onClick={() => handleServiceToggle(service.id)}
                                                                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 ${
                                                                    selectedServices.includes(service.id)
                                                                    ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-[1.02]'
                                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {service.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* TAB: SCHEDULE */}
                        {activeTab === 'schedule' && (
                            <div className="space-y-4 animate-fade-in-down pb-4">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl flex gap-3 shadow-sm">
                                    <IconAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                                        <strong>Nota:</strong> Os horários do profissional são estritamente limitados pelo funcionamento da barbearia configurado no painel de configurações.
                                    </div>
                                </div>

                                {weekDays.map(day => {
                                    const ui = uiWorkingHours[day];
                                    // Business Constraint Logic
                                    const bizSlots = businessWorkHours ? businessWorkHours[day] : null;
                                    const isShopOpen = bizSlots && bizSlots.length > 0;
                                    
                                    // Calculate Shop Limits for Inputs
                                    let shopStart = '09:00';
                                    let shopEnd = '18:00';
                                    if (isShopOpen) {
                                        const sorted = [...bizSlots!].sort((a,b)=>a.start.localeCompare(b.start));
                                        shopStart = sorted[0].start;
                                        shopEnd = sorted[sorted.length-1].end;
                                    }

                                    return (
                                        <div key={day} className={`p-4 rounded-2xl border transition-all duration-200 ${
                                            ui.active 
                                            ? 'bg-white border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700' 
                                            : 'bg-slate-50 border-slate-100 opacity-80 dark:bg-slate-800/40 dark:border-slate-700/50'
                                        }`}>
                                            
                                            {/* Header Row */}
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${ui.active ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}>
                                                        {weekDaysShort[day]}
                                                    </div>
                                                    <div>
                                                        <span className={`font-bold text-sm block ${ui.active ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{weekDaysPT[day]}</span>
                                                        {isShopOpen ? (
                                                            <p className="text-[10px] text-slate-400 font-medium">Expediente Loja: {shopStart} - {shopEnd}</p>
                                                        ) : (
                                                            <p className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded inline-block mt-0.5">LOJA FECHADA</p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={ui.active}
                                                        onChange={e => handleHoursChange(day, 'active', e.target.checked)}
                                                        disabled={!isShopOpen}
                                                    />
                                                    <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none transition-colors ${!isShopOpen ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary-600'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                                                </label>
                                            </div>

                                            {/* Inputs (Only if active) */}
                                            {ui.active && isShopOpen && (
                                                <div className="space-y-3 animate-fade-in-down mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Início</label>
                                                            <input 
                                                                type="time" 
                                                                value={ui.shiftStart} 
                                                                min={shopStart} max={shopEnd}
                                                                onChange={e => handleHoursChange(day, 'shiftStart', e.target.value)}
                                                                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Fim</label>
                                                            <input 
                                                                type="time" 
                                                                value={ui.shiftEnd} 
                                                                min={shopStart} max={shopEnd}
                                                                onChange={e => handleHoursChange(day, 'shiftEnd', e.target.value)}
                                                                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <label className="flex items-center gap-2 mb-2 cursor-pointer group">
                                                            <div className="relative flex items-center">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={ui.hasBreak} 
                                                                    onChange={e => handleHoursChange(day, 'hasBreak', e.target.checked)}
                                                                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary-600 transition-colors">Adicionar Intervalo (Almoço)</span>
                                                        </label>
                                                        
                                                        {ui.hasBreak && (
                                                            <div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-slate-200 dark:border-slate-700 ml-1">
                                                                <div>
                                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Saída</label>
                                                                    <input 
                                                                        type="time" 
                                                                        value={ui.breakStart}
                                                                        onChange={e => handleHoursChange(day, 'breakStart', e.target.value)} 
                                                                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-300 focus:border-primary-500 outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Volta</label>
                                                                    <input 
                                                                        type="time" 
                                                                        value={ui.breakEnd}
                                                                        onChange={e => handleHoursChange(day, 'breakEnd', e.target.value)} 
                                                                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-300 focus:border-primary-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0 pb-safe">
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            form="prof-form"
                            className="flex-1 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg dark:bg-white dark:text-slate-900 transition-transform active:scale-[0.98]"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. Main Page Component
const ProfessionalsPage: React.FC = () => {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [businessWorkHours, setBusinessWorkHours] = useState<BusinessInfo['work_hours'] | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    
    // Modal & Action State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [professionalToEdit, setProfessionalToEdit] = useState<Professional | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<Professional | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            addToast("Usuário não autenticado.", "error");
            setLoading(false);
            return;
        }
        
        const [profRes, servRes, bizRes] = await Promise.all([
            supabase.from('professionals').select('*').eq('business_id', user.id).order('name'),
            supabase.from('services').select('*').eq('business_id', user.id),
            supabase.from('businesses').select('work_hours').eq('id', user.id).maybeSingle()
        ]);

        if (profRes.error) addToast('Erro ao carregar profissionais.', 'error');
        else setProfessionals(profRes.data as Professional[]);

        if (servRes.data) setServices(servRes.data as Service[]);
        if (bizRes.data) setBusinessWorkHours(bizRes.data.work_hours);

        setLoading(false);
    }, [addToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSaveProfessional = async (data: Omit<Professional, 'id' | 'business_id'> & { id?: number }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = { ...data, business_id: user.id };
        let error;

        if (data.id) {
            ({ error } = await supabase.from('professionals').update(payload).eq('id', data.id));
        } else {
            ({ error } = await supabase.from('professionals').insert(payload));
        }

        if (error) {
            addToast(`Erro: ${error.message}`, 'error');
        } else {
            addToast('Salvo com sucesso!', 'success');
            fetchData();
            setIsModalOpen(false);
            setProfessionalToEdit(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmation) return;
        const { error } = await supabase.from('professionals').delete().eq('id', deleteConfirmation.id);
        if (error) addToast('Erro ao excluir.', 'error');
        else {
            addToast('Profissional removido.', 'info');
            fetchData();
        }
        setDeleteConfirmation(null);
    };

    const getServiceName = (id: number) => services.find(s => s.id === id)?.name;

    if (loading) return <div className="p-10 text-center text-slate-400">Carregando equipe...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
            
            {/* Header / Actions */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 sm:px-8 z-10 shrink-0 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-6xl mx-auto w-full">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <IconBriefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            Profissionais
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Gerencie sua equipe, fotos e horários de trabalho.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => { setProfessionalToEdit(null); setIsModalOpen(true); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all dark:bg-white dark:text-slate-900"
                    >
                        <IconPlus className="w-5 h-5" />
                        Adicionar Novo
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24">
                <div className="max-w-6xl mx-auto">
                    {professionals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <IconUser className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Nenhum profissional encontrado</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mt-2">Adicione membros à sua equipe para começar a receber agendamentos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {professionals.map(prof => (
                                <ProfessionalCard 
                                    key={prof.id} 
                                    professional={prof}
                                    onEdit={(p) => { setProfessionalToEdit(p); setIsModalOpen(true); }}
                                    onDelete={setDeleteConfirmation}
                                    getServiceName={getServiceName}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ProfessionalFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProfessional}
                professionalToEdit={professionalToEdit}
                businessWorkHours={businessWorkHours}
            />

            <ConfirmationModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={handleDelete}
                title="Excluir Profissional"
                message={`Tem certeza que deseja remover ${deleteConfirmation?.name}? Os agendamentos futuros não serão excluídos, mas o profissional não aparecerá para novas reservas.`}
                confirmButtonText="Confirmar Exclusão"
            />

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ProfessionalsPage;
