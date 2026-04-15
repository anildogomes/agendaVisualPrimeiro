
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Appointment, Client, Professional, Service, BusinessInfo } from '../types';
import { 
    IconPlus, IconCalendar, IconChevronRight, IconX, IconChevronLeft, PhoneInput, 
    IconCheck, IconTrash, ConfirmationModal, IconUser, IconClock, IconWhatsApp, 
    IconSearch, IconMapPin, IconFilter, IconMoreVertical, IconBriefcase, IconUserX, IconBell
} from '../constants';
import { supabase } from '../supabaseClient';
import { useToast } from '../App';

// --- HELPERS ---

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const getNextDays = (days: number) => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }
    return dates;
};

// --- MODAL COMPONENT ---

type AppointmentFormModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Appointment>, clientData?: { name: string, phone: string }) => void;
    appointmentToEdit: Appointment | null;
    professionals: Professional[];
    services: Service[];
    clients: Client[];
};

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ 
    isOpen, onClose, onSave, appointmentToEdit, professionals, services, clients 
}) => {
    const [clientId, setClientId] = useState<number | ''>('');
    const [serviceId, setServiceId] = useState<number | ''>('');
    const [professionalId, setProfessionalId] = useState<number | ''>('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [status, setStatus] = useState<string>('confirmed');
    
    const [isNewClient, setIsNewClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');

    const availableDates = useMemo(() => getNextDays(30), []);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const { addToast } = useToast();

    useEffect(() => {
        if (appointmentToEdit) {
            setClientId(appointmentToEdit.client_id);
            setServiceId(appointmentToEdit.service_id);
            setProfessionalId(appointmentToEdit.professional_id);
            setDate(appointmentToEdit.date);
            setTime(appointmentToEdit.time);
            setStatus(appointmentToEdit.status);
            setIsNewClient(false);
        } else {
            setClientId('');
            setServiceId('');
            setProfessionalId('');
            if (!date) setDate(new Date().toISOString().split('T')[0]);
            setTime('');
            setStatus('confirmed');
            setIsNewClient(false);
            setNewClientName('');
            setNewClientPhone('');
        }
    }, [appointmentToEdit, isOpen]);

    // Fetch Slots
    useEffect(() => {
        const fetchSlots = async () => {
            if (!date || !professionalId) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [appRes, blockRes] = await Promise.all([
                supabase.from('appointments').select('time').eq('business_id', user.id).eq('professional_id', professionalId).eq('date', date).neq('status', 'cancelled').neq('status', 'declined'),
                supabase.from('blocks').select('start_time, end_time').eq('business_id', user.id).eq('professional_id', professionalId).eq('date', date)
            ]);

            const busy: string[] = [];
            if (appRes.data) appRes.data.forEach((a: any) => busy.push(a.time));
            if (blockRes.data) {
                blockRes.data.forEach((b: any) => {
                    const start = timeToMinutes(b.start_time);
                    const end = timeToMinutes(b.end_time);
                    for (let t = start; t < end; t += 30) {
                        busy.push(`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`);
                    }
                });
            }
            setBookedSlots(busy);
        };
        fetchSlots();
    }, [date, professionalId]);

    const timeSlots = useMemo(() => {
        if (!date || !professionalId) return [];
        const professional = professionals.find(p => p.id === Number(professionalId));
        if (!professional) return [];
        const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(date).getUTCDay()];
        const shifts = professional.work_hours[dayKey];
        if (!shifts) return [];
        const slots: string[] = [];
        shifts.forEach(shift => {
            let current = timeToMinutes(shift.start);
            const end = timeToMinutes(shift.end);
            while (current < end) {
                slots.push(`${Math.floor(current/60).toString().padStart(2,'0')}:${(current%60).toString().padStart(2,'0')}`);
                current += 30;
            }
        });
        return slots;
    }, [date, professionalId, professionals]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceId || !professionalId || !date || !time) return addToast('Preencha todos os campos.', 'error');
        
        const appData = { service_id: Number(serviceId), professional_id: Number(professionalId), date, time, status };
        if (isNewClient) {
            if (!newClientName || !newClientPhone) return addToast('Dados do cliente incompletos.', 'error');
            onSave(appData as any, { name: newClientName, phone: newClientPhone });
        } else {
            if (!clientId) return addToast('Selecione um cliente.', 'error');
            onSave({ ...appData, client_id: Number(clientId) } as any);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-w-md animate-slide-up sm:animate-fade-in-down overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{appointmentToEdit ? 'Detalhes' : 'Novo Agendamento'}</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"><IconX className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                        {/* Client Section */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</label>
                                <button type="button" onClick={() => setIsNewClient(!isNewClient)} className="text-xs font-bold text-primary-600 hover:underline">{isNewClient ? 'Selecionar Existente' : 'Novo Cliente'}</button>
                            </div>
                            {isNewClient ? (
                                <div className="space-y-3 animate-fade-in-down">
                                    <input type="text" placeholder="Nome Completo" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
                                    <PhoneInput value={newClientPhone} onChange={setNewClientPhone} placeholder="WhatsApp" />
                                </div>
                            ) : (
                                <div className="relative">
                                    <IconUser className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"/>
                                    <select value={clientId} onChange={e => setClientId(Number(e.target.value))} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                                        <option value="">Selecione...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Service & Pro */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Serviço</label>
                                <select value={serviceId} onChange={e => setServiceId(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                                    <option value="">Selecione...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Profissional</label>
                                <select value={professionalId} onChange={e => setProfessionalId(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                                    <option value="">Selecione...</option>
                                    {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Data & Hora</label>
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
                            {availableDates.map((d, i) => {
                                const dStr = d.toISOString().split('T')[0];
                                const isSel = date === dStr;
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => { setDate(dStr); setTime(''); }} 
                                        className={`flex-shrink-0 w-14 h-16 rounded-xl flex flex-col items-center justify-center border transition-all ${isSel ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg scale-105' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-600'}`}
                                    >
                                        <span className="text-[10px] font-bold uppercase">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]}</span>
                                        <span className="text-lg font-bold">{d.getDate()}</span>
                                    </button>
                                )
                            })}
                        </div>
                        {date && professionalId ? (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                {timeSlots.map(slot => {
                                    const isTaken = bookedSlots.includes(slot) && slot !== appointmentToEdit?.time;
                                    const isSelected = time === slot;
                                    return (
                                        <button key={slot} disabled={isTaken} onClick={() => setTime(slot)} className={`py-2 rounded-lg text-sm font-bold border transition-all ${isTaken ? 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed dark:bg-slate-700 dark:text-slate-600' : isSelected ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-primary-500 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-300'}`}>
                                            {slot}
                                        </button>
                                    )
                                })}
                                {timeSlots.length === 0 && <p className="col-span-4 text-center text-sm text-slate-400 py-2">Sem horários.</p>}
                            </div>
                        ) : (
                            <p className="text-center text-sm text-slate-400 py-4">Selecione profissional e data.</p>
                        )}
                    </div>
                    
                    {/* Status (Edit Mode) */}
                    {appointmentToEdit && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 outline-none">
                                <option value="confirmed">Reservado</option>
                                <option value="completed">Concluído</option>
                                <option value="cancelled">Desistiu</option>
                                <option value="no_show">Não Veio</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0 pb-safe">
                    <button onClick={handleSubmit} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]">
                        {appointmentToEdit ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- APPOINTMENT CARD (Timeline Style - Redesigned) ---

const TimelineCard: React.FC<{
    app: Appointment;
    client?: Client;
    service?: Service;
    professional?: Professional;
    businessInfo?: BusinessInfo | null;
    isLast: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onUpdateStatus: (status: string) => void;
    onCancel: () => void;
}> = ({ app, client, service, professional, businessInfo, isLast, onEdit, onDelete, onUpdateStatus, onCancel }) => {
    const { addToast } = useToast();

    // Check if reminder is due
    const isReminderDue = useMemo(() => {
        if (app.status !== 'confirmed' || !businessInfo?.reminder_minutes) return false;
        
        const now = new Date();
        const appDate = new Date(app.date + ' ' + app.time);
        
        // Reminder Threshold: e.g. 60 mins before
        const reminderThreshold = businessInfo.reminder_minutes * 60 * 1000;
        const diff = appDate.getTime() - now.getTime();
        
        // Check if within window (e.g. between 0 and ReminderTime + 1 hour grace)
        return diff > 0 && diff <= reminderThreshold;
    }, [app, businessInfo]);

    // Visual Config based on Status
    const statusConfig: any = {
        confirmed: { color: 'bg-blue-500', label: 'Reservado', textColor: 'text-blue-700' },
        completed: { color: 'bg-emerald-500', label: 'Concluído', textColor: 'text-emerald-700' },
        cancelled: { color: 'bg-red-400', label: 'Desistiu', textColor: 'text-red-700' },
        no_show: { color: 'bg-slate-400', label: 'Não Veio', textColor: 'text-slate-700' },
    };
    const config = statusConfig[app.status] || statusConfig.confirmed;

    const handleAction = (actionType: 'remind' | 'auto_remind') => {
        if (!client?.phone) {
            addToast('Cliente sem telefone cadastrado.', 'error');
            return;
        }

        const firstName = client.name.split(' ')[0] || 'Cliente';
        const serviceName = service?.name || 'Serviço';
        const phone = client.phone.replace(/\D/g, '');

        let message = '';

        if (actionType === 'remind') {
            message = `Olá ${firstName}! Passando para lembrar do seu horário hoje: ${serviceName} às ${app.time}. Tudo certo?`;
        } else if (actionType === 'auto_remind') {
            const template = businessInfo?.reminder_message || "Olá {nome}, lembrete do seu agendamento às {horario}.";
            message = template.replace('{nome}', firstName).replace('{horario}', app.time);
        }

        // Open WhatsApp
        if (message && phone) {
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
            addToast('Lembrete enviado (WhatsApp aberto).', 'success');
        }
    };

    return (
        <div className="flex group relative">
            {/* Left: Time & Line */}
            <div className="flex flex-col items-center mr-3 sm:mr-4 min-w-[45px] sm:min-w-[50px] pt-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{app.time}</span>
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 border-2 border-white dark:border-slate-900 shadow-sm ${config.color} z-10`}></div>
                {!isLast && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 -mt-1"></div>}
            </div>

            {/* Right: Card */}
            <div className={`flex-1 mb-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border ${isReminderDue ? 'border-amber-400 ring-1 ring-amber-400 dark:border-amber-500 dark:ring-amber-500' : 'border-slate-100 dark:border-slate-700'} relative overflow-hidden transition-all hover:shadow-md`}>
                
                {/* Status Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.color}`}></div>

                {/* Reminder Badge/Alert */}
                {isReminderDue && app.status === 'confirmed' && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 z-10 animate-pulse">
                        <IconBell className="w-3 h-3" /> Lembrar
                    </div>
                )}

                {/* Header: Name + Badge */}
                <div className="flex justify-between items-start mb-2 pl-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate pr-2">
                        {client?.name || 'Cliente Removido'}
                    </h3>
                    <span className={`flex-shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${config.color} bg-opacity-10 dark:bg-opacity-20`}>
                        <span className={config.textColor || 'text-slate-600 dark:text-slate-300'}>{config.label}</span>
                    </span>
                </div>

                {/* Body: Service + Pro */}
                <div className="pl-2 mb-3">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 mb-1">
                        <IconBriefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">{service?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <IconUser className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs truncate">{professional?.name}</span>
                        <span className="text-xs text-slate-300 dark:text-slate-600 mx-1">•</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{service?.price ? formatCurrency(service.price) : 'R$ 0'}</span>
                    </div>
                </div>

                {/* Footer Actions - REDESIGNED FOR MOBILE (375px safe) */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-3 pl-2">
                    
                    {app.status === 'confirmed' && (
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleAction(isReminderDue ? 'auto_remind' : 'remind'); }}
                                className={`py-2.5 text-[10px] font-bold rounded-xl uppercase truncate transition-colors shadow-sm px-1 ${isReminderDue ? 'bg-amber-400 text-amber-900 hover:bg-amber-500 animate-pulse' : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300'}`}
                            >
                                {isReminderDue ? 'Avisar' : 'Lembrar'}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onUpdateStatus('completed'); }}
                                className="py-2.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-xl hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 uppercase truncate transition-colors shadow-sm px-1"
                            >
                                Concluído
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onUpdateStatus('no_show'); }}
                                className="py-2.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-xl hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 uppercase truncate transition-colors shadow-sm px-1"
                            >
                                Não Veio
                            </button>
                        </div>
                    )}

                    {/* Management Actions (Bottom Row) */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                        {(app.status === 'confirmed' || app.status === 'completed') && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onCancel(); }}
                                className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wide px-2 py-1 transition-colors"
                            >
                                DESISTIR
                            </button>
                        )}
                        <div className="w-px h-3 bg-slate-200 dark:bg-slate-700"></div>
                        <button 
                            onClick={onEdit} 
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-wide px-2 py-1 transition-colors"
                        >
                            DETALHES
                        </button>
                        <div className="w-px h-3 bg-slate-200 dark:bg-slate-700"></div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="text-slate-300 hover:text-red-600 dark:text-slate-600 dark:hover:text-red-400 transition-colors p-1"
                            title="Excluir"
                        >
                            <IconTrash className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const AppointmentsPage: React.FC = () => {
    // Data State
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
    const [loading, setLoading] = useState(true);

    // UI State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'upcoming'>('day');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Appointment | null>(null);
    const [cancelConfirm, setCancelConfirm] = useState<Appointment | null>(null);

    const { addToast } = useToast();

    // Init & Fetch
    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let query = supabase.from('appointments').select('*').eq('business_id', user.id);
        
        // Optimizado: Fetch range baseado na view
        if (viewMode === 'day') {
            query = query.eq('date', selectedDate.toISOString().split('T')[0]);
        } else {
            const todayStr = new Date().toISOString().split('T')[0];
            query = query.gte('date', todayStr).limit(50); // Limit upcoming for performance
        }
        
        query = query.order('date', { ascending: true }).order('time', { ascending: true });

        const [appRes, cliRes, serRes, proRes, bizRes] = await Promise.all([
            query,
            supabase.from('clients').select('*').eq('business_id', user.id),
            supabase.from('services').select('*').eq('business_id', user.id),
            supabase.from('professionals').select('*').eq('business_id', user.id),
            supabase.from('businesses').select('*').eq('id', user.id).maybeSingle()
        ]);

        if (appRes.data) setAppointments(appRes.data as Appointment[]);
        if (cliRes.data) setClients(cliRes.data as Client[]);
        if (serRes.data) setServices(serRes.data as Service[]);
        if (proRes.data) setProfessionals(proRes.data as Professional[]);
        if (bizRes.data) setBusinessInfo(bizRes.data as BusinessInfo);
        
        setLoading(false);
    }, [selectedDate, viewMode]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Polling for Auto Reminders (Frontend Check)
    useEffect(() => {
        if (!businessInfo?.reminder_minutes || appointments.length === 0) return;

        const checkReminders = () => {
            const now = new Date();
            const threshold = businessInfo.reminder_minutes! * 60 * 1000;

            appointments.forEach(app => {
                if (app.status !== 'confirmed') return;
                
                const appDate = new Date(app.date + ' ' + app.time);
                const diff = appDate.getTime() - now.getTime();
                
                if (diff > 0 && diff <= threshold && diff > threshold - 60000) {
                    const clientName = clients.find(c => c.id === app.client_id)?.name || 'Cliente';
                    addToast(`⏰ Hora de lembrar ${clientName} (${app.time})`, 'incoming');
                }
            });
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [appointments, businessInfo, clients, addToast]);

    // Listener for real-time updates from App.tsx
    useEffect(() => {
        const handleNewAppointment = () => {
            fetchData();
        };
        window.addEventListener('new_appointment_received', handleNewAppointment);
        return () => window.removeEventListener('new_appointment_received', handleNewAppointment);
    }, [fetchData]);

    // Filtering Logic
    const filteredList = useMemo(() => {
        let filtered = appointments;

        // Status Filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(a => a.status === statusFilter);
        }

        // Search Filter (Client Name or Service)
        if (searchQuery.trim()) {
            const lowerQ = searchQuery.toLowerCase();
            filtered = filtered.filter(a => {
                const cName = clients.find(c => c.id === a.client_id)?.name.toLowerCase() || '';
                const sName = services.find(s => s.id === a.service_id)?.name.toLowerCase() || '';
                return cName.includes(lowerQ) || sName.includes(lowerQ);
            });
        }

        return filtered;
    }, [appointments, statusFilter, searchQuery, clients, services]);

    // Handlers
    const handleSave = async (data: Partial<Appointment>, newClient?: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let clientId = data.client_id;
        if (newClient) {
            const { data: cData, error: cError } = await supabase.from('clients').insert({ ...newClient, business_id: user.id, status: 'active' }).select().single();
            if (cError) return addToast('Erro ao criar cliente', 'error');
            clientId = cData.id;
        }

        const payload = { ...data, client_id: clientId, business_id: user.id };
        let error;
        if (appointmentToEdit) {
            ({ error } = await supabase.from('appointments').update(payload).eq('id', appointmentToEdit.id));
        } else {
            ({ error } = await supabase.from('appointments').insert(payload));
        }

        if (error) addToast('Erro ao salvar', 'error');
        else {
            addToast('Salvo com sucesso!', 'success');
            fetchData();
            setIsModalOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        const { error } = await supabase.from('appointments').delete().eq('id', deleteConfirm.id);
        if (error) addToast('Erro ao excluir', 'error');
        else {
            addToast('Excluído', 'info');
            fetchData();
            setIsModalOpen(false); // Close edit modal if open
        }
        setDeleteConfirm(null);
    };

    const handleConfirmCancellation = async () => {
        if (!cancelConfirm) return;
        await handleQuickStatusUpdate(cancelConfirm.id, 'cancelled');
        setCancelConfirm(null);
    };

    const handleQuickStatusUpdate = async (appointmentId: number, newStatus: string) => {
        const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', appointmentId);
        if (error) {
            addToast('Erro ao atualizar status', 'error');
        } else {
            // Optimistic update
            setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } as any : a));
            if (newStatus === 'completed') addToast('Agendamento concluído!', 'success');
            if (newStatus === 'cancelled') addToast('Agendamento marcado como desistência.', 'info');
        }
    };

    // Date Navigation Helpers
    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    // Calculate Daily Stats
    const dailyStats = useMemo(() => {
        const total = filteredList.length;
        const revenue = filteredList.reduce((acc, app) => {
            if (['confirmed', 'completed'].includes(app.status)) {
                const s = services.find(s => s.id === app.service_id);
                return acc + (s?.price || 0);
            }
            return acc;
        }, 0);
        return { total, revenue };
    }, [filteredList, services]);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            {/* --- STICKY HEADER --- */}
            <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 transition-all">
                
                {/* Row 1: Title & Main Actions */}
                <div className="px-4 py-3 sm:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => { setAppointmentToEdit(null); setIsModalOpen(true); }}
                            className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl p-2.5 shadow-lg active:scale-95 transition-transform"
                        >
                            <IconPlus className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                            {viewMode === 'day' ? 'Agenda' : 'Geral'}
                        </h1>
                    </div>

                    {/* View Switcher Pills */}
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                        <button onClick={() => setViewMode('day')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Dia</button>
                        <button onClick={() => setViewMode('upcoming')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'upcoming' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Geral</button>
                    </div>
                </div>

                {/* Row 2: Date Navigation (Only in Day Mode) */}
                {viewMode === 'day' && (
                    <div className="px-4 pb-3 flex items-center justify-between">
                        <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><IconChevronLeft className="w-5 h-5" /></button>
                        <div className="flex flex-col items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-1 rounded-xl transition-colors">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
                            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span>
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><IconChevronRight className="w-5 h-5" /></button>
                    </div>
                )}

                {/* Row 3: Search & Filters (Scrollable) */}
                <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar items-center snap-x">
                    {/* Search Field */}
                    <div className="relative min-w-[140px] flex-1 snap-start">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                        />
                    </div>
                    {/* Filter Pills */}
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'confirmed', label: 'Reservado' },
                            { id: 'completed', label: 'Concluído' },
                            { id: 'no_show', label: 'Não Veio' },
                            { id: 'cancelled', label: 'Desistiu' }
                        ].map(f => (
                            <button 
                                key={f.id} 
                                onClick={() => setStatusFilter(f.id)}
                                className={`snap-start px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${statusFilter === f.id ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900' : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Stats Bar */}
                {viewMode === 'day' && filteredList.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>{dailyStats.total} agendamentos</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">{formatCurrency(dailyStats.revenue)}</span>
                    </div>
                )}
            </div>

            {/* --- CONTENT LIST --- */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
                <div className="max-w-xl mx-auto min-h-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-3">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                            <p className="text-xs text-slate-400">Carregando...</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-down">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                                <IconCalendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Agenda Livre</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Nenhum agendamento encontrado para este período ou filtro.</p>
                            <button onClick={() => { setAppointmentToEdit(null); setIsModalOpen(true); }} className="mt-6 text-sm font-bold text-primary-600 hover:underline">
                                Adicionar Manualmente
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {filteredList.map((app, index) => {
                                const showDateHeader = viewMode === 'upcoming' && (index === 0 || filteredList[index-1].date !== app.date);
                                const dateObj = new Date(app.date);
                                
                                return (
                                    <React.Fragment key={app.id}>
                                        {showDateHeader && (
                                            <div className="sticky top-0 z-10 py-2 mb-2 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                                                <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                                    {dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' })}
                                                </h3>
                                            </div>
                                        )}
                                        <TimelineCard 
                                            app={app} 
                                            client={clients.find(c => c.id === app.client_id)}
                                            service={services.find(s => s.id === app.service_id)}
                                            professional={professionals.find(p => p.id === app.professional_id)}
                                            businessInfo={businessInfo}
                                            isLast={index === filteredList.length - 1}
                                            onEdit={() => { setAppointmentToEdit(app); setIsModalOpen(true); }}
                                            onDelete={() => setDeleteConfirm(app)}
                                            onUpdateStatus={(status) => handleQuickStatusUpdate(app.id, status)}
                                            onCancel={() => setCancelConfirm(app)}
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            <AppointmentFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                appointmentToEdit={appointmentToEdit}
                clients={clients}
                services={services}
                professionals={professionals}
            />

            <ConfirmationModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Excluir Agendamento"
                message="Tem certeza? Essa ação não pode ser desfeita."
                confirmButtonText="Excluir"
            />

            <ConfirmationModal
                isOpen={!!cancelConfirm}
                onClose={() => setCancelConfirm(null)}
                onConfirm={handleConfirmCancellation}
                title="Confirmar Desistência"
                message={`Marcar o agendamento de ${clients.find(c => c.id === cancelConfirm?.client_id)?.name} como "Desistiu"?`}
                confirmButtonText="Confirmar Desistência"
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

export default AppointmentsPage;
