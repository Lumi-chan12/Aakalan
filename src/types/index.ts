export type UserRole = 'ADMIN' | 'SCRUTINY_OFFICER' | 'REGIONAL_OFFICER' | 'INSTITUTION';

export type Region = 'Western' | 'Northern' | 'Southern' | 'Eastern' | 'Central' | 'South-Western';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department?: string;
  region?: Region;
  institutionId?: string;
  institutionName?: string;
  avatarUrl?: string;
}

export type ApplicationType =
  | 'Extension of Approval (EoA)'
  | 'New Institution Setup'
  | 'Increase in Intake / New Course'
  | 'Change of Site / Location'
  | 'Closure / Merger';

export type WorkflowRouteType =
  | 'Only Scrutiny'
  | 'Scrutiny + EVC'
  | 'EVC + SAC/SHC'
  | 'Only EVC'
  | 'Custom Route';

export type StageId =
  | 'SUBMISSION'
  | 'INITIAL_SCREENING'
  | 'SCRUTINY'
  | 'DEFICIENCY_CORRECTION'
  | 'EVC_SCHEDULING'
  | 'EVC_INSPECTION'
  | 'SAC_SHC_REVIEW'
  | 'APPROVAL_COUNCIL'
  | 'CLOSED';

export type StageStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'RETURNED'
  | 'RESUBMITTED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'BYPASSED';

export type OverallStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Scrutiny'
  | 'Deficiency Raised'
  | 'Resubmitted'
  | 'EVC Scheduled'
  | 'EVC Completed'
  | 'Under SAC/SHC'
  | 'Approved'
  | 'Rejected'
  | 'Closed';

export interface WorkflowStageConfig {
  id: StageId;
  name: string;
  sequence: number;
  responsibleRole: UserRole;
  slaDays: number;
  isMandatory: boolean;
  canBypass: boolean;
  requiredDocuments: string[];
}

export interface WorkflowTemplate {
  id: string;
  name: WorkflowRouteType;
  description: string;
  applicableTypes: ApplicationType[];
  stages: WorkflowStageConfig[];
  isActive: boolean;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  category: 'Land & Building' | 'Faculty & Cadre' | 'Financial & Audit' | 'Affiliation & NOC' | 'Undertakings';
  status: 'VERIFIED' | 'DEFICIENT' | 'PENDING' | 'REJECTED';
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
  expiryDate?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

export interface Deficiency {
  id: string;
  documentId?: string;
  documentName?: string;
  category: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'CLARIFIED' | 'RESOLVED';
  raisedBy: string;
  raisedAt: string;
  institutionResponse?: string;
  responseSubmittedAt?: string;
  resolvedAt?: string;
}

export interface TimelineEvent {
  id: string;
  stage: StageId;
  stageName: string;
  status: StageStatus;
  enteredAt: string;
  completedAt?: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  remarks: string;
}

export interface EVCVisit {
  id: string;
  applicationId: string;
  institutionId: string;
  institutionName: string;
  region: Region;
  scheduledDate: string;
  committeeLeader: string;
  committeeMembers: string[];
  status: 'PROPOSED' | 'CONFIRMED' | 'INSPECTION_CONDUCTED' | 'REPORT_SUBMITTED' | 'CANCELLED';
  conflictFlag: boolean;
  conflictNotes?: string;
  inspectionScope: string;
  reportSummary?: string;
  videoEvidenceUrl?: string;
  geoLatitude?: number;
  geoLongitude?: number;
}

export interface Application {
  id: string; // e.g. AICTE-2026-WR-10892
  institutionId: string;
  institutionName: string;
  institutionAddress: string;
  institutionCode: string;
  region: Region;
  applicationType: ApplicationType;
  workflowRoute: WorkflowRouteType;
  currentStage: StageId;
  stageStatus: StageStatus;
  overallStatus: OverallStatus;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  submissionDate: string;
  dueDate: string;
  ageingDays: number;
  isOverdue: boolean;
  remarks: string;
  intakeProposed: number;
  programsList: string[];
  documents: ApplicationDocument[];
  deficiencies: Deficiency[];
  evcVisit?: EVCVisit;
  timeline: TimelineEvent[];
  updatedAt: string;
}

export interface ComplianceRecord {
  id: string;
  institutionId: string;
  institutionName: string;
  region: Region;
  documentType: string;
  category: 'Land & Lease' | 'Safety NOC' | 'Affiliation' | 'Statutory Undertaking' | 'Financial Audit';
  documentNumber: string;
  issuedDate: string;
  expiryDate: string;
  renewalDeadline: string;
  submissionStatus: 'SUBMITTED' | 'VERIFIED' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
  responsiblePerson: string;
  fileSize: string;
  lastUpdated: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  type: 'DEADLINE_APPROACHING' | 'OVERDUE' | 'DEFICIENCY_RAISED' | 'EVC_SCHEDULED' | 'STAGE_COMPLETED' | 'COMPLIANCE_EXPIRING' | 'ESCALATION';
  title: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetRole?: UserRole;
  targetRegion?: Region;
  targetInstitutionId?: string;
  applicationId?: string;
  dueDate?: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'APPLICATION' | 'WORKFLOW' | 'COMPLIANCE' | 'EVC_VISIT' | 'USER_ROLE';
  entityId: string;
  previousState?: string;
  newState?: string;
  ipAddress: string;
  remarks: string;
}

export interface OfficerWorkload {
  id: string;
  name: string;
  role: UserRole;
  region: Region;
  assignedCount: number;
  pendingCount: number;
  completedThisMonth: number;
  overdueCount: number;
  avgCompletionDays: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'OVERLOADED';
}

export interface DashboardSummary {
  totalApplications: number;
  pendingCount: number;
  overdueCount: number;
  evcVisitsScheduled: number;
  documentsExpiringSoon: number;
  complianceRate: number;
  stageDistribution: { stage: string; count: number; color: string }[];
  regionDistribution: { region: string; pending: number; completed: number; overdue: number }[];
  ageingBuckets: { range: string; count: number; percentage: number }[];
  upcomingDeadlines: { id: string; title: string; institution: string; dueDate: string; daysLeft: number; isOverdue: boolean }[];
  recentActivities: AuditLogItem[];
  urgentNotifications: NotificationItem[];
}
