
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Service, ServiceCategory } from '../types';
import { 
    IconPlus, IconEdit, IconX, IconDollarSign, IconClock, 
    ConfirmationModal, IconAlertTriangle, IconFilter, IconTrash, 
    IconCheck, IconMoreVertical, IconList
} from '../constants';
import { supabase } from '../supabaseClient';
import { useToast } from '../App';

// --- UTILITY: Duration Conversions ---
const minutesToTimeStruct = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
};

const formatDurationPretty = (totalMinutes: number) => {
    const { hours, minutes } = minutesToTimeStruct(totalMinutes);
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
    if (hours > 0) return `${hours}h`;
    return `${minutes} min`;
};

// --- COMPONENT: Mobile Action Menu ---
const ServiceActionMenu: React.FC<{
    onEdit: () => void;
    onDelete: () => void;
}> = ({ onEdit, onDelete }) => {
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
        <div className="relative sm:hidden" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-2 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-400 active:bg-slate-200 dark:active:bg-slate-600 transition-colors"
            >
                <IconMoreVertical className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-down origin-top-right">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(); }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                        <IconEdit className="w-4 h-4 text-slate-400" /> Editar
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700"></div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                        <IconTrash className="w-4 h-4" /> Excluir
                    </button>
                </div>
            )}
        </div>
    );
};

// --- MODAL: Service Form (Add/Edit) ---
type ServiceFormModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Omit<Service, 'id' | 'business_id'> & { id?: number }) => void;
    serviceToEdit: Service | null;
    categories: ServiceCategory[];
};

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ isOpen, onClose, onSave, serviceToEdit, categories }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState<string>('');
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
    
    // Split Duration State
    const [durationHours, setDurationHours] = useState<number>(0);
    const [durationMinutes, setDurationMinutes] = useState<number>(30);

    useEffect(() => {
        if (serviceToEdit) {
            setName(serviceToEdit.name);
            setPrice(serviceToEdit.price.toString());
            setCategoryId(serviceToEdit.category_id);
            const { hours, minutes } = minutesToTimeStruct(serviceToEdit.duration);
            setDurationHours(hours);
            setDurationMinutes(minutes);
        } else {
            setName('');
            setPrice('');
            setCategoryId(categories.length > 0 ? categories[0].id : undefined);
            setDurationHours(0);
            setDurationMinutes(30);
        }
    }, [serviceToEdit, isOpen, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const totalMinutes = (Number(durationHours) * 60) + Number(durationMinutes);
        
        if (totalMinutes === 0) {
            alert("A duração do serviço não pode ser 0.");
            return;
        }

        onSave({ 
            id: serviceToEdit?.id, 
            name, 
            duration: totalMinutes, 
            price: Number(price), 
            category_id: categoryId 
        });
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full sm:rounded-2xl rounded-t-3xl shadow-2xl p-6 sm:max-w-md animate-slide-up sm:animate-fade-in-down overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {serviceToEdit ? 'Editar Serviço' : 'Novo Serviço'}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
                        <IconX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nome do Serviço</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            required 
                            placeholder="Ex: Corte Degradê"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white transition-all font-medium" 
                        />
                    </div>

                    {/* Duration Split Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Duração</label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="12"
                                    value={durationHours} 
                                    onChange={e => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))} 
                                    className="w-full pl-4 pr-8 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white text-center font-bold text-lg" 
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold uppercase">H</span>
                            </div>
                            <span className="text-slate-300 dark:text-slate-600 font-light text-2xl">:</span>
                            <div className="flex-1 relative">
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="59"
                                    step="5"
                                    value={durationMinutes} 
                                    onChange={e => setDurationMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} 
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white text-center font-bold text-lg" 
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold uppercase">Min</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                            Tempo total: {formatDurationPretty((Number(durationHours) * 60) + Number(durationMinutes))}
                        </p>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Preço (R$)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={price} 
                                onChange={e => setPrice(e.target.value)} 
                                required 
                                placeholder="0,00"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-bold text-lg" 
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Categoria</label>
                        <div className="relative">
                            <select
                                value={categoryId || ''}
                                onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white appearance-none font-medium"
                            >
                                <option value="">Sem Categoria</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="flex-1 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MODAL: Category Manager ---
type CategoryManagerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    categories: ServiceCategory[];
    onSave: (category: Omit<ServiceCategory, 'id' | 'business_id'> & { id?: number }) => void;
    onDelete: (category: ServiceCategory) => void;
};

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, categories, onSave, onDelete }) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');

    const handleStartEdit = (cat: ServiceCategory) => {
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const handleSaveEdit = (id: number) => {
        if (!editName.trim()) return;
        onSave({ id, name: editName });
        setEditingId(null);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        onSave({ name: newName });
        setNewName('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full sm:rounded-2xl rounded-t-3xl shadow-2xl h-[80vh] sm:h-auto sm:max-h-[85vh] sm:max-w-md flex flex-col animate-slide-up sm:animate-fade-in-down overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gerenciar Categorias</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800"><IconX className="w-5 h-5" /></button>
                </div>
                
                {/* Create New */}
                <form onSubmit={handleCreate} className="p-4 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 shrink-0">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Nova Categoria..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white min-w-0"
                        />
                        <button type="submit" disabled={!newName.trim()} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-xl disabled:opacity-50 transition-colors shrink-0">
                            <IconPlus className="w-5 h-5" />
                        </button>
                    </div>
                </form>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 pb-safe bg-white dark:bg-slate-800">
                    {categories.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">Nenhuma categoria criada.</div>
                    ) : (
                        <ul className="space-y-1">
                            {categories.map(cat => (
                                <li key={cat.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    {editingId === cat.id ? (
                                        <div className="flex gap-2 w-full">
                                            <input 
                                                type="text" 
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="flex-1 px-3 py-1.5 rounded-lg border border-primary-500 text-sm dark:bg-slate-800 dark:text-white outline-none min-w-0"
                                                autoFocus
                                            />
                                            <button onClick={() => handleSaveEdit(cat.id)} className="text-green-600 p-1.5 hover:bg-green-50 rounded dark:hover:bg-green-900/30 shrink-0"><IconCheck className="w-4 h-4"/></button>
                                            <button onClick={() => setEditingId(null)} className="text-slate-400 p-1.5 hover:bg-slate-100 rounded dark:hover:bg-slate-600 shrink-0"><IconX className="w-4 h-4"/></button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate block">{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => handleStartEdit(cat)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20 transition-colors"><IconEdit className="w-4 h-4"/></button>
                                                <button onClick={() => onDelete(cat)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20 transition-colors"><IconTrash className="w-4 h-4"/></button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const ServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // UI States
    const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    
    // Deletion
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        type: 'service' | 'category';
        id: number;
        name: string;
    } | null>(null);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            addToast("Usuário não autenticado.", "error");
            setLoading(false);
            return;
        }

        const [servicesRes, categoriesRes] = await Promise.all([
            supabase.from('services').select('*').eq('business_id', user.id).order('name', { ascending: true }),
            supabase.from('service_categories').select('*').eq('business_id', user.id).order('name', { ascending: true })
        ]);

        if (servicesRes.error || categoriesRes.error) {
            addToast('Erro ao carregar dados.', 'error');
        } else {
            setServices(servicesRes.data as Service[]);
            setCategories(categoriesRes.data as ServiceCategory[]);
        }
        setLoading(false);
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HANDLERS ---

    const handleSaveService = async (serviceData: Omit<Service, 'id' | 'business_id'> & { id?: number }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = { ...serviceData, business_id: user.id };
        let error;

        if (serviceData.id) {
            ({ error } = await supabase.from('services').update(payload).eq('id', serviceData.id));
        } else {
            ({ error } = await supabase.from('services').insert(payload));
        }

        if (error) {
            addToast(`Erro ao salvar: ${error.message}`, 'error');
        } else {
            addToast(`Serviço ${serviceData.id ? 'atualizado' : 'criado'}!`, 'success');
            fetchData();
        }
        setIsServiceModalOpen(false);
        setServiceToEdit(null);
    };

    const handleSaveCategory = async (categoryData: Omit<ServiceCategory, 'id' | 'business_id'> & { id?: number }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = { ...categoryData, business_id: user.id };
        let error;

        if (categoryData.id) {
            ({ error } = await supabase.from('service_categories').update(payload).eq('id', categoryData.id));
        } else {
            ({ error } = await supabase.from('service_categories').insert(payload));
        }
        
        if (error) addToast(`Erro: ${error.message}`, 'error');
        else {
            addToast('Categoria salva!', 'success');
            fetchData();
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;
        const { type, id } = deleteConfirmation;
        let error;

        if (type === 'service') {
             ({ error } = await supabase.from('services').delete().eq('id', id));
        } else {
             ({ error } = await supabase.from('service_categories').delete().eq('id', id));
        }
        
        if (error) {
            if (error.code === '23503') {
                addToast(type === 'service' 
                    ? 'Não é possível excluir: Este serviço possui agendamentos vinculados.' 
                    : 'Atenção: Atualize o banco de dados para permitir exclusão segura (ON DELETE SET NULL).', 
                'error');
            } else {
                addToast(`Erro: ${error.message}`, 'error');
            }
        } else {
            addToast('Excluído com sucesso.', 'success');
            // If category deleted, reset filter if active was that category
            if(type === 'category' && activeCategory === id) {
                setActiveCategory('all');
            }
            fetchData();
        }
        setDeleteConfirmation(null);
    };

    // --- FILTERING ---
    const filteredServices = useMemo(() => {
        if (activeCategory === 'all') return services;
        // -1 for uncategorized
        if (activeCategory === -1) return services.filter(s => !s.category_id);
        return services.filter(s => s.category_id === activeCategory);
    }, [services, activeCategory]);

    const getCategoryName = (id?: number) => {
        if (!id) return 'Sem Categoria';
        return categories.find(c => c.id === id)?.name || 'Desconhecido';
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando serviços...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
            
            {/* Header / Filter Bar */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10 shrink-0">
                <div className="p-4 sm:p-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">Serviços</h1>
                        <button 
                            onClick={() => setIsCategoryManagerOpen(true)}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <IconList className="w-4 h-4" />
                            Categorias
                        </button>
                    </div>

                    {/* Horizontal Scrollable Categories */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                activeCategory === 'all'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}
                        >
                            Todos
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                    activeCategory === cat.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                        <button
                            onClick={() => setActiveCategory(-1)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                activeCategory === -1
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}
                        >
                            Sem Categoria
                        </button>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
                {filteredServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <IconFilter className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nenhum serviço encontrado nesta categoria.</p>
                        <button onClick={() => { setServiceToEdit(null); setIsServiceModalOpen(true); }} className="mt-4 text-primary-600 font-bold text-sm">Adicionar Novo</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredServices.map(service => (
                            <div key={service.id} className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0 pr-2">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate mb-1">
                                            {service.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 inline-block px-2 py-0.5 rounded-md mb-3">
                                            {getCategoryName(service.category_id)}
                                        </p>
                                    </div>
                                    
                                    {/* Mobile Menu Action */}
                                    <ServiceActionMenu 
                                        onEdit={() => { setServiceToEdit(service); setIsServiceModalOpen(true); }}
                                        onDelete={() => setDeleteConfirmation({ isOpen: true, type: 'service', id: service.id, name: service.name })}
                                    />
                                    
                                    {/* Desktop Actions */}
                                    <div className="hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
                                        <button 
                                            onClick={() => { setServiceToEdit(service); setIsServiceModalOpen(true); }}
                                            className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg shadow-sm"
                                        >
                                            <IconEdit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setDeleteConfirmation({ isOpen: true, type: 'service', id: service.id, name: service.name })}
                                            className="p-1.5 bg-white text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg shadow-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-bold">
                                        <IconClock className="w-3.5 h-3.5" />
                                        {formatDurationPretty(service.duration)}
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                                        R$ {service.price.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button (Mobile) */}
            <button 
                onClick={() => { setServiceToEdit(null); setIsServiceModalOpen(true); }}
                className="fixed bottom-24 right-4 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-transform dark:bg-white dark:text-slate-900"
            >
                <IconPlus className="w-7 h-7" />
            </button>

            {/* Modals */}
            <ServiceFormModal 
                isOpen={isServiceModalOpen} 
                onClose={() => setIsServiceModalOpen(false)} 
                onSave={handleSaveService} 
                serviceToEdit={serviceToEdit} 
                categories={categories}
            />

            <CategoryManagerModal
                isOpen={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
                categories={categories}
                onSave={handleSaveCategory}
                onDelete={(cat) => setDeleteConfirmation({ isOpen: true, type: 'category', id: cat.id, name: cat.name })}
            />

            <ConfirmationModal
                isOpen={deleteConfirmation !== null}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={handleConfirmDelete}
                title={deleteConfirmation?.type === 'service' ? 'Excluir Serviço' : 'Excluir Categoria'}
                message={
                    deleteConfirmation?.type === 'service' 
                    ? `Tem certeza que deseja excluir "${deleteConfirmation?.name}"?`
                    : `Tem certeza que deseja excluir a categoria "${deleteConfirmation?.name}"? Todos os serviços vinculados ficarão "Sem Categoria".`
                }
                confirmButtonText="Excluir"
            />
            
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
            `}</style>
        </div>
    );
};

export default ServicesPage;