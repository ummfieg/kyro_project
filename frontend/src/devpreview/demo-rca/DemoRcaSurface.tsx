import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  FileText,
  Gauge,
  LayoutDashboard,
  ListTree,
  Play,
  Server,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  BLUE,
  HP,
  INTERACTION,
  PRESENT_SCALE,
  RADIUS,
  SOFT,
  SPACE,
  TINT,
  TYPE,
  UI,
  blueA,
  inkA,
} from "../theme";
import {
  DEMO_RCA_CLUSTERS,
  DEMO_RCA_EVIDENCE,
  DEMO_RCA_MISSING_EVIDENCE,
  DEMO_RCA_PODS,
  DEMO_RCA_STEPS,
  type DemoRcaStatusTone,
  type DemoRcaStep,
} from "./scenario";
import {
  demoRcaPathForStep,
  demoRcaStepFromPath,
  type DemoRcaStepId,
} from "./route";

type DemoToast = {
  id: number;
  title: string;
  body: string;
};

const DEMO_ONLY_TOAST = {
  title: "데모 시나리오 안내",
  body: "이 데모에서는 Pod 장애 → RCA 보고서 → 복구 플랜 흐름만 확인할 수 있어요.",
};

const STEP_ORDER = DEMO_RCA_STEPS.map((step) => step.id);
const PRIMARY_CLUSTER_ID = "battle-ops";
const PRIMARY_POD_NAME = "api-server-d6cdf99b-74fsd";

function statusColor(tone: DemoRcaStatusTone): string {
  if (tone === "ok") return HP.ok;
  if (tone === "warn") return HP.warn;
  if (tone === "crit") return HP.crit;
  if (tone === "info") return BLUE;
  return UI.ink3;
}

function statusLabel(tone: DemoRcaStatusTone): string {
  if (tone === "ok") return "정상";
  if (tone === "warn") return "주의";
  if (tone === "crit") return "장애";
  if (tone === "info") return "진행";
  return "대기";
}

function stepIndex(stepId: DemoRcaStepId): number {
  return Math.max(0, STEP_ORDER.indexOf(stepId));
}

function nextStep(stepId: DemoRcaStepId): DemoRcaStepId {
  return STEP_ORDER[Math.min(STEP_ORDER.length - 1, stepIndex(stepId) + 1)];
}

function previousStep(stepId: DemoRcaStepId): DemoRcaStepId | null {
  const index = stepIndex(stepId);
  return index > 0 ? STEP_ORDER[index - 1] : null;
}

function navigateDemoStep(stepId: DemoRcaStepId): void {
  window.history.pushState(window.history.state, "", demoRcaPathForStep(stepId));
  window.dispatchEvent(new Event("demo-rca:navigation"));
}

export function DemoRcaSurface() {
  const [stepId, setStepId] = useState<DemoRcaStepId>(() => demoRcaStepFromPath(window.location.pathname));
  const [toasts, setToasts] = useState<DemoToast[]>([]);
  const toastSeq = useRef(0);

  useEffect(() => {
    const syncStep = () => setStepId(demoRcaStepFromPath(window.location.pathname));
    window.addEventListener("popstate", syncStep);
    window.addEventListener("demo-rca:navigation", syncStep);
    return () => {
      window.removeEventListener("popstate", syncStep);
      window.removeEventListener("demo-rca:navigation", syncStep);
    };
  }, []);

  const pushToast = useCallback((message: Omit<DemoToast, "id"> = DEMO_ONLY_TOAST) => {
    const id = ++toastSeq.current;
    setToasts((current) => [...current, { id, ...message }].slice(-3));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const activeStep = useMemo(
    () => DEMO_RCA_STEPS.find((step) => step.id === stepId) ?? DEMO_RCA_STEPS[0],
    [stepId],
  );
  const prev = previousStep(stepId);
  const next = nextStep(stepId);

  return (
    <div
      className="uni"
      style={{
        minHeight: `calc(100vh / ${PRESENT_SCALE})`,
        background: UI.bg,
        color: UI.ink,
        fontFamily: "var(--font-sans)",
        zoom: PRESENT_SCALE,
      }}
    >
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: SPACE.page, display: "grid", gap: SPACE.section }}>
        <DemoHeader
          activeStep={activeStep}
          onBack={prev ? () => navigateDemoStep(prev) : null}
          onToast={pushToast}
        />
        <DemoProgress activeStepId={stepId} onStepClick={(target) => {
          if (stepIndex(target) <= stepIndex(stepId) + 1) navigateDemoStep(target);
          else pushToast();
        }} />
        <DemoScenarioFrame stepId={stepId} onNext={() => navigateDemoStep(next)} onToast={pushToast} />
      </main>
      <DemoToastStack toasts={toasts} />
      <DemoStyle />
    </div>
  );
}

function DemoHeader({
  activeStep,
  onBack,
  onToast,
}: {
  activeStep: DemoRcaStep;
  onBack: (() => void) | null;
  onToast: () => void;
}) {
  return (
    <header style={{ display: "grid", gap: SPACE.stack }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.stack }}>
        <button
          type="button"
          className="product-focusable product-control"
          disabled={!onBack}
          onClick={onBack ?? undefined}
          style={demoIconButtonStyle}
          aria-label="이전 데모 단계로 이동"
        >
          <ArrowLeft size={15} />
        </button>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, color: UI.ink3, fontSize: TYPE.label, fontWeight: 600 }}>Demo RCA Flow</p>
          <h1 style={{ margin: 0, color: UI.heading, fontSize: TYPE.page, lineHeight: 1.25 }}>
            {activeStep.title}
          </h1>
        </div>
        <button
          type="button"
          className="product-focusable product-control"
          onClick={onToast}
          style={{ ...demoButtonStyle, marginLeft: "auto" }}
        >
          데모 범위
        </button>
      </div>
      <p style={{ margin: 0, maxWidth: 760, color: UI.ink2, fontSize: TYPE.body, lineHeight: 1.6 }}>
        {activeStep.description} 이 화면은 mock data 기반이며, 실제 운영 환경에서는 승인 또는 Safe PR 검토가 필요합니다.
      </p>
    </header>
  );
}

function DemoProgress({
  activeStepId,
  onStepClick,
}: {
  activeStepId: DemoRcaStepId;
  onStepClick: (stepId: DemoRcaStepId) => void;
}) {
  const activeIndex = stepIndex(activeStepId);
  return (
    <nav className="demo-rca-progress" aria-label="RCA 데모 단계" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: SPACE.compact }}>
      {DEMO_RCA_STEPS.map((step, index) => {
        const active = step.id === activeStepId;
        const reached = index <= activeIndex;
        return (
          <button
            key={step.id}
            type="button"
            className="product-focusable product-control"
            aria-current={active ? "step" : undefined}
            onClick={() => onStepClick(step.id)}
            style={{
              border: `1px solid ${active ? BLUE : reached ? blueA(0.28) : UI.line}`,
              borderRadius: RADIUS.control,
              background: active ? blueA(0.1) : UI.card,
              color: active ? BLUE : reached ? UI.ink : UI.ink3,
              padding: `${SPACE.compact}px ${SPACE.stack}px`,
              fontSize: TYPE.label,
              fontWeight: active ? 700 : 600,
              cursor: "pointer",
              minWidth: 0,
            }}
          >
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}

function DemoScenarioFrame({
  stepId,
  onNext,
  onToast,
}: {
  stepId: DemoRcaStepId;
  onNext: () => void;
  onToast: () => void;
}) {
  return (
    <section className="demo-rca-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)", gap: SPACE.section, alignItems: "start" }}>
      <div style={{ display: "grid", gap: SPACE.stack }}>
        {stepId === "overview" && <ClusterOverview onNext={onNext} onToast={onToast} />}
        {stepId === "resources" && <ResourceOverview onNext={onNext} onToast={onToast} />}
        {stepId === "pod" && <PodDetail onNext={onNext} onToast={onToast} />}
        {stepId === "alert" && <AlertPanel onNext={onNext} onToast={onToast} />}
        {stepId === "report" && <RcaReport onNext={onNext} onToast={onToast} />}
        {stepId === "recovery" && <RecoveryPlan onNext={onNext} onToast={onToast} />}
        {stepId === "resolved" && <ResolvedState onToast={onToast} />}
      </div>
      <DemoSidePanel stepId={stepId} onToast={onToast} />
    </section>
  );
}

function ClusterOverview({ onNext, onToast }: DemoActionProps) {
  return (
    <DemoCard title="클러스터 현황" icon={LayoutDashboard}>
      <div className="demo-rca-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: SPACE.stack }}>
        {DEMO_RCA_CLUSTERS.map((cluster) => {
          const primary = cluster.id === PRIMARY_CLUSTER_ID;
          return (
            <button
              key={cluster.id}
              type="button"
              className="product-focusable product-control demo-card-button"
              onClick={primary ? onNext : onToast}
              style={{
                ...demoPanelStyle,
                opacity: primary ? 1 : 0.48,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <StatusDot tone={cluster.status} />
              <strong style={{ display: "block", marginTop: SPACE.stack, fontSize: TYPE.section, color: UI.heading }}>{cluster.name}</strong>
              <span style={{ display: "block", marginTop: 4, color: UI.ink3, fontSize: TYPE.caption }}>{cluster.region}</span>
              <span style={{ display: "block", marginTop: SPACE.stack, color: UI.ink2, fontSize: TYPE.label, lineHeight: 1.45 }}>{cluster.summary}</span>
            </button>
          );
        })}
      </div>
    </DemoCard>
  );
}

function ResourceOverview({ onNext, onToast }: DemoActionProps) {
  return (
    <DemoCard title="Pod 목록" icon={ListTree}>
      <div style={{ display: "grid", gap: SPACE.compact }}>
        {DEMO_RCA_PODS.map((pod) => {
          const primary = pod.name === PRIMARY_POD_NAME;
          return (
            <button
              key={pod.name}
              type="button"
              className="product-focusable product-control demo-row-button"
              onClick={primary ? onNext : onToast}
              style={{ ...demoRowStyle, opacity: primary ? 1 : 0.48 }}
            >
              <StatusDot tone={pod.status} />
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: "block", color: UI.ink, fontSize: TYPE.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pod.name}</strong>
                <span style={{ color: UI.ink3, fontSize: TYPE.caption }}>{pod.namespace} · {pod.node}</span>
              </span>
              <DemoBadge tone={pod.status}>{statusLabel(pod.status)}</DemoBadge>
              <ChevronRight size={15} style={{ color: UI.ink3 }} />
            </button>
          );
        })}
      </div>
    </DemoCard>
  );
}

function PodDetail({ onNext, onToast }: DemoActionProps) {
  const pod = DEMO_RCA_PODS[0];
  return (
    <DemoCard title="Pod 상세" icon={Server}>
      <div className="demo-rca-metric-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: SPACE.stack }}>
        <Metric label="Status" value={statusLabel(pod.status)} tone={pod.status} />
        <Metric label="CPU" value={pod.cpu} tone="info" />
        <Metric label="Memory" value={pod.memory} tone="info" />
        <Metric label="Restarts" value={String(pod.restarts)} tone="crit" />
      </div>
      <div style={{ marginTop: SPACE.section, display: "grid", gap: SPACE.compact }}>
        {["admission failure 이벤트 증가", "최근 5분 입장 요청 실패율 상승", "lobby capacity saturation 후보 감지"].map((event) => (
          <button key={event} type="button" className="product-focusable product-control demo-row-button" onClick={onToast} style={demoRowStyle}>
            <AlertTriangle size={15} style={{ color: HP.warn }} />
            <span style={{ color: UI.ink2, fontSize: TYPE.body }}>{event}</span>
          </button>
        ))}
      </div>
      <DemoPrimaryAction label="장애 알림 확인" onClick={onNext} />
    </DemoCard>
  );
}

function AlertPanel({ onNext, onToast }: DemoActionProps) {
  return (
    <DemoCard title="장애 알림" icon={Bell}>
      <button type="button" className="product-focusable product-control demo-card-button" onClick={onNext} style={{ ...demoPanelStyle, borderColor: TINT.crit.bd, background: TINT.crit.bg }}>
        <DemoBadge tone="crit">critical</DemoBadge>
        <h2 style={{ margin: `${SPACE.stack}px 0 0`, color: UI.heading, fontSize: TYPE.section }}>api-server admission failure</h2>
        <p style={{ margin: `${SPACE.compact}px 0 0`, color: UI.ink2, fontSize: TYPE.body, lineHeight: 1.55 }}>
          sandbox 네임스페이스의 api-server에서 입장 실패율이 증가했습니다. RCA 보고서에서 원인 후보와 근거를 확인합니다.
        </p>
      </button>
      <button type="button" className="product-focusable product-control demo-row-button" onClick={onToast} style={{ ...demoRowStyle, opacity: 0.48, marginTop: SPACE.stack }}>
        <Gauge size={15} style={{ color: UI.ink3 }} />
        <span style={{ color: UI.ink2, fontSize: TYPE.body }}>다른 알림은 이번 데모 범위 밖입니다.</span>
      </button>
    </DemoCard>
  );
}

function RcaReport({ onNext, onToast }: DemoActionProps) {
  return (
    <DemoCard title="RCA 보고서" icon={FileText}>
      <div style={{ display: "grid", gap: SPACE.stack }}>
        <ReportSection title="최종 판단">
          sandbox Deployment api-server에서 확인된 원인은 로비 처리 용량 부족입니다.
        </ReportSection>
        <ReportSection title="확인된 근거">
          <EvidenceList items={DEMO_RCA_EVIDENCE} tone="ok" />
        </ReportSection>
        <ReportSection title="추가 확인 필요">
          <EvidenceList items={DEMO_RCA_MISSING_EVIDENCE} tone="warn" onClick={onToast} />
        </ReportSection>
      </div>
      <DemoPrimaryAction label="복구 플랜 보기" onClick={onNext} />
    </DemoCard>
  );
}

function RecoveryPlan({ onNext, onToast }: DemoActionProps) {
  return (
    <DemoCard title="복구 플랜" icon={Play}>
      <div style={{ display: "grid", gap: SPACE.stack }}>
        <button type="button" className="product-focusable product-control demo-card-button" onClick={onNext} style={{ ...demoPanelStyle, borderColor: TINT.blue.bd, background: TINT.blue.bg }}>
          <DemoBadge tone="info">demo route</DemoBadge>
          <h2 style={{ margin: `${SPACE.stack}px 0 0`, color: UI.heading, fontSize: TYPE.section }}>replicas 복구 시나리오 진행</h2>
          <p style={{ margin: `${SPACE.compact}px 0 0`, color: UI.ink2, fontSize: TYPE.body, lineHeight: 1.55 }}>
            실제 운영에서는 승인 또는 Safe PR 검토가 필요하지만, 데모에서는 상태 정상화 흐름만 확인합니다.
          </p>
        </button>
        <button type="button" className="product-focusable product-control demo-row-button" onClick={onToast} style={{ ...demoRowStyle, opacity: 0.48 }}>
          <FileText size={15} style={{ color: UI.ink3 }} />
          <span style={{ color: UI.ink2, fontSize: TYPE.body }}>다른 복구 후보는 다음 UI 리팩토링에서 다룹니다.</span>
        </button>
      </div>
    </DemoCard>
  );
}

function ResolvedState({ onToast }: { onToast: () => void }) {
  return (
    <DemoCard title="상태 정상화" icon={Check}>
      <div className="demo-rca-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: SPACE.stack }}>
        <Metric label="Pod Status" value="정상" tone="ok" />
        <Metric label="Admission Failure" value="0%" tone="ok" />
        <Metric label="Issue State" value="해결됨" tone="ok" />
      </div>
      <button type="button" className="product-focusable product-control demo-row-button" onClick={onToast} style={{ ...demoRowStyle, marginTop: SPACE.section }}>
        <Check size={15} style={{ color: HP.ok }} />
        <span style={{ color: UI.ink2, fontSize: TYPE.body }}>데모 한 사이클이 끝났습니다. 이제 RCA UI 리팩 범위를 검토할 수 있어요.</span>
      </button>
    </DemoCard>
  );
}

function DemoSidePanel({ stepId, onToast }: { stepId: DemoRcaStepId; onToast: () => void }) {
  const completedCount = stepIndex(stepId) + 1;
  return (
    <aside style={{ display: "grid", gap: SPACE.stack }}>
      <DemoCard title="시나리오 범위" icon={AlertTriangle}>
        <p style={{ margin: 0, color: UI.ink2, fontSize: TYPE.body, lineHeight: 1.55 }}>
          실제 AWS/EKS 연결 없이 mock data로 사용자 흐름을 검증합니다. 목표는 전체 기능 재현이 아니라 RCA 화면 리팩토링 범위를 찾는 것입니다.
        </p>
      </DemoCard>
      <DemoCard title="진행 상태" icon={Gauge}>
        <div style={{ display: "grid", gap: SPACE.compact }}>
          {DEMO_RCA_STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className="product-focusable product-control demo-row-button"
              onClick={index <= completedCount ? () => navigateDemoStep(step.id) : onToast}
              style={{ ...demoRowStyle, opacity: index <= completedCount ? 1 : 0.44 }}
            >
              <StatusDot tone={index < completedCount ? "ok" : "muted"} />
              <span style={{ color: UI.ink2, fontSize: TYPE.label }}>{step.label}</span>
            </button>
          ))}
        </div>
      </DemoCard>
    </aside>
  );
}

function DemoCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section style={{ background: UI.card, border: `1px solid ${UI.line}`, borderRadius: RADIUS.card, padding: SPACE.card, boxShadow: `0 1px 3px ${inkA(0.06)}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.compact, marginBottom: SPACE.stack }}>
        <span style={{ width: 28, height: 28, borderRadius: RADIUS.control, background: blueA(0.1), color: BLUE, display: "grid", placeItems: "center" }}>
          <Icon size={15} />
        </span>
        <h2 style={{ margin: 0, color: UI.heading, fontSize: TYPE.section, lineHeight: 1.3 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: DemoRcaStatusTone }) {
  return (
    <div style={demoPanelStyle}>
      <span style={{ color: UI.ink3, fontSize: TYPE.caption, fontWeight: 600 }}>{label}</span>
      <strong style={{ display: "block", marginTop: SPACE.compact, color: statusColor(tone), fontSize: TYPE.kpi, lineHeight: 1.1 }}>{value}</strong>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ border: `1px solid ${UI.line2}`, borderRadius: RADIUS.control, padding: SPACE.stack, background: UI.bg2 }}>
      <h3 style={{ margin: 0, color: UI.heading, fontSize: TYPE.body }}>{title}</h3>
      <div style={{ marginTop: SPACE.compact, color: UI.ink2, fontSize: TYPE.body, lineHeight: 1.55 }}>{children}</div>
    </section>
  );
}

function EvidenceList({ items, tone, onClick }: { items: readonly string[]; tone: DemoRcaStatusTone; onClick?: () => void }) {
  return (
    <div style={{ display: "grid", gap: SPACE.compact }}>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className="product-focusable product-control demo-row-button"
          onClick={onClick}
          style={{ ...demoRowStyle, cursor: onClick ? "pointer" : "default" }}
        >
          <StatusDot tone={tone} />
          <span style={{ color: UI.ink2, fontSize: TYPE.label }}>{item}</span>
        </button>
      ))}
    </div>
  );
}

function DemoPrimaryAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: SPACE.section }}>
      <button type="button" className="product-focusable product-control" onClick={onClick} style={demoPrimaryButtonStyle}>
        {label}
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

function DemoBadge({ tone, children }: { tone: DemoRcaStatusTone; children: ReactNode }) {
  const tint = tone === "crit" ? TINT.crit : tone === "warn" ? TINT.warn : tone === "ok" ? TINT.ok : tone === "info" ? TINT.blue : TINT.gray;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: RADIUS.chip, border: `1px solid ${tint.bd}`, background: tint.bg, color: tint.fg, padding: "3px 7px", fontSize: TYPE.caption, fontWeight: 700, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function StatusDot({ tone }: { tone: DemoRcaStatusTone }) {
  return (
    <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 999, background: statusColor(tone), flexShrink: 0 }} />
  );
}

function DemoToastStack({ toasts }: { toasts: DemoToast[] }) {
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 90, display: "grid", gap: SPACE.compact, pointerEvents: "none" }}>
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout="position"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={SOFT}
            role="status"
            style={{ width: 340, background: UI.card, border: `1px solid ${UI.line}`, borderRadius: RADIUS.card, padding: SPACE.stack, boxShadow: `0 16px 44px -16px ${inkA(0.3)}`, pointerEvents: "auto" }}
          >
            <strong style={{ display: "block", color: UI.ink, fontSize: TYPE.body }}>{toast.title}</strong>
            <span style={{ display: "block", marginTop: 3, color: UI.ink2, fontSize: TYPE.caption, lineHeight: 1.45 }}>{toast.body}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DemoStyle() {
  return (
    <style>{`
      .uni {
        color-scheme: light;
        --control-hover: ${INTERACTION.controlHover};
        --control-selected: ${INTERACTION.controlSelected};
        --disabled-background: ${INTERACTION.disabledBg};
        --disabled-foreground: ${INTERACTION.disabledText};
        --focus-ring: ${INTERACTION.focusRing};
        --action: ${INTERACTION.action};
        --action-hover: ${INTERACTION.actionHover};
        --action-pressed: ${INTERACTION.actionPressed};
      }
      .uni .demo-card-button,
      .uni .demo-row-button {
        transition: background .14s ease, border-color .14s ease, transform .14s ease;
      }
      .uni .demo-card-button:not(:disabled):hover,
      .uni .demo-row-button:not(:disabled):hover {
        background: ${UI.card} !important;
        border-color: ${blueA(0.35)} !important;
        transform: translateY(-1px);
      }
      @media (max-width: 980px) {
        .uni main { padding: ${SPACE.stack}px !important; }
        .uni .demo-rca-layout { grid-template-columns: minmax(0, 1fr) !important; }
        .uni .demo-rca-progress { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .uni .demo-rca-card-grid,
        .uni .demo-rca-metric-grid { grid-template-columns: minmax(0, 1fr) !important; }
      }
    `}</style>
  );
}

interface DemoActionProps {
  onNext: () => void;
  onToast: () => void;
}

const demoPanelStyle: CSSProperties = {
  border: `1px solid ${UI.line}`,
  borderRadius: RADIUS.control,
  background: UI.bg2,
  padding: SPACE.stack,
};

const demoRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto auto",
  alignItems: "center",
  gap: SPACE.compact,
  width: "100%",
  border: `1px solid ${UI.line}`,
  borderRadius: RADIUS.control,
  background: UI.card,
  padding: `${SPACE.compact}px ${SPACE.stack}px`,
  textAlign: "left",
  cursor: "pointer",
};

const demoButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: SPACE.compact,
  border: `1px solid ${UI.line}`,
  borderRadius: RADIUS.control,
  background: UI.card,
  color: UI.ink2,
  padding: `${SPACE.compact}px ${SPACE.stack}px`,
  fontSize: TYPE.label,
  fontWeight: 700,
  cursor: "pointer",
};

const demoPrimaryButtonStyle: CSSProperties = {
  ...demoButtonStyle,
  borderColor: BLUE,
  background: BLUE,
  color: UI.card,
};

const demoIconButtonStyle: CSSProperties = {
  ...demoButtonStyle,
  width: 34,
  height: 34,
  justifyContent: "center",
  padding: 0,
};
