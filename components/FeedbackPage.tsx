
import React, { useState, useEffect, useCallback } from 'react';
import { IconCheck, IconScissors } from '../constants';
import { Appointment, Service, Professional, Client, BusinessInfo, Feedback } from '../types';
import { supabase } from '../supabaseClient';
import { useToast } from '../App';

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => {
    return (
        <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        className="transition-transform duration-150 ease-in-out hover:scale-110"
                    >
                        <svg className={`w-10 h-10 ${starValue <= rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};

const FeedbackPage: React.FC = () => {
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [professional, setProfessional] = useState<Professional | null>(null);
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
    const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { addToast } = useToast();

    const fetchAppointmentData = useCallback(async () => {
        // Robust ID Extraction
        const hash = decodeURIComponent(window.location.hash);
        // Remove #feedback/ prefix
        let idPart = hash.replace(/^#feedback\//, '');
        
        // Clean query params (e.g. ?source=whatsapp)
        idPart = idPart.split('?')[0];
        
        // Clean trailing slash
        idPart = idPart.replace(/\/$/, '');
        
        const appointmentId = parseInt(idPart, 10);

        if (isNaN(appointmentId)) {
            setError('Link de avaliação inválido.');
            setIsLoading(false);
            return;
        }

        const { data: appData, error: appError } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', appointmentId)
            .single();

        if (appError || !appData) {
            setError('Agendamento não encontrado. O link pode ser inválido.');
            setIsLoading(false);
            return;
        }

        if (appData.status !== 'completed') {
            setError('Este agendamento ainda não foi concluído.');
            setIsLoading(false);
            return;
        }
        
        const {data: feedbackData, error: feedbackError} = await supabase
            .from('feedbacks')
            .select('*')
            .eq('appointment_id', appointmentId)
            .maybeSingle();
            
        if(feedbackData){
            setExistingFeedback(feedbackData);
        }

        setAppointment(appData as Appointment);

        const [serviceRes, profRes, bizRes] = await Promise.all([
            supabase.from('services').select('*').eq('id', appData.service_id).single(),
            supabase.from('professionals').select('*').eq('id', appData.professional_id).single(),
            supabase.from('businesses').select('*').eq('id', appData.business_id).single(),
        ]);

        if (serviceRes.error || profRes.error || bizRes.error) {
            setError('Não foi possível carregar os detalhes do agendamento.');
        } else {
            setService(serviceRes.data);
            setProfessional(profRes.data);
            setBusinessInfo(bizRes.data as BusinessInfo);
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchAppointmentData();
    }, [fetchAppointmentData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            addToast('Por favor, selecione pelo menos uma estrela.', 'error');
            return;
        }
        if (!appointment) return;
        setIsSubmitting(true);

        const { error: insertError } = await supabase
            .from('feedbacks')
            .insert({
                appointment_id: appointment.id,
                business_id: appointment.business_id,
                client_id: appointment.client_id,
                professional_id: appointment.professional_id,
                rating: rating,
                comment: comment || null,
            });

        if (insertError) {
            if (insertError.code === '23505') { // unique constraint violation
                 setError('Você já enviou uma avaliação para este agendamento.');
            } else {
                 setError('Ocorreu um erro ao enviar sua avaliação. Tente novamente.');
            }
        } else {
            setSuccess(true);
        }
        setIsSubmitting(false);
    }
    
    const renderContent = () => {
        if (isLoading) return <p>Carregando...</p>;
        if (error) return <p className="text-red-500">{error}</p>;

        if (success || existingFeedback) {
            return (
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Obrigado!</h2>
                    <p className="text-slate-500 dark:text-slate-400">Sua avaliação foi registrada com sucesso.</p>
                </div>
            );
        }
        
        if (!appointment || !service || !professional) return <p>Dados incompletos.</p>;

        return (
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Avalie seu Atendimento</h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Sua opinião é muito importante para nós.</p>

                <div className="text-sm p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-700 mb-6 text-center">
                    <p>Você está avaliando o serviço de <strong>{service.name}</strong></p>
                    <p>realizado por <strong>{professional.name}</strong></p>
                    <p>no dia {new Date(appointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.</p>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Sua nota:</label>
                        <StarRatingInput rating={rating} setRating={setRating} />
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deixe um comentário (opcional):</label>
                        <textarea
                            id="comment"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-900 dark:border-slate-600"
                            placeholder="Como foi sua experiência?"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-lg">
                 <div className="flex flex-col items-center mb-6 text-center">
                     <div className="w-20 h-20 rounded-full mb-4 shadow-md bg-slate-800 flex items-center justify-center border-2 border-gold-500">
                        {businessInfo?.logo_url ? 
                            <img src={businessInfo.logo_url} alt="Logo" className="w-full h-full object-cover rounded-full" /> :
                            <IconScissors className="w-10 h-10 text-gold-500" />
                        }
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{businessInfo?.business_name || "Avaliação de Serviço"}</h1>
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

export default FeedbackPage;
