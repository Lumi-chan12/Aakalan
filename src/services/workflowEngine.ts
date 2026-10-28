import {
  Application,
  StageId,
  StageStatus,
  User,
  UserRole,
  WorkflowRouteType,
  WorkflowTemplate,
} from '../types';

export interface WorkflowActionResult {
  success: boolean;
  message: string;
  nextStage?: StageId;
  nextStageStatus?: StageStatus;
  overallStatus?: Application['overallStatus'];
  validationErrors?: string[];
}

export interface TransitionContext {
  actor: User;
  action: string;
  remarks: string;
  additionalPayload?: Record<string, any>;
}

// Built-in Workflow Templates
export const DEFAULT_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'wf-scrutiny-evc',
    name: 'Scrutiny + EVC',
    description: 'Standard technical scrutiny followed by physical Expert Visit Committee (EVC) verification and SAC/SHC council review.',
    applicableTypes: ['Extension of Approval (EoA)', 'New Institution Setup', 'Increase in Intake / New Course'],
    isActive: true,
    stages: [
      { id: 'SUBMISSION', name: 'Application Submission', sequence: 1, responsibleRole: 'INSTITUTION', slaDays: 3, isMandatory: true, canBypass: false, requiredDocuments: ['Application Dossier'] },
      { id: 'INITIAL_SCREENING', name: 'Initial Screening & Assignment', sequence: 2, responsibleRole: 'REGIONAL_OFFICER', slaDays: 3, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'SCRUTINY', name: 'Technical Scrutiny', sequence: 3, responsibleRole: 'SCRUTINY_OFFICER', slaDays: 7, isMandatory: true, canBypass: false, requiredDocuments: ['Land & Building', 'Faculty Cadre', 'Fire Safety NOC'] },
      { id: 'EVC_SCHEDULING', name: 'EVC Committee Scheduling', sequence: 4, responsibleRole: 'REGIONAL_OFFICER', slaDays: 5, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'EVC_INSPECTION', name: 'On-Site EVC Inspection', sequence: 5, responsibleRole: 'REGIONAL_OFFICER', slaDays: 10, isMandatory: true, canBypass: false, requiredDocuments: ['EVC Inspection Report'] },
      { id: 'SAC_SHC_REVIEW', name: 'SAC / SHC Standing Hearing', sequence: 6, responsibleRole: 'ADMIN', slaDays: 7, isMandatory: true, canBypass: false, requiredDocuments: ['Committee Minutes'] },
      { id: 'APPROVAL_COUNCIL', name: 'Executive Council Approval', sequence: 7, responsibleRole: 'ADMIN', slaDays: 5, isMandatory: true, canBypass: false, requiredDocuments: ['Approval Order'] },
      { id: 'CLOSED', name: 'Case Closed', sequence: 8, responsibleRole: 'ADMIN', slaDays: 0, isMandatory: true, canBypass: false, requiredDocuments: [] },
    ],
  },
  {
    id: 'wf-only-scrutiny',
    name: 'Only Scrutiny',
    description: 'Desk-based technical scrutiny for low-risk recurring approvals and autonomous institutions without site inspection.',
    applicableTypes: ['Extension of Approval (EoA)'],
    isActive: true,
    stages: [
      { id: 'SUBMISSION', name: 'Application Submission', sequence: 1, responsibleRole: 'INSTITUTION', slaDays: 3, isMandatory: true, canBypass: false, requiredDocuments: ['Application Dossier'] },
      { id: 'INITIAL_SCREENING', name: 'Initial Screening & Assignment', sequence: 2, responsibleRole: 'REGIONAL_OFFICER', slaDays: 3, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'SCRUTINY', name: 'Technical Scrutiny', sequence: 3, responsibleRole: 'SCRUTINY_OFFICER', slaDays: 7, isMandatory: true, canBypass: false, requiredDocuments: ['Faculty Cadre', 'Self-Disclosure Undertaking'] },
      { id: 'SAC_SHC_REVIEW', name: 'SAC Review', sequence: 4, responsibleRole: 'ADMIN', slaDays: 5, isMandatory: true, canBypass: true, requiredDocuments: [] },
      { id: 'APPROVAL_COUNCIL', name: 'Council Approval', sequence: 5, responsibleRole: 'ADMIN', slaDays: 4, isMandatory: true, canBypass: false, requiredDocuments: ['Approval Order'] },
      { id: 'CLOSED', name: 'Case Closed', sequence: 6, responsibleRole: 'ADMIN', slaDays: 0, isMandatory: true, canBypass: false, requiredDocuments: [] },
    ],
  },
  {
    id: 'wf-evc-sac-shc',
    name: 'EVC + SAC/SHC',
    description: 'Fast-tracked inspection for surprise compliance visits or court/grievance-directed scrutiny with direct SAC hearing.',
    applicableTypes: ['Increase in Intake / New Course', 'Change of Site / Location'],
    isActive: true,
    stages: [
      { id: 'SUBMISSION', name: 'Application Submission', sequence: 1, responsibleRole: 'INSTITUTION', slaDays: 3, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'INITIAL_SCREENING', name: 'Screening', sequence: 2, responsibleRole: 'REGIONAL_OFFICER', slaDays: 3, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'EVC_SCHEDULING', name: 'EVC Scheduling', sequence: 3, responsibleRole: 'REGIONAL_OFFICER', slaDays: 5, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'EVC_INSPECTION', name: 'EVC Inspection & Geo-Tagging', sequence: 4, responsibleRole: 'REGIONAL_OFFICER', slaDays: 7, isMandatory: true, canBypass: false, requiredDocuments: ['EVC Report'] },
      { id: 'SAC_SHC_REVIEW', name: 'SAC / SHC Hearing Committee', sequence: 5, responsibleRole: 'ADMIN', slaDays: 6, isMandatory: true, canBypass: false, requiredDocuments: ['Hearing Minutes'] },
      { id: 'APPROVAL_COUNCIL', name: 'Council Decision', sequence: 6, responsibleRole: 'ADMIN', slaDays: 4, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'CLOSED', name: 'Case Closed', sequence: 7, responsibleRole: 'ADMIN', slaDays: 0, isMandatory: true, canBypass: false, requiredDocuments: [] },
    ],
  },
  {
    id: 'wf-only-evc',
    name: 'Only EVC',
    description: 'Direct physical verification route for infrastructure changes or land conversion without preliminary desk scrutiny.',
    applicableTypes: ['Change of Site / Location', 'Closure / Merger'],
    isActive: true,
    stages: [
      { id: 'SUBMISSION', name: 'Application Submission', sequence: 1, responsibleRole: 'INSTITUTION', slaDays: 3, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'INITIAL_SCREENING', name: 'Regional Screening', sequence: 2, responsibleRole: 'REGIONAL_OFFICER', slaDays: 2, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'EVC_SCHEDULING', name: 'EVC Scheduling', sequence: 3, responsibleRole: 'REGIONAL_OFFICER', slaDays: 4, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'EVC_INSPECTION', name: 'Physical EVC Inspection', sequence: 4, responsibleRole: 'REGIONAL_OFFICER', slaDays: 8, isMandatory: true, canBypass: false, requiredDocuments: ['Physical Verification Report'] },
      { id: 'APPROVAL_COUNCIL', name: 'Council Approval', sequence: 5, responsibleRole: 'ADMIN', slaDays: 4, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'CLOSED', name: 'Case Closed', sequence: 6, responsibleRole: 'ADMIN', slaDays: 0, isMandatory: true, canBypass: false, requiredDocuments: [] },
    ],
  },
  {
    id: 'wf-custom',
    name: 'Custom Route',
    description: 'Customised approval workflow configured by Chief Administrator for special technical institutions or polytechnics.',
    applicableTypes: ['Extension of Approval (EoA)', 'New Institution Setup', 'Closure / Merger'],
    isActive: true,
    stages: [
      { id: 'SUBMISSION', name: 'Application Submission', sequence: 1, responsibleRole: 'INSTITUTION', slaDays: 3, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'INITIAL_SCREENING', name: 'Initial Screening', sequence: 2, responsibleRole: 'REGIONAL_OFFICER', slaDays: 3, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'SCRUTINY', name: 'Technical Scrutiny', sequence: 3, responsibleRole: 'SCRUTINY_OFFICER', slaDays: 7, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'EVC_SCHEDULING', name: 'EVC Scheduling', sequence: 4, responsibleRole: 'REGIONAL_OFFICER', slaDays: 5, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'EVC_INSPECTION', name: 'EVC Inspection', sequence: 5, responsibleRole: 'REGIONAL_OFFICER', slaDays: 10, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'APPROVAL_COUNCIL', name: 'Final Council Review', sequence: 6, responsibleRole: 'ADMIN', slaDays: 5, isMandatory: true, canBypass: false, requiredDocuments: [] },
      { id: 'CLOSED', name: 'Case Closed', sequence: 7, responsibleRole: 'ADMIN', slaDays: 0, isMandatory: true, canBypass: false, requiredDocuments: [] },
    ],
  },
];

export class WorkflowEngine {
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor(customTemplates?: WorkflowTemplate[]) {
    const list = customTemplates || DEFAULT_WORKFLOW_TEMPLATES;
    for (const t of list) {
      this.templates.set(t.name, t);
      this.templates.set(t.id, t);
    }
  }

  public getTemplate(route: WorkflowRouteType): WorkflowTemplate | undefined {
    return this.templates.get(route) || this.templates.get('Scrutiny + EVC');
  }

  public getNextStageInRoute(route: WorkflowRouteType, currentStage: StageId): StageId | null {
    const template = this.getTemplate(route);
    if (!template) return null;

    const stages = template.stages.sort((a, b) => a.sequence - b.sequence);
    const currentIndex = stages.findIndex((s) => s.id === currentStage);

    if (currentIndex >= 0 && currentIndex < stages.length - 1) {
      return stages[currentIndex + 1].id;
    }
    return null;
  }

  public canExecuteAction(app: Application, actor: User, action: string): { allowed: boolean; reason?: string } {
    // 1. Role-based privilege checks
    if (actor.role === 'INSTITUTION') {
      if (app.institutionId !== actor.institutionId) {
        return { allowed: false, reason: 'Institution can only act on its own applications.' };
      }
      if (!['SUBMIT', 'RESUBMIT', 'SAVE_DRAFT', 'SUBMIT_DOCUMENT'].includes(action)) {
        return { allowed: false, reason: 'Institutions cannot perform evaluation or regulatory actions.' };
      }
    }

    if (actor.role === 'SCRUTINY_OFFICER') {
      if (!['START_SCRUTINY', 'COMPLETE_SCRUTINY', 'RETURN_DEFICIENCY', 'RECORD_OBSERVATION'].includes(action)) {
        return { allowed: false, reason: 'Scrutiny Officer is not authorized for this workflow action.' };
      }
      if (app.assignedOfficerId && app.assignedOfficerId !== actor.id) {
        return { allowed: false, reason: 'This application is assigned to another Scrutiny Officer.' };
      }
    }

    if (actor.role === 'REGIONAL_OFFICER') {
      if (app.region !== actor.region) {
        return { allowed: false, reason: `Regional Officer can only act on applications in their region (${actor.region}).` };
      }
      if (['APPROVE', 'REJECT'].includes(action) && app.workflowRoute !== 'Only Scrutiny') {
        // Council approval reserved for Council/Admin
        return { allowed: false, reason: 'Final EoA approval authority lies with the AICTE Council/Admin.' };
      }
    }

    // 2. Stage-action compatibility
    switch (action) {
      case 'SUBMIT':
        if (app.currentStage !== 'SUBMISSION' && app.overallStatus !== 'Draft') {
          return { allowed: false, reason: 'Application has already been submitted.' };
        }
        break;

      case 'ASSIGN':
        if (actor.role !== 'ADMIN' && actor.role !== 'REGIONAL_OFFICER') {
          return { allowed: false, reason: 'Only Regional Officers or Administrators can assign cases.' };
        }
        break;

      case 'START_SCRUTINY':
        if (app.currentStage !== 'SCRUTINY' && app.currentStage !== 'INITIAL_SCREENING') {
          return { allowed: false, reason: 'Application is not in scrutiny stage.' };
        }
        break;

      case 'RETURN_DEFICIENCY':
        if (app.currentStage !== 'SCRUTINY' && app.currentStage !== 'INITIAL_SCREENING') {
          return { allowed: false, reason: 'Deficiencies can only be returned during scrutiny or initial screening.' };
        }
        break;

      case 'RESUBMIT':
        if (app.stageStatus !== 'RETURNED' && app.currentStage !== 'DEFICIENCY_CORRECTION') {
          return { allowed: false, reason: 'Application is not in returned or deficiency correction state.' };
        }
        break;

      case 'COMPLETE_SCRUTINY':
        if (app.currentStage !== 'SCRUTINY') {
          return { allowed: false, reason: 'Current stage is not Technical Scrutiny.' };
        }
        // Check open deficiencies
        const openDeficiencies = app.deficiencies.filter((d) => d.status === 'OPEN');
        if (openDeficiencies.length > 0) {
          return {
            allowed: false,
            reason: `Cannot complete scrutiny: ${openDeficiencies.length} unresolved deficiency(s) exist. Return application or resolve them first.`,
          };
        }
        break;

      case 'SCHEDULE_EVC':
        if (actor.role !== 'REGIONAL_OFFICER' && actor.role !== 'ADMIN') {
          return { allowed: false, reason: 'Only Regional Officers or Admin can schedule EVC visits.' };
        }
        if (app.currentStage !== 'EVC_SCHEDULING' && app.currentStage !== 'SCRUTINY') {
          return { allowed: false, reason: 'Application is not eligible for EVC scheduling.' };
        }
        break;

      case 'COMPLETE_EVC':
        if (app.currentStage !== 'EVC_INSPECTION') {
          return { allowed: false, reason: 'Application is not currently in EVC Inspection stage.' };
        }
        break;

      case 'FORWARD_SAC_SHC':
        if (actor.role !== 'ADMIN' && actor.role !== 'REGIONAL_OFFICER') {
          return { allowed: false, reason: 'Only Regional Officer or Council can forward to SAC/SHC.' };
        }
        break;

      case 'APPROVE':
      case 'REJECT':
        if (actor.role !== 'ADMIN' && actor.role !== 'REGIONAL_OFFICER') {
          return { allowed: false, reason: 'Only Council Administrators or Regional Head can finalize approval.' };
        }
        break;
    }

    return { allowed: true };
  }

  public executeTransition(app: Application, ctx: TransitionContext): WorkflowActionResult {
    const check = this.canExecuteAction(app, ctx.actor, ctx.action);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'Transition not authorized.' };
    }

    switch (ctx.action) {
      case 'SUBMIT': {
        const next = this.getNextStageInRoute(app.workflowRoute, 'SUBMISSION') || 'INITIAL_SCREENING';
        return {
          success: true,
          message: 'Application submitted successfully to AICTE Regional Office.',
          nextStage: next,
          nextStageStatus: 'PENDING',
          overallStatus: 'Submitted',
        };
      }

      case 'ASSIGN': {
        return {
          success: true,
          message: `Application assigned to ${ctx.additionalPayload?.officerName || 'Scrutiny Officer'}.`,
          nextStage: 'SCRUTINY',
          nextStageStatus: 'PENDING',
          overallStatus: 'Under Scrutiny',
        };
      }

      case 'START_SCRUTINY': {
        return {
          success: true,
          message: 'Scrutiny verification started by assigned officer.',
          nextStage: 'SCRUTINY',
          nextStageStatus: 'IN_PROGRESS',
          overallStatus: 'Under Scrutiny',
        };
      }

      case 'RETURN_DEFICIENCY': {
        if (!ctx.remarks || ctx.remarks.trim().length < 5) {
          return {
            success: false,
            message: 'A mandatory and clear reason/remark is required when returning an application for deficiency.',
          };
        }
        return {
          success: true,
          message: 'Application returned to institution for deficiency rectification.',
          nextStage: 'DEFICIENCY_CORRECTION',
          nextStageStatus: 'RETURNED',
          overallStatus: 'Deficiency Raised',
        };
      }

      case 'RESUBMIT': {
        return {
          success: true,
          message: 'Clarifications and corrected documents resubmitted by institution.',
          nextStage: 'SCRUTINY',
          nextStageStatus: 'RESUBMITTED',
          overallStatus: 'Resubmitted',
        };
      }

      case 'COMPLETE_SCRUTINY': {
        // Automatic stage progression to next configured route stage!
        const next = this.getNextStageInRoute(app.workflowRoute, 'SCRUTINY');
        let overall: Application['overallStatus'] = 'Under Scrutiny';
        if (next === 'EVC_SCHEDULING') overall = 'Under Scrutiny';
        else if (next === 'SAC_SHC_REVIEW') overall = 'Under SAC/SHC';
        else if (next === 'APPROVAL_COUNCIL') overall = 'Under SAC/SHC';

        return {
          success: true,
          message: `Scrutiny completed successfully. Advancing to ${next || 'Next Stage'}.`,
          nextStage: next || 'APPROVAL_COUNCIL',
          nextStageStatus: 'PENDING',
          overallStatus: overall,
        };
      }

      case 'SCHEDULE_EVC': {
        return {
          success: true,
          message: 'EVC inspection committee scheduled successfully.',
          nextStage: 'EVC_INSPECTION',
          nextStageStatus: 'PENDING',
          overallStatus: 'EVC Scheduled',
        };
      }

      case 'COMPLETE_EVC': {
        const next = this.getNextStageInRoute(app.workflowRoute, 'EVC_INSPECTION') || 'SAC_SHC_REVIEW';
        return {
          success: true,
          message: 'EVC inspection report submitted and verified.',
          nextStage: next,
          nextStageStatus: 'PENDING',
          overallStatus: 'EVC Completed',
        };
      }

      case 'FORWARD_SAC_SHC': {
        return {
          success: true,
          message: 'Case forwarded to Standing Appellate Committee / Standing Hearing Committee.',
          nextStage: 'SAC_SHC_REVIEW',
          nextStageStatus: 'IN_PROGRESS',
          overallStatus: 'Under SAC/SHC',
        };
      }

      case 'APPROVE': {
        return {
          success: true,
          message: 'Application has received final Executive Council Approval (EoA issued).',
          nextStage: 'CLOSED',
          nextStageStatus: 'COMPLETED',
          overallStatus: 'Approved',
        };
      }

      case 'REJECT': {
        if (!ctx.remarks || ctx.remarks.trim().length < 5) {
          return {
            success: false,
            message: 'A formal reason is required for application rejection.',
          };
        }
        return {
          success: true,
          message: 'Application rejected by council.',
          nextStage: 'CLOSED',
          nextStageStatus: 'REJECTED',
          overallStatus: 'Rejected',
        };
      }

      case 'CLOSE': {
        return {
          success: true,
          message: 'Application file formally closed.',
          nextStage: 'CLOSED',
          nextStageStatus: 'COMPLETED',
          overallStatus: 'Closed',
        };
      }

      default:
        return { success: false, message: `Unknown workflow action: ${ctx.action}` };
    }
  }
}

// Global engine instance
export const workflowEngine = new WorkflowEngine();

// Unit test function to verify workflow rules programmatically
export function runWorkflowEngineTests(): { passed: number; failed: number; results: { test: string; status: 'PASS' | 'FAIL'; note?: string }[] } {
  const engine = new WorkflowEngine();
  const results: { test: string; status: 'PASS' | 'FAIL'; note?: string }[] = [];

  const mockApp: Application = {
    id: 'AICTE-TEST-001',
    institutionId: 'inst-001',
    institutionName: 'Test Engineering College',
    institutionAddress: 'Pune, Maharashtra',
    institutionCode: 'TEC-1234',
    region: 'Western',
    applicationType: 'Extension of Approval (EoA)',
    workflowRoute: 'Scrutiny + EVC',
    currentStage: 'SCRUTINY',
    stageStatus: 'IN_PROGRESS',
    overallStatus: 'Under Scrutiny',
    assignedOfficerId: 'officer-01',
    assignedOfficerName: 'Dr. Ramesh Iyer',
    submissionDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    ageingDays: 3,
    isOverdue: false,
    remarks: 'Sample test application',
    intakeProposed: 420,
    programsList: ['Computer Engineering', 'Mechanical Engineering'],
    documents: [],
    deficiencies: [],
    timeline: [],
    updatedAt: new Date().toISOString(),
  };

  const scrutinyOfficer: User = {
    id: 'officer-01',
    name: 'Dr. Ramesh Iyer',
    email: 'ramesh.iyer@aicte.gov.in',
    role: 'SCRUTINY_OFFICER',
    designation: 'Senior Scrutiny Officer',
    region: 'Western',
  };

  const otherOfficer: User = {
    id: 'officer-99',
    name: 'Dr. Unknown',
    email: 'unknown@aicte.gov.in',
    role: 'SCRUTINY_OFFICER',
    designation: 'Officer',
    region: 'Western',
  };

  const institutionUser: User = {
    id: 'inst-user-01',
    name: 'Prof. Ananya Sen',
    email: 'registrar@bvit.ac.in',
    role: 'INSTITUTION',
    designation: 'Registrar',
    institutionId: 'inst-001',
    institutionName: 'Bharati Vidyapeeth',
  };

  // Test 1: Authorized scrutiny officer completes scrutiny without deficiencies
  const t1 = engine.executeTransition(mockApp, {
    actor: scrutinyOfficer,
    action: 'COMPLETE_SCRUTINY',
    remarks: 'All documents verified and found in order.',
  });
  results.push({
    test: 'Authorized Scrutiny Completion advances to next stage (EVC_SCHEDULING)',
    status: t1.success && t1.nextStage === 'EVC_SCHEDULING' ? 'PASS' : 'FAIL',
    note: t1.message,
  });

  // Test 2: Unassigned officer trying to act on application
  const t2 = engine.executeTransition(mockApp, {
    actor: otherOfficer,
    action: 'COMPLETE_SCRUTINY',
    remarks: 'Unauthorized attempt',
  });
  results.push({
    test: 'Unassigned officer action rejected with role guard',
    status: !t2.success ? 'PASS' : 'FAIL',
    note: t2.message,
  });

  // Test 3: Institution user attempting scrutiny completion (Forbidden)
  const t3 = engine.executeTransition(mockApp, {
    actor: institutionUser,
    action: 'COMPLETE_SCRUTINY',
    remarks: 'Self approval attempt',
  });
  results.push({
    test: 'Institution user prevented from approving or completing scrutiny',
    status: !t3.success ? 'PASS' : 'FAIL',
    note: t3.message,
  });

  // Test 4: Return for deficiency requires mandatory remarks
  const t4 = engine.executeTransition(mockApp, {
    actor: scrutinyOfficer,
    action: 'RETURN_DEFICIENCY',
    remarks: '', // Missing remark
  });
  results.push({
    test: 'Return for deficiency enforces mandatory detailed remarks',
    status: !t4.success ? 'PASS' : 'FAIL',
    note: t4.message,
  });

  // Test 5: Open deficiencies block scrutiny completion
  const appWithDeficiencies: Application = {
    ...mockApp,
    deficiencies: [
      {
        id: 'def-1',
        category: 'Land Title',
        description: 'Khasra map lease deed is expired or illegible',
        severity: 'HIGH',
        status: 'OPEN',
        raisedBy: 'Dr. Ramesh Iyer',
        raisedAt: new Date().toISOString(),
      },
    ],
  };
  const t5 = engine.executeTransition(appWithDeficiencies, {
    actor: scrutinyOfficer,
    action: 'COMPLETE_SCRUTINY',
    remarks: 'Trying to finish despite deficiency',
  });
  results.push({
    test: 'Open deficiencies prevent scrutiny completion',
    status: !t5.success ? 'PASS' : 'FAIL',
    note: t5.message,
  });

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.length - passed;
  return { passed, failed, results };
}
