
import React, { useState, useEffect } from 'react';
import { Block, Professional, Appointment, Service, Client } from '../types';
import { IconX, timeToMinutes, IconClock, IconCheck, IconCalendar } from '../constants';
import { useToast } from '../App';
import { supabase } from '../supabaseClient';

type BlockFormModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (block: Omit<Block, 'id' | 'business_id'> & { id?: number }) => void;
    professionals: Professional[];
    blockToEdit: Block | null;
};

const QUICK_REASONS = ['Almoço', 'Folga', 'Médico', 'Reunião', 'Pessoal', 'Manutenção'];

const BlockFormModal: React.FC<BlockFormModalProps> = ({ isOpen, onClose, onSave, professionals, blockToEdit }) => {
    const [professionalId, setProfessionalId] = useState<number>(professionals[0]?.id || 0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('12:00');
    const [endTime, setEndTime] = useState('13:00');
    const [reason, setReason] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);
    
    const [timeConflictError, setTimeConflictError] = useState('');
    const [conflictData, setConflictData] = useState<{ appointments: Appointment[], services: Service[], clients: Client[] }>({ appointments: [], services: [], clients: [] });
    const [isChecking, setIsChecking] = useState(false);
    
    const { addToast } = useToast();

    useEffect(() => {
        if (blockToEdit) {
            setProfessionalId(blockToEdit.professional_id);
            setDate(blockToEdit.date);
            setStartTime(blockToEdit.start_time);
            setEndTime(blockToEdit.end_time);
            setReason(blockToEdit.reason || '');
            
            // Check if it looks like an all day block
            if (blockToEdit.start_time === '00:00' && blockToEdit.end_time === '23:59') {
                setIsAllDay(true);
            } else {
                setIsAllDay(false);
            }
        } else {
            setProfessionalId(professionals[0]?.id || 0);
            setDate(new Date().toISOString().split('T')[0]);
            setStartTime('12:00');
            setEndTime('13:00');
            setReason('');
            setIsAllDay(false);
        }
        setTimeConflictError(''); 
    }, [blockToEdit, isOpen, professionals]);

    // Fetch data for conflict validation
    useEffect(() => {
        if (!isOpen || !professionalId || !date) return;

        const fetchConflictData = async () => {
            setIsChecking(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsChecking(false);
                return;
            }

            const profId = Number(professionalId);

            const [appRes, servRes, clientRes] = await Promise.all([
                supabase.from('appointments').select('*').eq('business_id', user.id).eq('professional_id', profId).eq('date', date),
                supabase.from('services').select('id, duration').eq('business_id', user.id),
                supabase.from('clients').select('id, name').eq('business_id', user.id),
            ]);

            if (appRes.error || servRes.error || clientRes.error) {
                // Silent error or mild toast to not disrupt flow too much
                console.error("Conflict check failed");
            } else {
                setConflictData({
                    appointments: (appRes.data || []) as Appointment[],
                    services: (servRes.data || []) as Service[],
                    clients: (clientRes.data || []) as Client[],
                });
            }
            setIsChecking(false);
        };

        fetchConflictData();
    }, [isOpen, professionalId, date]);

    // Validation Logic
    useEffect(() => {
        if (!isOpen) return;
        setTimeConflictError('');
        
        if (isAllDay) return; // Skip granular validation for all day, just block it.

        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        if (endMinutes <= startMinutes) {
            setTimeConflictError('O horário de fim deve ser posterior ao de início.');
            return;
        }

        // Conflict check with existing appointments
        const { appointments, services, clients } = conflictData;
        const activeApps = appointments.filter(app => ['confirmed', 'pending'].includes(app.status));

        for (const app of activeApps) {
            const service = services.find(s => s.id === app.service_id);
            if (!service) continue;

            const appStart = timeToMinutes(app.time);
            const appEnd = appStart + service.duration;

            // Check overlap
            if (startMinutes < appEnd && endMinutes > appStart) {
                const client = clients.find(c => c.id === app.client_id);
                setTimeConflictError(`Conflito com cliente ${client?.name || 'Agendado'} (${app.time})`);
                return;
            }
        }
    }, [isOpen, professionalId, date, startTime, endTime, conflictData, isAllDay]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (timeConflictError && !isAllDay) {
             addToast(`Atenção: ${timeConflictError}`, 'error');
            return;
        }

        const finalStart = isAllDay ? '00:00' : startTime;
        const finalEnd = isAllDay ? '23:59' : endTime;

        onSave({ 
            id: blockToEdit?.id, 
            professional_id: Number(professionalId), 
            date, 
            start_time: finalStart, 
            end_time: finalEnd, 
            reason 
        });
    };

    const handleReasonClick = (r: string) => {
        setReason(r);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="bg-white dark:bg-slate-800 w-full sm:w-full sm:max-w-md pointer-events-auto rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] animate-slide-up sm:m-4 overflow-hidden transform transition-all">
                
                {/* Header */}
                <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                            {blockToEdit ? 'Editar Bloqueio' : 'Novo Bloqueio'}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 -mr-2 bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-full transition-colors"
                    >
                        <IconX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 space-y-6 bg-white dark:bg-slate-800">
                    <form id="block-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* 1. Profissional & Data Row */}
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Profissional
                                </label>
                                <div className="relative">
                                    <select 
                                        value={professionalId} 
                                        onChange={e => setProfessionalId(Number(e.target.value))} 
                                        required 
                                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 transition-all truncate"
                                    >
                                        {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Data
                                </label>
                                <div className="relative">
                                    <IconCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                    <input 
                                        type="date" 
                                        value={date} 
                                        onChange={e => setDate(e.target.value)} 
                                        required 
                                        className="w-full pl-11 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 transition-all appearance-none" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Horários e Toggle */}
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Dia Inteiro</span>
                                </label>
                                {isAllDay && <span className="text-[10px] font-bold uppercase text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/40 px-2 py-1 rounded-md">Bloqueio Total</span>}
                            </div>

                            <div className={`grid grid-cols-2 gap-3 sm:gap-4 transition-all duration-300 ${isAllDay ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">De</label>
                                    <input 
                                        type="time" 
                                        value={startTime} 
                                        onChange={e => setStartTime(e.target.value)} 
                                        className="w-full px-1 py-3 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 appearance-none min-w-0" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Até</label>
                                    <input 
                                        type="time" 
                                        value={endTime} 
                                        onChange={e => setEndTime(e.target.value)} 
                                        className="w-full px-1 py-3 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 appearance-none min-w-0" 
                                    />
                                </div>
                            </div>
                            
                            {/* Validation Message */}
                            {!isAllDay && (
                                <div className="min-h-[20px]">
                                    {isChecking ? (
                                        <p className="text-xs text-slate-400 flex items-center gap-1 animate-pulse"><IconClock className="w-3 h-3"/> Verificando agenda...</p>
                                    ) : timeConflictError ? (
                                        <p className="text-xs text-red-500 font-medium flex items-center gap-1"><IconX className="w-3 h-3"/> {timeConflictError}</p>
                                    ) : (
                                        <p className="text-xs text-green-500 font-medium flex items-center gap-1"><IconCheck className="w-3 h-3"/> Horário disponível</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. Motivo e Tags */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Motivo do Bloqueio
                            </label>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                                {QUICK_REASONS.map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => handleReasonClick(r)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                            reason === r 
                                            ? 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700' 
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <input 
                                type="text" 
                                value={reason} 
                                onChange={e => setReason(e.target.value)} 
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 placeholder-slate-400" 
                                placeholder="Digite um motivo ou selecione acima..."
                            />
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 py-4 text-sm font-bold text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            form="block-form"
                            disabled={!!timeConflictError && !isAllDay || isChecking} 
                            className="flex-1 py-4 text-sm font-bold text-white bg-slate-900 rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all transform active:scale-[0.98]"
                        >
                            {blockToEdit ? 'Salvar Alterações' : 'Criar Bloqueio'}
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .pb-safe {
                    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 20px));
                }
            `}</style>
        </div>
    );
};

export default BlockFormModal;
