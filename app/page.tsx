"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

// ─── MICRO SPARKLINE SVG ─────────────────────────────────────────────────────
function Sparkline({
  data,
  color = "#FF4FA3",
  width = 80,
  height = 32,
  fill = false,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(" L ")}`;
  const areaD = `M 0,${height} L ${pts.join(" L ")} L ${width},${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && (
        <path
          d={areaD}
          fill={color}
          fillOpacity="0.12"
        />
      )}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ─── ANIMATED BAR CHART ───────────────────────────────────────────────────────
function BarChart({
  bars,
  height = 120,
}: {
  bars: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div ref={ref} className="flex items-end gap-2 w-full" style={{ height }}>
      {bars.map((bar, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-[#1E1B4B]/70 mb-1">
            {bar.value}%
          </span>
          <motion.div
            className="w-full rounded-t-lg relative overflow-hidden"
            style={{
              background: bar.color
                ? `linear-gradient(to top, ${bar.color}, ${bar.color}99)`
                : "linear-gradient(to top, #FF4FA3, #FF85C2)",
              height: inView ? `${(bar.value / max) * (height - 30)}px` : "0px",
            }}
            initial={{ height: 0 }}
            animate={inView ? { height: `${(bar.value / max) * (height - 30)}px` } : {}}
            transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2.5s infinite",
              }}
            />
          </motion.div>
          <span className="text-xs text-gray-400 text-center leading-tight whitespace-nowrap">
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── DONUT CHART ─────────────────────────────────────────────────────────────
function DonutChart({
  segments,
  size = 100,
  strokeWidth = 16,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const total = segments.reduce((a, b) => a + b.value, 0);
  let offset = 0;
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#FFF1F7"
        strokeWidth={strokeWidth}
      />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const currentOffset = offset;
        offset += dash;
        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={
              inView
                ? { strokeDasharray: `${dash} ${gap}` }
                : {}
            }
            transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
          />
        );
      })}
    </svg>
  );
}

// ─── LINE AREA CHART ─────────────────────────────────────────────────────────
function LineAreaChart({
  datasets,
  labels,
  height = 140,
}: {
  datasets: { data: number[]; color: string; label: string }[];
  labels: string[];
  height?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const width = 400;
  const allVals = datasets.flatMap((d) => d.data);
  const max = Math.max(...allVals) * 1.1;
  const min = 0;
  const getY = (v: number) =>
    height - ((v - min) / (max - min)) * (height - 20) - 10;
  const getX = (i: number) =>
    (i / (labels.length - 1)) * (width - 20) + 10;

  return (
    <div ref={ref as any} className="w-full">
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height + 20}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = getY((pct / 100) * max);
          return (
            <line
              key={pct}
              x1="10"
              x2={width - 10}
              y1={y}
              y2={y}
              stroke="rgba(255,79,163,0.08)"
              strokeWidth="1"
            />
          );
        })}
        {datasets.map((ds, di) => {
          const pts = ds.data.map((v, i) => `${getX(i)},${getY(v)}`);
          const pathD = `M ${pts.join(" L ")}`;
          const areaD = `M ${getX(0)},${height} L ${pts.join(" L ")} L ${getX(ds.data.length - 1)},${height} Z`;
          return (
            <g key={di}>
              <motion.path
                d={areaD}
                fill={ds.color}
                fillOpacity="0.08"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: di * 0.15 }}
              />
              <motion.path
                d={pathD}
                fill="none"
                stroke={ds.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{
                  duration: 1.4,
                  delay: di * 0.2,
                  ease: "easeInOut",
                }}
              />
              {ds.data.map((v, i) => (
                <motion.circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(v)}
                  r="3.5"
                  fill={ds.color}
                  stroke="white"
                  strokeWidth="2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{
                    duration: 0.3,
                    delay: di * 0.2 + i * 0.08 + 0.9,
                  }}
                />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-1 px-2">
        {labels.map((l) => (
          <span key={l} className="text-xs text-gray-300">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── GAUGE CHART ─────────────────────────────────────────────────────────────
function GaugeChart({
  value,
  max = 100,
  color = "#FF4FA3",
  size = 90,
}: {
  value: number;
  max?: number;
  color?: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pct = value / max;
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.6;
  const startAngle = -Math.PI * 0.85;
  const endAngle = Math.PI * 0.85;
  const totalAngle = endAngle - startAngle;
  const circumference = r * totalAngle;
  const fillLen = pct * circumference;
  const gapLen = circumference - fillLen;

  const describeArc = (start: number, end: number) => {
    const s = { x: cx + r * Math.cos(start), y: cy + r * Math.sin(start) };
    const e = { x: cx + r * Math.cos(end), y: cy + r * Math.sin(end) };
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="#FFF1F7"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: circumference - fillLen } : {}}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize="14"
          fontWeight="900"
          fill="#1E1B4B"
          fontFamily="Sora, sans-serif"
        >
          {value}%
        </text>
      </svg>
    </div>
  );
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
function AnimatedCounter({
  value,
  duration = 2,
}: {
  value: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(numeric)) {
      setDisplay(value);
      return;
    }
    const prefix = value.match(/^[^0-9]*/)?.[0] ?? "";
    const suffix = value.match(/[^0-9.]+$/)?.[0] ?? "";
    const decimals = (value.split(".")[1] ?? "")
      .replace(/[^0-9]/g, "").length;
    let start = 0;
    const step = numeric / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) {
        setDisplay(`${prefix}${numeric.toFixed(decimals)}${suffix}`);
        clearInterval(timer);
        return;
      }
      setDisplay(`${prefix}${start.toFixed(decimals)}${suffix}`);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

// ─── FAQ ITEM ─────────────────────────────────────────────────────────────────
function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#F0E0EA] rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left group"
      >
        <span className="font-semibold text-[#1E1B4B] text-sm pr-4 group-hover:text-[#FF4FA3] transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg shadow"
        >
          +
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-pink-50 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const NAV_LINKS = ["Recursos", "Dashboard", "Planos", "Depoimentos", "FAQ"];

const FAQS = [
  {
    question: "Preciso ter conhecimento em finanças para usar a Precy+?",
    answer:
      "Não! A Precy+ foi desenvolvida para empreendedores que não são contadores. A IA te guia em cada passo, explica os números em linguagem simples e faz os cálculos complexos por você.",
  },
  {
    question: "Em quanto tempo vejo resultados?",
    answer:
      "A maioria dos usuários já vê melhora significativa na margem de lucro nos primeiros 30 dias. Com a precificação correta e controle financeiro ativo, muitos relatam aumento de 40% a 200% no lucro líquido em 3 meses.",
  },
  {
    question: "Funciona para qualquer tipo de negócio?",
    answer:
      "Sim! A Precy+ foi projetada para gráficas, papelarias, personalizados, sublimação, brindes, comunicação visual, cosméticos, velas, ateliês, docerias, costureiras, artesãos e qualquer negócio que precise precificar produtos e serviços.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. Sem fidelidade, sem multa. Você pode cancelar a qualquer momento diretamente pelo sistema. Seus dados ficam disponíveis por 30 dias após o cancelamento para exportação.",
  },
  {
    question: "Tem período de teste gratuito?",
    answer:
      "Sim! Você tem 7 dias grátis com acesso completo ao plano Pro. Sem precisar cadastrar cartão de crédito.",
  },
];

const MONTHLY_REVENUE = [38, 45, 42, 58, 53, 71, 68, 82, 79, 95, 91, 110];
const MONTHLY_PROFIT  = [12, 16, 14, 22, 19, 30, 28, 38, 35, 47, 44, 58];
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PrecyPlusLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 20));
    return () => unsub();
  }, [scrollY]);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        delay: i * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  const PLANS = [
    {
      name: "Basic",
      price: "R$ 17",
      period: "/mês",
      description: "Ideal para quem está começando a organizar o negócio.",
      highlighted: false,
      features: [
        { text: "Dashboard básico", included: true },
        { text: "Gestão de materiais", included: true },
        { text: "Cadastro de produtos", included: true },
        { text: "Precificação inteligente", included: true },
        { text: "Controle de custos fixos", included: true },
        { text: "7 dias grátis", included: true },
        { text: "Financeiro completo", included: false },
        { text: "Gestão de clientes", included: false },
        { text: "Orçamentos profissionais", included: false },
      ],
    },
    {
      name: "Pro",
      price: "R$ 37",
      period: "/mês",
      description: "Controle completo do seu negócio com recursos profissionais.",
      highlighted: true,
      badge: "MAIS ESCOLHIDO",
      features: [
        { text: "Tudo do plano Basic", included: true },
        { text: "Financeiro completo", included: true },
        { text: "Gestão de clientes", included: true },
        { text: "Orçamentos profissionais", included: true },
        { text: "Relatórios completos", included: true },
        { text: "Atualizações futuras", included: true },
        { text: "Suporte prioritário", included: true },
      ],
    },
  ];

  const DASHBOARD_TABS = [
    { label: "Visão Geral", icon: "◈" },
    { label: "Financeiro", icon: "◎" },
    { label: "Precificação", icon: "◆" },
    { label: "Clientes", icon: "◉" },
  ];

  return (
    <main
      className="min-h-screen bg-[#FFF1F7] overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=Sora:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .font-sora{font-family:'Sora',system-ui,sans-serif}
        .font-mono-code{font-family:'JetBrains Mono',monospace}
        .gradient-text{background:linear-gradient(135deg,#FF4FA3 0%,#FF85C2 60%,#FF4FA3 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .gradient-bg{background:linear-gradient(135deg,#FF4FA3 0%,#FF85C2 100%)}
        .gradient-bg-deep{background:linear-gradient(135deg,#e0357a 0%,#FF4FA3 100%)}
        .glow-pink{box-shadow:0 0 50px rgba(255,79,163,0.3),0 0 100px rgba(255,79,163,0.1)}
        .glow-pink-sm{box-shadow:0 0 20px rgba(255,79,163,0.2)}
        .glass{background:rgba(255,255,255,0.8);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,79,163,0.1)}
        .glass-white{background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .plan-glow{box-shadow:0 0 0 1px rgba(255,79,163,0.4),0 24px 80px rgba(255,79,163,0.3)}
        .float-a{animation:floatA 7s ease-in-out infinite}
        .float-b{animation:floatB 9s ease-in-out infinite 1.5s}
        .float-c{animation:floatC 8s ease-in-out infinite 3s}
        @keyframes floatA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(2deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(-2deg)}}
        @keyframes floatC{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .shimmer{background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.5) 50%,transparent 100%);background-size:200% 100%;animation:shimmer 2.5s infinite}
        .pulse-dot{animation:pulseDot 2s ease-in-out infinite}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}
        .hover-card{transition:transform .3s ease,box-shadow .3s ease}
        .hover-card:hover{transform:translateY(-6px);box-shadow:0 24px 60px rgba(255,79,163,0.18)}
        .btn-main{background:linear-gradient(135deg,#FF4FA3 0%,#FF85C2 100%);box-shadow:0 4px 24px rgba(255,79,163,0.45),0 1px 0 rgba(255,255,255,0.25) inset;transition:all .3s ease;position:relative;overflow:hidden}
        .btn-main::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#FF85C2 0%,#FF4FA3 100%);opacity:0;transition:opacity .3s ease}
        .btn-main:hover::before{opacity:1}
        .btn-main:hover{box-shadow:0 8px 40px rgba(255,79,163,0.6),0 1px 0 rgba(255,255,255,0.25) inset;transform:translateY(-2px)}
        .btn-main span{position:relative;z-index:1}
        .mesh-hero{background:radial-gradient(ellipse 90% 60% at 15% 25%,rgba(255,79,163,.14) 0%,transparent 55%),radial-gradient(ellipse 70% 70% at 85% 75%,rgba(255,133,194,.11) 0%,transparent 55%),radial-gradient(ellipse 55% 45% at 65% 10%,rgba(255,199,227,.22) 0%,transparent 50%),#FFF1F7}
        .card-border{border:1px solid rgba(255,79,163,.12);transition:border-color .3s ease,box-shadow .3s ease}
        .card-border:hover{border-color:rgba(255,79,163,.3);box-shadow:0 0 32px rgba(255,79,163,.1)}
        .tab-active{background:linear-gradient(135deg,#FF4FA3,#FF85C2);color:white;box-shadow:0 4px 16px rgba(255,79,163,.35)}
        .metric-up{color:#10b981}
        .metric-down{color:#ef4444}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .ticker-track{animation:ticker 28s linear infinite}
        .ticker-track:hover{animation-play-state:paused}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#FFF1F7}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#FF4FA3,#FF85C2);border-radius:99px}
      `}</style>

      {/* ── TICKER BAR ── */}
      <div className="bg-[#1E1B4B] py-2 overflow-hidden relative z-50">
        <div className="flex whitespace-nowrap ticker-track gap-16 text-xs font-semibold text-white/50">
          {[...Array(2)].map((_, j) => (
            <span key={j} className="flex gap-16 items-center">
              {[
                "⚡ Precificação com IA",
                "📊 Dashboard em tempo real",
                "🤖 Orçamentos automáticos",
                "💰 Controle de lucro",
                "📦 Gestão de estoque",
                "👥 CRM integrado",
                "📋 DRE automático",
                "🎯 Margem garantida",
                "⚡ Precificação com IA",
                "📊 Dashboard em tempo real",
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  {item}
                  <span className="text-[#FF4FA3]">•</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "glass shadow-[0_1px_0_rgba(255,79,163,0.1)] py-3"
            : "bg-white/90 backdrop-blur-xl py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo placeholder */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm glow-pink-sm shadow-md">
              P+
            </div>
            <span className="font-sora font-black text-lg text-[#1E1B4B]">Precy<span className="gradient-text">+</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm font-medium text-[#1E1B4B]/60 hover:text-[#FF4FA3] transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-semibold text-[#1E1B4B]/70 hover:text-[#FF4FA3] transition-colors px-4 py-2"
            >
              Entrar
            </a>
            <a
              href="/cadastro"
              className="btn-main text-white text-sm font-bold px-6 py-2.5 rounded-xl"
            >
              <span>Começar Grátis →</span>
            </a>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          >
            <motion.span animate={mobileOpen ? { rotate: 45, y: 8 } : {}} className="block w-6 h-0.5 bg-[#1E1B4B] rounded-full origin-center" />
            <motion.span animate={mobileOpen ? { opacity: 0 } : {}} className="block w-6 h-0.5 bg-[#1E1B4B] rounded-full" />
            <motion.span animate={mobileOpen ? { rotate: -45, y: -8 } : {}} className="block w-6 h-0.5 bg-[#1E1B4B] rounded-full origin-center" />
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden glass border-t border-pink-100 px-4 py-4 flex flex-col gap-3"
            >
              {NAV_LINKS.map((l) => (
                <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-[#1E1B4B]/70 py-2 hover:text-[#FF4FA3] transition-colors">
                  {l}
                </a>
              ))}
              <a href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-[#1E1B4B]/70 hover:text-[#FF4FA3] transition-colors py-2 text-center border border-pink-100 rounded-xl">
                Entrar
              </a>
              <a href="/cadastro" className="btn-main text-white text-sm font-bold px-5 py-3 rounded-xl text-center">
                <span>Começar 7 dias grátis →</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden mesh-hero pt-8 pb-0">
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-[#FF4FA3]/12 rounded-full blur-3xl float-a" />
          <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-[#FF85C2]/12 rounded-full blur-3xl float-b" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 glow-pink-sm shadow">
              <span className="pulse-dot w-2 h-2 rounded-full bg-[#FF4FA3]" />
              <span className="text-xs font-bold text-[#FF4FA3] uppercase tracking-widest">
                Plataforma Nº 1 para Empreendedores e Pequenos Negócios
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-sora font-black text-center text-[#1E1B4B] leading-[1.04] mb-6"
            style={{ fontSize: "clamp(2.5rem, 6.5vw, 4.75rem)" }}
          >
            Pare de trabalhar muito<br />
            e <span className="gradient-text">ganhar pouco.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-lg sm:text-xl text-[#1E1B4B]/55 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A Precy+ é a plataforma de inteligência financeira que precifica com IA, automatiza sua gestão e <strong className="text-[#FF4FA3] font-semibold">multiplica o lucro</strong> do seu negócio — sem complicação.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <a href="/cadastro" className="btn-main text-white font-bold px-10 py-4 rounded-2xl text-base w-full sm:w-auto">
              <span>Começar 7 dias grátis →</span>
            </a>
            <a href="#dashboard" className="flex items-center gap-2.5 font-semibold text-[#1E1B4B]/60 hover:text-[#FF4FA3] transition-colors text-sm group">
              <span className="w-10 h-10 rounded-full glass flex items-center justify-center text-[#FF4FA3] shadow group-hover:scale-110 transition-transform">▶</span>
              Ver o dashboard ao vivo
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 text-sm text-[#1E1B4B]/45 mb-14"
          >
            <div className="flex -space-x-2">
              {["CR","FL","JM","AM","BS","KL"].map((a, i) => (
                <div key={i} className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm" style={{zIndex:6-i}}>{a}</div>
              ))}
            </div>
            <span><strong className="text-[#1E1B4B]/75">+47.000</strong> empreendedores já usam</span>
            <span className="hidden sm:block text-pink-200">|</span>
            <span className="flex items-center gap-1">
              {"★★★★★".split("").map((s,i)=><span key={i} className="text-[#FF4FA3]">{s}</span>)}
              <strong className="text-[#1E1B4B]/75 ml-1.5">4.9 / 5</strong>
            </span>
          </motion.div>

          {/* ── HERO DASHBOARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Floating kpi cards */}
            <div className="absolute -left-2 sm:-left-14 top-10 z-20 float-b hidden sm:block">
              <div className="glass rounded-2xl px-4 py-3.5 shadow-xl glow-pink-sm min-w-[140px]">
                <div className="text-xs text-gray-400 mb-1">Lucro hoje</div>
                <div className="font-sora font-black text-xl text-[#1E1B4B]">R$ 842</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-emerald-500 text-xs font-bold">↑ 18%</span>
                  <Sparkline data={[20,35,28,45,38,55,48,62]} color="#10b981" width={60} height={22} fill />
                </div>
              </div>
            </div>
            <div className="absolute -right-2 sm:-right-14 top-20 z-20 float-a hidden sm:block">
              <div className="glass rounded-2xl px-4 py-3.5 shadow-xl glow-pink-sm min-w-[148px]">
                <div className="text-xs text-gray-400 mb-1">Margem IA</div>
                <div className="font-sora font-black text-2xl gradient-text">52,4%</div>
                <div className="text-xs text-[#FF4FA3] font-medium mt-1">✨ Calculada agora</div>
              </div>
            </div>
            <div className="absolute -right-2 sm:-right-10 bottom-24 z-20 float-c hidden sm:block">
              <div className="glass rounded-2xl px-3.5 py-3 shadow-xl glow-pink-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold shadow">✓</div>
                  <div>
                    <div className="text-xs font-bold text-[#1E1B4B]">Orçamento aprovado</div>
                    <div className="text-xs text-gray-400">R$ 2.480 • há 3 min 🤖</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard window */}
            <div className="relative glass rounded-3xl p-1 glow-pink shadow-2xl" style={{boxShadow:"0 30px 100px rgba(255,79,163,0.18),0 0 0 1px rgba(255,79,163,0.12)"}}>
              <div className="bg-white rounded-[22px] overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/80">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1 border border-gray-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                    <span className="text-xs font-mono-code text-gray-400">app.precy.com.br/dashboard</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-md bg-gray-200" />
                    <div className="w-5 h-5 rounded-md bg-gray-200" />
                  </div>
                </div>

                {/* Sidebar + content */}
                <div className="flex min-h-[420px]">
                  {/* Sidebar */}
                  <div className="hidden sm:flex w-[52px] flex-col items-center py-4 gap-4 border-r border-gray-100 bg-[#FAFAFA]">
                    {["◈","◎","◆","◉","⊞","☰"].map((ic, i) => (
                      <button key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${i === 0 ? "gradient-bg text-white shadow-sm" : "text-gray-300 hover:text-[#FF4FA3]"}`}>
                        {ic}
                      </button>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-4 sm:p-6 overflow-hidden">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-sora font-bold text-[#1E1B4B] text-base">Visão Geral — Dezembro 2024</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Atualizado há 2 minutos</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-500 bg-white shadow-sm">
                          <option>Últimos 12 meses</option>
                        </select>
                        <button className="btn-main text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                          <span>+ Relatório</span>
                        </button>
                      </div>
                    </div>

                    {/* KPI row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: "Faturamento", value: "R$ 110k", change: "+22%", up: true, spark: [60,75,68,90,82,95,88,110] },
                        { label: "Lucro Líquido", value: "R$ 58k", change: "+34%", up: true, spark: [22,30,28,38,35,47,44,58] },
                        { label: "Margem Média", value: "52,7%", change: "+8pp", up: true, spark: [38,42,40,46,44,50,48,53] },
                        { label: "Clientes Ativos", value: "284", change: "+15%", up: true, spark: [180,200,195,220,210,240,260,284] },
                      ].map((m, i) => (
                        <div key={i} className="bg-gradient-to-br from-[#FFF1F7] to-white rounded-2xl p-3.5 border border-pink-100/80">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs text-gray-400 font-medium leading-tight">{m.label}</span>
                            <span className={`text-xs font-bold ${m.up ? "text-emerald-500" : "text-red-500"}`}>{m.change}</span>
                          </div>
                          <div className="font-sora font-black text-[#1E1B4B] text-lg leading-none mb-2">{m.value}</div>
                          <Sparkline data={m.spark} color={m.up ? "#10b981" : "#ef4444"} width={70} height={24} fill />
                        </div>
                      ))}
                    </div>

                    {/* Charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {/* Area chart — Revenue vs Profit */}
                      <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-gray-600">Faturamento × Lucro (12 meses)</span>
                          <div className="flex gap-3 text-xs">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded bg-[#FF4FA3] inline-block" />Faturamento</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded bg-[#10b981] inline-block" />Lucro</span>
                          </div>
                        </div>
                        <LineAreaChart
                          datasets={[
                            { data: MONTHLY_REVENUE, color: "#FF4FA3", label: "Faturamento" },
                            { data: MONTHLY_PROFIT, color: "#10b981", label: "Lucro" },
                          ]}
                          labels={["J","F","M","A","M","J","J","A","S","O","N","D"]}
                          height={110}
                        />
                      </div>

                      {/* Donut — Product mix */}
                      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-gray-600 mb-3">Mix de Produtos</span>
                        <div className="flex items-center justify-center mb-3">
                          <div className="relative">
                            <DonutChart
                              segments={[
                                { value: 42, color: "#FF4FA3", label: "Personalizados" },
                                { value: 31, color: "#FF85C2", label: "Impressão" },
                                { value: 16, color: "#FFC7E3", label: "Papelaria" },
                                { value: 11, color: "#1E1B4B", label: "Outros" },
                              ]}
                              size={90}
                              strokeWidth={14}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-sora font-black text-xs text-[#1E1B4B]">100%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[
                            { label: "Personalizados", color: "#FF4FA3", pct: "42%" },
                            { label: "Impressão", color: "#FF85C2", pct: "31%" },
                            { label: "Papelaria", color: "#FFC7E3", pct: "16%" },
                            { label: "Outros", color: "#1E1B4B", pct: "11%" },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                              <span className="text-gray-500 flex-1">{item.label}</span>
                              <span className="font-bold text-[#1E1B4B]">{item.pct}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="py-16 bg-[#1E1B4B] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 left-1/3 w-72 h-72 bg-[#FF4FA3]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-[#FF85C2]/15 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "47.000+", label: "Negócios ativos", icon: "🏢" },
              { value: "R$890M+", label: "Faturamento gerenciado", icon: "💰" },
              { value: "3.2x", label: "Aumento médio de lucro", icon: "📈" },
              { value: "98.7%", label: "Taxa de satisfação", icon: "⭐" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-sora font-black text-3xl sm:text-4xl gradient-text mb-1">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="text-sm text-white/40">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DASHBOARD SHOWCASE AVANÇADO
      ══════════════════════════════════════════════ */}
      <section id="dashboard" className="py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#FFF1F7] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-[#FFF1F7] border border-pink-200 rounded-full px-4 py-2 mb-5">
              <span className="text-[#FF4FA3] text-sm font-bold">📊 Dashboard Inteligente</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-sora font-black text-3xl sm:text-5xl text-[#1E1B4B] mb-4">
              Veja o seu negócio inteiro<br />
              <span className="gradient-text">em uma só tela.</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-[#1E1B4B]/50 max-w-xl mx-auto text-base">
              Dados financeiros, produção, clientes e margem — tudo em tempo real, com gráficos que tomam decisões por você.
            </motion.p>
          </motion.div>

          {/* Tab selector */}
          <div className="flex justify-center mb-10">
            <div className="flex gap-2 glass rounded-2xl p-1.5 shadow">
              {DASHBOARD_TABS.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === i
                      ? "tab-active"
                      : "text-gray-500 hover:text-[#FF4FA3]"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard tab content */}
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="tab0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                {/* Grid of chart panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {/* Panel 1 — Monthly bars */}
                  <div className="xl:col-span-2 glass-white rounded-3xl p-6 card-border shadow">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="font-sora font-bold text-[#1E1B4B] text-base">Receita por Mês</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Em R$ mil — 2024</p>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="flex items-center gap-1.5 bg-pink-50 rounded-lg px-2.5 py-1.5"><span className="w-2 h-2 rounded bg-[#FF4FA3]"/>Receita</span>
                        <span className="flex items-center gap-1.5 bg-emerald-50 rounded-lg px-2.5 py-1.5"><span className="w-2 h-2 rounded bg-emerald-400"/>Lucro</span>
                      </div>
                    </div>
                    <BarChart
                      bars={MONTHS.map((m, i) => ({ label: m, value: MONTHLY_REVENUE[i], color: "#FF4FA3" }))}
                      height={140}
                    />
                  </div>

                  {/* Panel 2 — Gauges */}
                  <div className="glass-white rounded-3xl p-6 card-border shadow flex flex-col gap-5">
                    <h4 className="font-sora font-bold text-[#1E1B4B] text-base">Indicadores de Saúde</h4>
                    {[
                      { label: "Margem Bruta", value: 72, color: "#FF4FA3" },
                      { label: "Margem Líquida", value: 52, color: "#FF85C2" },
                      { label: "Ticket Médio", value: 68, color: "#10b981" },
                    ].map((g, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <GaugeChart value={g.value} color={g.color} size={80} />
                        <div>
                          <div className="text-sm font-semibold text-[#1E1B4B]">{g.label}</div>
                          <div className="text-xs text-gray-400">Excelente ↑</div>
                          <div className="mt-1.5 w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: g.color }}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${g.value}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: i * 0.2 }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Panel 3 — Lucro trend */}
                  <div className="glass-white rounded-3xl p-6 card-border shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-sora font-bold text-[#1E1B4B] text-sm">Evolução do Lucro</h4>
                      <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-1 rounded-lg">+382% anual</span>
                    </div>
                    <LineAreaChart
                      datasets={[{ data: MONTHLY_PROFIT, color: "#FF4FA3", label: "Lucro" }]}
                      labels={["J","F","M","A","M","J","J","A","S","O","N","D"]}
                      height={100}
                    />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-[#FFF1F7] rounded-xl p-3 text-center">
                        <div className="font-sora font-black text-lg gradient-text">R$ 58k</div>
                        <div className="text-xs text-gray-400">Melhor mês</div>
                      </div>
                      <div className="bg-[#FFF1F7] rounded-xl p-3 text-center">
                        <div className="font-sora font-black text-lg gradient-text">R$ 12k</div>
                        <div className="text-xs text-gray-400">Início do ano</div>
                      </div>
                    </div>
                  </div>

                  {/* Panel 4 — Top produtos */}
                  <div className="glass-white rounded-3xl p-6 card-border shadow">
                    <h4 className="font-sora font-bold text-[#1E1B4B] text-sm mb-4">Top Produtos por Margem</h4>
                    <div className="space-y-3.5">
                      {[
                        { name: "Caneca Personalizada", margin: 72, rev: "R$ 4.200" },
                        { name: "Banner Lona 1m²", margin: 58, rev: "R$ 3.100" },
                        { name: "Convite Digital", margin: 89, rev: "R$ 2.800" },
                        { name: "Caixinha Kraft", margin: 64, rev: "R$ 1.950" },
                      ].map((p, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600 truncate flex-1">{p.name}</span>
                            <span className="text-xs font-bold text-[#FF4FA3] ml-2">{p.margin}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-pink-50 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full gradient-bg rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${p.margin}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-16 text-right">{p.rev}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel 5 — Fluxo de caixa */}
                  <div className="glass-white rounded-3xl p-6 card-border shadow">
                    <h4 className="font-sora font-bold text-[#1E1B4B] text-sm mb-4">Fluxo de Caixa — 30 dias</h4>
                    <div className="space-y-2.5 mb-4">
                      {[
                        { label: "Entradas", value: "R$ 28.400", change: "+12%", up: true },
                        { label: "Saídas", value: "R$ 14.200", change: "-8%", up: false },
                        { label: "Saldo", value: "R$ 14.200", change: "+43%", up: true, highlight: true },
                      ].map((row, i) => (
                        <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${row.highlight ? "gradient-bg text-white" : "bg-gray-50"}`}>
                          <span className={`text-xs font-medium ${row.highlight ? "text-white/80" : "text-gray-500"}`}>{row.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${row.highlight ? "text-white" : "text-[#1E1B4B]"}`}>{row.value}</span>
                            <span className={`text-xs font-bold ${row.highlight ? "text-white/70" : row.up ? "text-emerald-500" : "text-red-400"}`}>{row.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Sparkline
                      data={[8,12,9,15,11,18,14,20,17,24,22,28]}
                      color="#FF4FA3"
                      width={240}
                      height={40}
                      fill
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="tab1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {/* DRE */}
                  <div className="xl:col-span-2 glass-white rounded-3xl p-6 card-border shadow">
                    <h4 className="font-sora font-bold text-[#1E1B4B] mb-5">DRE Automático — Demonstrativo de Resultado</h4>
                    <div className="space-y-2">
                      {[
                        { label: "Receita Bruta", value: "R$ 110.000", indent: 0, highlight: false, positive: true },
                        { label: "(-) Deduções e impostos", value: "R$ 12.100", indent: 1, highlight: false, positive: false },
                        { label: "= Receita Líquida", value: "R$ 97.900", indent: 0, highlight: true, positive: true },
                        { label: "(-) Custos variáveis", value: "R$ 28.400", indent: 1, highlight: false, positive: false },
                        { label: "= Margem de Contribuição", value: "R$ 69.500", indent: 0, highlight: true, positive: true },
                        { label: "(-) Custos fixos", value: "R$ 11.500", indent: 1, highlight: false, positive: false },
                        { label: "= EBITDA", value: "R$ 58.000", indent: 0, highlight: true, positive: true },
                      ].map((row, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.07 }}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${
                            row.highlight
                              ? "bg-gradient-to-r from-[#FFF1F7] to-pink-50 border border-pink-100"
                              : "hover:bg-gray-50"
                          }`}
                          style={{ paddingLeft: `${(row.indent + 1) * 16}px` }}
                        >
                          <span className={`text-sm ${row.highlight ? "font-bold text-[#1E1B4B]" : "text-gray-500"}`}>
                            {row.label}
                          </span>
                          <span className={`text-sm font-bold ${row.highlight ? "gradient-text" : row.positive ? "text-[#1E1B4B]" : "text-gray-400"}`}>
                            {row.value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Donut despesas */}
                  <div className="glass-white rounded-3xl p-6 card-border shadow flex flex-col">
                    <h4 className="font-sora font-bold text-[#1E1B4B] text-sm mb-5">Distribuição de Custos</h4>
                    <div className="flex justify-center mb-5">
                      <DonutChart
                        segments={[
                          { value: 45, color: "#FF4FA3", label: "Mat-prima" },
                          { value: 25, color: "#FF85C2", label: "Mão de obra" },
                          { value: 18, color: "#FFC7E3", label: "Fixos" },
                          { value: 12, color: "#1E1B4B", label: "Impostos" },
                        ]}
                        size={110}
                        strokeWidth={16}
                      />
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { label: "Matéria-prima", color: "#FF4FA3", value: "R$ 12.780", pct: "45%" },
                        { label: "Mão de obra", color: "#FF85C2", value: "R$ 7.100", pct: "25%" },
                        { label: "Custos fixos", color: "#FFC7E3", value: "R$ 5.100", pct: "18%" },
                        { label: "Impostos", color: "#1E1B4B", value: "R$ 3.420", pct: "12%" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-gray-500 flex-1">{item.label}</span>
                          <span className="text-gray-400">{item.pct}</span>
                          <span className="font-bold text-[#1E1B4B]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="tab2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {/* Precificação IA */}
                  <div className="xl:col-span-2 glass-white rounded-3xl p-6 card-border shadow">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white text-xl">✨</div>
                      <div>
                        <h4 className="font-sora font-bold text-[#1E1B4B]">Calculadora IA — Precificação Automática</h4>
                        <p className="text-xs text-gray-400">Análise em tempo real com inteligência artificial</p>
                      </div>
                    </div>
                    <div className="bg-[#FFF1F7] rounded-2xl p-4 mb-4 font-mono-code text-xs">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                        <span className="text-[#FF4FA3] font-bold">IA Precy+ analisando...</span>
                      </div>
                      {[
                        { key: "produto", value: '"Caneca Personalizada 325ml"' },
                        { key: "custo_total", value: "R$ 8,40" },
                        { key: "margem_mercado", value: "62–78%" },
                        { key: "concorrência", value: "R$ 19,90 – R$ 35,00" },
                        { key: "preço_sugerido", value: '"R$ 27,90"', highlight: true },
                        { key: "lucro_unitário", value: "R$ 19,50 (69,9%)", highlight: true },
                      ].map((line, i) => (
                        <div key={i} className="flex gap-3 py-0.5">
                          <span className="text-[#FF85C2]/70 w-32 truncate flex-shrink-0">{line.key}:</span>
                          <span className={`${line.highlight ? "text-[#FF4FA3] font-bold" : "text-[#1E1B4B]/60"}`}>{line.value}</span>
                        </div>
                      ))}
                    </div>
                    {/* Products comparison bars */}
                    <div className="space-y-3">
                      {[
                        { name: "Caneca 325ml", cost: 8.4, price: 27.9, margin: 70 },
                        { name: "Caixinha Kraft P", cost: 3.2, price: 12.9, margin: 75 },
                        { name: "Adesivo 10x10cm", cost: 0.9, price: 4.9, margin: 82 },
                        { name: "Tag kraft personalizada", cost: 0.6, price: 2.9, margin: 79 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-36 truncate flex-shrink-0">{item.name}</span>
                          <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                            <motion.div
                              className="h-full gradient-bg rounded-lg flex items-center justify-end px-2"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.margin}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.9, delay: i * 0.1 }}
                            >
                              <span className="text-xs text-white font-bold">{item.margin}%</span>
                            </motion.div>
                          </div>
                          <span className="text-xs font-bold text-[#1E1B4B] w-14 text-right">R$ {item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Margem por categoria */}
                  <div className="glass-white rounded-3xl p-6 card-border shadow">
                    <h4 className="font-sora font-bold text-[#1E1B4B] text-sm mb-5">Margem por Categoria</h4>
                    <BarChart
                      bars={[
                        { label: "Canecas", value: 69 },
                        { label: "Papelaria", value: 78 },
                        { label: "Adesivos", value: 82 },
                        { label: "Caixas", value: 64 },
                        { label: "Digital", value: 91 },
                      ]}
                      height={160}
                    />
                    <div className="mt-4 p-3 bg-[#FFF1F7] rounded-xl">
                      <div className="text-xs text-gray-400 mb-1">Margem média geral</div>
                      <div className="font-sora font-black text-2xl gradient-text">76,8%</div>
                      <div className="text-xs text-emerald-500 font-semibold">+12pp vs. antes da Precy+</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div
                key="tab3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {/* CRM pipeline */}
                  <div className="xl:col-span-2 glass-white rounded-3xl p-6 card-border shadow">
                    <h4 className="font-sora font-bold text-[#1E1B4B] mb-5">Pipeline de Vendas — CRM</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {[
                        { stage: "Lead", count: 24, value: "R$ 18.400", color: "#94a3b8" },
                        { stage: "Orçamento", count: 12, value: "R$ 34.200", color: "#FF85C2" },
                        { stage: "Negociando", count: 8, value: "R$ 22.800", color: "#FF4FA3" },
                        { stage: "Fechado", count: 47, value: "R$ 89.600", color: "#10b981" },
                      ].map((stage, i) => (
                        <div key={i} className="flex-1 min-w-[130px]">
                          <div className="text-xs font-bold mb-2 text-center" style={{ color: stage.color }}>{stage.stage}</div>
                          <div className="space-y-2">
                            {[...Array(Math.min(stage.count, 3))].map((_, j) => (
                              <div key={j} className="h-10 rounded-lg text-xs flex items-center px-3 font-medium text-gray-600" style={{ background: `${stage.color}18`, border: `1px solid ${stage.color}30` }}>
                                Cliente #{stage.count - j}
                              </div>
                            ))}
                            {stage.count > 3 && (
                              <div className="h-8 rounded-lg text-xs flex items-center justify-center text-gray-400 border border-dashed border-gray-200">
                                +{stage.count - 3} mais
                              </div>
                            )}
                          </div>
                          <div className="mt-3 text-center">
                            <div className="text-xs font-bold" style={{ color: stage.color }}>{stage.value}</div>
                            <div className="text-xs text-gray-400">{stage.count} clientes</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LTV e retenção */}
                  <div className="glass-white rounded-3xl p-6 card-border shadow flex flex-col gap-5">
                    <h4 className="font-sora font-bold text-[#1E1B4B] text-sm">Métricas de Clientes</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "LTV Médio", value: "R$ 3.840", change: "+28%", spark: [20,25,30,28,35,32,40,38] },
                        { label: "Retenção", value: "78%", change: "+5%", spark: [60,65,68,70,72,74,76,78] },
                        { label: "NPS", value: "87", change: "+12pts", spark: [60,65,70,68,75,78,82,87] },
                        { label: "Ticket Médio", value: "R$ 287", change: "+19%", spark: [180,200,195,220,240,260,275,287] },
                      ].map((m, i) => (
                        <div key={i} className="bg-[#FFF1F7] rounded-xl p-3">
                          <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                          <div className="font-sora font-black text-base text-[#1E1B4B] leading-tight">{m.value}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-emerald-500 font-bold">{m.change}</span>
                          </div>
                          <Sparkline data={m.spark} color="#FF4FA3" width={80} height={22} fill />
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-3">Top Clientes por Receita</div>
                      {[
                        { name: "Studio Bella", value: "R$ 4.200", pct: 88 },
                        { name: "Papelaria Flor", value: "R$ 3.100", pct: 65 },
                        { name: "Ateliê Arte+", value: "R$ 2.800", pct: 59 },
                      ].map((c, i) => (
                        <div key={i} className="mb-2.5">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 font-medium">{c.name}</span>
                            <span className="font-bold text-[#1E1B4B]">{c.value}</span>
                          </div>
                          <div className="h-1.5 bg-pink-50 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full gradient-bg rounded-full"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${c.pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── PARE DE PERDER DINHEIRO ── */}
      <section id="recursos" className="py-24 sm:py-32 bg-[#FFF1F7] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-2 mb-5">
              <span className="text-red-500 text-sm font-bold">⚠️ Reconhece isso?</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-sora font-black text-3xl sm:text-5xl text-[#1E1B4B] mb-4">
              Seu negócio está perdendo dinheiro<br />
              <span className="gradient-text">todo dia. Você sabe?</span>
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "💸", title: "Precificando no chute", desc: "Você cobra sem saber se está lucrando de verdade. No final do mês, o dinheiro some misteriosamente.", stat: "67% dos negócios", statLabel: "precificam errado" },
              { icon: "📉", title: "Margem invisível corroída", desc: "Custos escondidos corroem seu lucro. Você trabalha muito, recebe pouco e não entende por quê.", stat: "34% do lucro", statLabel: "perdido em média" },
              { icon: "📂", title: "Desorganização total", desc: "Orçamentos em papel, clientes no WhatsApp, financeiro numa planilha quebrada e desatualizada.", stat: "8h por semana", statLabel: "desperdiçadas" },
              { icon: "⏰", title: "Tempo que não volta", desc: "Horas calculando manualmente o que poderia ser feito em segundos com automação e IA.", stat: "R$ 2.400/mês", statLabel: "em horas perdidas" },
              { icon: "🎯", title: "Sem visão estratégica", desc: "Você não sabe quais produtos lucram mais, quais clientes valem mais e onde está sangrando.", stat: "91% nunca", statLabel: "calcularam margem real" },
              { icon: "😰", title: "Estresse financeiro", desc: "Ansiedade sobre fechar o mês no positivo. Sem clareza, sem controle, sem paz mental para crescer.", stat: "3x mais chances", statLabel: "de fechar sem isso" },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                className="group glass-white rounded-3xl p-6 hover-card card-border"
              >
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-sora font-bold text-[#1E1B4B] text-base mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.desc}</p>
                <div className="pt-4 border-t border-pink-50">
                  <span className="font-sora font-black gradient-text text-lg">{p.stat}</span>
                  <span className="text-xs text-gray-400 ml-2">{p.statLabel}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANTES × DEPOIS ── */}
      <section className="py-24 sm:py-32 bg-[#1E1B4B] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FF4FA3]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FF85C2]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-sora font-black text-3xl sm:text-5xl text-white text-center mb-14">
            A transformação que <span className="gradient-text">nossos clientes vivem.</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-center mb-5">
                <span className="inline-flex items-center gap-2 bg-red-500/15 text-red-300 text-sm font-bold px-4 py-2 rounded-full border border-red-500/25">✗ ANTES da Precy+</span>
              </div>
              {["Preço no chute, margem incerta e imprevisível","Planilhas desatualizadas que ninguém entende","Perder clientes por falta de follow-up","Relatórios que levam horas para fazer","Não saber se o mês fechou no lucro","Desorganização, estresse e esgotamento mental"].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                  <span className="text-red-400 flex-shrink-0 font-bold">✗</span>
                  <span className="text-white/55 text-sm">{t}</span>
                </motion.div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="text-center mb-5">
                <span className="inline-flex items-center gap-2 bg-[#FF4FA3]/15 text-[#FF85C2] text-sm font-bold px-4 py-2 rounded-full border border-[#FF4FA3]/25">✓ DEPOIS da Precy+</span>
              </div>
              {["Precificação automática com IA e margem garantida","Dashboard financeiro em tempo real, sempre atualizado","CRM automático que nunca esquece um cliente","Relatórios e DRE gerados automaticamente em segundos","Lucro visível ao vivo, sem surpresas no fim do mês","Clareza total, controle absoluto, paz mental e crescimento"].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 + 0.1 }} className="flex items-center gap-3 bg-[#FF4FA3]/10 border border-[#FF4FA3]/20 rounded-xl px-4 py-3">
                  <span className="text-[#FF85C2] flex-shrink-0 font-bold">✓</span>
                  <span className="text-white/85 text-sm font-medium">{t}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section id="depoimentos" className="py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-[#FFF1F7] border border-pink-200 rounded-full px-4 py-2 mb-5">
              <span className="text-[#FF4FA3] text-sm font-bold">💬 Resultados reais</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-sora font-black text-3xl sm:text-5xl text-[#1E1B4B]">
              Quem usa, <span className="gradient-text">não volta atrás.</span>
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Camila Rodrigues", role: "Papelaria personalizada", local: "São Paulo, SP", avatar: "CR", highlight: "Triplicou o lucro em 60 dias", rating: 5, text: "Eu trabalhava 12 horas por dia e não entendia por que não sobrava dinheiro. Com a Precy+ descobri que estava perdendo 34% de margem em quase todos os produtos. Em 60 dias triplicei meu lucro líquido." },
              { name: "Fernanda Lima", role: "Negócio de Comunicação Visual", local: "Belo Horizonte, MG", avatar: "FL", highlight: "Contratou 2 funcionários em 3 meses", rating: 5, text: "Meu negócio faturava bem mas eu não conseguia crescer. A Precy+ mostrou que estava com o preço errado em 70% dos produtos. Reajustei, automatizei os orçamentos e em 3 meses contratei mais 2 funcionários." },
              { name: "Juliana Martins", role: "Criadora de personalizados", local: "Curitiba, PR", avatar: "JM", highlight: "Orçamentos profissionais em 30 segundos", rating: 5, text: "O sistema de precificação com IA mudou minha vida. Antes ficava horas calculando cada orçamento. Hoje em 30 segundos tenho um orçamento profissional com minha logo. Clientes ficam impressionados." },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-white rounded-3xl p-7 hover-card card-border">
                <div className="flex gap-0.5 mb-4">{"★★★★★".split("").map((s, j) => <span key={j} className="text-[#FF4FA3]">{s}</span>)}</div>
                <div className="inline-flex items-center gap-1.5 bg-[#FF4FA3]/10 rounded-lg px-3 py-1.5 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4FA3]" />
                  <span className="text-xs font-bold text-[#FF4FA3]">{t.highlight}</span>
                </div>
                <blockquote className="text-gray-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</blockquote>
                <div className="flex items-center gap-3 border-t border-pink-50 pt-5">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{t.avatar}</div>
                  <div>
                    <div className="font-sora font-bold text-[#1E1B4B] text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role} · {t.local}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM NUMBERS ── */}
      <section className="py-20 bg-[#FFF1F7] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-white rounded-3xl p-8 sm:p-12 card-border shadow-lg" style={{ boxShadow: "0 24px 80px rgba(255,79,163,0.08)" }}>
            <div className="text-center mb-10">
              <h2 className="font-sora font-black text-2xl sm:text-4xl text-[#1E1B4B]">
                Números que <span className="gradient-text">provam o impacto.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              {[
                { icon: "📈", value: "3.2x", label: "Aumento médio de lucro líquido em 90 dias", spark: [30,38,52,48,62,58,72,68,80,88,95,105] },
                { icon: "⏱️", value: "4h", label: "Economizadas por semana com automações", spark: [0.5,0.8,1.2,1.8,2.3,2.8,3.1,3.5,3.8,4,4,4] },
                { icon: "💰", value: "R$890M+", label: "Em faturamento gerenciado na plataforma", spark: [10,30,60,80,120,180,250,340,450,580,720,890] },
                { icon: "🎯", value: "89%", label: "Corrigiram a precificação no 1º mês de uso", spark: [40,45,52,58,65,70,74,78,82,85,87,89] },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-sora font-black text-3xl sm:text-4xl gradient-text mb-2">
                    <AnimatedCounter value={item.value} />
                  </div>
                  <div className="text-sm text-gray-500 mb-3 leading-snug">{item.label}</div>
                  <div className="flex justify-center">
                    <Sparkline data={item.spark} color="#FF4FA3" width={100} height={32} fill />
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Revenue projection chart */}
            <div className="bg-[#FFF1F7] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sora font-bold text-[#1E1B4B] text-sm">Crescimento acumulado de usuários — 2024</h3>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-3 py-1.5 rounded-lg">+340% no ano</span>
              </div>
              <LineAreaChart
                datasets={[
                  { data: [4200,6800,9500,12000,16000,19500,24000,29000,34000,39500,44000,47000], color: "#FF4FA3", label: "Usuários" },
                ]}
                labels={["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]}
                height={120}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#FF4FA3]/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-[#FFF1F7] border border-pink-200 rounded-full px-4 py-2 mb-5">
              <span className="text-[#FF4FA3] text-sm font-bold">💎 Planos e preços</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-sora font-black text-3xl sm:text-5xl text-[#1E1B4B] mb-4">
              Invista no seu negócio.<br />
              <span className="gradient-text">O retorno é certo.</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-[#1E1B4B]/50 max-w-md mx-auto">7 dias grátis, sem cartão. Cancele quando quiser.</motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-3xl mx-auto">
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-7 sm:p-8 ${plan.highlighted ? "gradient-bg text-white plan-glow scale-[1.04]" : "glass-white card-border hover-card"}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1E1B4B] text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap tracking-wide">
                    {plan.badge}
                  </div>
                )}
                <div className={`text-xs font-bold mb-2 ${plan.highlighted ? "text-white/70" : "text-[#FF4FA3]"}`}>{plan.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`font-sora font-black text-4xl ${plan.highlighted ? "text-white" : "text-[#1E1B4B]"}`}>{plan.price}</span>
                  <span className={`text-sm mb-2 ${plan.highlighted ? "text-white/60" : "text-gray-400"}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 leading-relaxed ${plan.highlighted ? "text-white/65" : "text-gray-500"}`}>{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-3 text-sm ${!f.included ? "opacity-35" : ""}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${f.included ? (plan.highlighted ? "bg-white/20 text-white" : "bg-[#FF4FA3]/12 text-[#FF4FA3]") : "bg-gray-100 text-gray-300"}`}>
                        {f.included ? "✓" : "✗"}
                      </span>
                      <span className={plan.highlighted ? "text-white/85" : "text-gray-600"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <a href="#" className={`block w-full text-center font-bold py-3.5 rounded-2xl transition-all text-sm ${plan.highlighted ? "bg-white text-[#FF4FA3] hover:bg-white/90 shadow-lg" : "btn-main text-white"}`}>
                  {plan.highlighted ? <span>Começar grátis por 7 dias →</span> : "Começar agora"}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 sm:py-32 bg-[#FFF1F7] relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="font-sora font-black text-3xl sm:text-5xl text-[#1E1B4B] mb-4">
              Perguntas <span className="gradient-text">frequentes.</span>
            </motion.h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <FaqItem question={f.question} answer={f.answer} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 sm:py-40 bg-[#1E1B4B] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#FF4FA3] rounded-full blur-3xl opacity-10" />
          <div className="absolute top-10 right-1/4 w-72 h-72 bg-[#FF85C2] rounded-full blur-3xl opacity-15" />
          <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-[#FFC7E3] rounded-full blur-3xl opacity-8" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-[#FF4FA3]/20 border border-[#FF4FA3]/30 rounded-full px-5 py-2 mb-8">
              <span className="pulse-dot w-2 h-2 rounded-full bg-[#FF4FA3]" />
              <span className="text-sm font-bold text-[#FF85C2]">7 dias grátis — sem cartão</span>
            </div>
            <h2 className="font-sora font-black text-4xl sm:text-6xl text-white mb-6 leading-tight">
              Seu negócio merece<br />
              <span className="gradient-text">mais lucro. Agora.</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed">
              Cada dia sem a Precy+ é dinheiro que poderia estar no seu bolso. Comece grátis, veja o impacto em dias.
            </p>
            <a href="#planos" className="btn-main text-white font-black px-14 py-5 rounded-2xl text-lg inline-block glow-pink">
              <span>Quero meu lucro de volta →</span>
            </a>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-10 text-sm text-white/30 mt-10">
              {["✓ 7 dias grátis", "✓ Sem cartão de crédito", "✓ Cancele quando quiser", "✓ Suporte em português"].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="text-[#FF85C2]">{item.split(" ")[0]}</span>
                  {item.split(" ").slice(1).join(" ")}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0A0820] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-md">P+</div>
                <span className="font-sora font-black text-base text-white">Precy<span className="gradient-text">+</span></span>
              </div>
              <p className="text-white/35 text-sm leading-relaxed max-w-xs mb-5">
                A plataforma de inteligência financeira para pequenos negócios brasileiros precificarem com IA e crescerem com clareza.
              </p>
              <div className="flex gap-2">
                {[
                  { label: "ig", icon: "◈" },
                  { label: "fb", icon: "◉" },
                  { label: "yt", icon: "▶" },
                  { label: "li", icon: "◆" },
                ].map((s) => (
                  <div key={s.label} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#FF4FA3]/20 border border-white/8 hover:border-[#FF4FA3]/30 flex items-center justify-center text-white/30 hover:text-[#FF85C2] text-sm transition-all cursor-pointer">
                    {s.icon}
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: "Produto", links: ["Recursos", "Como Funciona", "Integrações", "Roadmap", "Changelog"] },
              { title: "Empresa", links: ["Sobre nós", "Blog", "Carreiras", "Imprensa", "Parceiros"] },
              { title: "Suporte", links: ["Central de Ajuda", "Tutoriais em vídeo", "API Docs", "Status", "Contato"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-white/60 font-semibold text-xs uppercase tracking-widest mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-white/30 hover:text-[#FF85C2] text-sm transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs">© 2025 Precy+. Todos os direitos reservados. Feito com 💖 no Brasil.</p>
            <div className="flex gap-6">
              {["Privacidade", "Termos de Uso", "Cookies"].map((l) => (
                <a key={l} href="#" className="text-white/20 hover:text-white/45 text-xs transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}