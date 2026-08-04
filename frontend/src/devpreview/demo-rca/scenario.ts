import type { DemoRcaStepId } from "./route";

export type DemoRcaStatusTone = "ok" | "warn" | "crit" | "info" | "muted";

export interface DemoRcaStep {
  id: DemoRcaStepId;
  label: string;
  title: string;
  description: string;
}

export interface DemoRcaCluster {
  id: string;
  name: string;
  region: string;
  status: DemoRcaStatusTone;
  summary: string;
}

export interface DemoRcaPod {
  name: string;
  namespace: string;
  node: string;
  status: DemoRcaStatusTone;
  cpu: string;
  memory: string;
  restarts: number;
}

export const DEMO_RCA_STEPS: DemoRcaStep[] = [
  {
    id: "overview",
    label: "홈",
    title: "운영 현황에서 대상 클러스터 확인",
    description: "데모에서는 battle-ops 클러스터만 RCA 시나리오로 진입합니다.",
  },
  {
    id: "resources",
    label: "리소스",
    title: "Pod 상태 확인",
    description: "api-server Pod에서 입장 실패와 관련된 이상 상태를 확인합니다.",
  },
  {
    id: "pod",
    label: "Pod 상세",
    title: "Pod 리소스와 이벤트 확인",
    description: "재시작, CPU, 메모리, 최근 이벤트를 보고 장애 후보를 좁힙니다.",
  },
  {
    id: "alert",
    label: "장애 알림",
    title: "알림에서 이슈로 연결",
    description: "입장 실패 알림을 이슈로 연결하고 RCA 보고서로 이동합니다.",
  },
  {
    id: "report",
    label: "RCA",
    title: "근거 기반 RCA 보고서 검토",
    description: "증상, 영향 범위, 판단 근거, 부족한 근거를 한 화면에서 확인합니다.",
  },
  {
    id: "recovery",
    label: "복구 플랜",
    title: "복구 플랜 확인",
    description: "포트폴리오 데모에서는 안전한 시나리오로 가정해 복구 진행만 시연합니다.",
  },
  {
    id: "resolved",
    label: "정상화",
    title: "복구 후 상태 정상화 확인",
    description: "Pod 상태가 정상으로 바뀌고 이슈가 해결 흐름으로 이동합니다.",
  },
];

export const DEMO_RCA_CLUSTERS: DemoRcaCluster[] = [
  {
    id: "battle-ops",
    name: "battle-ops",
    region: "ap-northeast-2",
    status: "crit",
    summary: "sandbox 네임스페이스에서 입장 실패 이슈 감지",
  },
  {
    id: "arena-prod",
    name: "arena-prod",
    region: "ap-northeast-2",
    status: "ok",
    summary: "전체 워크로드 정상",
  },
  {
    id: "lobby-dev",
    name: "lobby-dev",
    region: "ap-northeast-2",
    status: "warn",
    summary: "관측 데이터 일부 지연",
  },
];

export const DEMO_RCA_PODS: DemoRcaPod[] = [
  {
    name: "api-server-d6cdf99b-74fsd",
    namespace: "sandbox",
    node: "ip-192-168-114-116",
    status: "crit",
    cpu: "347m",
    memory: "312Mi",
    restarts: 4,
  },
  {
    name: "lobby-worker-5bc7c7df-q2x9p",
    namespace: "sandbox",
    node: "ip-192-168-114-118",
    status: "ok",
    cpu: "118m",
    memory: "182Mi",
    restarts: 0,
  },
  {
    name: "matchmaker-64b9f7d8c9-2kp4s",
    namespace: "game",
    node: "ip-192-168-114-119",
    status: "ok",
    cpu: "92m",
    memory: "144Mi",
    restarts: 0,
  },
];

export const DEMO_RCA_EVIDENCE = [
  "Deployment api-server의 admission failure 증가",
  "sandbox 네임스페이스에서 입장 요청 실패율 상승",
  "최근 배포 이후 lobby capacity 관련 로그 증가",
] as const;

export const DEMO_RCA_MISSING_EVIDENCE = [
  "외부 결제/인증 API 장애 여부",
  "같은 시간대 전체 리전 네트워크 지연 여부",
] as const;
