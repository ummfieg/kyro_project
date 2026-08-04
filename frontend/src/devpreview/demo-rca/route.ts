export type DemoRcaStepId =
  | "overview"
  | "resources"
  | "pod"
  | "alert"
  | "report"
  | "recovery"
  | "resolved";

const DEMO_RCA_BASE_PATH = "/demo/rca";

const DEMO_RCA_STEP_PATHS: Record<DemoRcaStepId, string> = {
  overview: DEMO_RCA_BASE_PATH,
  resources: `${DEMO_RCA_BASE_PATH}/resources`,
  pod: `${DEMO_RCA_BASE_PATH}/pod`,
  alert: `${DEMO_RCA_BASE_PATH}/alert`,
  report: `${DEMO_RCA_BASE_PATH}/report`,
  recovery: `${DEMO_RCA_BASE_PATH}/recovery`,
  resolved: `${DEMO_RCA_BASE_PATH}/resolved`,
};

export function isDemoRcaPath(pathname: string): boolean {
  return pathname === DEMO_RCA_BASE_PATH || pathname.startsWith(`${DEMO_RCA_BASE_PATH}/`);
}

export function demoRcaPathForStep(stepId: DemoRcaStepId): string {
  return DEMO_RCA_STEP_PATHS[stepId];
}

export function demoRcaStepFromPath(pathname: string): DemoRcaStepId {
  const match = Object.entries(DEMO_RCA_STEP_PATHS).find(([, path]) => path === pathname);
  return match?.[0] as DemoRcaStepId | undefined ?? "overview";
}
