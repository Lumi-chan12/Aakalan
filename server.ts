import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  UserRole,
  Region,
  Application,
  WorkflowTemplate,
  ComplianceRecord,
  EVCVisit,
  NotificationItem,
  AuditLogItem,
  OfficerWorkload,
  DashboardSummary,
  StageId,
} from './src/types';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_WORKFLOW_TEMPLATES, WorkflowEngine, runWorkflowEngineTests } from './src/services/workflowEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Gemini SDK client if API key is provided
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI();
  } catch (err) {
    console.warn('Gemini SDK initialization note:', err);
  }
}

app.use(express.json());

// In-Memory persistent transactional store with seeded demo records
const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'user-admin-01',
    name: 'Dr. Arvind K. Sharma',
    email: 'admin@aicte.gov.in',
    role: 'ADMIN',
    designation: 'Chief Administrative & Compliance Officer',
    department: 'Approval Bureau, AICTE HQ New Delhi',
  },
  scrutiny: {
    id: 'user-scrutiny-01',
    name: 'Dr. Ramesh Iyer',
    email: 'ramesh.iyer@aicte.gov.in',
    role: 'SCRUTINY_OFFICER',
    designation: 'Senior Technical Scrutiny Officer',
    department: 'Scrutiny Committee (Western Region)',
    region: 'Western',
  },
  regional: {
    id: 'user-regional-01',
    name: 'Smt. Meenakshi Sundaram',
    email: 'regional.wr@aicte.gov.in',
    role: 'REGIONAL_OFFICER',
    designation: 'Regional Officer & Director',
    department: 'Western Regional Office (WRO), Mumbai',
    region: 'Western',
  },
  institution: {
    id: 'user-inst-01',
    name: 'Prof. Ananya Sen',
    email: 'registrar@bvit.ac.in',
    role: 'INSTITUTION',
    designation: 'Registrar',
    department: 'Administration',
    region: 'Western',
    institutionId: 'inst-bvit-pune',
    institutionName: 'Bharati Vidyapeeth Institute of Technology',
  },
};

let currentActiveUser: User = DEMO_USERS.admin;

// Seeded Applications
let applications: Application[] = [
  {
    id: 'AICTE-2026-WR-10892',
    institutionId: 'inst-bvit-pune',
    institutionName: 'Bharati Vidyapeeth Institute of Technology',
    institutionAddress: 'Sector 7, CBD Belapur, Navi Mumbai / Pune Campus, Maharashtra',
    institutionCode: 'BVIT-5124',
    region: 'Western',
    applicationType: 'Extension of Approval (EoA)',
    workflowRoute: 'Scrutiny + EVC',
    currentStage: 'SCRUTINY',
    stageStatus: 'IN_PROGRESS',
    overallStatus: 'Under Scrutiny',
    assignedOfficerId: 'user-scrutiny-01',
    assignedOfficerName: 'Dr. Ramesh Iyer',
    submissionDate: '2026-10-18T09:30:00.000Z',
    dueDate: '2026-10-31T17:00:00.000Z',
    ageingDays: 10,
    isOverdue: false,
    remarks: 'EoA renewal request with expansion in Computer Engineering (AI & Data Science).',
    intakeProposed: 480,
    programsList: ['Computer Engineering', 'Information Technology', 'Civil Engineering', 'Mechanical Engineering'],
    documents: [
      { id: 'doc-1', name: 'Registered Land Lease Deed (30 Years)', category: 'Land & Building', status: 'VERIFIED', fileUrl: '/docs/land_lease.pdf', fileSize: '4.2 MB', uploadedAt: '2026-10-18T10:00:00.000Z', expiryDate: '2045-12-31' },
      { id: 'doc-2', name: 'Building Completion & Occupancy Certificate', category: 'Land & Building', status: 'VERIFIED', fileUrl: '/docs/occupancy.pdf', fileSize: '2.8 MB', uploadedAt: '2026-10-18T10:05:00.000Z' },
      { id: 'doc-3', name: 'State Fire Advisory NOC Certificate', category: 'Land & Building', status: 'DEFICIENT', fileUrl: '/docs/fire_noc.pdf', fileSize: '1.4 MB', uploadedAt: '2026-10-18T10:10:00.000Z', remarks: 'NOC validity expired on 30 Sept 2026; renewal endorsement missing.' },
      { id: 'doc-4', name: 'Faculty Cadre Ratio & Pay Commission Undertaking', category: 'Faculty & Cadre', status: 'PENDING', fileUrl: '/docs/faculty_cadre.pdf', fileSize: '3.1 MB', uploadedAt: '2026-10-18T10:12:00.000Z' },
      { id: 'doc-5', name: 'Annual Audited Financial Statements (FY 2025-26)', category: 'Financial & Audit', status: 'VERIFIED', fileUrl: '/docs/audit_report.pdf', fileSize: '5.6 MB', uploadedAt: '2026-10-18T10:15:00.000Z' },
      { id: 'doc-6', name: 'Anti-Ragging Statutory Undertaking', category: 'Undertakings', status: 'VERIFIED', fileUrl: '/docs/anti_ragging.pdf', fileSize: '850 KB', uploadedAt: '2026-10-18T10:20:00.000Z' },
    ],
    deficiencies: [
      {
        id: 'def-101',
        documentId: 'doc-3',
        documentName: 'State Fire Advisory NOC Certificate',
        category: 'Fire Safety',
        description: 'The uploaded Fire NOC is expired as of 30 Sept 2026. Please upload current valid Fire Safety NOC or municipal renewal receipt.',
        severity: 'HIGH',
        status: 'OPEN',
        raisedBy: 'Dr. Ramesh Iyer',
        raisedAt: '2026-10-22T14:30:00.000Z',
      },
    ],
    timeline: [
      { id: 't-1', stage: 'SUBMISSION', stageName: 'Application Submission', status: 'COMPLETED', enteredAt: '2026-10-18T09:30:00.000Z', completedAt: '2026-10-18T09:30:00.000Z', actorId: 'user-inst-01', actorName: 'Prof. Ananya Sen', actorRole: 'INSTITUTION', action: 'SUBMIT', remarks: 'Application dossier submitted along with fee receipt.' },
      { id: 't-2', stage: 'INITIAL_SCREENING', stageName: 'Initial Screening & Assignment', status: 'COMPLETED', enteredAt: '2026-10-18T09:35:00.000Z', completedAt: '2026-10-19T11:20:00.000Z', actorId: 'user-regional-01', actorName: 'Smt. Meenakshi Sundaram', actorRole: 'REGIONAL_OFFICER', action: 'ASSIGN', remarks: 'Screening passed; assigned to Senior Officer Dr. Ramesh Iyer for scrutiny.' },
      { id: 't-3', stage: 'SCRUTINY', stageName: 'Technical Scrutiny', status: 'IN_PROGRESS', enteredAt: '2026-10-19T11:20:00.000Z', actorId: 'user-scrutiny-01', actorName: 'Dr. Ramesh Iyer', actorRole: 'SCRUTINY_OFFICER', action: 'START_SCRUTINY', remarks: 'Desk scrutiny underway. Fire NOC found expired; deficiency issued.' },
    ],
    updatedAt: '2026-10-22T14:30:00.000Z',
  },
  {
    id: 'AICTE-2026-WR-10895',
    institutionId: 'inst-kjsce-mumbai',
    institutionName: 'K.J. Somaiya College of Engineering (Autonomous)',
    institutionAddress: 'Vidyavihar East, Mumbai, Maharashtra 400077',
    institutionCode: 'KJSCE-3108',
    region: 'Western',
    applicationType: 'Extension of Approval (EoA)',
    workflowRoute: 'Only Scrutiny',
    currentStage: 'CLOSED',
    stageStatus: 'COMPLETED',
    overallStatus: 'Approved',
    assignedOfficerId: 'user-scrutiny-01',
    assignedOfficerName: 'Dr. Ramesh Iyer',
    submissionDate: '2026-10-05T10:00:00.000Z',
    dueDate: '2026-10-20T17:00:00.000Z',
    ageingDays: 14,
    isOverdue: false,
    remarks: 'Autonomous NAAC A+ institution EoA renewal granted.',
    intakeProposed: 660,
    programsList: ['Artificial Intelligence', 'Electronics & Telecom', 'Computer Engineering'],
    documents: [
      { id: 'doc-k1', name: 'Autonomous Status Approval Letter', category: 'Affiliation & NOC', status: 'VERIFIED', fileUrl: '/docs/auto_ugc.pdf', fileSize: '1.9 MB', uploadedAt: '2026-10-05T10:10:00.000Z' },
      { id: 'doc-k2', name: 'NBA Accreditation Certificates (Tier-I)', category: 'Affiliation & NOC', status: 'VERIFIED', fileUrl: '/docs/nba.pdf', fileSize: '3.4 MB', uploadedAt: '2026-10-05T10:12:00.000Z' },
    ],
    deficiencies: [],
    timeline: [
      { id: 'tk-1', stage: 'SUBMISSION', stageName: 'Application Submission', status: 'COMPLETED', enteredAt: '2026-10-05T10:00:00.000Z', completedAt: '2026-10-05T10:00:00.000Z', actorId: 'inst-kjsce', actorName: 'Dean Academics', actorRole: 'INSTITUTION', action: 'SUBMIT', remarks: 'EoA self-disclosure submission.' },
      { id: 'tk-2', stage: 'SCRUTINY', stageName: 'Technical Scrutiny', status: 'COMPLETED', enteredAt: '2026-10-07T09:00:00.000Z', completedAt: '2026-10-12T16:00:00.000Z', actorId: 'user-scrutiny-01', actorName: 'Dr. Ramesh Iyer', actorRole: 'SCRUTINY_OFFICER', action: 'COMPLETE_SCRUTINY', remarks: 'All documents verified in order.' },
      { id: 'tk-3', stage: 'APPROVAL_COUNCIL', stageName: 'Executive Council Approval', status: 'COMPLETED', enteredAt: '2026-10-14T10:00:00.000Z', completedAt: '2026-10-19T14:00:00.000Z', actorId: 'user-admin-01', actorName: 'Dr. Arvind K. Sharma', actorRole: 'ADMIN', action: 'APPROVE', remarks: 'EoA granted for Academic Year 2026-27.' },
    ],
    updatedAt: '2026-10-19T14:00:00.000Z',
  },
  {
    id: 'AICTE-2026-WR-10899',
    institutionId: 'inst-vit-pune',
    institutionName: 'Vishwakarma Institute of Technology',
    institutionAddress: 'Bibwewadi, Pune, Maharashtra 411037',
    institutionCode: 'VIT-6112',
    region: 'Western',
    applicationType: 'Increase in Intake / New Course',
    workflowRoute: 'Scrutiny + EVC',
    currentStage: 'EVC_INSPECTION',
    stageStatus: 'PENDING',
    overallStatus: 'EVC Scheduled',
    assignedOfficerId: 'user-scrutiny-01',
    assignedOfficerName: 'Dr. Ramesh Iyer',
    submissionDate: '2026-10-10T11:00:00.000Z',
    dueDate: '2026-10-29T17:00:00.000Z',
    ageingDays: 18,
    isOverdue: false,
    remarks: 'Addition of B.Tech Robotics & Automation (60 seats). Scrutiny cleared; physical EVC visit scheduled.',
    intakeProposed: 780,
    programsList: ['Robotics & Automation', 'Computer Engineering', 'Instrumentation'],
    documents: [],
    deficiencies: [],
    evcVisit: {
      id: 'evc-2026-042',
      applicationId: 'AICTE-2026-WR-10899',
      institutionId: 'inst-vit-pune',
      institutionName: 'Vishwakarma Institute of Technology',
      region: 'Western',
      scheduledDate: '2026-10-30T10:00:00.000Z',
      committeeLeader: 'Prof. S. R. Kale (IIT Delhi)',
      committeeMembers: ['Dr. V. M. Deshmukh (COEP Tech Univ)', 'Er. Prakash Joshi (Industry Expert, Tata Motors)'],
      status: 'CONFIRMED',
      conflictFlag: false,
      inspectionScope: 'Physical verification of new Robotics Labs, computing equipment, and faculty ratios.',
      geoLatitude: 18.4636,
      geoLongitude: 73.8682,
    },
    timeline: [
      { id: 'tv-1', stage: 'SUBMISSION', stageName: 'Application Submission', status: 'COMPLETED', enteredAt: '2026-10-10T11:00:00.000Z', actorId: 'inst-vit', actorName: 'Principal VIT', actorRole: 'INSTITUTION', action: 'SUBMIT', remarks: 'Application for new program.' },
      { id: 'tv-2', stage: 'SCRUTINY', stageName: 'Technical Scrutiny', status: 'COMPLETED', enteredAt: '2026-10-12T10:00:00.000Z', completedAt: '2026-10-18T17:00:00.000Z', actorId: 'user-scrutiny-01', actorName: 'Dr. Ramesh Iyer', actorRole: 'SCRUTINY_OFFICER', action: 'COMPLETE_SCRUTINY', remarks: 'Desk scrutiny cleared. Recommended for EVC inspection.' },
      { id: 'tv-3', stage: 'EVC_SCHEDULING', stageName: 'EVC Scheduling', status: 'COMPLETED', enteredAt: '2026-10-19T10:00:00.000Z', completedAt: '2026-10-21T15:30:00.000Z', actorId: 'user-regional-01', actorName: 'Smt. Meenakshi Sundaram', actorRole: 'REGIONAL_OFFICER', action: 'SCHEDULE_EVC', remarks: '3-member inspection panel constituted for 30 Oct 2026.' },
    ],
    updatedAt: '2026-10-21T15:30:00.000Z',
  },
  {
    id: 'AICTE-2026-WR-10904',
    institutionId: 'inst-gpn-nagpur',
    institutionName: 'Government Polytechnic Nagpur',
    institutionAddress: 'Sadar, Nagpur, Maharashtra 440001',
    institutionCode: 'GPN-4008',
    region: 'Western',
    applicationType: 'Extension of Approval (EoA)',
    workflowRoute: 'Only Scrutiny',
    currentStage: 'DEFICIENCY_CORRECTION',
    stageStatus: 'RETURNED',
    overallStatus: 'Deficiency Raised',
    assignedOfficerId: 'user-scrutiny-01',
    assignedOfficerName: 'Dr. Ramesh Iyer',
    submissionDate: '2026-10-08T09:00:00.000Z',
    dueDate: '2026-10-24T17:00:00.000Z',
    ageingDays: 20,
    isOverdue: true,
    remarks: 'Discrepancy in faculty cadre ratio in Mechanical Dept. Cadre shortfall exceeds 20%.',
    intakeProposed: 360,
    programsList: ['Diploma in Civil', 'Diploma in Mechanical', 'Diploma in Electrical'],
    documents: [],
    deficiencies: [
      {
        id: 'def-102',
        category: 'Cadre Ratio',
        description: 'Professor/Associate Professor cadre ratio is deficient. Institution must submit state recruitment sanction or undertaking.',
        severity: 'HIGH',
        status: 'OPEN',
        raisedBy: 'Dr. Ramesh Iyer',
        raisedAt: '2026-10-17T11:00:00.000Z',
      },
    ],
    timeline: [
      { id: 'tg-1', stage: 'SUBMISSION', stageName: 'Submission', status: 'COMPLETED', enteredAt: '2026-10-08T09:00:00.000Z', actorId: 'inst-gpn', actorName: 'Principal', actorRole: 'INSTITUTION', action: 'SUBMIT', remarks: 'Submitted.' },
      { id: 'tg-2', stage: 'SCRUTINY', stageName: 'Scrutiny', status: 'RETURNED', enteredAt: '2026-10-10T09:00:00.000Z', completedAt: '2026-10-17T11:00:00.000Z', actorId: 'user-scrutiny-01', actorName: 'Dr. Ramesh Iyer', actorRole: 'SCRUTINY_OFFICER', action: 'RETURN_DEFICIENCY', remarks: 'Returned for cadre deficiency correction.' },
    ],
    updatedAt: '2026-10-17T11:00:00.000Z',
  },
  {
    id: 'AICTE-2026-NR-20411',
    institutionId: 'inst-dti-delhi',
    institutionName: 'Delhi Technological Institute of Science',
    institutionAddress: 'Sector 14, Dwarka, New Delhi 110078',
    institutionCode: 'DTI-1102',
    region: 'Northern',
    applicationType: 'New Institution Setup',
    workflowRoute: 'Scrutiny + EVC',
    currentStage: 'SCRUTINY',
    stageStatus: 'IN_PROGRESS',
    overallStatus: 'Under Scrutiny',
    assignedOfficerId: 'user-scrutiny-nr',
    assignedOfficerName: 'Dr. P. K. Gupta',
    submissionDate: '2026-10-15T12:00:00.000Z',
    dueDate: '2026-11-02T17:00:00.000Z',
    ageingDays: 13,
    isOverdue: false,
    remarks: 'Application for greenfield Engineering & Technology Institute in NCR.',
    intakeProposed: 300,
    programsList: ['Computer Science', 'Data Science', 'Electronics'],
    documents: [],
    deficiencies: [],
    timeline: [],
    updatedAt: '2026-10-16T10:00:00.000Z',
  },
  {
    id: 'AICTE-2026-SR-30122',
    institutionId: 'inst-ciat-chennai',
    institutionName: 'Chennai Institute of Advanced Technology',
    institutionAddress: 'OMR Road, Sholinganallur, Chennai, Tamil Nadu 600119',
    institutionCode: 'CIAT-2089',
    region: 'Southern',
    applicationType: 'Increase in Intake / New Course',
    workflowRoute: 'EVC + SAC/SHC',
    currentStage: 'SAC_SHC_REVIEW',
    stageStatus: 'IN_PROGRESS',
    overallStatus: 'Under SAC/SHC',
    assignedOfficerId: 'user-scrutiny-sr',
    assignedOfficerName: 'Dr. K. Swaminathan',
    submissionDate: '2026-09-28T10:00:00.000Z',
    dueDate: '2026-10-25T17:00:00.000Z',
    ageingDays: 30,
    isOverdue: true,
    remarks: 'EVC inspection report submitted with minor lab remarks. Under Standing Appellate Committee review.',
    intakeProposed: 420,
    programsList: ['Artificial Intelligence & Machine Learning', 'Electrical Engineering'],
    documents: [],
    deficiencies: [],
    timeline: [],
    updatedAt: '2026-10-24T16:00:00.000Z',
  },
  {
    id: 'AICTE-2026-ER-40501',
    institutionId: 'inst-ksm-odisha',
    institutionName: 'Kalinga School of Mines & Applied Tech',
    institutionAddress: 'Infocity Avenue, Chandaka, Bhubaneswar, Odisha 751024',
    institutionCode: 'KSM-7741',
    region: 'Eastern',
    applicationType: 'Change of Site / Location',
    workflowRoute: 'Only EVC',
    currentStage: 'INITIAL_SCREENING',
    stageStatus: 'PENDING',
    overallStatus: 'Submitted',
    assignedOfficerId: undefined,
    assignedOfficerName: undefined,
    submissionDate: '2026-10-25T14:30:00.000Z',
    dueDate: '2026-11-05T17:00:00.000Z',
    ageingDays: 3,
    isOverdue: false,
    remarks: 'Shifting campus to new 15-acre contiguous land parcel.',
    intakeProposed: 240,
    programsList: ['Mining Engineering', 'Metallurgical Engineering'],
    documents: [],
    deficiencies: [],
    timeline: [],
    updatedAt: '2026-10-25T14:30:00.000Z',
  },
  {
    id: 'AICTE-2026-WR-10915',
    institutionId: 'inst-dypatil-pune',
    institutionName: 'D.Y. Patil College of Engineering',
    institutionAddress: 'Sector 29, Akurdi, Pune, Maharashtra 411044',
    institutionCode: 'DYP-5021',
    region: 'Western',
    applicationType: 'Extension of Approval (EoA)',
    workflowRoute: 'Custom Route',
    currentStage: 'APPROVAL_COUNCIL',
    stageStatus: 'PENDING',
    overallStatus: 'Under SAC/SHC',
    assignedOfficerId: 'user-scrutiny-01',
    assignedOfficerName: 'Dr. Ramesh Iyer',
    submissionDate: '2026-10-02T11:00:00.000Z',
    dueDate: '2026-10-28T17:00:00.000Z',
    ageingDays: 26,
    isOverdue: true,
    remarks: 'Custom polytechnic dual-degree verification. Final Council sanction awaiting signature.',
    intakeProposed: 540,
    programsList: ['Electronics', 'Automobile Engineering', 'Civil'],
    documents: [],
    deficiencies: [],
    timeline: [],
    updatedAt: '2026-10-26T12:00:00.000Z',
  },
];

// Seeded Compliance Documents
let complianceDocuments: ComplianceRecord[] = [
  {
    id: 'comp-101',
    institutionId: 'inst-bvit-pune',
    institutionName: 'Bharati Vidyapeeth Institute of Technology',
    region: 'Western',
    documentType: 'Registered Land Lease Deed (30 Years)',
    category: 'Land & Lease',
    documentNumber: 'LLD-MH-2015-88941',
    issuedDate: '2015-05-15',
    expiryDate: '2045-05-14',
    renewalDeadline: '2044-11-14',
    submissionStatus: 'VERIFIED',
    responsiblePerson: 'Prof. Ananya Sen (Registrar)',
    fileSize: '4.2 MB',
    lastUpdated: '2026-10-18T10:00:00.000Z',
    notes: 'Registered sub-registrar deed in order.',
  },
  {
    id: 'comp-102',
    institutionId: 'inst-bvit-pune',
    institutionName: 'Bharati Vidyapeeth Institute of Technology',
    region: 'Western',
    documentType: 'State Fire Safety Advisory NOC',
    category: 'Safety NOC',
    documentNumber: 'FIRE-NOC-2023-7412',
    issuedDate: '2023-09-30',
    expiryDate: '2026-09-30',
    renewalDeadline: '2026-08-30',
    submissionStatus: 'EXPIRED',
    responsiblePerson: 'Safety Officer, BVIT Pune',
    fileSize: '1.4 MB',
    lastUpdated: '2026-10-22T14:30:00.000Z',
    notes: 'Expired 28 days ago. Immediate renewal submission mandated.',
  },
  {
    id: 'comp-103',
    institutionId: 'inst-bvit-pune',
    institutionName: 'Bharati Vidyapeeth Institute of Technology',
    region: 'Western',
    documentType: 'AICTE Anti-Ragging Statutory Undertaking',
    category: 'Statutory Undertaking',
    documentNumber: 'AR-UND-2026-01',
    issuedDate: '2026-08-01',
    expiryDate: '2027-07-31',
    renewalDeadline: '2027-06-30',
    submissionStatus: 'VERIFIED',
    responsiblePerson: 'Head Anti-Ragging Squad',
    fileSize: '850 KB',
    lastUpdated: '2026-10-18T10:20:00.000Z',
  },
  {
    id: 'comp-104',
    institutionId: 'inst-bvit-pune',
    institutionName: 'Bharati Vidyapeeth Institute of Technology',
    region: 'Western',
    documentType: 'Structural Stability Certificate',
    category: 'Land & Lease',
    documentNumber: 'SSC-ENG-2022-9901',
    issuedDate: '2022-11-15',
    expiryDate: '2026-11-14',
    renewalDeadline: '2026-10-14',
    submissionStatus: 'EXPIRING_SOON',
    responsiblePerson: 'Estate Manager',
    fileSize: '2.1 MB',
    lastUpdated: '2026-10-18T10:05:00.000Z',
    notes: 'Expiring in 17 days. Chartered engineer inspection report due.',
  },
  {
    id: 'comp-105',
    institutionId: 'inst-kjsce-mumbai',
    institutionName: 'K.J. Somaiya College of Engineering',
    region: 'Western',
    documentType: 'University Affiliation Order (AY 2026-27)',
    category: 'Affiliation',
    documentNumber: 'UOM-AFF-2026-441',
    issuedDate: '2026-06-10',
    expiryDate: '2027-05-31',
    renewalDeadline: '2027-04-30',
    submissionStatus: 'VERIFIED',
    responsiblePerson: 'Dr. S. K. Deshmukh',
    fileSize: '3.1 MB',
    lastUpdated: '2026-10-05T10:10:00.000Z',
  },
  {
    id: 'comp-106',
    institutionId: 'inst-vit-pune',
    institutionName: 'Vishwakarma Institute of Technology',
    region: 'Western',
    documentType: 'Pollution Control Board Consent to Operate (CTO)',
    category: 'Safety NOC',
    documentNumber: 'MPCB-CTO-2024-8821',
    issuedDate: '2024-03-01',
    expiryDate: '2026-11-05',
    renewalDeadline: '2026-10-05',
    submissionStatus: 'EXPIRING_SOON',
    responsiblePerson: 'Environmental In-charge',
    fileSize: '1.8 MB',
    lastUpdated: '2026-10-10T11:00:00.000Z',
  },
  {
    id: 'comp-107',
    institutionId: 'inst-gpn-nagpur',
    institutionName: 'Government Polytechnic Nagpur',
    region: 'Western',
    documentType: 'Faculty Cadre Ratio Compliance Undertaking',
    category: 'Statutory Undertaking',
    documentNumber: 'CADRE-UND-2026-90',
    issuedDate: '2026-10-01',
    expiryDate: '2027-09-30',
    renewalDeadline: '2027-08-30',
    submissionStatus: 'MISSING',
    responsiblePerson: 'Principal GPN',
    fileSize: '0 KB',
    lastUpdated: '2026-10-17T11:00:00.000Z',
    notes: 'Deficiency issued during scrutiny. Not yet submitted.',
  },
];

// Seeded EVC Visits
let evcVisits: EVCVisit[] = [
  {
    id: 'evc-2026-042',
    applicationId: 'AICTE-2026-WR-10899',
    institutionId: 'inst-vit-pune',
    institutionName: 'Vishwakarma Institute of Technology',
    region: 'Western',
    scheduledDate: '2026-10-30T10:00:00.000Z',
    committeeLeader: 'Prof. S. R. Kale (IIT Delhi)',
    committeeMembers: ['Dr. V. M. Deshmukh (COEP Tech Univ)', 'Er. Prakash Joshi (Industry Expert, Tata Motors)'],
    status: 'CONFIRMED',
    conflictFlag: false,
    inspectionScope: 'Physical verification of new Robotics Labs, computing equipment, and faculty ratios.',
    geoLatitude: 18.4636,
    geoLongitude: 73.8682,
  },
  {
    id: 'evc-2026-043',
    applicationId: 'AICTE-2026-WR-10892',
    institutionId: 'inst-bvit-pune',
    institutionName: 'Bharati Vidyapeeth Institute of Technology',
    region: 'Western',
    scheduledDate: '2026-11-04T09:30:00.000Z',
    committeeLeader: 'Dr. Anand Joshi (VNIT Nagpur)',
    committeeMembers: ['Dr. R. K. Shrivastava (SGSITS)', 'Er. Arvind Mehta (CII Representative)'],
    status: 'PROPOSED',
    conflictFlag: true,
    conflictNotes: 'Committee member Dr. R. K. Shrivastava served as external examiner at BVIT in 2025. Replacement member recommended.',
    inspectionScope: 'Verification of AI/Data Science hardware infrastructure and fire safety renewal.',
    geoLatitude: 19.0144,
    geoLongitude: 73.0416,
  },
  {
    id: 'evc-2026-039',
    applicationId: 'AICTE-2026-SR-30122',
    institutionId: 'inst-ciat-chennai',
    institutionName: 'Chennai Institute of Advanced Technology',
    region: 'Southern',
    scheduledDate: '2026-10-14T10:00:00.000Z',
    committeeLeader: 'Dr. G. Sundar (BITS Pilani)',
    committeeMembers: ['Dr. Meera Natarajan (Anna Univ)', 'Er. T. R. Rao (L&T Technology)'],
    status: 'INSPECTION_CONDUCTED',
    conflictFlag: false,
    inspectionScope: 'Physical verification of new lab wings and faculty attendance registers.',
    reportSummary: 'Infrastructure meets 92% of prescribed AICTE norms. Electrical lab earthing certificate to be regularised.',
    geoLatitude: 12.9010,
    geoLongitude: 80.2279,
  },
];

// Seeded Notifications
let notifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'OVERDUE',
    title: 'Scrutiny Overdue: Government Polytechnic Nagpur',
    message: 'Application AICTE-2026-WR-10904 is overdue by 4 days in deficiency correction.',
    priority: 'CRITICAL',
    targetRole: 'REGIONAL_OFFICER',
    targetRegion: 'Western',
    applicationId: 'AICTE-2026-WR-10904',
    dueDate: '2026-10-24T17:00:00.000Z',
    acknowledged: false,
    createdAt: '2026-10-25T08:00:00.000Z',
  },
  {
    id: 'notif-2',
    type: 'DEFICIENCY_RAISED',
    title: 'Deficiency Notice Issued: Fire Safety NOC',
    message: 'Scrutiny Officer Dr. Ramesh Iyer marked State Fire NOC expired for Bharati Vidyapeeth.',
    priority: 'HIGH',
    targetRole: 'INSTITUTION',
    targetInstitutionId: 'inst-bvit-pune',
    applicationId: 'AICTE-2026-WR-10892',
    dueDate: '2026-10-31T17:00:00.000Z',
    acknowledged: false,
    createdAt: '2026-10-22T14:35:00.000Z',
  },
  {
    id: 'notif-3',
    type: 'EVC_SCHEDULED',
    title: 'EVC Conflict Flagged: Committee Member Overlap',
    message: 'Proposed EVC visit for Bharati Vidyapeeth flagged potential committee conflict of interest.',
    priority: 'HIGH',
    targetRole: 'ADMIN',
    targetRegion: 'Western',
    applicationId: 'AICTE-2026-WR-10892',
    dueDate: '2026-11-04T09:30:00.000Z',
    acknowledged: false,
    createdAt: '2026-10-23T11:20:00.000Z',
  },
  {
    id: 'notif-4',
    type: 'DEADLINE_APPROACHING',
    title: 'Upcoming Scrutiny Deadline (3 Days Left)',
    message: 'Bharati Vidyapeeth EoA application scrutiny deadline is 31 Oct 2026.',
    priority: 'MEDIUM',
    targetRole: 'SCRUTINY_OFFICER',
    applicationId: 'AICTE-2026-WR-10892',
    dueDate: '2026-10-31T17:00:00.000Z',
    acknowledged: true,
    createdAt: '2026-10-28T09:00:00.000Z',
  },
  {
    id: 'notif-5',
    type: 'COMPLIANCE_EXPIRING',
    title: 'Structural Stability Certificate Expiring Soon',
    message: 'Bharati Vidyapeeth Structural Stability Certificate expires on 14 Nov 2026 (17 days remaining).',
    priority: 'MEDIUM',
    targetRole: 'INSTITUTION',
    targetInstitutionId: 'inst-bvit-pune',
    dueDate: '2026-11-14T23:59:59.000Z',
    acknowledged: false,
    createdAt: '2026-10-27T07:15:00.000Z',
  },
];

// Immutable Audit Logs
let auditLogs: AuditLogItem[] = [
  {
    id: 'audit-1001',
    timestamp: '2026-10-18T09:30:00.000Z',
    actorId: 'user-inst-01',
    actorName: 'Prof. Ananya Sen',
    actorRole: 'INSTITUTION',
    action: 'APPLICATION_SUBMITTED',
    entityType: 'APPLICATION',
    entityId: 'AICTE-2026-WR-10892',
    previousState: 'Draft',
    newState: 'Submitted',
    ipAddress: '115.112.44.82',
    remarks: 'Application submitted along with 6 compliance attachments.',
  },
  {
    id: 'audit-1002',
    timestamp: '2026-10-19T11:20:00.000Z',
    actorId: 'user-regional-01',
    actorName: 'Smt. Meenakshi Sundaram',
    actorRole: 'REGIONAL_OFFICER',
    action: 'OFFICER_ASSIGNED',
    entityType: 'APPLICATION',
    entityId: 'AICTE-2026-WR-10892',
    previousState: 'INITIAL_SCREENING',
    newState: 'SCRUTINY',
    ipAddress: '14.139.120.10',
    remarks: 'Assigned to Senior Officer Dr. Ramesh Iyer for scrutiny.',
  },
  {
    id: 'audit-1003',
    timestamp: '2026-10-22T14:30:00.000Z',
    actorId: 'user-scrutiny-01',
    actorName: 'Dr. Ramesh Iyer',
    actorRole: 'SCRUTINY_OFFICER',
    action: 'DEFICIENCY_ISSUED',
    entityType: 'APPLICATION',
    entityId: 'AICTE-2026-WR-10892',
    previousState: 'IN_PROGRESS',
    newState: 'DEFICIENCY_RAISED',
    ipAddress: '14.139.120.45',
    remarks: 'Fire safety NOC expired. Returned for immediate clarification.',
  },
  {
    id: 'audit-1004',
    timestamp: '2026-10-21T15:30:00.000Z',
    actorId: 'user-regional-01',
    actorName: 'Smt. Meenakshi Sundaram',
    actorRole: 'REGIONAL_OFFICER',
    action: 'EVC_SCHEDULED',
    entityType: 'EVC_VISIT',
    entityId: 'evc-2026-042',
    previousState: 'PROPOSED',
    newState: 'CONFIRMED',
    ipAddress: '14.139.120.10',
    remarks: 'EVC Committee panel confirmed for Vishwakarma Institute of Technology.',
  },
];

// Officer Workloads
const officerWorkloads: OfficerWorkload[] = [
  { id: 'user-scrutiny-01', name: 'Dr. Ramesh Iyer', role: 'SCRUTINY_OFFICER', region: 'Western', assignedCount: 14, pendingCount: 5, completedThisMonth: 12, overdueCount: 1, avgCompletionDays: 5.2, status: 'ACTIVE' },
  { id: 'user-scrutiny-02', name: 'Dr. Sunita Kulkarni', role: 'SCRUTINY_OFFICER', region: 'Western', assignedCount: 16, pendingCount: 8, completedThisMonth: 9, overdueCount: 2, avgCompletionDays: 6.8, status: 'OVERLOADED' },
  { id: 'user-scrutiny-03', name: 'Prof. Rajesh Bhave', role: 'SCRUTINY_OFFICER', region: 'Western', assignedCount: 10, pendingCount: 3, completedThisMonth: 11, overdueCount: 0, avgCompletionDays: 4.1, status: 'ACTIVE' },
  { id: 'user-scrutiny-nr', name: 'Dr. P. K. Gupta', role: 'SCRUTINY_OFFICER', region: 'Northern', assignedCount: 18, pendingCount: 7, completedThisMonth: 14, overdueCount: 1, avgCompletionDays: 5.5, status: 'ACTIVE' },
  { id: 'user-scrutiny-sr', name: 'Dr. K. Swaminathan', role: 'SCRUTINY_OFFICER', region: 'Southern', assignedCount: 12, pendingCount: 4, completedThisMonth: 15, overdueCount: 0, avgCompletionDays: 4.8, status: 'ACTIVE' },
];

const workflowEngine = new WorkflowEngine();

// Auth Middleware: Extracts user role from session/header or active user state
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const roleHeader = req.headers['x-demo-role'] as string;
  if (roleHeader && DEMO_USERS[roleHeader.toLowerCase()]) {
    req.user = DEMO_USERS[roleHeader.toLowerCase()];
  } else {
    req.user = currentActiveUser;
  }
  next();
}

// Extends Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

app.use(authenticateUser);

// ---------------- REST API ROUTES ----------------

// 1. Auth & Current Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({
    user: req.user,
    availableRoles: Object.values(DEMO_USERS),
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, email } = req.body;
  let key: string | undefined;

  if (email) {
    key = Object.keys(DEMO_USERS).find((k) => DEMO_USERS[k].email.toLowerCase() === email.toLowerCase());
  }
  if (!key && role) {
    key = Object.keys(DEMO_USERS).find((k) => DEMO_USERS[k].role === role || k.toLowerCase() === role?.toLowerCase());
  }

  if (key) {
    currentActiveUser = DEMO_USERS[key];
    res.json({ success: true, user: currentActiveUser, roleKey: key });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please select an authorized persona or provide a valid government/institutional email.',
    });
  }
});

app.post('/api/auth/switch-demo-role', (req: Request, res: Response) => {
  const { roleKey } = req.body;
  if (DEMO_USERS[roleKey]) {
    currentActiveUser = DEMO_USERS[roleKey];
    res.json({ success: true, user: currentActiveUser });
  } else {
    res.status(400).json({ success: false, message: 'Role key not found' });
  }
});

// 2. Dashboard Summary (Role-Scoped!)
app.get('/api/dashboard/summary', (req: Request, res: Response) => {
  const user = req.user!;

  // Scope applications based on role
  let scopedApps = applications;
  if (user.role === 'INSTITUTION') {
    scopedApps = applications.filter((a) => a.institutionId === user.institutionId);
  } else if (user.role === 'REGIONAL_OFFICER' && user.region) {
    scopedApps = applications.filter((a) => a.region === user.region);
  } else if (user.role === 'SCRUTINY_OFFICER') {
    // For scrutiny officer, applications assigned to him or unassigned in his region
    scopedApps = applications.filter((a) => a.assignedOfficerId === user.id || (a.region === user.region && a.currentStage === 'SCRUTINY'));
  }

  const total = scopedApps.length;
  const pending = scopedApps.filter((a) => a.stageStatus !== 'COMPLETED' && a.overallStatus !== 'Approved' && a.overallStatus !== 'Closed').length;
  const overdue = scopedApps.filter((a) => a.isOverdue).length;

  const scopedEvc = user.role === 'INSTITUTION'
    ? evcVisits.filter((e) => e.institutionId === user.institutionId)
    : user.role === 'REGIONAL_OFFICER'
    ? evcVisits.filter((e) => e.region === user.region)
    : evcVisits;

  const scopedDocs = user.role === 'INSTITUTION'
    ? complianceDocuments.filter((d) => d.institutionId === user.institutionId)
    : user.role === 'REGIONAL_OFFICER'
    ? complianceDocuments.filter((d) => d.region === user.region)
    : complianceDocuments;

  const expiringSoonDocs = scopedDocs.filter((d) => d.submissionStatus === 'EXPIRING_SOON' || d.submissionStatus === 'EXPIRED').length;
  const verifiedDocs = scopedDocs.filter((d) => d.submissionStatus === 'VERIFIED').length;
  const complianceRate = scopedDocs.length > 0 ? Math.round((verifiedDocs / scopedDocs.length) * 100) : 100;

  // Stage distribution
  const stageCounts: Record<string, number> = {};
  for (const a of scopedApps) {
    stageCounts[a.currentStage] = (stageCounts[a.currentStage] || 0) + 1;
  }
  const stageDistribution = Object.entries(stageCounts).map(([stage, count]) => {
    let color = '#321B35';
    if (stage === 'SCRUTINY') color = '#F2B544';
    if (stage === 'EVC_INSPECTION') color = '#27845A';
    if (stage === 'DEFICIENCY_CORRECTION') color = '#C44949';
    if (stage === 'SAC_SHC_REVIEW') color = '#C58A16';
    return { stage, count, color };
  });

  // Region distribution
  const regions: Region[] = ['Western', 'Northern', 'Southern', 'Eastern', 'Central', 'South-Western'];
  const regionDistribution = regions.map((reg) => {
    const list = applications.filter((a) => a.region === reg);
    return {
      region: reg,
      pending: list.filter((a) => a.stageStatus !== 'COMPLETED').length,
      completed: list.filter((a) => a.stageStatus === 'COMPLETED' || a.overallStatus === 'Approved').length,
      overdue: list.filter((a) => a.isOverdue).length,
    };
  });

  // Ageing Buckets
  const ageingBuckets = [
    { range: '0-7 Days (Within SLA)', count: scopedApps.filter((a) => a.ageingDays <= 7).length, percentage: 0 },
    { range: '8-15 Days', count: scopedApps.filter((a) => a.ageingDays > 7 && a.ageingDays <= 15).length, percentage: 0 },
    { range: '16-30 Days', count: scopedApps.filter((a) => a.ageingDays > 15 && a.ageingDays <= 30).length, percentage: 0 },
    { range: '> 30 Days (Overdue Alert)', count: scopedApps.filter((a) => a.ageingDays > 30).length, percentage: 0 },
  ];
  const totalBucket = ageingBuckets.reduce((acc, b) => acc + b.count, 0) || 1;
  ageingBuckets.forEach((b) => (b.percentage = Math.round((b.count / totalBucket) * 100)));

  // Upcoming deadlines
  const upcomingDeadlines = scopedApps
    .filter((a) => a.dueDate)
    .map((a) => {
      const diffMs = new Date(a.dueDate).getTime() - Date.now();
      const daysLeft = Math.ceil(diffMs / 86400000);
      return {
        id: a.id,
        title: `${a.applicationType} - ${a.currentStage}`,
        institution: a.institutionName,
        dueDate: a.dueDate,
        daysLeft,
        isOverdue: daysLeft < 0,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  const scopedNotifications = notifications.filter((n) => {
    if (user.role === 'INSTITUTION') return n.targetInstitutionId === user.institutionId || n.targetRole === 'INSTITUTION';
    if (user.role === 'REGIONAL_OFFICER') return n.targetRegion === user.region || n.targetRole === 'REGIONAL_OFFICER';
    if (user.role === 'SCRUTINY_OFFICER') return n.targetRole === 'SCRUTINY_OFFICER' || n.targetRegion === user.region;
    return true;
  });

  const summary: DashboardSummary = {
    totalApplications: total,
    pendingCount: pending,
    overdueCount: overdue,
    evcVisitsScheduled: scopedEvc.length,
    documentsExpiringSoon: expiringSoonDocs,
    complianceRate,
    stageDistribution,
    regionDistribution,
    ageingBuckets,
    upcomingDeadlines,
    recentActivities: auditLogs.slice(0, 8),
    urgentNotifications: scopedNotifications.slice(0, 5),
  };

  res.json(summary);
});

// 3. Applications List (Search, Filter, Pagination, Role Enforcement)
app.get('/api/applications', (req: Request, res: Response) => {
  const user = req.user!;
  const {
    search,
    region,
    stage,
    status,
    applicationType,
    workflowRoute,
    isOverdue,
    assignedToMe,
    page = '1',
    limit = '10',
  } = req.query;

  let filtered = [...applications];

  // RBAC SCOPE GUARD:
  if (user.role === 'INSTITUTION') {
    // Institutions MUST ONLY see their own applications!
    filtered = filtered.filter((a) => a.institutionId === user.institutionId);
  } else if (user.role === 'REGIONAL_OFFICER') {
    // Regional Officers restricted to their assigned region!
    filtered = filtered.filter((a) => a.region === user.region);
  } else if (user.role === 'SCRUTINY_OFFICER') {
    if (assignedToMe === 'true') {
      filtered = filtered.filter((a) => a.assignedOfficerId === user.id);
    } else {
      // In scrutiny portal, show cases assigned to officer or pending scrutiny in their region
      filtered = filtered.filter((a) => a.assignedOfficerId === user.id || a.region === user.region);
    }
  }

  // Query parameter filters
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.id.toLowerCase().includes(s) ||
        a.institutionName.toLowerCase().includes(s) ||
        a.institutionCode.toLowerCase().includes(s)
    );
  }

  if (region && typeof region === 'string' && region !== 'ALL') {
    filtered = filtered.filter((a) => a.region === region);
  }

  if (stage && typeof stage === 'string' && stage !== 'ALL') {
    filtered = filtered.filter((a) => a.currentStage === stage);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    filtered = filtered.filter((a) => a.overallStatus === status);
  }

  if (applicationType && typeof applicationType === 'string' && applicationType !== 'ALL') {
    filtered = filtered.filter((a) => a.applicationType === applicationType);
  }

  if (workflowRoute && typeof workflowRoute === 'string' && workflowRoute !== 'ALL') {
    filtered = filtered.filter((a) => a.workflowRoute === workflowRoute);
  }

  if (isOverdue === 'true') {
    filtered = filtered.filter((a) => a.isOverdue);
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const pageSize = parseInt(limit as string, 10) || 10;
  const total = filtered.length;
  const paginated = filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  res.json({
    data: paginated,
    pagination: {
      total,
      page: pageNum,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// 4. Get Application by ID
app.get('/api/applications/:id', (req: Request, res: Response) => {
  const user = req.user!;
  const appItem = applications.find((a) => a.id === req.params.id);

  if (!appItem) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Security check: institutions cannot view other institutions' applications
  if (user.role === 'INSTITUTION' && appItem.institutionId !== user.institutionId) {
    return res.status(403).json({ error: 'Access Denied: You cannot view another institution’s confidential records.' });
  }

  // Regional officer check
  if (user.role === 'REGIONAL_OFFICER' && appItem.region !== user.region) {
    return res.status(403).json({ error: `Access Denied: This application belongs to the ${appItem.region} region.` });
  }

  res.json(appItem);
});

// 5. Create New Application (INSTITUTION ONLY!)
app.post('/api/applications', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'INSTITUTION') {
    return res.status(403).json({
      error: 'Access Denied: Only authenticated institutions are authorized to submit new AICTE applications.',
    });
  }

  const { applicationType, workflowRoute, intakeProposed, programsList, remarks, isDraft } = req.body;

  if (!applicationType) {
    return res.status(400).json({ error: 'applicationType is required' });
  }

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const regionCode = user.region ? user.region.slice(0, 2).toUpperCase() : 'WR';
  const newId = `AICTE-2026-${regionCode}-${randomNum}`;

  const newApp: Application = {
    id: newId,
    institutionId: user.institutionId || 'inst-user-01',
    institutionName: user.institutionName || 'Demo Technical Institute',
    institutionAddress: 'Campus Road, Maharashtra',
    institutionCode: 'DTI-' + randomNum.toString().slice(0, 4),
    region: user.region || 'Western',
    applicationType: applicationType,
    workflowRoute: workflowRoute || 'Scrutiny + EVC',
    currentStage: isDraft ? 'SUBMISSION' : 'INITIAL_SCREENING',
    stageStatus: isDraft ? 'PENDING' : 'IN_PROGRESS',
    overallStatus: isDraft ? 'Draft' : 'Submitted',
    submissionDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    ageingDays: 0,
    isOverdue: false,
    remarks: remarks || 'Initial application submitted through institutional portal.',
    intakeProposed: intakeProposed || 300,
    programsList: Array.isArray(programsList) && programsList.length ? programsList : ['Computer Science & Engineering'],
    documents: [
      { id: `doc-${Date.now()}-1`, name: 'Land Title / Lease Agreement', category: 'Land & Building', status: 'PENDING', fileUrl: '/docs/sample_land.pdf', fileSize: '2.5 MB', uploadedAt: new Date().toISOString() },
      { id: `doc-${Date.now()}-2`, name: 'Anti-Ragging Undertaking', category: 'Undertakings', status: 'VERIFIED', fileUrl: '/docs/anti_ragging.pdf', fileSize: '850 KB', uploadedAt: new Date().toISOString() },
    ],
    deficiencies: [],
    timeline: [
      {
        id: `t-${Date.now()}`,
        stage: 'SUBMISSION',
        stageName: 'Application Submission',
        status: 'COMPLETED',
        enteredAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: isDraft ? 'SAVE_DRAFT' : 'SUBMIT',
        remarks: isDraft ? 'Application draft saved.' : 'Application submitted with supporting certificates.',
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  applications.unshift(newApp);

  // Immutable audit log
  auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: isDraft ? 'APPLICATION_DRAFTED' : 'APPLICATION_SUBMITTED',
    entityType: 'APPLICATION',
    entityId: newId,
    previousState: 'None',
    newState: isDraft ? 'Draft' : 'Submitted',
    ipAddress: req.ip || '127.0.0.1',
    remarks: `Application ${newId} created by ${user.name}.`,
  });

  res.status(201).json(newApp);
});

// 6. Execute Workflow Action (Server-side transition validation & concurrency safe)
app.post('/api/applications/:id/actions', (req: Request, res: Response) => {
  const user = req.user!;
  const appItem = applications.find((a) => a.id === req.params.id);

  if (!appItem) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const { action, remarks, payload } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action parameter is required.' });
  }

  // Transition validation
  const transitionResult = workflowEngine.executeTransition(appItem, {
    actor: user,
    action,
    remarks: remarks || '',
    additionalPayload: payload,
  });

  if (!transitionResult.success) {
    return res.status(422).json({
      error: 'Workflow Rule Violation',
      message: transitionResult.message,
    });
  }

  const previousState = `${appItem.currentStage} (${appItem.stageStatus})`;

  // Mutate application state atomically
  if (transitionResult.nextStage) {
    appItem.currentStage = transitionResult.nextStage;
  }
  if (transitionResult.nextStageStatus) {
    appItem.stageStatus = transitionResult.nextStageStatus;
  }
  if (transitionResult.overallStatus) {
    appItem.overallStatus = transitionResult.overallStatus;
  }
  appItem.updatedAt = new Date().toISOString();

  // If assigning officer
  if (action === 'ASSIGN' && payload?.officerId && payload?.officerName) {
    appItem.assignedOfficerId = payload.officerId;
    appItem.assignedOfficerName = payload.officerName;
  }

  // Append to timeline
  const timelineEvent = {
    id: `tl-${Date.now()}`,
    stage: appItem.currentStage,
    stageName: appItem.currentStage.replace(/_/g, ' '),
    status: appItem.stageStatus,
    enteredAt: new Date().toISOString(),
    completedAt: ['COMPLETE_SCRUTINY', 'APPROVE', 'REJECT', 'CLOSE'].includes(action) ? new Date().toISOString() : undefined,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action,
    remarks: remarks || transitionResult.message,
  };
  appItem.timeline.push(timelineEvent);

  // Immutable audit log
  auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action,
    entityType: 'APPLICATION',
    entityId: appItem.id,
    previousState,
    newState: `${appItem.currentStage} (${appItem.stageStatus})`,
    ipAddress: req.ip || '127.0.0.1',
    remarks: remarks || transitionResult.message,
  });

  res.json({
    success: true,
    message: transitionResult.message,
    application: appItem,
  });
});

// 7. Deficiencies: Raise Deficiency (Scrutiny Officer / Admin)
app.post('/api/applications/:id/deficiencies', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'SCRUTINY_OFFICER' && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only Scrutiny Officers or Administrators can raise formal deficiencies.' });
  }

  const appItem = applications.find((a) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  const { category, description, severity, documentId, documentName } = req.body;
  if (!description || description.trim().length < 5) {
    return res.status(400).json({ error: 'Clear description of deficiency is mandatory.' });
  }

  const newDef = {
    id: `def-${Date.now()}`,
    category: category || 'Document Compliance',
    description,
    severity: severity || 'HIGH',
    status: 'OPEN' as const,
    documentId,
    documentName,
    raisedBy: user.name,
    raisedAt: new Date().toISOString(),
  };

  appItem.deficiencies.push(newDef);

  // If a document was flagged, update document status to DEFICIENT
  if (documentId) {
    const doc = appItem.documents.find((d) => d.id === documentId);
    if (doc) {
      doc.status = 'DEFICIENT';
      doc.remarks = description;
    }
  }

  // Push notification for the institution
  notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'DEFICIENCY_RAISED',
    title: `Deficiency Raised on ${appItem.id}`,
    message: `${user.name} reported deficiency: ${description}`,
    priority: severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
    targetRole: 'INSTITUTION',
    targetInstitutionId: appItem.institutionId,
    applicationId: appItem.id,
    dueDate: appItem.dueDate,
    acknowledged: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, deficiency: newDef, application: appItem });
});

// 8. Deficiencies: Institution Clarification / Resubmission
app.post('/api/applications/:id/deficiencies/:defId/clarify', (req: Request, res: Response) => {
  const user = req.user!;
  const appItem = applications.find((a) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'Application not found' });

  if (user.role !== 'INSTITUTION' && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only Institution or Admin can submit clarification response.' });
  }

  const def = appItem.deficiencies.find((d) => d.id === req.params.defId);
  if (!def) return res.status(404).json({ error: 'Deficiency record not found' });

  const { responseText } = req.body;
  if (!responseText || responseText.trim().length < 3) {
    return res.status(400).json({ error: 'Clarification explanation is required.' });
  }

  def.status = 'CLARIFIED';
  def.institutionResponse = responseText;
  def.responseSubmittedAt = new Date().toISOString();

  res.json({ success: true, deficiency: def });
});

// 9. Workflows (Configurable approval routes)
app.get('/api/workflows', (_req: Request, res: Response) => {
  res.json(DEFAULT_WORKFLOW_TEMPLATES);
});

app.post('/api/workflows', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access Denied: Only System Administrators can configure workflow routes.' });
  }

  const { name, description, stages, applicableTypes } = req.body;
  const newTemplate: WorkflowTemplate = {
    id: `wf-${Date.now()}`,
    name: name || 'Custom Route',
    description: description || 'Configured via Workflow Admin Studio',
    applicableTypes: applicableTypes || ['Extension of Approval (EoA)'],
    isActive: true,
    stages: stages || [],
  };

  DEFAULT_WORKFLOW_TEMPLATES.push(newTemplate);

  auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: 'WORKFLOW_CONFIGURED',
    entityType: 'WORKFLOW',
    entityId: newTemplate.id,
    previousState: 'None',
    newState: newTemplate.name,
    ipAddress: req.ip || '127.0.0.1',
    remarks: `Workflow template "${newTemplate.name}" created with ${newTemplate.stages.length} stages.`,
  });

  res.status(201).json(newTemplate);
});

// 10. Compliance Register
app.get('/api/compliance/documents', (req: Request, res: Response) => {
  const user = req.user!;
  let filtered = [...complianceDocuments];

  if (user.role === 'INSTITUTION') {
    filtered = filtered.filter((d) => d.institutionId === user.institutionId);
  } else if (user.role === 'REGIONAL_OFFICER' && user.region) {
    filtered = filtered.filter((d) => d.region === user.region);
  }

  res.json(filtered);
});

app.post('/api/compliance/documents', (req: Request, res: Response) => {
  const user = req.user!;
  const { documentType, category, documentNumber, issuedDate, expiryDate, notes } = req.body;

  const newDoc: ComplianceRecord = {
    id: `comp-${Date.now()}`,
    institutionId: user.institutionId || 'inst-bvit-pune',
    institutionName: user.institutionName || 'Bharati Vidyapeeth Institute of Technology',
    region: user.region || 'Western',
    documentType: documentType || 'Statutory Compliance Document',
    category: category || 'Land & Lease',
    documentNumber: documentNumber || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    issuedDate: issuedDate || new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || '2028-12-31',
    renewalDeadline: expiryDate ? new Date(new Date(expiryDate).getTime() - 60 * 86400000).toISOString().split('T')[0] : '2028-10-31',
    submissionStatus: 'SUBMITTED',
    responsiblePerson: user.name,
    fileSize: '2.4 MB',
    lastUpdated: new Date().toISOString(),
    notes,
  };

  complianceDocuments.unshift(newDoc);
  res.status(201).json(newDoc);
});

// 11. EVC Scheduler
app.get('/api/evc-visits', (req: Request, res: Response) => {
  const user = req.user!;
  let filtered = [...evcVisits];

  if (user.role === 'INSTITUTION') {
    filtered = filtered.filter((e) => e.institutionId === user.institutionId);
  } else if (user.role === 'REGIONAL_OFFICER') {
    filtered = filtered.filter((e) => e.region === user.region);
  }

  res.json(filtered);
});

app.post('/api/evc-visits', (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'REGIONAL_OFFICER' && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only Regional Officers or Administrators can schedule EVC visits.' });
  }

  const { applicationId, scheduledDate, committeeLeader, committeeMembers, inspectionScope, conflictFlag, conflictNotes } = req.body;
  const appItem = applications.find((a) => a.id === applicationId);

  const newVisit: EVCVisit = {
    id: `evc-${Date.now()}`,
    applicationId: applicationId || 'AICTE-2026-WR-10892',
    institutionId: appItem ? appItem.institutionId : 'inst-bvit-pune',
    institutionName: appItem ? appItem.institutionName : 'Bharati Vidyapeeth Institute of Technology',
    region: appItem ? appItem.region : (user.region || 'Western'),
    scheduledDate: scheduledDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    committeeLeader: committeeLeader || 'Prof. S. K. Mukherjee (IIT Bombay)',
    committeeMembers: committeeMembers || ['Dr. A. Verma (VNIT)', 'Er. M. Patil (Industry Expert)'],
    status: 'CONFIRMED',
    conflictFlag: !!conflictFlag,
    conflictNotes: conflictNotes || undefined,
    inspectionScope: inspectionScope || 'Physical infrastructure, lab equipment & faculty cadre verification.',
  };

  evcVisits.unshift(newVisit);

  if (appItem) {
    appItem.evcVisit = newVisit;
    appItem.currentStage = 'EVC_INSPECTION';
    appItem.stageStatus = 'PENDING';
    appItem.overallStatus = 'EVC Scheduled';
  }

  res.status(201).json(newVisit);
});

// 12. Officer Workloads
app.get('/api/officers', (_req: Request, res: Response) => {
  res.json(officerWorkloads);
});

// 13. Notifications & Alert Centre
app.get('/api/notifications', (req: Request, res: Response) => {
  const user = req.user!;
  const filtered = notifications.filter((n) => {
    if (user.role === 'INSTITUTION') return n.targetInstitutionId === user.institutionId || n.targetRole === 'INSTITUTION';
    if (user.role === 'REGIONAL_OFFICER') return n.targetRegion === user.region || n.targetRole === 'REGIONAL_OFFICER';
    if (user.role === 'SCRUTINY_OFFICER') return n.targetRole === 'SCRUTINY_OFFICER' || n.targetRegion === user.region;
    return true;
  });
  res.json(filtered);
});

app.patch('/api/notifications/:id/acknowledge', (req: Request, res: Response) => {
  const item = notifications.find((n) => n.id === req.params.id);
  if (item) {
    item.acknowledged = true;
    res.json(item);
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// 14. Audit Logs (Immutable)
app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json(auditLogs);
});

// 15. Unit Test Endpoint: Verifies Workflow Engine Rules
app.get('/api/tests/workflow', (_req: Request, res: Response) => {
  const testResults = runWorkflowEngineTests();
  res.json(testResults);
});

// 16. OpenAPI / Swagger Documentation endpoint
app.get('/api/openapi.json', (_req: Request, res: Response) => {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Aakalan — AICTE Approval & Compliance Intelligence Platform API',
      version: '1.0.0',
      description: 'REST APIs for AICTE Approval Workflows, Technical Scrutiny, EVC Scheduling, Compliance Registers, and RBAC.',
    },
    paths: {
      '/api/auth/me': { get: { summary: 'Get authenticated user session & current role' } },
      '/api/auth/login': { post: { summary: 'Login with role credentials' } },
      '/api/dashboard/summary': { get: { summary: 'Role-scoped dashboard KPI summary and analytics' } },
      '/api/applications': {
        get: { summary: 'List applications with search, region, stage, and overdue filters' },
        post: { summary: 'Submit new AICTE application (Institution role only)' },
      },
      '/api/applications/{id}': { get: { summary: 'Get application details by ID' } },
      '/api/applications/{id}/actions': { post: { summary: 'Execute state transition (assign, scrutiny, return, approve, etc.)' } },
      '/api/workflows': { get: { summary: 'List configurable route templates' }, post: { summary: 'Create custom route (Admin only)' } },
      '/api/compliance/documents': { get: { summary: 'List institutional compliance & statutory documents' } },
      '/api/evc-visits': { get: { summary: 'List scheduled EVC inspection visits' }, post: { summary: 'Schedule new EVC visit' } },
      '/api/notifications': { get: { summary: 'Get role-scoped alerts & SLA deadline notifications' } },
      '/api/audit-logs': { get: { summary: 'Query immutable system audit logs' } },
      '/api/tests/workflow': { get: { summary: 'Run automated workflow transition test suite' } },
    },
  };
  res.json(openApiSpec);
});

// 17. Voice Assistant Intelligence Endpoint
app.post('/api/voice/query', async (req: Request, res: Response) => {
  const { query, language = 'en' } = req.body;
  const user = req.user!;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string is required' });
  }

  const q = query.toLowerCase().trim();

  // Compute live context stats
  const totalApps = applications.length;
  const pendingApps = applications.filter(
    (a) => a.stageStatus !== 'COMPLETED' && a.overallStatus !== 'Approved' && a.overallStatus !== 'Closed'
  );
  const overdueApps = applications.filter((a) => a.isOverdue);
  const evcScheduled = evcVisits.filter((v) => v.status === 'CONFIRMED' || v.status === 'PROPOSED');
  const stageCounts: Record<string, number> = {};
  for (const a of applications) {
    stageCounts[a.currentStage] = (stageCounts[a.currentStage] || 0) + 1;
  }

  // Identify bottleneck stage
  let bottleneckStage = 'SCRUTINY';
  let maxStageCount = 0;
  for (const [st, count] of Object.entries(stageCounts)) {
    if (st !== 'CLOSED' && count > maxStageCount) {
      maxStageCount = count;
      bottleneckStage = st;
    }
  }

  // Western region stats
  const wrApps = applications.filter((a) => a.region === 'Western');
  const wrOverdue = wrApps.filter((a) => a.isOverdue);

  // Check for navigation commands
  let navPath: string | null = null;
  let navLabel: string | null = null;

  if (q.includes('workflow') || q.includes('route') || q.includes('stages') || q.includes('sla')) {
    navPath = '/admin/workflows';
    navLabel = 'Workflow Configuration Studio';
  } else if (q.includes('overdue') || q.includes('delay') || q.includes('late') || q.includes('vilambit')) {
    navPath = '/admin/applications';
    navLabel = 'Overdue Applications View';
  } else if (q.includes('evc') || q.includes('committee') || q.includes('inspection') || q.includes('daura')) {
    navPath = user.role === 'REGIONAL_OFFICER' ? '/regional/evc' : '/admin/evc';
    navLabel = 'EVC Committee Oversight';
  } else if (q.includes('compliance') || q.includes('lease') || q.includes('fire') || q.includes('patta')) {
    navPath = user.role === 'INSTITUTION' ? '/institution/documents' : '/admin/compliance';
    navLabel = 'Statutory Compliance Register';
  } else if (q.includes('officer') || q.includes('workload') || q.includes('staff') || q.includes('karmachari')) {
    navPath = '/admin/officers';
    navLabel = 'Scrutiny Officer Workload';
  } else if (q.includes('audit') || q.includes('log') || q.includes('trail')) {
    navPath = '/admin/audit-logs';
    navLabel = 'Immutable Audit Register';
  } else if (q.includes('new application') || q.includes('apply') || q.includes('naya aavedan')) {
    navPath = '/institution/new-application';
    navLabel = 'New Application Wizard';
  } else if (q.includes('all applications') || q.includes('application list') || q.includes('dossier')) {
    navPath = '/admin/applications';
    navLabel = 'National Applications Register';
  }

  // Check if Gemini API is available
  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are "Vaak", the official voice assistant for Aakalan — AICTE Approval & Compliance Intelligence Platform.
User: ${user.name} (Role: ${user.role}, Region: ${user.region || 'National HQ'}).
Current system facts:
- Total applications: ${totalApps} across 6 regional bureaus.
- Pending applications: ${pendingApps.length} in progress.
- Overdue cases: ${overdueApps.length} (${overdueApps.map((a) => `${a.institutionName} [${a.ageingDays}d]`).join(', ')}).
- Highest bottleneck stage: ${bottleneckStage} with ${maxStageCount} applications queued.
- Western Region workload: ${wrApps.length} applications, ${wrOverdue.length} overdue cases.
- Upcoming deadlines: Bharati Vidyapeeth due 31 Oct, Vishwakarma EVC scheduled 30 Oct.
- Configurable routes: Only Scrutiny, Scrutiny + EVC, EVC + SAC/SHC, Only EVC, Custom Route.

User query: "${query}"

Respond concisely (2-3 spoken sentences maximum).
If the user asks in Hindi or Hinglish, respond naturally in Hindi (or clean Hinglish).
If the user asks to navigate somewhere, acknowledge the navigation smoothly.
Do not format with bullet points; this text will be read aloud.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';
      return res.json({
        responseText: text,
        navigationPath: navPath,
        navigationLabel: navLabel,
        stats: {
          totalApplications: totalApps,
          pendingCount: pendingApps.length,
          overdueCount: overdueApps.length,
          bottleneckStage,
        },
      });
    } catch (err) {
      console.warn('Gemini live generation fallback engaged:', err);
    }
  }

  // Domain Grounded Rule-based Responder (English, Hindi, Hinglish)
  let responseText = '';
  const isHindi = language === 'hi' || q.includes('hai') || q.includes('kya') || q.includes('kitne') || q.includes('batao') || q.includes('dikhao');

  if (q.includes('pendency') || q.includes('pending') || q.includes('status') || q.includes('overall') || q.includes('kitne')) {
    if (isHindi) {
      responseText = `सिस्टम में कुल ${totalApps} आवेदनों में से ${pendingApps.length} मामले अभी लंबित हैं, और ${overdueApps.length} आवेदन समय-सीमा पार कर चुके हैं। सबसे बड़ा अवरोध ${bottleneckStage.replace(/_/g, ' ')} चरण में है।`;
    } else {
      responseText = `Overall pendency stands at ${pendingApps.length} pending cases out of ${totalApps} total applications across bureaus. ${overdueApps.length} cases are currently overdue, with ${bottleneckStage.replace(/_/g, ' ')} being the main bottleneck.`;
    }
  } else if (q.includes('overdue') || q.includes('deadline') || q.includes('late') || q.includes('vilambit')) {
    if (isHindi) {
      responseText = `वर्तमान में ${overdueApps.length} आवेदन समय-सीमा से अधिक हैं, जिनमें गवर्नमेंट पॉलिटेक्निक नागपुर और डी.वाई. पाटिल कॉलेज शामिल हैं। भारती विद्यापीठ की जांच की अंतिम तिथि 31 अक्टूबर है।`;
    } else {
      responseText = `There are ${overdueApps.length} overdue applications requiring intervention, including Government Polytechnic Nagpur and D.Y. Patil College. The next upcoming scrutiny deadline is Bharati Vidyapeeth on 31 October.`;
    }
  } else if (q.includes('western') || q.includes('region') || q.includes('workload') || q.includes('bottleneck') || q.includes('kshetra')) {
    if (isHindi) {
      responseText = `पश्चिमी क्षेत्र (Western Region) में सबसे अधिक ${wrApps.length} आवेदन हैं। स्क्रूटनी अधिकारियों पर सबसे अधिक भार है, जहां टेक्निकल स्क्रूटनी स्टेज में 3 मामले अटके हुए हैं।`;
    } else {
      responseText = `The Western Region handles the highest load with ${wrApps.length} applications and ${wrOverdue.length} overdue cases. The primary bottleneck is Technical Scrutiny, where officer workload is currently highest.`;
    }
  } else if (q.includes('workflow') || q.includes('route') || q.includes('rule') || q.includes('template')) {
    if (isHindi) {
      responseText = `आकलन प्लेटफॉर्म 5 प्रकार के अनुमोदन मार्गों का समर्थन करता है: केवल स्क्रूटनी, स्क्रूटनी प्लस EVC, EVC प्लस SAC/SHC, केवल EVC और कस्टम रूट। बिना अनिवार्य सत्यापन के कोई भी चरण छोड़ा नहीं जा सकता।`;
    } else {
      responseText = `Aakalan supports 5 configurable approval routes including Only Scrutiny, Scrutiny + EVC, EVC + SAC/SHC, Only EVC, and Custom Route. Stages cannot be bypassed unless authorized rules permit.`;
    }
  } else if (q.includes('evc') || q.includes('inspection') || q.includes('visit') || q.includes('daura')) {
    if (isHindi) {
      responseText = `कुल ${evcScheduled.length} विशेषज्ञ निरीक्षण (EVC) दौरे निर्धारित हैं। विश्वकर्मा इंस्टीट्यूट के लिए 30 अक्टूबर को समिति का दौरा तय किया गया है।`;
    } else {
      responseText = `There are ${evcScheduled.length} Expert Visit Committee inspections scheduled. The next on-site verification is for Vishwakarma Institute of Technology on 30 October.`;
    }
  } else if (navPath) {
    if (isHindi) {
      responseText = `${navLabel} पृष्ठ खोला जा रहा है।`;
    } else {
      responseText = `Navigating to ${navLabel} as requested.`;
    }
  } else {
    if (isHindi) {
      responseText = `आकलन वॉयस असिस्टेंट सक्रिय है। आप पेंडेंसी, क्षेत्रीय कार्यभार, ओवरड्यू मामलों, या वर्कफ़्लो कॉन्फ़िगरेशन के बारे में पूछ सकते हैं।`;
    } else {
      responseText = `Aakalan Voice Assistant is ready. You can ask about overall pendency, regional bottlenecks, overdue deadlines, or request navigation to any authorized page.`;
    }
  }

  res.json({
    responseText,
    navigationPath: navPath,
    navigationLabel: navLabel,
    stats: {
      totalApplications: totalApps,
      pendingCount: pendingApps.length,
      overdueCount: overdueApps.length,
      bottleneckStage,
    },
  });
});

// 18. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'Aakalan AICTE Engine', timestamp: new Date().toISOString() });
});

// Development vs Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite dev server in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aakalan Platform] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Aakalan Platform] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
