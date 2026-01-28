
export enum Role {
  FOUNDER = 'FOUNDER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER'
}

export enum EntityType {
  PVT_LTD = 'Private Limited',
  LLP = 'LLP',
  OPC = 'One Person Company',
  PROPRIETORSHIP = 'Proprietorship'
}

export enum RecordType {
  SUBSCRIPTION = 'Subscription',
  TOOL = 'Tool',
  VENDOR = 'Vendor',
  CONTRACT = 'Contract',
  LICENSE = 'License',
  DOMAIN = 'Domain',
  POLICY = 'Policy',
  ASSET = 'Asset',
  TASK = 'Task',
  CUSTOM = 'Custom'
}

export enum RecordStatus {
  ACTIVE = 'Active',
  RENEWAL_SOON = 'Renewal Soon',
  EXPIRED = 'Expired',
  ARCHIVED = 'Archived'
}

export enum HealthStatus {
  HEALTHY = 'Healthy',
  ATTENTION_NEEDED = 'Attention Needed',
  AT_RISK = 'At Risk'
}

export enum EmploymentType {
  FOUNDER = 'Founder',
  EMPLOYEE = 'Employee',
  CONTRACTOR = 'Contractor',
  ADVISOR = 'Advisor'
}

export enum ExpenseCategory {
  PAYROLL = 'Payroll',
  TOOL = 'SaaS/Tools',
  INFRA = 'Infrastructure',
  MARKETING = 'Marketing',
  LEGAL = 'Legal/Compliance',
  RENT = 'Rent/Office',
  OTHER = 'Other'
}

export interface Person {
  _id: string;
  name: string;
  email: string;
  roleId: string;
  employmentType: EmploymentType;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  managerId?: string;
  notes: string;
  linkedAssetIds: string[];
  linkedDecisionIds: string[];
  updated_at: string;
}

export interface RoleDef {
  _id: string;
  title: string;
  description: string;
  responsibilities: { id: string; text: string; done: boolean }[];
  accessLevel: Role;
  updated_at: string;
}

export interface Expense {
  _id: string;
  companyId?: string;
  name: string;
  amount: number; // in ₹ INR
  type: 'RECURRING' | 'ONE_TIME';
  category: ExpenseCategory;
  billingCycle: 'MONTHLY' | 'ANNUAL' | 'ONE_TIME';
  startDate: string;
  renewalDate?: string;
  linkedRecordId?: string; // tool, vendor, person
  paymentMethod: string;
  notes: string;
  decisionId?: string;
  updated_at: string;
}

export interface FinanceData {
  cashBalance: number;
  lastUpdated: string;
  scenarios: {
    name: string;
    burnMultiplier: number; // e.g. 1.2 for worst case
    isActive: boolean;
  }[];
}

export interface Advisor {
  name: string;
  type: string;
  firm: string;
}

export interface Founder {
  name: string;
  share: number;
}

export interface Company {
  _id?: string;
  name: string;
  entityType: EntityType;
  cin?: string;
  pan?: string;
  tan?: string;
  gstin?: string;
  incorporationDate: string;
  registeredAddress: string;
  founders: Founder[];
  advisors: Advisor[];
  complianceChecklist: { id: string; name: string; status: 'DONE' | 'PENDING'; deadline?: string }[];
  updated_at: string;
}

export interface Record {
  _id: string;
  companyId?: string;
  name: string;
  category: string;
  type: RecordType;
  status: RecordStatus;
  startDate: string;
  renewalDate?: string;
  cost: number;
  billingCycle: 'MONTHLY' | 'ANNUAL' | 'ONE_TIME';
  paymentMethod: string;
  primaryOwner: string;
  backupOwner?: string;
  tags: string[];
  notes: string;
  decisionLog: string[];
  risks: string[];
  alternatives: string[];
  links: { label: string; url: string }[];
  updated_at: string;
}

export interface Decision {
  _id: string;
  companyId?: string;
  title: string;
  area: string;
  description: string;
  tradeOffs: string;
  mentalModels: string[];
  outcome?: string;
  reviewDate?: string;
  linkedRecordIds: string[];
  updated_at: string;
}

export interface Assumption {
  _id: string;
  statement: string;
  area: string;
  confidence: number;
  evidence: string;
  validationDate?: string;
  outcome?: string;
  updated_at: string;
}

export interface Risk {
  _id: string;
  type: string;
  probability: number;
  impact: number;
  mitigationPlan: string;
  owner: string;
  status: string;
  updated_at: string;
}

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  targetId: string;
  timestamp: string;
  diff?: any;
}

export interface QuickCaptureSuggestion {
  type: 'DECISION' | 'RISK' | 'ASSET' | 'TASK' | 'PERSON' | 'EXPENSE';
  title: string;
  content: string;
  confidence: number;
}

export interface DraftCard {
  id: string;
  type: 'DECISION' | 'TASK' | 'RISK' | 'ASSUMPTION' | 'PERSON' | 'EXPENSE';
  summary: string;
  details: string;
  confidence: number;
  approved: boolean;
}

export interface TranscriptSegment {
  timestamp: string;
  text: string;
}

export interface LiveSession {
  _id: string;
  startTime: string;
  endTime?: string;
  transcript: string;
  segments: TranscriptSegment[];
  draftCards: DraftCard[];
}
