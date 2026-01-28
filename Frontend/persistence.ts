
import { Record, Decision, LiveSession, Company, Assumption, Risk, Person, RoleDef, Expense, FinanceData } from './types';

const STORAGE_KEYS = {
  RECORDS: 'founder_os_records',
  DECISIONS: 'founder_os_decisions',
  SESSIONS: 'founder_os_sessions',
  COMPANIES: 'founder_os_companies',
  ASSUMPTIONS: 'founder_os_assumptions',
  RISKS: 'founder_os_risks',
  PEOPLE: 'founder_os_people',
  ROLES: 'founder_os_roles',
  EXPENSES: 'founder_os_expenses',
  FINANCE_DATA: 'founder_os_finance'
};

export const persistence = {
  // RECORDS
  getRecords: (): Record[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  },
  saveRecords: (records: Record[]) => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },
  
  // DECISIONS
  getDecisions: (): Decision[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DECISIONS);
    return data ? JSON.parse(data) : [];
  },
  saveDecisions: (decisions: Decision[]) => {
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
  },

  // RISKS
  getRisks: (): Risk[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RISKS);
    return data ? JSON.parse(data) : [];
  },
  saveRisks: (risks: Risk[]) => {
    localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(risks));
  },

  // ASSUMPTIONS
  getAssumptions: (): Assumption[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ASSUMPTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveAssumptions: (assumptions: Assumption[]) => {
    localStorage.setItem(STORAGE_KEYS.ASSUMPTIONS, JSON.stringify(assumptions));
  },

  // VOICE SESSIONS
  getSessions: (): LiveSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },
  saveSession: (session: LiveSession) => {
    const sessions = persistence.getSessions();
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([session, ...sessions]));
  },

  // COMPANIES
  getCompanies: (): Company[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return data ? JSON.parse(data) : [];
  },
  saveCompanies: (companies: Company[]) => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  },

  // PEOPLE
  getPeople: (): Person[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    return data ? JSON.parse(data) : [];
  },
  savePeople: (people: Person[]) => {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  },

  // ROLES
  getRoles: (): RoleDef[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ROLES);
    return data ? JSON.parse(data) : [];
  },
  saveRoles: (roles: RoleDef[]) => {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  },

  // EXPENSES
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  saveExpenses: (expenses: Expense[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  // FINANCE DATA
  getFinanceData: (): FinanceData => {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCE_DATA);
    if (data) return JSON.parse(data);
    return {
      cashBalance: 0,
      lastUpdated: new Date().toISOString(),
      scenarios: [
        { name: 'Realistic', burnMultiplier: 1, isActive: true },
        { name: 'Aggressive Growth', burnMultiplier: 1.5, isActive: false },
        { name: 'Survival Mode', burnMultiplier: 0.7, isActive: false }
      ]
    };
  },
  saveFinanceData: (data: FinanceData) => {
    localStorage.setItem(STORAGE_KEYS.FINANCE_DATA, JSON.stringify(data));
  }
};
