import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Terminal,
  CreditCard,
  Sliders,
  Code2,
  DollarSign,
  Building2,
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  Globe,
  Bot,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface LandingPageProps {
  onEnterStudio: (tab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterStudio }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeMetricIdx, setActiveMetricIdx] = useState(0);

  const metrics = [
    { label: "Token Waste Eliminated", val: "85%+", color: "text-orange-400" },
    { label: "Global Edge Latency", val: "< 18ms", color: "text-cyan-400" },
    { label: "Deterministic Schema Fidelity", val: "100%", color: "text-emerald-400" },
    { label: "Autonomous Agent Protocol", val: "MCP & HTTP 402", color: "text-purple-400" }
  ];

  // Metric rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMetricIdx((prev) => (prev + 1) % metrics.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // 60 FPS Complex Data Refinement Particle Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let lastResize = Date.now();
    const handleResize = () => {
      if (!canvas) return;
      // Debounce resize to prevent iOS Safari address-bar scroll freezing
      if (Date.now() - lastResize < 200) return;
      lastResize = Date.now();
      if (Math.abs(canvas.width - window.innerWidth) > 40 || Math.abs(canvas.height - window.innerHeight) > 100) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Particle types: RAW_CHAOS (left, red/amber), REFINING (center, vortex), PRISTINE_FUEL (right, cyan/emerald)
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      stage: "CHAOS" | "CORE" | "PRISTINE";
      color: string;
      label?: string;
      alpha: number;
    }

    const chaoticGlyphs = ["<div>", "<html>", "cookie_consent", "404", "ads.js", "style=font", "token_waste", "{...}", "%20"];
    const pristineGlyphs = ["JSON", "schema", "200_OK", "verified", "AST_diff", "MCP_tool", "price_tier", "zoning_code"];

    const particles: Particle[] = [];
    const numParticles = isMobile ? 25 : 65;

    for (let i = 0; i < numParticles; i++) {
      const isLeft = Math.random() > 0.45;
      particles.push({
        x: isLeft ? Math.random() * (width * 0.45) : width * 0.55 + Math.random() * (width * 0.45),
        y: Math.random() * height,
        vx: isLeft ? 0.4 + Math.random() * 1.0 : 0.7 + Math.random() * 1.2,
        vy: (Math.random() - 0.5) * 0.6,
        size: isMobile ? 1.5 + Math.random() * 1.5 : 2 + Math.random() * 2.5,
        stage: isLeft ? "CHAOS" : "PRISTINE",
        color: isLeft ? (Math.random() > 0.5 ? "#f97316" : "#ef4444") : (Math.random() > 0.5 ? "#06b6d4" : "#10b981"),
        label: isLeft ? chaoticGlyphs[Math.floor(Math.random() * chaoticGlyphs.length)] : pristineGlyphs[Math.floor(Math.random() * pristineGlyphs.length)],
        alpha: 0.3 + Math.random() * 0.6
      });
    }

    let coreRotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const coreX = width * 0.5;
      const coreY = isMobile ? height * 0.35 : height * 0.42;
      coreRotation += 0.015;

      // Draw Refinery Reactor Core Glow & Concentric Rings
      const gradRadius = isMobile ? 180 : 280;
      const grad = ctx.createRadialGradient(coreX, coreY, 20, coreX, coreY, gradRadius);
      grad.addColorStop(0, "rgba(249, 115, 22, 0.3)");
      grad.addColorStop(0.4, "rgba(245, 158, 11, 0.15)");
      grad.addColorStop(0.7, "rgba(6, 182, 212, 0.1)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(coreX, coreY, gradRadius, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Outer Reactor Ring
      ctx.save();
      ctx.translate(coreX, coreY);
      ctx.rotate(coreRotation);
      ctx.strokeStyle = "rgba(249, 115, 22, 0.4)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([12, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, isMobile ? 130 : 190, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating Middle Ring
      ctx.rotate(-coreRotation * 2.2);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([16, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, isMobile ? 90 : 135, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating Inner Ring
      ctx.rotate(coreRotation * 1.5);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, isMobile ? 55 : 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Update & Draw Particles
      for (let idx = 0; idx < particles.length; idx++) {
        const p = particles[idx];
        // Move towards core if in CHAOS and crossing threshold
        if (p.stage === "CHAOS" && p.x > width * 0.42 && p.x < width * 0.52) {
          // Transmute into pristine data stream!
          p.stage = "PRISTINE";
          p.color = Math.random() > 0.5 ? "#06b6d4" : "#10b981";
          p.label = pristineGlyphs[Math.floor(Math.random() * pristineGlyphs.length)];
          p.vx = 1.0 + Math.random() * 1.2;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Reset if offscreen right
        if (p.x > width + 40) {
          p.x = -20;
          p.y = Math.random() * height;
          p.stage = "CHAOS";
          p.color = Math.random() > 0.5 ? "#f97316" : "#ef4444";
          p.label = chaoticGlyphs[Math.floor(Math.random() * chaoticGlyphs.length)];
          p.vx = 0.5 + Math.random() * 1.0;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Draw glyph label (only on desktop or subset to preserve iOS FPS)
        if (!isMobile && idx % 3 === 0 && p.label) {
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillStyle = p.color;
          ctx.fillText(p.label, p.x + 6, p.y + 3);
        }

        // Connect nearby pristine particles with laser lattices (desktop only)
        if (!isMobile && p.stage === "PRISTINE") {
          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            if (p2.stage === "PRISTINE") {
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 80) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
            }
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050811] text-slate-100 overflow-x-hidden selection:bg-orange-500 selection:text-white flex flex-col justify-between">
      {/* Background Interactive Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Radial Ambient Backdrops */}
      <div className="fixed top-0 left-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-orange-600/10 rounded-full blur-3xl sm:blur-[140px] pointer-events-none z-0 transform-gpu" />
      <div className="fixed bottom-0 right-0 w-72 sm:w-[600px] h-72 sm:h-[600px] bg-cyan-600/10 rounded-full blur-3xl sm:blur-[160px] pointer-events-none z-0 transform-gpu" />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800/60 bg-[#070b16]/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-md animate-pulse"></div>
              <img
                src="/logo.png"
                alt="Universal Data Refinery"
                className="h-11 w-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(244,129,32,0.6)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
                  UNIVERSAL DATA REFINERY
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  Workers AI v3.3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Edge Foundry for Autonomous Machine Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEnterStudio("schemas")}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-teal-300 hover:bg-teal-950/30 hover:border-teal-500/30 border border-transparent transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>Schema Studio</span>
            </button>

            <button
              onClick={() => onEnterStudio("mcp")}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-950/30 hover:border-purple-500/30 border border-transparent transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>MCP Protocol</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else onEnterStudio("billing");
              }}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Pricing & Plans</span>
            </button>

            <button
              onClick={() => onEnterStudio("diffs")}
              className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-teal-500 hover:from-orange-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-orange-500/20 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 flex-1 flex flex-col justify-center items-center text-center space-y-10">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-orange-500/30 shadow-lg shadow-orange-500/10 backdrop-blur-md animate-float">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span className="text-xs font-mono font-semibold text-slate-300">
            Cloudflare Workers AI Llama 3.3-70B • 330 Global Edge Cities
          </span>
        </div>

        {/* Hero Logo Type & 3D Typography */}
        <div className="space-y-4 max-w-4xl">
          <div className="flex justify-center mb-8">
            <div className="relative group cursor-pointer" onClick={() => onEnterStudio("diffs")}>
              {/* Massive Ambient Energy Halo */}
              <div className="absolute -inset-10 bg-gradient-to-r from-orange-500/40 via-amber-500/30 to-cyan-500/40 rounded-full blur-3xl opacity-70 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
              
              {/* Concentric Orbital Glow Rings */}
              <div className="absolute -inset-6 rounded-full border border-orange-500/30 border-dashed animate-spin duration-[25000ms]"></div>
              <div className="absolute -inset-12 rounded-full border border-cyan-500/25 border-dashed animate-spin duration-[35000ms] [animation-direction:reverse]"></div>

              {/* High-Resolution Centered Logo */}
              <img
                src="/logo.png"
                alt="Refinery Logo Mark"
                className="w-48 sm:w-64 md:w-80 lg:w-96 h-auto object-contain relative z-10 drop-shadow-[0_0_35px_rgba(244,129,32,0.85)] drop-shadow-[0_0_70px_rgba(6,182,212,0.5)] transform group-hover:scale-105 transition-all duration-500 animate-pulse-glow"
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
            <span className="block text-white">The World Wide Web Was Built</span>
            <span className="block bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
              For Human Eyes.
            </span>
            <span className="block text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-300 mt-2">
              We Refine It Into Pristine Machine Fuel.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed pt-2">
            Eliminate <strong className="text-orange-400 font-bold">85%+ token noise</strong> and AI hallucinations. Transform messy public web pages into deterministic JSON schemas, AST delta diffs, and Model Context Protocol (MCP) streams in under 20ms.
          </p>
        </div>

        {/* Dynamic Rotating Metric Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-[#0b101d]/80 border transition-all duration-500 backdrop-blur-md ${
                activeMetricIdx === idx
                  ? "border-orange-500/60 bg-[#0f172a] shadow-lg shadow-orange-500/10 scale-[1.03]"
                  : "border-slate-800/80 text-slate-400"
              }`}
            >
              <div className={`text-2xl sm:text-3xl font-black font-mono ${m.color}`}>
                {m.val}
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Hero Interactive Launch CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={() => onEnterStudio("diffs")}
            className="w-full sm:w-auto relative group overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-teal-500 hover:from-orange-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-2xl shadow-orange-500/30 transition-all transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <Zap className="w-5 h-5 text-slate-950 fill-current" />
            <span>Enter Refinery Studio</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => onEnterStudio("schemas")}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-teal-300 font-bold text-sm border border-teal-500/30 hover:border-teal-500/60 transition-all backdrop-blur-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Visual Schema Studio</span>
          </button>
        </div>

        {/* Interactive Data Transformation Comparison Box */}
        <div className="w-full max-w-5xl pt-8">
          <div className="bg-[#0b101d]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-left">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  Live Data Transformation: Raw Web HTML ➔ Pristine Machine Fuel
                </h3>
                <p className="text-xs text-slate-400">See how Cloudflare Workers AI and AST delta diffing purify unformatted web code.</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                100% Token Efficiency
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Left: Raw Messy Web */}
              <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-red-400 font-bold text-[11px]">
                  <span>RAW MESSY WEB (54.2 KB • 8,400 Tokens)</span>
                  <span className="px-2 py-0.5 rounded bg-red-900/40">85% Noise Waste</span>
                </div>
                <pre className="text-red-300/70 overflow-x-auto text-[11px] max-h-52 overflow-y-auto leading-relaxed bg-black/40 p-3 rounded-xl border border-red-900/30">
{`<!DOCTYPE html>
<html lang="en">
  <head><script src="/ads.js"></script><style>.ad{display:flex}</style></head>
  <body>
    <div id="cookie-banner">Accept cookies to continue</div>
    <nav class="mega-menu">Products | Pricing | Docs</nav>
    <div class="main-content">
      <h1>Stripe Node SDK Release v15.0.0</h1>
      <p>Notice: All legacy callback methods have been permanently removed.</p>
      <p>Please use Promise-based async/await syntax.</p>
    </div>
    <footer>Copyright 2026 • Privacy Policy</footer>
  </body>
</html>`}
                </pre>
              </div>

              {/* Right: Pristine Structured Fuel */}
              <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-bold text-[11px]">
                  <span>REFINED MACHINE FUEL (0.8 KB • 110 Tokens)</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-900/40 text-emerald-400">Strict JSON</span>
                </div>
                <pre className="text-cyan-200 overflow-x-auto text-[11px] max-h-52 overflow-y-auto leading-relaxed bg-black/40 p-3 rounded-xl border border-cyan-800/30">
{`{
  "package": "stripe-node",
  "targetVersion": "15.0.0",
  "breakingChanges": [
    {
      "symbol": "charges.create(params, callback)",
      "type": "REMOVED_FUNCTION",
      "severity": "CRITICAL",
      "migrationGuide": "Use await stripe.charges.create(params)"
    }
  ],
  "verified": true,
  "edgeLatencyMs": 16
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Core Product Pillars */}
        <div className="w-full max-w-5xl pt-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Enterprise Machine Data Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Built for Cursor, Claude Desktop, LangChain, LlamaIndex, and Autonomous AI Fleets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            <div
              onClick={() => onEnterStudio("dev")}
              className="bg-[#0b101d]/80 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Developer API Breaking Changes</h3>
              <p className="text-xs text-slate-400">
                Machine-actionable deprecation AST diffs, removed parameters, and TypeScript migration code snippets.
              </p>
            </div>

            <div
              onClick={() => onEnterStudio("pricing")}
              className="bg-[#0b101d]/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">B2B SaaS Pricing Matrices</h3>
              <p className="text-xs text-slate-400">
                Normalized pricing plans, seats, token cost limits, overage rates, and live plan upgrades.
              </p>
            </div>

            <div
              onClick={() => onEnterStudio("regulatory")}
              className="bg-[#0b101d]/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
            >
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Regulatory & Municipal Rules</h3>
              <p className="text-xs text-slate-400">
                Municipal permits, short-term rental laws, building compliance codes, and penalty checklists.
              </p>
            </div>

            <div
              onClick={() => onEnterStudio("schemas")}
              className="bg-[#0b101d]/80 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
            >
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 w-fit">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Visual Custom Schema Studio</h3>
              <p className="text-xs text-slate-400">
                Define custom schemas visually with no code. Auto-generate live JSON schemas, TypeScript types, and dynamic MCP tools.
              </p>
            </div>

            <div
              onClick={() => onEnterStudio("mcp")}
              className="bg-[#0b101d]/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Model Context Protocol (MCP)</h3>
              <p className="text-xs text-slate-400">
                Native JSON-RPC 2.0 endpoint for Claude Desktop, Cursor, and multi-agent frameworks to query live knowledge in 1 click.
              </p>
            </div>

            <div
              onClick={() => onEnterStudio("billing")}
              className="bg-[#0b101d]/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">HTTP 402 Agent Micro-Billing</h3>
              <p className="text-xs text-slate-400">
                Fractional $0.005/query autonomous agent key provisioning, live Stripe subscriptions, and metered quotas.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: TRANSPARENT PRICING & SUBSCRIPTION PLANS */}
        <div id="pricing" className="w-full max-w-5xl pt-16 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Transparent, Predictable Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Fuel Your Autonomous Agents at the Edge
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Choose the right tier for your agent fleet or software workloads. Zero hidden lock-in, cancel anytime, backed by Stripe.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {/* Free Starter */}
            <div className="bg-[#0b101d]/90 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-xl backdrop-blur-md hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Hobby / Dev</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                    FREE
                  </span>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-white">$0</div>
                  <div className="text-xs text-slate-400 mt-1">Free forever for exploratory testing</div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>50 queries / day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Public Dev, Pricing & Zoning feeds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Standard MCP & REST access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Global Cloudflare edge caching</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onEnterStudio("playground")}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer text-center"
              >
                Explore Free Studio
              </button>
            </div>

            {/* Pro Builder (Highlighted) */}
            <div className="relative bg-gradient-to-b from-slate-900 via-[#0b101d] to-[#0b101d] border-2 border-emerald-500 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-2xl shadow-emerald-500/10 transform hover:scale-[1.02] transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-lg">
                Most Popular
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Data Refinery Pro</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    PRO BUILDER
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">$49</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">For AI startups, agent builders, and production apps</div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-200 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>10,000</strong> refined queries / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Priority Workers AI Llama 3.3-70B</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Live AST Breaking Changes & Diffs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Visual Schema Studio & Custom Schemas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Multi-agent MCP concurrency support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onEnterStudio("billing")}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-center"
              >
                Subscribe with Stripe ($49/mo)
              </button>
            </div>

            {/* Enterprise Custom */}
            <div className="bg-[#0b101d]/90 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-xl backdrop-blur-md hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-purple-400 uppercase tracking-wider">Enterprise PaaS</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                    CUSTOM SLA
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">$299+</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Dedicated private edge zones & custom SLAs</div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span><strong>100,000+</strong> queries / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Dedicated private D1 SQL & Vectorize</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Custom Webhooks & 99.998% Uptime SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Dedicated Engineering Slack channel</span>
                  </li>
                </ul>
              </div>

              <a
                href="mailto:sales@freshbeats.ai?subject=Universal%20Data%20Refinery%20Enterprise%20Inquiry"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold text-xs border border-purple-500/30 transition-all cursor-pointer text-center block"
              >
                Contact Enterprise Sales
              </a>
            </div>
          </div>

          {/* Autonomous AI Micropayment Strip */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Bot className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                <strong>Autonomous Agent Wallet?</strong> Pay per query on demand ($0.005/call) via <code className="text-cyan-300">X-402-Payment</code> header.
              </span>
            </div>
            <button
              onClick={() => onEnterStudio("help")}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 whitespace-nowrap cursor-pointer"
            >
              View HTTP 402 Spec →
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-[#060913] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto opacity-70" />
            <span>Universal Data Refinery • Edge Machine Fuel for AI Agents</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onEnterStudio("diffs")} className="hover:text-slate-300">Studio Dashboard</button>
            <button onClick={() => onEnterStudio("schemas")} className="hover:text-slate-300">Schema Studio</button>
            <button onClick={() => onEnterStudio("mcp")} className="hover:text-slate-300">MCP Protocol</button>
            <button onClick={() => onEnterStudio("billing")} className="hover:text-slate-300">Stripe Billing</button>
            <a href="https://data-refinery-worker.juanquy.workers.dev/mcp/manifest" target="_blank" rel="noreferrer" className="hover:text-slate-300 flex items-center gap-1">
              MCP Manifest <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
