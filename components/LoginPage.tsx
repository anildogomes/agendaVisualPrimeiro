
import React, { useState } from 'react';
import { IconScissors } from '../constants';
import { supabase } from '../supabaseClient';
import { useToast } from '../App';

const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const translateAuthError = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes('new password should be different from the old password')) {
        return 'A nova senha deve ser diferente da senha anterior.';
    }
    if (msg.includes('invalid login credentials')) {
        return 'E-mail ou senha incorretos.';
    }
    if (msg.includes('user already registered')) {
        return 'Este e-mail já está cadastrado.';
    }
    if (msg.includes('password should be at least')) {
        return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (msg.includes('invalid email')) {
        return 'Formato de e-mail inválido.';
    }
    if (msg.includes('rate limit exceeded') || msg.includes('too many requests')) {
        return 'Muitas tentativas. Por favor, aguarde alguns instantes.';
    }
    if (msg.includes('anonymous users cannot be updated')) {
        return 'Erro de sessão. Por favor, faça login novamente.';
    }
    if (msg.includes('token has expired') || msg.includes('is invalid') || msg.includes('verification link')) {
        return 'O link de recuperação expirou ou é inválido. Solicite um novo.';
    }
    if (msg.includes('same password')) {
        return 'A nova senha não pode ser igual à anterior.';
    }
    return message;
};

export const UpdatePassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { addToast } = useToast();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(translateAuthError(error.message));
            addToast('Erro ao atualizar senha.', 'error');
        } else {
            addToast('Senha atualizada com sucesso!', 'success');
            // Redirect to dashboard after success
            window.location.hash = '#inicio';
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 relative">
            <div className="w-full max-w-sm p-6 sm:p-8 space-y-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-gold-500 text-slate-900 p-3 rounded-xl mb-4 shadow-lg shadow-gold-500/20">
                        <IconScissors className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                        Nova Senha
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Digite sua nova senha abaixo.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleUpdatePassword}>
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nova Senha</label>
                        <input
                            id="new-password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:placeholder-slate-400"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Nova Senha</label>
                        <input
                            id="confirm-new-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:placeholder-slate-400"
                            placeholder="Repita a senha"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-800 transition-colors shadow-lg shadow-primary-500/30"
                    >
                        {loading ? (
                            <>
                                <SpinnerIcon />
                                Atualizando...
                            </>
                        ) : (
                            'Redefinir Senha'
                        )}
                    </button>
                </form>
            </div>
             <footer className="absolute bottom-4 text-center w-full text-xs text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} AGSISTEMAS. Todos os direitos reservados.
            </footer>
        </div>
    );
};

const LoginPage: React.FC = () => {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Signup State
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupEmailError, setSignupEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  // Forgot Password State
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryEmailError, setRecoveryEmailError] = useState('');

  // Shared State
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgotPassword'>('login');
  
  const validateEmail = (value: string, errorSetter: React.Dispatch<React.SetStateAction<string>>): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    errorSetter('');
    if (!value.trim()) {
      errorSetter('O campo de e-mail é obrigatório.');
      return false;
    }
    if (!emailRegex.test(value)) {
      errorSetter('Por favor, insira um formato de e-mail válido.');
      return false;
    }
    return true;
  };

  const getRedirectUrl = () => {
      const env = (import.meta as any).env || {};
      // Retorna a URL de origem se for localhost (para desenvolvimento)
      // Caso contrário, força o domínio de produção agendavisual.com.br
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return window.location.origin;
      }
      return 'https://agendavisual.com.br';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email, setEmailError)) return;
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(translateAuthError(error.message) || 'E-mail ou senha inválidos.');
    }
    // No subscription check here. Access control is handled in Dashboard.tsx
    
    setIsLoading(false);
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setPasswordError('');
    setSignupSuccess(false);
    
    let isValid = true;
    if (!businessName.trim() || !fullName.trim() || !city.trim() || !state.trim() || !signupPassword || !confirmPassword) {
        setSignupError('Todos os campos são obrigatórios.');
        isValid = false;
    }
    if (!validateEmail(signupEmail, setSignupEmailError)) {
        isValid = false;
    }
    if (signupPassword.length < 6) {
        setPasswordError('A senha deve ter pelo menos 6 caracteres.');
        isValid = false;
    } else if (signupPassword !== confirmPassword) {
        setPasswordError('As senhas não coincidem.');
        isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    const defaultWorkingHours = {
        sunday: null,
        monday: [{ start: '09:00', end: '18:00' }],
        tuesday: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '19:00' }],
        wednesday: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '19:00' }],
        thursday: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '20:00' }],
        friday: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '20:00' }],
        saturday: [{ start: '08:00', end: '16:00' }],
    };

    const generateSlug = (name: string) => {
        const baseSlug = name.toLowerCase().trim().replace(/&/g, '-e-').replace(/[áàâãäå]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòôõö]/g, 'u').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c').replace(/ñ/g, 'n').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        return `${baseSlug}-${Math.random().toString(36).substring(2, 9)}`;
    };
    const slug = generateSlug(businessName);

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: getRedirectUrl(),
        data: {
            business_name: businessName,
            full_name: fullName,
            city: city,
            state: state,
            slug: slug,
            work_hours: defaultWorkingHours,
            logo_url: 'https://images.unsplash.com/photo-1599351432903-8515c1b69437?auto=format&fit=crop&w=200&h=200&q=80',
            subscription_status: 'trialing' // Default to trialing
        }
      }
    });

    if (error) {
      setSignupError(translateAuthError(error.message));
    } else if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
             setSignupError('Esta conta já existe. Tente fazer login.');
        } else {
             setSignupSuccess(true);
        }
    }

    setIsLoading(false);
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryEmailError('');

    if (!validateEmail(recoveryEmail, setRecoveryEmailError)) {
        return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: getRedirectUrl(),
    });

    if (error) {
        setRecoveryMessage('Erro ao enviar e-mail. Tente novamente.');
    } else {
        setRecoveryMessage('Se um e-mail correspondente for encontrado em nosso sistema, um link de recuperação será enviado.');
    }

    setIsLoading(false);
  };

  const handleSwitchTab = (tab: 'login' | 'signup') => {
      setActiveTab(tab);
      setError(''); setEmailError('');
      setSignupError(''); setSignupEmailError(''); setPasswordError(''); setSignupSuccess(false);
      setRecoveryMessage(''); setRecoveryEmail(''); setRecoveryEmailError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 relative">
      <div className="w-full max-w-sm p-6 sm:p-8 space-y-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="bg-gold-500 text-slate-900 p-3 rounded-xl mb-4 shadow-lg shadow-gold-500/20">
            <IconScissors className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
            AgendaVisual
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Atendimento inteligente para barbearias e studios de beleza
          </p>
        </div>

        {activeTab !== 'forgotPassword' && (
            <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1 flex space-x-1">
            <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className={`w-full py-2 text-sm font-semibold rounded-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
                activeTab === 'login'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-gold-600 dark:text-gold-400'
                    : 'text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
            >
                Entrar
            </button>
            <button
                type="button"
                onClick={() => handleSwitchTab('signup')}
                className={`w-full py-2 text-sm font-semibold rounded-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
                activeTab === 'signup'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-gold-600 dark:text-gold-400'
                    : 'text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
            >
                Criar conta
            </button>
            </div>
        )}
        
        {activeTab === 'login' ? (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`mt-1 appearance-none block w-full px-3 py-2.5 border placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400 ${emailError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={() => validateEmail(email, setEmailError)}
                />
                 {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
              </div>
              <div>
                <div className="flex justify-between items-center">
                    <label htmlFor="password-sr" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Senha
                    </label>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('forgotPassword'); }} className="text-xs font-medium text-gold-600 hover:text-gold-500 dark:text-gold-400 dark:hover:text-gold-300">
                        Esqueceu a senha?
                    </a>
                </div>
                <input
                  id="password-sr"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:placeholder-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-800 transition-colors shadow-lg shadow-primary-500/30"
              >
                {isLoading ? (
                  <>
                    <SpinnerIcon />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Ou</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('is_mock_logged_in', 'true');
                  window.location.reload();
                }}
                className="w-full flex justify-center py-2.5 px-4 border border-slate-300 dark:border-slate-600 text-sm font-bold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                Demonstração
              </button>
            </div>
          </form>
        ) : activeTab === 'signup' ? (
             <form className="space-y-4" onSubmit={handleSignup}>
                {signupSuccess ? (
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">Cadastro Realizado!</h3>
                        <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                            Enviamos um link de confirmação para <strong>{signupEmail}</strong>.
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500">
                            Por favor, verifique sua caixa de entrada (e spam) e clique no link para ativar sua conta e acessar o sistema.
                        </p>
                        <button type="button" onClick={() => handleSwitchTab('login')} className="mt-4 text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 underline">
                            Ir para Login
                        </button>
                    </div>
                ) : (
                <>
                    <div className="space-y-4">
                    <div>
                        <label htmlFor="business-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do seu negócio</label>
                        <input id="business-name" name="business-name" type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:placeholder-slate-400" placeholder="Ex: Barbearia Vanguarda"/>
                    </div>
                    <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Seu nome completo</label>
                        <input id="full-name" name="full-name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:placeholder-slate-400" placeholder="Ex: João da Silva"/>
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cidade</label>
                        <input id="city" name="city" type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:placeholder-slate-400" placeholder="Ex: São Paulo" />
                    </div>
                    <div>
                            <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado (UF)</label>
                            <input id="state" name="state" type="text" required value={state} onChange={(e) => setState(e.target.value)} maxLength={2} className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:placeholder-slate-400" placeholder="Ex: SP"/>
                    </div>
                    <div>
                        <label htmlFor="signup-email-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input id="signup-email-address" name="email" type="email" autoComplete="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} onBlur={() => validateEmail(signupEmail, setSignupEmailError)} className={`mt-1 appearance-none block w-full px-3 py-2.5 border placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400 ${signupEmailError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`} placeholder="seu@email.com" />
                        {signupEmailError && <p className="text-red-500 text-xs mt-1">{signupEmailError}</p>}
                    </div>
                    <div>
                        <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                        <input id="signup-password" name="password" type="password" required value={signupPassword} onChange={(e) => { setSignupPassword(e.target.value); if (passwordError) setPasswordError(''); }} className="mt-1 appearance-none block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50 dark:placeholder-slate-400" placeholder="Mínimo 6 caracteres"/>
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar senha</label>
                        <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError(''); }} className={`mt-1 appearance-none block w-full px-3 py-2.5 border placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400 ${passwordError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`} placeholder="••••••••" />
                        {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                    </div>
                    </div>
                    {signupError && <p className="text-red-500 text-sm text-center">{signupError}</p>}
                    <div>
                    <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-800 transition-colors shadow-lg shadow-primary-500/30">
                        {isLoading ? (
                            <>
                            <SpinnerIcon />
                            Criando conta...
                            </>
                        ) : (
                        'Criar conta gratuitamente'
                        )}
                    </button>
                    </div>
                </>
                )}
             </form>
        ) : ( // Forgot Password
            <form className="space-y-4" onSubmit={handleForgotPassword}>
                {recoveryMessage ? (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">{recoveryMessage}</p>
                        <button type="button" onClick={() => handleSwitchTab('login')} className="mt-4 text-sm font-bold text-gold-600 hover:text-gold-500 dark:text-gold-400 dark:hover:text-gold-300">
                        Voltar para o login
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Recuperar Senha</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Digite seu e-mail para receber as instruções.
                            </p>
                        </div>
                        <div>
                            <label htmlFor="recovery-email-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                            <input
                                id="recovery-email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`mt-1 appearance-none block w-full px-3 py-2.5 border placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-gold-500 focus:border-gold-500 text-sm dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400 ${recoveryEmailError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                placeholder="seu@email.com"
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                onBlur={() => validateEmail(recoveryEmail, setRecoveryEmailError)}
                            />
                            {recoveryEmailError && <p className="text-red-500 text-xs mt-1">{recoveryEmailError}</p>}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-800 transition-colors shadow-lg shadow-primary-500/30"
                            >
                                {isLoading ? (
                                    <>
                                        <SpinnerIcon />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar link de recuperação'
                                )}
                            </button>
                            <p className="mt-4 text-center text-sm">
                                <button type="button" onClick={() => handleSwitchTab('login')} className="font-medium text-gold-600 hover:text-gold-500 dark:text-gold-400 dark:hover:text-gold-300">
                                    Lembrou a senha? Voltar
                                </button>
                            </p>
                        </div>
                    </>
                )}
            </form>
        )}
        <div className="text-center pt-4">
          <a href="#" className="text-sm font-medium text-gold-600 hover:text-gold-500 dark:text-gold-400 dark:hover:text-gold-300 transition-colors">
            &larr; Voltar à página inicial
          </a>
        </div>
      </div>
      <footer className="absolute bottom-4 text-center w-full text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} AGSISTEMAS. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default LoginPage;
