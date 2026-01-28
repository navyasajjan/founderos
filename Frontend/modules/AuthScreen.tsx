
import React, { useState } from 'react';
import { Cpu, Lock, Mail, ArrowRight, Building2, User, Calendar, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { EntityType, Company, Person, EmploymentType } from '../types';
import { persistence } from '../persistence';
import { api } from '../api';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Registration State
  const [regData, setRegData] = useState({
    email: '',
    password: '',
    companyName: '',
    entityType: EntityType.PVT_LTD,
    incorpDate: new Date().toISOString().split('T')[0],
    founderName: '',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.auth.login({ email: loginEmail, password: loginPass });
      api.setToken(response.token);
      
      localStorage.setItem("user",JSON.stringify(response.user))

      onLogin();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterFinalize = async () => {
    if (!regData.companyName || !regData.founderName || !regData.email) {
      alert("Missing critical details for OS initialization.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
   


      const newCompany: Company = {
        name: regData.companyName,
        entityType: regData.entityType,
        incorporationDate: regData.incorpDate,
        registeredAddress: 'Primary Headquarters',
        founders: [{ name: regData.founderName, share: 100 }],
        advisors: [],
        complianceChecklist: [{ id: '1', name: 'Initial Statutory Filing', status: 'PENDING', deadline: 'T+30 days' }],
        updated_at: new Date().toISOString(),
        
      };
      
    const payload = {
      email: regData.email,
      password: regData.password,
      fullName: regData.founderName,
      companyData: newCompany
    };

  const authResponse = await api.auth.register({
        payload
      });

       api.setToken(authResponse.token);
      localStorage.setItem("user",JSON.stringify(authResponse.user))
     
      const founderPerson: Person = {
        _id: authResponse.user.id,
        name: regData.founderName,
        email: regData.email,
        roleId: 'FOUNDER_ROLE',
        employmentType: EmploymentType.FOUNDER,
        startDate: regData.incorpDate,
        status: 'ACTIVE',
        notes: 'Initial OS Administrator',
        linkedAssetIds: [],
        linkedDecisionIds: [],
        updated_at: new Date().toISOString()
      };

      persistence.saveCompanies([newCompany, ...persistence.getCompanies()]);
      persistence.savePeople([founderPerson, ...persistence.getPeople()]);

      onLogin();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'REGISTER') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6">
              <Cpu className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase italic">Initialize OS</h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide">STAGE {step} OF 3</p>
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-indigo-500' : 'w-4 bg-slate-700'}`} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : setView('LOGIN')}
              className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                {errorMessage}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <header>
                  <h2 className="text-xl font-bold text-slate-900">Step 1: Admin Identity</h2>
                  <p className="text-sm text-slate-500">Establish the primary account for the Founder OS.</p>
                </header>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        value={regData.email}
                        onChange={(e) => setRegData({...regData, email: e.target.value})}
                        placeholder="founder@company.co"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">System Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password" 
                        value={regData.password}
                        onChange={(e) => setRegData({...regData, password: e.target.value})}
                        placeholder="••••••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  disabled={!regData.email || !regData.password}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all"
                >
                  Continue Setup <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <header>
                  <h2 className="text-xl font-bold text-slate-900">Step 2: Entity Definition</h2>
                  <p className="text-sm text-slate-500">Capture your legal structure details.</p>
                </header>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={regData.companyName}
                        onChange={(e) => setRegData({...regData, companyName: e.target.value})}
                        placeholder="Acme Technologies"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Entity Type</label>
                      <select 
                        value={regData.entityType}
                        onChange={(e) => setRegData({...regData, entityType: e.target.value as EntityType})}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                      >
                        {Object.values(EntityType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Incorp Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="date" 
                          value={regData.incorpDate}
                          onChange={(e) => setRegData({...regData, incorpDate: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!regData.companyName}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all"
                >
                  Define Founder <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <header>
                  <h2 className="text-xl font-bold text-slate-900">Step 3: Founder Identity</h2>
                  <p className="text-sm text-slate-500">Record your name as the system administrator.</p>
                </header>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Founder Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={regData.founderName}
                        onChange={(e) => setRegData({...regData, founderName: e.target.value})}
                        placeholder="Jane Doe"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                    <CheckCircle2 className="text-indigo-600 mt-1 shrink-0" size={16} />
                    <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                      Initializing system with {regData.founderName || 'Founder'} as the root owner. All modules will be unlocked upon launch.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleRegisterFinalize}
                  disabled={!regData.founderName || isLoading}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black shadow-xl disabled:opacity-50 transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Launch Founder OS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6">
            <Cpu className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">FOUNDER OS</h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide">PRIVATE OPERATING SYSTEM</p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Access Control Center</h2>
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLoginSubmit}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="founder@startup.co"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all group disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              Initialize System
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
            <button 
              onClick={() => { setView('REGISTER'); setStep(1); setErrorMessage(null); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
            >
              Register New Entity
            </button>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Founder OS is a secure, private environment. All data is locally persisted.<br /> Unauthorized access is logged and flagged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
