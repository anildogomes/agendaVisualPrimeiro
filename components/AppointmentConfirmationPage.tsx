
import React, { useState, useEffect } from 'react';
import { IconCheck, IconX, IconScissors } from '../constants';
import { Appointment, Service, Professional, Client, BusinessInfo } from '../types';
import { supabase } from '../supabaseClient';


const AppointmentConfirmationPage: React.FC = () => {
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [professional, setProfessional] = useState<Professional | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointmentData = async () => {
            // Robust ID Extraction
            const hash = decodeURIComponent(window.location.hash);
            // Remove #confirm-appointment/ prefix
            let idPart = hash.replace(/^#confirm-appointment\//, '');
            
            // Clean query params (e.g. ?source=whatsapp)
            idPart = idPart.split('?')[0];
            
            // Clean trailing slash
            idPart = idPart.replace(/\/$/, '');

            const appointmentId = parseInt(idPart, 10);

            if (isNaN(appointmentId)) {
                setError('Link de agendamento inválido ou corrompido.');
                setIsLoading(false);
                return;
            }

            const { data: appData, error: appError } = await supabase
                .from('appointments')
                .select('*')
                .eq('id', appointmentId)
                .single();

            if (appError || !appData) {
                setError('Agendamento não encontrado. Pode já ter sido cancelado ou o link é inválido.');
                setIsLoading(false);
                return;
            }
            
            setAppointment(appData as Appointment);

            const [clientRes, serviceRes, profRes, bizRes] = await Promise.all([
                supabase.from('clients').select('*').eq('id', appData.client_id).single(),
                supabase.from('services').select('*').eq('id', appData.service_id).single(),
                supabase.from('professionals').select('*').eq('id', appData.professional_id).single(),
                supabase.from('businesses').select('*').eq('id', appData.business_id).single(),
            ]);


            if (clientRes.error || serviceRes.error || profRes.error || bizRes.error) {
                setError('Não foi possível carregar os detalhes do agendamento.');
            } else {
                setClient(clientRes.data);
                setService(serviceRes.data);
                setProfessional(profRes.data);
                setBusinessInfo(bizRes.data as BusinessInfo);
            }

            setIsLoading(false);
        };

        fetchAppointmentData();
    }, []);

    const handleUpdateStatus = async (status: 'confirmed' | 'cancelled') => {
        if (!appointment) return;

        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointment.id)
            .select()
            .single();

        if (error) {
            setError('Ocorreu um erro ao tentar atualizar seu agendamento.');
        } else {
            setAppointment(data as Appointment);
            if (status === 'confirmed') {
                setMessage('Obrigado! Seu agendamento está reservado. Te esperamos!');
            } else {
                setMessage('Sua desistência foi registrada com sucesso. Esperamos te ver em breve.');
            }
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center text-slate-500 dark:text-slate-400">Carregando detalhes do agendamento...</div>;
        }

        if (error) {
            return (
                 <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconX className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Ocorreu um Erro</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                    <a href={`/#public/${businessInfo?.slug || ''}`} className="inline-block px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                        Voltar para Agendamentos
                    </a>
                </div>
            )
        }
        
        if (message) {
            return (
                 <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Tudo Certo!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{message}</p>
                    <a href={`/#public/${businessInfo?.slug || ''}`} className="inline-block px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                        Fazer Novo Agendamento
                    </a>
                </div>
            )
        }

        if (!appointment || !service || !professional || !client) {
             return <div className="text-center text-slate-500 dark:text-slate-400">Não foi possível carregar os detalhes do agendamento.</div>;
        }

        if (appointment.status === 'cancelled' || appointment.status === 'declined' || appointment.status === 'confirmed') {
            const statusText = {
                cancelled: 'desistiu',
                declined: 'recusado',
                confirmed: 'reservado'
            };
            return (
                <div className="text-center py-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Agendamento Já Processado</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Este agendamento já foi {statusText[appointment.status]} e não pode ser modificado.</p>
                    <a href={`/#public/${businessInfo?.slug || ''}`} className="inline-block px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                        Voltar para Agendamentos
                    </a>
                </div>
            );
        }

        return (
            <div>
                 <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Olá, {client.name}!</h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Por favor, confirme ou desista do seu agendamento abaixo.</p>
                
                <div className="space-y-3 text-sm p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-700 mb-6">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Detalhes do Agendamento:</h3>
                    <div className="flex justify-between"> <span className="text-slate-500 dark:text-slate-400">Serviço:</span> <span className="font-medium text-slate-800 dark:text-slate-100 text-right">{service.name}</span> </div>
                    <div className="flex justify-between"> <span className="text-slate-500 dark:text-slate-400">Profissional:</span> <span className="font-medium text-slate-800 dark:text-slate-100 text-right">{professional.name}</span> </div>
                    <div className="flex justify-between"> <span className="text-slate-500 dark:text-slate-400">Data:</span> <span className="font-medium text-slate-800 dark:text-slate-100 text-right">{new Date(appointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long' })}</span> </div>
                    <div className="flex justify-between"> <span className="text-slate-500 dark:text-slate-400">Horário:</span> <span className="font-medium text-slate-800 dark:text-slate-100 text-right">{appointment.time}</span> </div>
                    <div className="flex justify-between pt-2 border-t dark:border-slate-600 mt-2"> <span className="text-slate-500 dark:text-slate-400">Valor:</span> <span className="font-bold text-lg text-primary-600 dark:text-primary-400">R$ {service.price.toFixed(2)}</span> </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button onClick={() => handleUpdateStatus('confirmed')} className="w-full px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                        Confirmar Agendamento
                    </button>
                    <button onClick={() => handleUpdateStatus('cancelled')} className="w-full px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                        Desistir do Agendamento
                    </button>
                </div>
                <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} AGSISTEMAS. Todos os direitos reservados.
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-lg">
                 <div className="flex flex-col items-center mb-6 text-center">
                    <div className="w-20 h-20 rounded-full mb-4 shadow-md bg-slate-800 flex items-center justify-center border-2 border-gold-500">
                        <IconScissors className="w-10 h-10 text-gold-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{businessInfo?.business_name}</h1>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg">
                    {renderContent()}
                </div>
                <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} AGSISTEMAS. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
};

export default AppointmentConfirmationPage;