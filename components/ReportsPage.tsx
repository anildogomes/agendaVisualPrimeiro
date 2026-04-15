
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Appointment, Service, Professional, Feedback } from '../types';
import { 
    IconDollarSign, IconCalendar, IconChart, IconCheck, IconFilter, 
    IconUser, IconScissors, IconChevronDown, LineChart, DonutChart, 
    IconTrendingUp, IconClock 
} from '../constants';
import { supabase } from '../supabaseClient';
import { useToast } from '../App';

// --- SUB-COMPONENTS ---

const KpiCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color: 'emerald' | 'blue' | 'violet' | 'amber';
}> = ({ title, value, icon, trend, color }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-full min-w-[140px] sm:min-w-0">
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${colors[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full flex items-center">
                        <IconTrendingUp className="w-3 h-3 mr-0.5" /> {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const ReportsPage: React.FC = () => {
    // Date Logic
    const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'month' | 'custom'>('30days');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Data State
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'services'>('overview');
    const [showCustomDate, setShowCustomDate] = useState(false);
    
    const { addToast } = useToast();

    // Helper to calculate dates based on quick filters
    const applyDateFilter = useCallback((range: string) => {
        const end = new Date();
        const start = new Date();
        
        // Reset time to end of day for end date
        end.setHours(23, 59, 59, 999);
        // Reset time to start of day for start date base
        start.setHours(0, 0, 0, 0);

        switch (range) {
            case 'today':
                // start remains today 00:00
                break;
            case '7days':
                start.setDate(end.getDate() - 6);
                break;
            case '30days':
                start.setDate(end.getDate() - 29);
                break;
            case 'month':
                start.setDate(1); // First day of current month
                break;
            case 'custom':
                setShowCustomDate(true);
                return; // Don't auto-set dates
        }

        if (range !== 'custom') {
            setShowCustomDate(false);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        applyDateFilter('30days');
    }, [applyDateFilter]);

    // Data Fetching
    const fetchReportData = useCallback(async () => {
        if (!startDate || !endDate) return;
        
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const [servicesRes, profRes, appRes] = await Promise.all([
                supabase.from('services').select('*').eq('business_id', user.id),
                supabase.from('professionals').select('*').eq('business_id', user.id),
                supabase.from('appointments').select('*').eq('business_id', user.id)
                    .gte('date', startDate)
                    .lte('date', endDate)
            ]);
            
            if (servicesRes.data) setServices(servicesRes.data as Service[]);
            if (profRes.data) setProfessionals(profRes.data as Professional[]);
            if (appRes.data) setAppointments(appRes.data as Appointment[]);
        } catch (error) {
            addToast('Erro ao carregar dados.', 'error');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, addToast]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    // --- CALCULATIONS ---

    const validAppointments = useMemo(() => 
        appointments.filter(app => ['confirmed', 'completed'].includes(app.status)),
    [appointments]);

    const metrics = useMemo(() => {
        const revenue = validAppointments.reduce((acc, app) => {
            const s = services.find(s => s.id === app.service_id);
            return acc + (s?.price || 0);
        }, 0);
        
        const count = validAppointments.length;
        const ticket = count > 0 ? revenue / count : 0;
        
        // Calculate status distribution
        const statusCounts = { confirmed: 0, completed: 0, cancelled: 0, no_show: 0 };
        appointments.forEach(app => {
            if (statusCounts.hasOwnProperty(app.status)) {
                statusCounts[app.status as keyof typeof statusCounts]++;
            }
        });

        return { revenue, count, ticket, statusCounts };
    }, [validAppointments, appointments, services]);

    const chartData = useMemo(() => {
        // Group by date for Line Chart
        const dailyData: Record<string, number> = {};
        // Initialize aggregation map
        validAppointments.forEach(app => {
            const date = app.date; // YYYY-MM-DD
            const s = services.find(s => s.id === app.service_id);
            dailyData[date] = (dailyData[date] || 0) + (s?.price || 0);
        });

        // Convert to array and sort
        const sortedDates = Object.keys(dailyData).sort();
        return sortedDates.map(date => {
            const [y, m, d] = date.split('-');
            return {
                label: `${d}/${m}`,
                value: dailyData[date]
            };
        });
    }, [validAppointments, services]);

    const teamPerformance = useMemo(() => {
        const stats = professionals.map(prof => {
            const profApps = validAppointments.filter(a => a.professional_id === prof.id);
            const revenue = profApps.reduce((acc, app) => {
                const s = services.find(s => s.id === app.service_id);
                return acc + (s?.price || 0);
            }, 0);
            return {
                id: prof.id,
                name: prof.name,
                avatar: prof.avatar_url,
                count: profApps.length,
                revenue
            };
        });
        return stats.sort((a, b) => b.revenue - a.revenue);
    }, [professionals, validAppointments, services]);

    const serviceStats = useMemo(() => {
        const stats = services.map(srv => {
            const srvApps = validAppointments.filter(a => a.service_id === srv.id);
            return {
                id: srv.id,
                name: srv.name,
                count: srvApps.length,
                revenue: srvApps.length * srv.price
            };
        });
        return stats.sort((a, b) => b.count - a.count);
    }, [services, validAppointments]);

    const statusChartData = useMemo(() => [
        { label: 'Concluído', value: metrics.statusCounts.completed, color: '#10b981' }, // Emerald
        { label: 'Reservado', value: metrics.statusCounts.confirmed, color: '#3b82f6' }, // Blue
        { label: 'Desistiu', value: metrics.statusCounts.cancelled, color: '#ef4444' }, // Red
        { label: 'Falta', value: metrics.statusCounts.no_show, color: '#6b7280' } // Gray
    ], [metrics.statusCounts]);

    // --- RENDER ---

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">
            
            {/* 1. Header Filter Section */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-20 shadow-sm">
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <IconChart className="w-6 h-6 text-primary-600" /> Relatórios
                        </h1>
                        
                        {/* Quick Filters - Horizontal Scroll on Mobile */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                            {[
                                { key: 'today', label: 'Hoje' },
                                { key: '7days', label: '7 Dias' },
                                { key: '30days', label: '30 Dias' },
                                { key: 'month', label: 'Mês Atual' },
                                { key: 'custom', label: 'Personalizar' },
                            ].map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => { setDateRange(filter.key as any); applyDateFilter(filter.key); }}
                                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                        dateRange === filter.key
                                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Picker (Collapsible) */}
                    {showCustomDate && (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600 animate-fade-in-down">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Início</label>
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-sm dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fim</label>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-sm dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Content Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="max-w-5xl mx-auto space-y-6">
                    
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                        </div>
                    ) : (
                        <>
                            {/* KPI Carousel (Scrollable on mobile) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <KpiCard 
                                    title="Receita Confirmada" 
                                    value={`R$ ${metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                                    icon={<IconDollarSign className="w-6 h-6" />}
                                    color="emerald"
                                />
                                <KpiCard 
                                    title="Atendimentos" 
                                    value={metrics.count} 
                                    icon={<IconCheck className="w-6 h-6" />}
                                    color="blue"
                                />
                                <KpiCard 
                                    title="Ticket Médio" 
                                    value={`R$ ${metrics.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                                    icon={<IconChart className="w-6 h-6" />}
                                    color="violet"
                                />
                            </div>

                            {/* Tabs Navigation */}
                            <div className="border-b border-slate-200 dark:border-slate-700">
                                <div className="flex gap-6 overflow-x-auto no-scrollbar">
                                    {[
                                        { id: 'overview', label: 'Visão Geral' },
                                        { id: 'team', label: 'Equipe' },
                                        { id: 'services', label: 'Serviços' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                                                activeTab === tab.id
                                                ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* TAB: OVERVIEW */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in-down">
                                    {/* Revenue Chart */}
                                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                            <IconDollarSign className="w-5 h-5 text-slate-400" />
                                            Evolução da Receita
                                        </h3>
                                        <div className="h-64 w-full">
                                            <LineChart data={chartData} color="#10b981" />
                                        </div>
                                    </div>

                                    {/* Status Distribution */}
                                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                            <IconFilter className="w-5 h-5 text-slate-400" />
                                            Status dos Agendamentos
                                        </h3>
                                        <div className="flex justify-center">
                                            <DonutChart data={statusChartData} size={160} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: TEAM */}
                            {activeTab === 'team' && (
                                <div className="space-y-4 animate-fade-in-down">
                                    {teamPerformance.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400">Nenhum dado de equipe.</div>
                                    ) : (
                                        teamPerformance.map((prof, idx) => (
                                            <div key={prof.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-lg font-bold text-slate-400">
                                                            {prof.avatar ? (
                                                                <img src={prof.avatar} className="w-full h-full object-cover" alt={prof.name} />
                                                            ) : (
                                                                prof.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800">
                                                            #{idx + 1}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{prof.name}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{prof.count} atendimentos</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">R$ {prof.revenue.toFixed(0)}</p>
                                                    
                                                    {/* Mini Bar */}
                                                    <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden ml-auto">
                                                        <div 
                                                            className="h-full bg-emerald-500 rounded-full" 
                                                            style={{ width: `${(prof.revenue / Math.max(teamPerformance[0].revenue, 1)) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* TAB: SERVICES */}
                            {activeTab === 'services' && (
                                <div className="space-y-4 animate-fade-in-down">
                                    {serviceStats.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400">Nenhum dado de serviço.</div>
                                    ) : (
                                        serviceStats.map((srv, idx) => (
                                            <div key={srv.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                                            <IconScissors className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{srv.name}</h4>
                                                            <span className="text-xs font-medium text-slate-400">Rank #{idx + 1}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block font-bold text-sm text-slate-900 dark:text-slate-100">{srv.count}x</span>
                                                        <span className="text-xs text-slate-500">agendado</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-slate-500">Receita Gerada</span>
                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ {srv.revenue.toFixed(0)}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-blue-500 rounded-full" 
                                                                style={{ width: `${(srv.count / Math.max(serviceStats[0].count, 1)) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;