
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Block, Professional } from '../types';
import { IconPlus, IconX, IconEdit, ConfirmationModal, IconCalendar, IconClock, IconUser, IconBlock, IconTrash, IconFilter } from '../constants';
import BlockFormModal from './BlockFormModal';
import { supabase } from '../supabaseClient';
import { useToast } from '../App';

const ScheduleBlocksPage: React.FC = () => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [blockToEdit, setBlockToEdit] = useState<Block | null>(null);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [selectedProfessional, setSelectedProfessional] = useState<number | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [deleteConfirmation, setDeleteConfirmation] = useState<Block | null>(null);
    const { addToast } = useToast();

    // Data Fetching
    const fetchBlocks = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch everything active (future and recent past)
        const today = new Date();
        today.setDate(today.getDate() - 30); // Show last 30 days context too
        const dateStr = today.toISOString().split('T')[0];

        let query = supabase
            .from('blocks')
            .select('*')
            .eq('business_id', user.id)
            .gte('date', dateStr)
            .order('date', { ascending: true })
            .order('start_time', { ascending: true });
        
        if (selectedProfessional !== 'all') {
            query = query.eq('professional_id', selectedProfessional);
        }

        const { data, error } = await query;
        
        if (error) {
            addToast('Erro ao carregar bloqueios.', 'error');
        } else {
            setBlocks(data as Block[]);
        }
        setLoading(false);

    }, [addToast, selectedProfessional]);

    useEffect(() => {
        const fetchProfessionals = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if(!user) return;
            const { data } = await supabase.from('professionals').select('*').eq('business_id', user.id);
            if (data) setProfessionals(data as Professional[]);
        };
        fetchProfessionals();
    }, []);
    
    useEffect(() => {
        fetchBlocks();
    }, [fetchBlocks]);

    // Helpers
    const getProfessionalName = (id: number) => {
        const prof = professionals.find(p => p.id === id);
        return prof ? prof.name : 'Desconhecido';
    };

    const getProfessionalAvatar = (id: number) => {
        const prof = professionals.find(p => p.id === id);
        return prof?.avatar_url || null;
    };

    // Handlers
    const handleOpenModal = (block: Block | null) => {
        setBlockToEdit(block);
        setIsModalOpen(true);
    };

    const handleSaveBlock = async (blockData: Omit<Block, 'id' | 'business_id'> & { id?: number }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return addToast("Ação não permitida", "error");

        const payload = {
            ...blockData,
            business_id: user.id,
        };
        const { id, ...data } = payload;

        let error;
        if (id) {
            ({ error } = await supabase.from('blocks').update(data).eq('id', id));
        } else {
            ({ error } = await supabase.from('blocks').insert(data));
        }

        if (error) {
            addToast(`Erro ao salvar bloqueio: ${error.message}`, 'error');
        } else {
            addToast(`Bloqueio ${id ? 'atualizado' : 'criado'} com sucesso!`, 'success');
            fetchBlocks();
        }
        setIsModalOpen(false);
        setBlockToEdit(null);
    };

    const handleDeleteBlock = async () => {
        if (!deleteConfirmation) return;
        const { error } = await supabase.from('blocks').delete().eq('id', deleteConfirmation.id);
        
        if (error) {
            addToast(`Erro: ${error.message}`, 'error');
        } else {
            addToast('Bloqueio removido.', 'info');
            fetchBlocks();
        }
        setDeleteConfirmation(null);
    };

    // Grouping Logic for "Timeline" View
    const groupedBlocks = useMemo(() => {
        const groups: { [key: string]: Block[] } = {};
        blocks.forEach(block => {
            const dateObj = new Date(block.date);
            // Fix timezone issue for label by using UTC methods for the YYYY-MM-DD string
            const todayStr = new Date().toISOString().split('T')[0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            let label = new Intl.DateTimeFormat('pt-BR', { 
                weekday: 'long', day: '2-digit', month: 'long', timeZone: 'UTC' 
            }).format(dateObj);

            // Capitalize first letter
            label = label.charAt(0).toUpperCase() + label.slice(1);

            if (block.date === todayStr) label = "Hoje • " + label;
            else if (block.date === tomorrowStr) label = "Amanhã • " + label;

            if (!groups[block.date]) groups[block.date] = [];
            groups[block.date].push(block);
        });
        return groups;
    }, [blocks]);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Header Sticky */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 sm:px-8 z-20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-5xl mx-auto w-full">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <IconBlock className="w-6 h-6 text-primary-500" />
                            Bloqueios
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Gerencie pausas, folgas e indisponibilidades.
                        </p>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        {/* Filter Pill */}
                        {professionals.length > 0 && (
                            <div className="relative flex-1 sm:flex-none">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconFilter className="h-4 w-4 text-slate-400" />
                                </div>
                                <select
                                    value={selectedProfessional}
                                    onChange={(e) => setSelectedProfessional(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="pl-9 pr-8 py-2.5 w-full bg-slate-100 border-none rounded-xl text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-primary-500 cursor-pointer dark:bg-slate-700 dark:text-slate-200 appearance-none"
                                >
                                    <option value="all">Todos Profissionais</option>
                                    {professionals.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button 
                            onClick={() => handleOpenModal(null)} 
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all dark:bg-white dark:text-slate-900"
                        >
                            <IconPlus className="w-5 h-5" />
                            <span className="hidden sm:inline">Novo Bloqueio</span>
                            <span className="sm:hidden">Novo</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-3xl mx-auto pb-20">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin"></div>
                            <p className="text-sm text-slate-500">Carregando agenda...</p>
                        </div>
                    ) : Object.keys(groupedBlocks).length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <IconCalendar className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Agenda Livre</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                Não há bloqueios registrados para os próximos dias. A agenda está totalmente aberta.
                            </p>
                            <button 
                                onClick={() => handleOpenModal(null)}
                                className="mt-6 text-primary-600 font-bold text-sm hover:underline"
                            >
                                Adicionar um bloqueio agora
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in-down">
                            {Object.keys(groupedBlocks).sort().map(dateKey => {
                                const dateBlocks = groupedBlocks[dateKey];
                                const dateObj = new Date(dateKey);
                                
                                // Label logic
                                const todayStr = new Date().toISOString().split('T')[0];
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                                
                                let displayDate = new Intl.DateTimeFormat('pt-BR', { 
                                    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' 
                                }).format(dateObj);
                                
                                let highlightClass = "text-slate-500 dark:text-slate-400";
                                if (dateKey === todayStr) {
                                    displayDate = "Hoje";
                                    highlightClass = "text-primary-600 dark:text-primary-400 font-extrabold";
                                } else if (dateKey === tomorrowStr) {
                                    displayDate = "Amanhã";
                                } else {
                                    displayDate = displayDate.charAt(0).toUpperCase() + displayDate.slice(1);
                                }

                                return (
                                    <div key={dateKey} className="relative">
                                        {/* Date Sticky Header Concept */}
                                        <div className="sticky top-0 z-10 py-2 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm mb-3 flex items-center gap-3">
                                            <div className={`h-3 w-3 rounded-full ${dateKey === todayStr ? 'bg-primary-500 ring-4 ring-primary-100 dark:ring-primary-900' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                            <h3 className={`text-sm font-bold uppercase tracking-wide ${highlightClass}`}>
                                                {displayDate}
                                                {dateKey !== todayStr && dateKey !== tomorrowStr && <span className="font-normal normal-case text-slate-400 ml-2 text-xs">({new Date(dateKey).toLocaleDateString('pt-BR', {timeZone: 'UTC'})})</span>}
                                            </h3>
                                        </div>

                                        <div className="ml-1.5 border-l-2 border-slate-200 dark:border-slate-800 pl-6 space-y-3 pb-2">
                                            {dateBlocks.map(block => {
                                                const isAllDay = block.start_time === '00:00' && block.end_time === '23:59';
                                                
                                                return (
                                                    <div 
                                                        key={block.id} 
                                                        className="group relative bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500 overflow-hidden"
                                                    >
                                                        {/* Color Stripe based on reason (visual candy) */}
                                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                                            block.reason?.includes('Almoço') ? 'bg-orange-400' : 
                                                            block.reason?.includes('Folga') ? 'bg-green-400' :
                                                            block.reason?.includes('Médico') ? 'bg-blue-400' :
                                                            'bg-slate-400'
                                                        }`}></div>

                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg">
                                                                        <IconUser className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide truncate">
                                                                        {getProfessionalName(block.professional_id)}
                                                                    </span>
                                                                </div>
                                                                
                                                                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">
                                                                    {block.reason || 'Indisponível'}
                                                                </h4>
                                                                
                                                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                                    <IconClock className="w-4 h-4" />
                                                                    {isAllDay ? (
                                                                        <span className="font-semibold text-primary-600 dark:text-primary-400">Dia Inteiro</span>
                                                                    ) : (
                                                                        <span>{block.start_time} - {block.end_time}</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={() => handleOpenModal(block)}
                                                                    className="p-2 bg-slate-50 hover:bg-white text-slate-400 hover:text-primary-600 rounded-lg border border-slate-100 hover:border-slate-200 transition-all dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-600 dark:text-slate-300"
                                                                    title="Editar"
                                                                >
                                                                    <IconEdit className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => setDeleteConfirmation(block)}
                                                                    className="p-2 bg-slate-50 hover:bg-white text-slate-400 hover:text-red-600 rounded-lg border border-slate-100 hover:border-slate-200 transition-all dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-600 dark:text-slate-300 dark:hover:text-red-400"
                                                                    title="Excluir"
                                                                >
                                                                    <IconTrash className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <BlockFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveBlock}
                professionals={professionals}
                blockToEdit={blockToEdit}
            />
            
            <ConfirmationModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={handleDeleteBlock}
                title="Remover Bloqueio"
                message="Tem certeza que deseja remover este bloqueio? O horário ficará disponível para agendamentos novamente."
                confirmButtonText="Remover"
            />
        </div>
    );
};

export default ScheduleBlocksPage;
