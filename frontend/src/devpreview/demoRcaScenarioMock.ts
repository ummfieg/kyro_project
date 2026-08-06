import type { AlertEvent } from "../api/alert-events-schemas";
import type { RecoveryPlan } from "../api/recovery-schemas";
import type { FleetSummaryFeedView } from "./fleetSummaryFeed";
import type { RcaIssueItem } from "../api/schemas";
import type { InventoryResourcesView, InventoryKindCountsView, Row } from "./inventoryResourcesFeed";
import type { InventoryNamespacesView } from "./inventoryNamespacesFeed";

export const DEMO_RCA_CLUSTER_ID = "battle-ops";
export const DEMO_RCA_NAMESPACE = "sandbox";
export const DEMO_RCA_POD_NAME = "api-server-d6cdf99b-74fsd";
export const DEMO_RCA_DEPLOYMENT_NAME = "api-server";
export const DEMO_RCA_CORRELATION_ID = "demo-rca-battle-ops-api-server";
export const DEMO_RCA_INCIDENT_ID = "demo-incident-admission-failure";
export const DEMO_RCA_RECOVERY_RESOLVED_EVENT = "demo-rca:recovery-resolved";
export const DEMO_RCA_RECOVERY_RESOLVED_REASON = "demo_auto_resolved";

export const DEMO_RCA_CONTRACT_CLUSTERS = [
  {
    id: DEMO_RCA_CLUSTER_ID,
    workspaceId: "default",
    name: DEMO_RCA_CLUSTER_ID,
    displayName: DEMO_RCA_CLUSTER_ID,
    environment: "sandbox",
    provider: "eks",
    connectionStatus: "online",
    connectionStage: "ready",
    observationMode: "agent",
    lastObservedAt: "2026-08-04T10:13:24+09:00",
    kubernetesVersion: "1.30",
    nodeCount: 2,
    podCount: 40,
    namespaceCount: 4,
    incidentCount: 1,
    role: "target",
    readOnly: false,
  },
] as const;

export const DEMO_RCA_FLEET_VIEW: FleetSummaryFeedView = {
  status: "ready",
  transport: "http",
  totalsObservation: "observed",
  totals: {
    clusters: 1,
    healthy: 0,
    warning: 0,
    critical: 1,
    stale: 0,
    unknown: 0,
    open_incidents: 1,
    pending_approvals: 1,
    running_workflows: 1,
    dead_letters: 0,
  },
  clusters: {
    [DEMO_RCA_CLUSTER_ID]: {
      status: "ready",
      health: "critical",
      cpuPct: 72,
      memPct: 68,
      podsRunning: 39,
      podsTotal: 40,
      nodesReady: 2,
      nodesTotal: 2,
      openIncidents: 1,
      restartDelta: 4,
      nodes: [
        {
          name: "ip-192-168-114-116",
          ready: true,
          health: "critical",
          cpuPct: 78,
          memPct: 71,
          podsRunning: 21,
          podsCapacity: 29,
          restartsRecent: 4,
          conditions: ["Ready"],
        },
        {
          name: "ip-192-168-114-118",
          ready: true,
          health: "healthy",
          cpuPct: 46,
          memPct: 52,
          podsRunning: 18,
          podsCapacity: 29,
          restartsRecent: 0,
          conditions: ["Ready"],
        },
      ],
    },
  },
};

export const DEMO_RCA_KIND_COUNTS: InventoryKindCountsView = {
  status: "ready",
  meta: {
    [DEMO_RCA_CLUSTER_ID]: {
      deployment: 3,
      pod: 3,
      node: 2,
      service: 2,
      namespace: 4,
    },
  },
};

const podRows: Row[] = [
  {
    _key: `${DEMO_RCA_CLUSTER_ID}/pod/${DEMO_RCA_NAMESPACE}/${DEMO_RCA_POD_NAME}`,
    cluster: DEMO_RCA_CLUSTER_ID,
    kind: "Pod",
    resource_type: "pod",
    name: DEMO_RCA_POD_NAME,
    ns: DEMO_RCA_NAMESPACE,
    node: "ip-192-168-114-116",
    status: "AdmissionFailure",
    health: "critical",
    bad: true,
    ctr: 2,
    cpu: { used: "347m", lim: "500m", pct: 69 },
    mem: { used: "312Mi", lim: "512Mi", pct: 61 },
    img: "api-server:demo",
    age: "2시간",
  },
  {
    _key: `${DEMO_RCA_CLUSTER_ID}/pod/${DEMO_RCA_NAMESPACE}/lobby-worker-5bc7c7df-q2x9p`,
    cluster: DEMO_RCA_CLUSTER_ID,
    kind: "Pod",
    resource_type: "pod",
    name: "lobby-worker-5bc7c7df-q2x9p",
    ns: DEMO_RCA_NAMESPACE,
    node: "ip-192-168-114-118",
    status: "Running",
    health: "healthy",
    bad: false,
    ctr: 1,
    cpu: { used: "118m", lim: "500m", pct: 24 },
    mem: { used: "182Mi", lim: "512Mi", pct: 36 },
    img: "lobby-worker:demo",
    age: "3시간",
  },
  {
    _key: `${DEMO_RCA_CLUSTER_ID}/pod/game/matchmaker-64b9f7d8c9-2kp4s`,
    cluster: DEMO_RCA_CLUSTER_ID,
    kind: "Pod",
    resource_type: "pod",
    name: "matchmaker-64b9f7d8c9-2kp4s",
    ns: "game",
    node: "ip-192-168-114-118",
    status: "Running",
    health: "healthy",
    bad: false,
    ctr: 1,
    cpu: { used: "92m", lim: "500m", pct: 18 },
    mem: { used: "144Mi", lim: "512Mi", pct: 28 },
    img: "matchmaker:demo",
    age: "3시간",
  },
];

const deploymentRows: Row[] = [
  {
    _key: `${DEMO_RCA_CLUSTER_ID}/deployment/${DEMO_RCA_NAMESPACE}/${DEMO_RCA_DEPLOYMENT_NAME}`,
    cluster: DEMO_RCA_CLUSTER_ID,
    kind: "Deployment",
    resource_type: "deployment",
    name: DEMO_RCA_DEPLOYMENT_NAME,
    ns: DEMO_RCA_NAMESPACE,
    status: "2/3",
    health: "critical",
    bad: true,
    desired: 3,
    ready: "2/3",
    utd: 2,
    avail: 2,
    img: "api-server:demo",
    st: "AdmissionFailure",
    age: "2시간",
  },
];

const resolvedPodRows: Row[] = podRows.map((row) => row.name === DEMO_RCA_POD_NAME
  ? {
      ...row,
      status: "Running",
      health: "healthy",
      bad: false,
      cpu: { used: "212m", lim: "500m", pct: 42 },
      mem: { used: "224Mi", lim: "512Mi", pct: 44 },
    }
  : row);

const resolvedDeploymentRows: Row[] = deploymentRows.map((row) => ({
  ...row,
  status: "3/3",
  health: "healthy",
  bad: false,
  ready: "3/3",
  utd: 3,
  avail: 3,
  st: "Running",
}));

const nodeRows: Row[] = [
  {
    _key: `${DEMO_RCA_CLUSTER_ID}/node/ip-192-168-114-116`,
    cluster: DEMO_RCA_CLUSTER_ID,
    kind: "Node",
    resource_type: "node",
    name: "ip-192-168-114-116",
    status: "Ready",
    health: "warning",
    bad: false,
    st: "Ready",
    cpu: { used: "78%", lim: "100%", pct: 78 },
    mem: { used: "71%", lim: "100%", pct: 71 },
    pods: { used: "22", lim: "29", pct: 76 },
    zone: "apne2-a",
    inst: "t3.medium",
    age: "4시간",
  },
  {
    _key: `${DEMO_RCA_CLUSTER_ID}/node/ip-192-168-114-118`,
    cluster: DEMO_RCA_CLUSTER_ID,
    kind: "Node",
    resource_type: "node",
    name: "ip-192-168-114-118",
    status: "Ready",
    health: "healthy",
    bad: false,
    st: "Ready",
    cpu: { used: "46%", lim: "100%", pct: 46 },
    mem: { used: "52%", lim: "100%", pct: 52 },
    pods: { used: "18", lim: "29", pct: 62 },
    zone: "apne2-c",
    inst: "t3.medium",
    age: "4시간",
  },
];

export function demoRcaRowsForResourceType(resourceType: string, resolved = false): Row[] {
  if (resourceType === "pod") return resolved ? resolvedPodRows : podRows;
  if (resourceType === "deployment") return resolved ? resolvedDeploymentRows : deploymentRows;
  if (resourceType === "node") return nodeRows;
  return [];
}

export function demoRcaInventoryView(resourceType: string, resolved = false): InventoryResourcesView {
  return { status: "ready", rows: demoRcaRowsForResourceType(resourceType, resolved) };
}

export const DEMO_RCA_NAMESPACES: InventoryNamespacesView = {
  status: "ready",
  items: [
    { namespace: DEMO_RCA_NAMESPACE, podCount: 2 },
    { namespace: "game", podCount: 1 },
  ],
};

export const DEMO_RCA_ISSUES: RcaIssueItem[] = [
  {
    workspace_id: "default",
    correlation_id: DEMO_RCA_CORRELATION_ID,
    cluster_id: DEMO_RCA_CLUSTER_ID,
    incident_id: DEMO_RCA_INCIDENT_ID,
    incident_occurrence_id: "demo-occurrence-admission-failure",
    incident_namespace: DEMO_RCA_NAMESPACE,
    incident_resource_kind: "Deployment",
    incident_resource_name: DEMO_RCA_DEPLOYMENT_NAME,
    incident_symptom: "admission_failure",
    evidence_ref: "object://evidence/demo-rca-battle-ops-api-server.json#metrics:admission_failure",
    current_subject: "rca",
    status: "rca_completed",
    root_cause: "lobby_capacity_saturation",
    confidence: 1,
    supporting_evidence: [
      "Deployment api-server의 admission failure 증가",
      "sandbox 네임스페이스에서 입장 요청 실패율 상승",
      "최근 배포 이후 lobby capacity 관련 로그 증가",
    ],
    missing_evidence: [
      "외부 인증 API 오류율",
      "전체 리전 네트워크 지연 여부",
    ],
    action_route: "safe_pr",
    command_id: null,
    pr_url: null,
    error_reason: null,
    updated_at: "2026-08-04T10:13:24+09:00",
    issue_severity: "critical",
    severity_availability: "available",
    severity_reason_code: null,
    situation_summary: "sandbox의 api-server에서 입장 실패율이 증가했고, 로비 처리 용량 부족이 가장 높은 원인 후보입니다.",
    recommended_action_summary: "최근 배포로 축소된 replicas 값을 승인 기준으로 되돌리는 Safe PR을 검토합니다.",
    evidence_summary: "입장 실패율, capacity 로그, Deployment 이벤트가 같은 시간대에 맞물려 있습니다.",
    evidence_bundle_summary: "Metrics, Logs, Events, Deploy Changes 기준으로 RCA evidence bundle을 구성했습니다.",
    recovery_reason_code: "safe_pr_required",
  },
];

export const DEMO_RCA_RECOVERY_PLAN: RecoveryPlan = {
  plan_id: "demo-plan-restore-lobby-replicas",
  correlation_id: DEMO_RCA_CORRELATION_ID,
  incident_id: DEMO_RCA_INCIDENT_ID,
  evidence_ref: "object://evidence/demo-rca-battle-ops-api-server.json",
  status: "selection_required",
  summary: "로비 처리 용량 부족을 완화하기 위해 api-server replicas 복구 PR을 권장합니다.",
  target: {
    cluster_id: DEMO_RCA_CLUSTER_ID,
    namespace: DEMO_RCA_NAMESPACE,
    resource_kind: "Deployment",
    resource_name: DEMO_RCA_DEPLOYMENT_NAME,
  },
  recommended_action_id: "restore-lobby-replicas",
  execution_route: "auto",
  selection_required: true,
  selected_action_id: null,
  selected_by: null,
  selected_action: null,
  candidates: [
    {
      action_id: "restore-lobby-replicas",
      title: "api-server replicas 자동 복구",
      description: "데모에서는 승인된 기준 replicas로 즉시 복구합니다. 실제 운영 환경에서는 Safe PR 또는 승인 절차를 거쳐 적용해야 합니다.",
      route: "auto",
      rank: 1,
      score: 0.72,
      risk_level: "medium",
      blast_radius: "Deployment api-server",
      approval_required: false,
      prerequisites: ["최근 배포 변경 이력 확인", "승인 기준 replicas 확인"],
      validation_checks: ["선언 replicas와 실행 replicas 일치", "matchmaking failure 하락 유지", "alertmanager no refire"],
      rollback_plan: "생성된 PR 또는 merge commit을 revert합니다.",
      evidence_refs: ["object://evidence/demo-rca-battle-ops-api-server.json#metrics:admission_failure"],
      recommendation_reason: "원인 후보가 로비 처리 용량 부족으로 수렴했습니다. 데모에서는 auto로 정상화하지만 운영 환경에서는 Safe PR 또는 approval_required 경로를 검토합니다.",
      expected_outcome: "입장 실패율이 정상 범위로 내려가고 api-server Ready replica가 승인 값과 일치합니다.",
      risk_explanation: "대상 Deployment의 처리 용량을 되돌리는 변경이므로 영향 범위는 target workload로 제한됩니다.",
      rollback_reason: "복구 후 실패율이 유지되거나 다른 서비스에 영향이 확인될 경우",
      executable: true,
      blocked_reason_code: null,
      blocked_reason: null,
    },
  ],
  lifecycle: null,
};

export const DEMO_RCA_ALERT_EVENTS: AlertEvent[] = [
  {
    event_id: "demo-alert-admission-failure",
    rule_id: "demo-rule-admission-failure",
    rule_name: "api-server admission failure",
    source: "incident",
    severity: "critical",
    subject: {
      cluster: DEMO_RCA_CLUSTER_ID,
      namespace: DEMO_RCA_NAMESPACE,
      kind: "Deployment",
      name: DEMO_RCA_DEPLOYMENT_NAME,
    },
    fired_at: "2026-08-04T10:13:24+09:00",
    resolved_at: null,
    status: "firing",
    observed_value: 34.7,
    threshold: 5,
    evidence: [
      {
        type: "metric",
        metric: "admission_failure_rate",
        observed_at: "2026-08-04T10:13:24+09:00",
        subject: {
          cluster: DEMO_RCA_CLUSTER_ID,
          namespace: DEMO_RCA_NAMESPACE,
          kind: "Deployment",
          name: DEMO_RCA_DEPLOYMENT_NAME,
        },
        value: 34.7,
        summary: "api-server 신규 요청 중 admission failure 비율이 임계값을 초과했습니다.",
        link: "/?surface=issues",
      },
    ],
    incident_id: DEMO_RCA_INCIDENT_ID,
    acknowledged_at: null,
    acknowledged_by: null,
    promoted_at: "2026-08-04T10:13:30+09:00",
    promoted_by: "demo",
  },
];
