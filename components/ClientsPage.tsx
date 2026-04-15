
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Client, Appointment, Service, Professional } from '../types';
import { 
    IconPlus, IconEdit, IconX, IconMessageSquare, IconWhatsApp, Pagination, 
    ConfirmationModal, PhoneInput, IconCheck, IconUserX, IconClock, 
    IconUser, IconSearch, IconMoreVertical, IconTrash 
} from '../constants';
import { supabase } from '../supabaseClient';
import { useToast } from '../App';

// --- UTILS ---
const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/); // Split by any whitespace
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromId = (id: number) => {
    const colors = [
        'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
        'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300', 
        'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
        'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
        'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
        'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
        'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
        'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
        'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
        'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
        'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
    ];
    return colors[id % colors.length];
};

// --- COMPONENTS ---

// Dropdown Menu for Actions
const ActionMenu: React.FC<{
    onEdit: () => void;
    onHistory: () => void;
    onDelete: () => void;
    onToggleStatus: () => void;
    isActive: boolean;
}> = ({ onEdit, onHistory, onDelete, onToggleStatus, isActive }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                <IconMoreVertical className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-down origin-top-right">
                    <button onClick={(e) => { e.stopPropagation(); onHistory(); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <IconClock className="w-4 h-4 text-slate-400" /> Histórico
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <IconEdit className="w-4 h-4 text-slate-400" /> Editar
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onToggleStatus(); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        {isActive ? <IconUserX className="w-4 h-4 text-slate-400" /> : <IconCheck className="w-4 h-4 text-slate-400" />}
                        {isActive ? 'Desativar' : 'Ativar'}
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                        <IconTrash className="w-4 h-4" /> Excluir
                    </button>
                </div>
            )}
        </div>
    );
};

// --- MODALS ---

const ClientHistoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    services: Service[];
    professionals: Professional[];
}> = ({ isOpen, onClose, client, services, professionals }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!client || !isOpen) return;
            setLoading(true);
            const { data } = await supabase
                .from('appointments')
                .select('*')
                .eq('client_id', client.id)
                .order('date', { ascending: false })
                .order('time', { ascending: false })
                .limit(50); // Limit to last 50 for performance
            if (data) setAppointments(data as Appointment[]);
            setLoading(false);
        };
        fetchHistory();
    }, [client, isOpen]);

    if (!isOpen || !client) return null;

    const getServiceName = (id: number) => services.find(s => s.id === id)?.name || 'Serviço removido';
    const getProfName = (id: number) => professionals.find(p => p.id === id)?.name || 'Profissional removido';

    const getStatusInfo = (status: string) => {
        switch(status) {
            case 'completed': return { label: 'Concluído', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
            case 'confirmed': return { label: 'Reservado', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
            case 'cancelled': return { label: 'Desistiu', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
            case 'declined': return { label: 'Recusado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
            case 'no_show': return { label: 'Não Compareceu', className: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' };
            default: return { label: status, className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' };
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full sm:rounded-2xl shadow-2xl h-[85vh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl flex flex-col overflow-hidden animate-slide-up sm:animate-fade-in-down rounded-t-3xl">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
                        <IconClock className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="truncate">Histórico: {client.name.split(' ')[0]}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><IconX className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900">
                    {loading ? <div className="text-center py-10 text-slate-400">Carregando...</div> : 
                     appointments.length === 0 ? <div className="text-center py-12 text-slate-400">Nenhum agendamento encontrado.</div> :
                     appointments.map(app => {
                        const statusInfo = getStatusInfo(app.status);
                        return (
                            <div key={app.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{getServiceName(app.service_id)}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                        <IconClock className="w-3 h-3 shrink-0"/> 
                                        {new Date(app.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} às {app.time}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5 truncate">Prof: {getProfName(app.professional_id)}</p>
                                </div>
                                <span className={`self-start sm:self-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusInfo.className}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        );
                     })}
                </div>
            </div>
        </div>
    );
};

const ClientFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Omit<Client, 'id' | 'business_id' | 'created_at'> & { id?: number }) => void;
    clientToEdit: Client | null;
}> = ({ isOpen, onClose, onSave, clientToEdit }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [observations, setObservations] = useState('');

    useEffect(() => {
        if (clientToEdit) {
            setName(clientToEdit.name);
            setPhone(clientToEdit.phone);
            setStatus(clientToEdit.status);
            setObservations(clientToEdit.observations || '');
        } else {
            setName('');
            setPhone('');
            setStatus('active');
            setObservations('');
        }
    }, [clientToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: clientToEdit?.id, name, phone, status, observations });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full sm:rounded-2xl shadow-2xl sm:max-w-md animate-slide-up sm:animate-fade-in-down rounded-t-3xl flex flex-col max-h-[90vh]">
                
                {/* Header (Fixo) */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
                        <IconX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form id="client-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Visual Avatar Preview (Static) */}
                        <div className="flex justify-center mb-2">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm ${name ? getColorFromId(name.length) : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}>
                                {getInitials(name)}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white transition-all" placeholder="Ex: João Silva" />
                        </div>
                        <div>
                            <PhoneInput label="WhatsApp / Telefone" value={phone} onChange={setPhone} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                            <textarea rows={3} value={observations} onChange={e => setObservations(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white transition-all resize-none" placeholder="Preferências, alergias..." />
                        </div>
                    </form>
                </div>
                
                {/* Footer (Fixo - Botões de Ação) */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sm:rounded-b-2xl shrink-0 pb-safe">
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
                            Cancelar
                        </button>
                        <button type="submit" form="client-form" className="flex-1 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<Client | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyClient, setHistoryClient] = useState<Client | null>(null);

    // Expandable Logic
    const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
    const [observationText, setObservationText] = useState('');
    const [clientStats, setClientStats] = useState<{ completed: number; no_show: number; total: number } | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); 
    const [totalClients, setTotalClients] = useState(0);

    const { addToast } = useToast();

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => { setCurrentPage(1); }, [debouncedSearchQuery, filter]);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load Aux Data only once
        if (services.length === 0) {
            const [sRes, pRes] = await Promise.all([
                supabase.from('services').select('*').eq('business_id', user.id),
                supabase.from('professionals').select('*').eq('business_id', user.id)
            ]);
            if (sRes.data) setServices(sRes.data as Service[]);
            if (pRes.data) setProfessionals(pRes.data as Professional[]);
        }

        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        let query = supabase
            .from('clients')
            .select('*', { count: 'exact' })
            .eq('business_id', user.id)
            .order('name', { ascending: true }) // Alfabetico é melhor para lista de clientes
            .range(from, to);
        
        if (debouncedSearchQuery) query = query.ilike('name', `%${debouncedSearchQuery}%`);
        if (filter !== 'all') query = query.eq('status', filter);

        const { data, error, count } = await query;
        
        if (error) {
            addToast(`Erro: ${error.message}`, "error");
        } else {
            setClients(data as Client[]);
            setTotalClients(count || 0);
        }
        setLoading(false);
    }, [currentPage, itemsPerPage, debouncedSearchQuery, filter]);

    useEffect(() => { fetchClients(); }, [fetchClients]);

    // --- HANDLERS ---

    const handleSaveClient = async (clientData: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = { ...clientData, business_id: user.id };
        const { id, ...data } = payload;

        let error;
        if (id) {
            ({ error } = await supabase.from('clients').update(data).eq('id', id));
        } else {
            ({ error } = await supabase.from('clients').insert(data));
        }

        if (error) addToast('Erro ao salvar.', 'error');
        else {
            addToast('Cliente salvo com sucesso.', 'success');
            fetchClients();
        }
        setIsModalOpen(false);
    };

    const handleToggleStatus = async (client: Client) => {
        const newStatus = client.status === 'active' ? 'inactive' : 'active';
        const { error } = await supabase.from('clients').update({ status: newStatus }).eq('id', client.id);
        if (error) addToast('Erro ao atualizar.', 'error');
        else fetchClients();
    };

    const handleDelete = async () => {
        if (!deleteConfirmation) return;
        const { error } = await supabase.from('clients').delete().eq('id', deleteConfirmation.id);
        if (error) {
            if (error.code === '23503') addToast('Cliente possui agendamentos e não pode ser excluído.', 'error');
            else addToast('Erro ao excluir.', 'error');
        } else {
            addToast('Cliente removido.', 'success');
            fetchClients();
        }
        setDeleteConfirmation(null);
    };

    const handleExpandRow = async (client: Client) => {
        if (expandedClientId === client.id) {
            setExpandedClientId(null);
            setObservationText('');
            setClientStats(null);
        } else {
            setExpandedClientId(client.id);
            setObservationText(client.observations || '');
            setStatsLoading(true);
            const { data } = await supabase.from('appointments').select('status').eq('client_id', client.id);
            if (data) {
                setClientStats({
                    completed: data.filter(a => a.status === 'completed').length,
                    no_show: data.filter(a => a.status === 'no_show').length,
                    total: data.length
                });
            }
            setStatsLoading(false);
        }
    };

    const handleSaveObservation = async (clientId: number) => {
        const { error } = await supabase.from('clients').update({ observations: observationText }).eq('id', clientId);
        if (!error) {
            setClients(prev => prev.map(c => c.id === clientId ? { ...c, observations: observationText } : c));
            addToast('Observação salva.', 'success');
        } else {
            addToast('Erro ao salvar.', 'error');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
            {/* --- HEADER TOOLBAR (STICKY) --- */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 shadow-sm shrink-0">
                <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                        
                        {/* Search Bar */}
                        <div className="relative w-full sm:max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconSearch className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
                                placeholder="Buscar nome ou telefone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        {/* Filter & Actions */}
                        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-full sm:w-auto overflow-hidden">
                                {[
                                    { id: 'all', label: 'Todos' },
                                    { id: 'active', label: 'Ativos' },
                                    { id: 'inactive', label: 'Inativos' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFilter(tab.id as any)}
                                        className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                                            filter === tab.id 
                                            ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm scale-100' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-600/50'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Desktop Add Button */}
                            <button 
                                onClick={() => { setClientToEdit(null); setIsModalOpen(true); }}
                                className="hidden sm:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
                            >
                                <IconPlus className="w-5 h-5" />
                                Novo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SCROLLABLE LIST --- */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6" id="client-list-container">
                <div className="max-w-5xl mx-auto pb-24">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl animate-pulse">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <IconUser className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                                {searchQuery ? 'Nenhum resultado encontrado' : 'Sua lista está vazia'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">
                                {searchQuery ? `Não encontramos clientes para "${searchQuery}".` : 'Adicione seu primeiro cliente para começar a gerenciar.'}
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {clients.map(client => {
                                const isExpanded = expandedClientId === client.id;
                                return (
                                    <li key={client.id} className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary-500/30 shadow-md transform scale-[1.01]' : 'hover:shadow-md'}`}>
                                        <div 
                                            className="p-4 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none" 
                                            onClick={() => handleExpandRow(client)}
                                        >
                                            
                                            {/* Left: Generated Avatar + Info */}
                                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shadow-inner shrink-0 ${getColorFromId(client.id)}`}>
                                                    {getInitials(client.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate">{client.name}</h4>
                                                        {client.status === 'inactive' && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 uppercase">Inativo</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate font-medium">{client.phone}</p>
                                                </div>
                                            </div>

                                            {/* Right: Actions */}
                                            <div className="flex items-center gap-1 sm:gap-2" onClick={e => e.stopPropagation()}>
                                                {/* WhatsApp Button */}
                                                <a 
                                                    href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-2 sm:p-2.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors shadow-sm"
                                                    title="Conversar no WhatsApp"
                                                >
                                                    <IconWhatsApp className="w-5 h-5" />
                                                </a>

                                                {/* Mobile Menu */}
                                                <div className="sm:hidden">
                                                    <ActionMenu 
                                                        onEdit={() => { setClientToEdit(client); setIsModalOpen(true); }}
                                                        onHistory={() => { setHistoryClient(client); setIsHistoryModalOpen(true); }}
                                                        onDelete={() => setDeleteConfirmation(client)}
                                                        onToggleStatus={() => handleToggleStatus(client)}
                                                        isActive={client.status === 'active'}
                                                    />
                                                </div>

                                                {/* Desktop Actions */}
                                                <div className="hidden sm:flex items-center gap-1">
                                                    <button onClick={() => { setHistoryClient(client); setIsHistoryModalOpen(true); }} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-700 transition-colors" title="Histórico">
                                                        <IconClock className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => { setClientToEdit(client); setIsModalOpen(true); }} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-700 transition-colors" title="Editar">
                                                        <IconEdit className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleToggleStatus(client)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition-colors" title={client.status === 'active' ? 'Desativar' : 'Ativar'}>
                                                        {client.status === 'active' ? <IconUserX className="w-5 h-5" /> : <IconCheck className="w-5 h-5" />}
                                                    </button>
                                                    <button onClick={() => setDeleteConfirmation(client)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700 transition-colors" title="Excluir">
                                                        <IconTrash className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* EXPANDED SECTION */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 pt-0 animate-fade-in-down border-t border-slate-100 dark:border-slate-700/50 mt-1">
                                                <div className="pt-3">
                                                    {/* Mini Stats Grid */}
                                                    {statsLoading ? (
                                                        <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse w-full mb-3"></div>
                                                    ) : clientStats ? (
                                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                                                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                                <IconClock className="w-3.5 h-3.5 opacity-60" /> Total: {clientStats.total}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 dark:text-green-400 whitespace-nowrap">
                                                                <IconCheck className="w-3.5 h-3.5" /> Completos: {clientStats.completed}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 dark:text-red-400 whitespace-nowrap">
                                                                <IconUserX className="w-3.5 h-3.5" /> Faltas: {clientStats.no_show}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                    
                                                    {/* Observations Input */}
                                                    <div className="relative group">
                                                        <div className="absolute top-3 left-3 text-slate-400">
                                                            <IconMessageSquare className="w-4 h-4" />
                                                        </div>
                                                        <textarea 
                                                            className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 outline-none dark:text-slate-200 resize-none transition-all" 
                                                            rows={2} 
                                                            placeholder="Adicione observações (ex: prefere cabelo curto, alérgico a talco...)"
                                                            value={observationText}
                                                            onChange={e => setObservationText(e.target.value)}
                                                        />
                                                        <div className="mt-2 flex justify-end">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleSaveObservation(client.id); }}
                                                                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-colors shadow-sm"
                                                            >
                                                                Salvar Nota
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* --- FOOTER PAGINATION --- */}
            <div className="shrink-0 z-10">
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={Math.ceil(totalClients / itemsPerPage)} 
                    onPageChange={setCurrentPage} 
                    totalItems={totalClients} 
                    itemsPerPage={itemsPerPage} 
                />
            </div>

            {/* --- FAB (MOBILE ADD) --- */}
            <button 
                onClick={() => { setClientToEdit(null); setIsModalOpen(true); }}
                className="sm:hidden fixed bottom-24 right-4 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-transform dark:bg-white dark:text-slate-900"
            >
                <IconPlus className="w-7 h-7" />
            </button>

            {/* --- MODALS --- */}
            <ClientFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveClient} 
                clientToEdit={clientToEdit} 
            />
            
            <ClientHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                client={historyClient}
                services={services}
                professionals={professionals}
            />

            <ConfirmationModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={handleDelete}
                title="Excluir Cliente"
                message={`Tem certeza que deseja remover ${deleteConfirmation?.name}?`}
                confirmButtonText="Excluir"
            />
        </div>
    );
};

export default ClientsPage;