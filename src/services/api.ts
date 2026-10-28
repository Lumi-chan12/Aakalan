import {
  Application,
  AuditLogItem,
  ComplianceRecord,
  DashboardSummary,
  EVCVisit,
  NotificationItem,
  OfficerWorkload,
  User,
  WorkflowTemplate,
} from '../types';

export class ApiService {
  private static activeRoleKey: string = 'admin';

  public static setActiveRole(key: string) {
    this.activeRoleKey = key;
    localStorage.setItem('aakalan_role_key', key);
  }

  public static getActiveRole(): string {
    const saved = localStorage.getItem('aakalan_role_key');
    if (saved) {
      this.activeRoleKey = saved;
    }
    return this.activeRoleKey;
  }

  private static getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-demo-role': this.getActiveRole(),
    };
  }

  public static async getMe(): Promise<{ user: User; availableRoles: User[] }> {
    const res = await fetch('/api/auth/me', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load user profile');
    return res.json();
  }

  public static async login(payload: { email?: string; role?: string; password?: string }): Promise<{ success: boolean; user: User; roleKey?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed. Invalid credentials.');
    }
    if (data.roleKey) {
      this.setActiveRole(data.roleKey);
    }
    return data;
  }

  public static async switchRole(roleKey: string): Promise<{ success: boolean; user: User }> {
    this.setActiveRole(roleKey);
    const res = await fetch('/api/auth/switch-demo-role', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ roleKey }),
    });
    if (!res.ok) throw new Error('Failed to switch role');
    return res.json();
  }

  public static async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch('/api/dashboard/summary', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return res.json();
  }

  public static async getApplications(params: Record<string, any> = {}): Promise<{
    data: Application[];
    pagination: { total: number; page: number; pageSize: number; totalPages: number };
  }> {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const res = await fetch(`/api/applications?${searchParams.toString()}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load applications');
    return res.json();
  }

  public static async getApplicationById(id: string): Promise<Application> {
    const res = await fetch(`/api/applications/${id}`, { headers: this.getHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch application');
    }
    return res.json();
  }

  public static async createApplication(payload: any): Promise<Application> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create application');
    }
    return res.json();
  }

  public static async executeAction(
    id: string,
    action: string,
    remarks: string,
    payload?: any
  ): Promise<{ success: boolean; message: string; application: Application }> {
    const res = await fetch(`/api/applications/${id}/actions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action, remarks, payload }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Workflow action failed');
    }
    return data;
  }

  public static async raiseDeficiency(id: string, def: any): Promise<{ success: boolean; deficiency: any }> {
    const res = await fetch(`/api/applications/${id}/deficiencies`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(def),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to raise deficiency');
    return data;
  }

  public static async clarifyDeficiency(id: string, defId: string, responseText: string): Promise<any> {
    const res = await fetch(`/api/applications/${id}/deficiencies/${defId}/clarify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ responseText }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit clarification');
    return data;
  }

  public static async getWorkflows(): Promise<WorkflowTemplate[]> {
    const res = await fetch('/api/workflows', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load workflows');
    return res.json();
  }

  public static async createWorkflow(template: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Failed to save workflow template');
    return res.json();
  }

  public static async getComplianceDocuments(): Promise<ComplianceRecord[]> {
    const res = await fetch('/api/compliance/documents', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load compliance documents');
    return res.json();
  }

  public static async submitComplianceDocument(doc: any): Promise<ComplianceRecord> {
    const res = await fetch('/api/compliance/documents', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error('Failed to submit compliance record');
    return res.json();
  }

  public static async getEVCVisits(): Promise<EVCVisit[]> {
    const res = await fetch('/api/evc-visits', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load EVC visits');
    return res.json();
  }

  public static async scheduleEVCVisit(visit: any): Promise<EVCVisit> {
    const res = await fetch('/api/evc-visits', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(visit),
    });
    if (!res.ok) throw new Error('Failed to schedule EVC visit');
    return res.json();
  }

  public static async getOfficers(): Promise<OfficerWorkload[]> {
    const res = await fetch('/api/officers', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load officer workload');
    return res.json();
  }

  public static async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  }

  public static async acknowledgeNotification(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/acknowledge`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
  }

  public static async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetch('/api/audit-logs', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  }

  public static async runWorkflowTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    const res = await fetch('/api/tests/workflow', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to run workflow unit tests');
    return res.json();
  }

  public static async sendVoiceQuery(
    query: string,
    language: string = 'en'
  ): Promise<{
    responseText: string;
    navigationPath?: string | null;
    navigationLabel?: string | null;
    stats?: any;
  }> {
    const res = await fetch('/api/voice/query', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query, language }),
    });
    if (!res.ok) throw new Error('Failed to process voice query');
    return res.json();
  }
}
