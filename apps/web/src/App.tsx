import React, { useState, useEffect } from "react";
import {
  Database,
  Cpu,
  Layers,
  Code2,
  DollarSign,
  Building2,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Terminal,
  Activity,
  Zap,
  Globe,
  HelpCircle,
  BookOpen,
  Workflow,
  Lightbulb,
  CheckSquare,
  CreditCard,
  Key,
  ShieldCheck
} from "lucide-react";

interface DiffItem {
  id: string;
  entityKey: string;
  domain: string;
  severity: "CRITICAL" | "MAJOR" | "MINOR" | "INFORMATIONAL";
  diffSummary: string;
  changes: any[];
  detectedAt: string;
}

interface RefinedEntity {
  id: string;
  domain: string;
  entityKey: string;
  versionLabel?: string;
  structuredData: any;
  summary: string;
  createdAt: string;
}

const API_BASE = import.meta.env.DEV ? "" : "https://data-refinery-worker.juanquy.workers.dev";

export default function App() {
  const [activeTab, setActiveTab] = useState<"diffs" | "dev" | "pricing" | "regulatory" | "playground" | "mcp" | "help" | "billing">("diffs");
  const [loading, setLoading] = useState(false);
  const [diffs, setDiffs] = useState<DiffItem[]>([]);
  const [devItems, setDevItems] = useState<RefinedEntity[]>([]);
  const [pricingItems, setPricingItems] = useState<RefinedEntity[]>([]);
  const [regulatoryItems, setRegulatoryItems] = useState<RefinedEntity[]>([]);
  const [stats, setStats] = useState({
    developer: 1,
    pricing: 1,
    regulatory: 1,
    custom: 0,
    recentDiffs: 1
  });

  // Playground state
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [prompt, setPrompt] = useState("Extract main product features, pricing if mentioned, and company details.");
  const [refining, setRefining] = useState(false);
  const [refineResult, setRefineResult] = useState<any>(null);
  const [copiedMcp, setCopiedMcp] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);

  // Billing & Stripe state
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [purchasedKey, setPurchasedKey] = useState<string | null>(null);
  const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null);
  const [keyToCheck, setKeyToCheck] = useState("");
  const [keyInspectResult, setKeyInspectResult] = useState<any>(null);
  const [checkingKey, setCheckingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Fetch initial data & handle checkout success redirect
  const fetchData = async () => {
    setLoading(true);
    try {
      // Check for Stripe Checkout return
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");
      if (sessionId) {
        setActiveTab("billing");
        const keyRes = await fetch(`${API_BASE}/api/v1/billing/session-key?session_id=${sessionId}`);
        if (keyRes.ok) {
          const keyData = await keyRes.json();
          if (keyData.apiKey) {
            setPurchasedKey(keyData.apiKey);
            setPurchasedPlan(keyData.plan || "PRO");
          }
        }
      }
      // Diffs
      const diffRes = await fetch(`${API_BASE}/api/v1/diffs`);
      if (diffRes.ok) {
        const d = await diffRes.json();
        setDiffs(d.diffs || []);
      }

      // Dev
      const devRes = await fetch(`${API_BASE}/api/v1/dev`);
      if (devRes.ok) {
        const d = await devRes.json();
        setDevItems(d.items || []);
      }

      // Pricing
      const pricingRes = await fetch(`${API_BASE}/api/v1/pricing`);
      if (pricingRes.ok) {
        const d = await pricingRes.json();
        setPricingItems(d.items || []);
      }

      // Regulatory
      const regRes = await fetch(`${API_BASE}/api/v1/regulatory`);
      if (regRes.ok) {
        const d = await regRes.json();
        setRegulatoryItems(d.items || []);
      }

      // Stats
      const statsRes = await fetch(`${API_BASE}/api/v1/stats`);
      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.counts) setStats(d.counts);
      }
    } catch (err) {
      console.warn("Using offline fallback demo data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefining(true);
    setRefineResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/custom/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: targetUrl,
          domainName: "custom",
          instructionPrompt: prompt
        })
      });
      const data = await res.json();
      setRefineResult(data);
      fetchData(); // refresh data
    } catch (err: any) {
      setRefineResult({ error: err.message || "Failed to refine target URL" });
    } finally {
      setRefining(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const copyMcpConfig = () => {
    const config = {
      mcpServers: {
        "data-refinery": {
          url: "https://data-refinery-worker.juanquy.workers.dev/mcp"
        }
      }
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  const handleSubscribePro = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/billing/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: window.location.origin
        })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Failed to create Stripe Checkout session: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error contacting billing server: " + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCheckKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyToCheck.trim()) return;
    setCheckingKey(true);
    setKeyInspectResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/billing/verify-key?key=${encodeURIComponent(keyToCheck.trim())}`);
      const data = await res.json();
      setKeyInspectResult(data);
    } catch (err: any) {
      setKeyInspectResult({ valid: false, message: err.message });
    } finally {
      setCheckingKey(false);
    }
  };

  const copyApiKeyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0d1424]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Universal Data Refinery Logo"
              className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(244,129,32,0.3)]"
            />
            <div className="hidden sm:block border-l border-slate-800 pl-4 py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Cloudflare Workers AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  MCP Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Pristine Structured Fuel for Autonomous AI Agents</p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Workers AI Edge: Active</span>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors border border-slate-700/50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-orange-400" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Metric Badges Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Semantic Diffs</div>
              <div className="text-xl font-bold text-white">{diffs.length || stats.recentDiffs}</div>
            </div>
          </div>

          <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Dev Packages</div>
              <div className="text-xl font-bold text-white">{devItems.length || stats.developer}</div>
            </div>
          </div>

          <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Pricing Matrices</div>
              <div className="text-xl font-bold text-white">{pricingItems.length || stats.pricing}</div>
            </div>
          </div>

          <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Regulations & Permits</div>
              <div className="text-xl font-bold text-white">{regulatoryItems.length || stats.regulatory}</div>
            </div>
          </div>

          <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">MCP Protocol</div>
              <div className="text-sm font-bold text-emerald-400">Ready (JSON-RPC)</div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search across all refined domains (e.g. 'breaking change callbacks', 'monthly cost per seat', 'SF rental permit')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1424] border border-slate-800 rounded-xl px-4 py-3 pl-11 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          <button
            type="submit"
            className="absolute right-2.5 top-2 px-3 py-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Refinery Search
          </button>
        </form>

        {/* Search Results Display if active */}
        {searchResults && (
          <div className="bg-[#0f172a] border border-orange-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Refinery Query Results for: &ldquo;{searchResults.query}&rdquo;
              </h3>
              <button
                onClick={() => setSearchResults(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear Search
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {searchResults.results?.directMatches?.map((item: any) => (
                <div key={item.id} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-mono text-orange-300 font-semibold mb-1">
                    <span>[{item.domain.toUpperCase()}] {item.entityKey}</span>
                    <span className="text-slate-500">{item.versionLabel || "v1"}</span>
                  </div>
                  <p className="text-slate-300">{item.summary}</p>
                </div>
              ))}
              {(!searchResults.results?.directMatches || searchResults.results?.directMatches.length === 0) && (
                <p className="text-xs text-slate-500">No direct matches found. Try searching with a broader keyword.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("diffs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "diffs"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Diffs & Alerts
          </button>

          <button
            onClick={() => setActiveTab("dev")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "dev"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Code2 className="w-4 h-4" />
            1. Dev Breaking Changes
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "pricing"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            2. B2B Pricing Matrices
          </button>

          <button
            onClick={() => setActiveTab("regulatory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "regulatory"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            3. Regulatory & Permits
          </button>

          <button
            onClick={() => setActiveTab("playground")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "playground"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Globe className="w-4 h-4" />
            Universal On-Demand Refiner
          </button>

          <button
            onClick={() => setActiveTab("mcp")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "mcp"
                ? "bg-slate-700 text-white"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Agent MCP Connect
          </button>

          <button
            onClick={() => setActiveTab("help")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "help"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            📖 User & MCP Guide
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "billing"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                : "bg-slate-900/60 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 border border-emerald-500/20"
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            💎 Pricing & API Keys
          </button>
        </div>

        {/* TAB 1: DIFFS & ALERTS */}
        {activeTab === "diffs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Semantic Diffs & High-Priority Change Alerts
                </h2>
                <p className="text-xs text-slate-400">
                  Autonomous change detection calculated whenever new version snapshots are refined.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {diffs.map((diff) => (
                <div
                  key={diff.id}
                  className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider ${
                          diff.severity === "CRITICAL"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : diff.severity === "MAJOR"
                            ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {diff.severity} SEVERITY
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        {diff.entityKey}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {diff.domain}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(diff.detectedAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200">{diff.diffSummary}</p>

                  {/* Changes List */}
                  {Array.isArray(diff.changes) && diff.changes.length > 0 && (
                    <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Detected Entity Modifications
                      </div>
                      <div className="grid gap-1.5 text-xs">
                        {diff.changes.map((c: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-orange-400 font-mono font-bold">•</span>
                            <div>
                              <span className="font-mono text-slate-400 mr-2">[{c.field}]</span>
                              <span>{c.significance || c.changeType}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {diffs.length === 0 && (
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
                  No diffs recorded yet. Trigger a second refinement of an existing entity to see semantic delta calculations!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DEVELOPER BREAKING CHANGES */}
        {activeTab === "dev" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                Developer API & SDK Breaking Changes Refinery
              </h2>
              <p className="text-xs text-slate-400">
                Machine-actionable breaking change signatures, deprecations, and code migration diffs.
              </p>
            </div>

            <div className="grid gap-6">
              {devItems.map((item) => {
                const data = item.structuredData;
                return (
                  <div key={item.id} className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold font-mono text-white">{data.packageOrServiceName}</h3>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            v{data.version}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {data.ecosystem}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.summary}</p>
                      </div>

                      {data.hasBreakingChanges && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Breaking Changes Present
                        </span>
                      )}
                    </div>

                    {/* Breaking Changes List */}
                    {data.breakingChanges && data.breakingChanges.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Breaking API Signatures & Migration Rules
                        </div>
                        {data.breakingChanges.map((bc: any, idx: number) => (
                          <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-bold text-orange-300">
                                {bc.symbolName}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                                {bc.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">{bc.description}</p>
                            <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-800/30 p-2.5 rounded">
                              <strong className="font-semibold">Migration Guide:</strong> {bc.migrationGuide}
                            </div>

                            {(bc.beforeCodeSnippet || bc.afterCodeSnippet) && (
                              <div className="grid md:grid-cols-2 gap-3 text-xs pt-1">
                                {bc.beforeCodeSnippet && (
                                  <div className="bg-red-950/20 border border-red-900/40 rounded p-3">
                                    <div className="text-[10px] font-bold text-red-400 mb-1">PREVIOUS (DEPRECATED)</div>
                                    <pre className="text-red-200 overflow-x-auto">{bc.beforeCodeSnippet}</pre>
                                  </div>
                                )}
                                {bc.afterCodeSnippet && (
                                  <div className="bg-emerald-950/20 border border-emerald-900/40 rounded p-3">
                                    <div className="text-[10px] font-bold text-emerald-400 mb-1">REFINED REPLACEMENT</div>
                                    <pre className="text-emerald-200 overflow-x-auto">{bc.afterCodeSnippet}</pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: B2B PRICING */}
        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                B2B SaaS, API & Cloud Pricing Matrix Refinery
              </h2>
              <p className="text-xs text-slate-400">
                Normalized pricing vectors, usage thresholds, hidden caveats, and cost overage calculators.
              </p>
            </div>

            <div className="grid gap-6">
              {pricingItems.map((item) => {
                const data = item.structuredData;
                return (
                  <div key={item.id} className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-white">{data.companyOrProductName}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {data.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.summary}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {data.freeTierAvailable && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Free Tier Available
                          </span>
                        )}
                        {data.estimatedEntryCostMonthly !== null && (
                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 text-slate-200">
                            Entry: ${data.estimatedEntryCostMonthly}/mo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tiers Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {data.tiers?.map((tier: any, idx: number) => (
                        <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{tier.name}</span>
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                {tier.pricingModel}
                              </span>
                            </div>

                            <div className="mt-3 mb-2">
                              <span className="text-2xl font-black text-white">
                                {tier.monthlyPrice === null ? "Custom" : `$${tier.monthlyPrice}`}
                              </span>
                              {tier.monthlyPrice !== null && (
                                <span className="text-xs text-slate-400 font-medium"> / mo</span>
                              )}
                            </div>

                            {/* Features */}
                            <div className="space-y-1.5 pt-2">
                              {tier.features?.map((f: string, fIdx: number) => (
                                <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Hidden conditions / caveats */}
                          {tier.hiddenConditions && tier.hiddenConditions.length > 0 && (
                            <div className="bg-amber-950/20 border border-amber-900/30 rounded p-2 text-[11px] text-amber-300 mt-3">
                              <strong>Caveat:</strong> {tier.hiddenConditions.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: REGULATORY */}
        {activeTab === "regulatory" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Localized Regulatory & Compliance Intelligence Refinery
              </h2>
              <p className="text-xs text-slate-400">
                Municipal ordinances, zoning laws, permit requirements, and grant eligibility matrices.
              </p>
            </div>

            <div className="grid gap-6">
              {regulatoryItems.map((item) => {
                const data = item.structuredData;
                return (
                  <div key={item.id} className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-white">{data.topic}</h3>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {data.jurisdiction}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {data.level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.summary}</p>
                      </div>

                      <span className="text-xs text-slate-500 font-mono">
                        Governing Body: {data.governingBody}
                      </span>
                    </div>

                    {/* Requirements */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {data.requirements?.map((req: any, idx: number) => (
                        <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-200">{req.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {req.category}
                            </span>
                          </div>

                          {req.estimatedCostOrFee && (
                            <div className="text-xs text-amber-400 font-semibold">
                              Fee: {req.estimatedCostOrFee}
                            </div>
                          )}

                          {req.penaltyForNonCompliance && (
                            <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-2 rounded">
                              <strong>Penalty:</strong> {req.penaltyForNonCompliance}
                            </div>
                          )}

                          {req.stepByStepAction && (
                            <div className="space-y-1 text-xs text-slate-300 pt-1">
                              <div className="font-semibold text-slate-400">Action Steps:</div>
                              {req.stepByStepAction.map((step: string, sIdx: number) => (
                                <div key={sIdx} className="flex items-start gap-2">
                                  <span className="text-purple-400 font-bold">{sIdx + 1}.</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: UNIVERSAL ON-DEMAND REFINER PLAYGROUND */}
        {activeTab === "playground" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                Universal On-Demand Web Refinery Playground
              </h2>
              <p className="text-xs text-slate-400">
                Input any target web URL and custom extraction prompt. Cloudflare Workers AI will crawl, sanitize HTML, extract strict JSON, compute diffs, and store the result in D1 SQL.
              </p>
            </div>

            <form onSubmit={handleRefineSubmit} className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Target Web URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/pricing or https://github.com/org/repo/releases"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Refinery Extraction Prompt / Schema Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Specify what exact structured data attributes and entities you need..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={refining}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-lg shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {refining ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Refining via Workers AI Edge...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Refine Web Content
                  </>
                )}
              </button>
            </form>

            {/* Playground Result Display */}
            {refineResult && (
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Refinery Output ({refineResult.durationMs ? `${refineResult.durationMs}ms` : "Done"})
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Entity: {refineResult.entityKey}
                  </span>
                </div>

                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-200 leading-relaxed">
                    {JSON.stringify(refineResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: MCP SERVER AGENT CONNECTION */}
        {activeTab === "mcp" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Connect AI Agents via Model Context Protocol (MCP)
              </h2>
              <p className="text-xs text-slate-400">
                Plug this Data Refinery directly into Claude Desktop, Cursor, Antigravity, LangChain, or autonomous agents.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Claude Desktop Config */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Claude Desktop / Cursor Configuration</h3>
                  <button
                    onClick={copyMcpConfig}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    {copiedMcp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedMcp ? "Copied!" : "Copy JSON"}
                  </button>
                </div>

                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "data-refinery": {
      "url": "https://data-refinery-worker.juanquy.workers.dev/mcp"
    }
  }
}`}
                </pre>

                <p className="text-xs text-slate-400">
                  Add this to your <code className="text-orange-300">claude_desktop_config.json</code> or <code className="text-orange-300">.cursor/mcp.json</code>.
                </p>
              </div>

              {/* Native MCP Tools List */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Exposed Native Agent Tools</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="font-mono font-bold text-blue-400">refinery_dev_breaking_changes</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Query deprecations, breaking changes, and migration diffs for any package.</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="font-mono font-bold text-emerald-400">refinery_b2b_pricing_matrix</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Lookup structured pricing tiers, token costs, and overage rates.</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="font-mono font-bold text-purple-400">refinery_regulatory_compliance</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Check municipal rules, permits, deadlines, and grants.</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="font-mono font-bold text-amber-400">refinery_refine_custom_url</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">On-demand extraction and sanitization for any target URL.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: USER & MCP GUIDE (HELP PAGE) */}
        {activeTab === "help" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Universal Data Refinery User & MCP Guide
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Everything you need to know about the Refinery Studio, Autonomous AI Fuel, and Model Context Protocol (MCP) integration.
              </p>
            </div>

            {/* Section 1: The Core Philosophy */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-orange-400" />
                1. What is the Data Refinery?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The internet was built for human eyes with HTML, styling, ads, and navigation menus. When autonomous AI agents (like Antigravity, Claude, or Cursor) browse web pages, raw HTML causes heavy token waste, parsing lag, and frequent hallucinations.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                The <strong>Universal Data Refinery</strong> runs at the edge on Cloudflare Workers AI. It ingests messy web documents, extracts verified facts into strict JSON schemas, calculates semantic version diffs, and serves the result as instant <em>&ldquo;machine fuel&rdquo;</em> via REST and MCP.
              </p>

              <div className="grid md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-orange-400">⚡ Ingest & Sanitize</div>
                  <p className="text-slate-400">HTML boilerplate, ads, and scripts are stripped into token-dense markdown.</p>
                </div>
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-purple-400">🧠 Workers AI Extraction</div>
                  <p className="text-slate-400">Llama 3.3 models structure the raw text into deterministic, typed JSON.</p>
                </div>
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-emerald-400">📊 Delta Diffing & Indexing</div>
                  <p className="text-slate-400">Automatic diffing flags critical changes and saves to D1 SQL & Vectorize.</p>
                </div>
              </div>
            </div>

            {/* Section 2: How to Use the Studio Dashboard */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                2. How to Use the Studio Dashboard
              </h3>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    Live Diffs & Alerts Feed
                  </div>
                  <p className="text-slate-300">
                    Whenever an existing entity is re-refined with new updates, the system computes the exact semantic difference and flags its severity (<strong>CRITICAL</strong>, <strong>MAJOR</strong>, or <strong>MINOR</strong>).
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    Universal On-Demand Refiner
                  </div>
                  <p className="text-slate-300">
                    Paste any live URL into the playground, specify your prompt, and click <strong>&ldquo;Refine Web Content&rdquo;</strong>. Cloudflare Workers AI will process the page live and store the structured result in D1 SQL.
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    Dev Breaking Changes Explorer
                  </div>
                  <p className="text-slate-300">
                    Explore major package upgrades, removed methods, signature modifications, and exact before/after migration code snippets.
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    B2B Pricing Matrix Explorer
                  </div>
                  <p className="text-slate-300">
                    Compare normalized tier costs, per-seat/usage pricing, included limits, overage rates, and hidden terms for enterprise SaaS tools.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Connecting AI Assistants via MCP */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                3. Connecting AI Assistants via Model Context Protocol (MCP)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The <strong>Model Context Protocol (MCP)</strong> allows any AI model to safely discover and invoke tools on your Data Refinery without custom coding.
              </p>

              <div className="space-y-3 text-xs">
                <div className="font-bold text-slate-200 uppercase tracking-wider">Example AI Questions you can ask once connected:</div>
                <div className="grid md:grid-cols-2 gap-3 font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
                    &ldquo;Check if there are breaking changes in stripe-node v15 and show me code migration diffs.&rdquo;
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
                    &ldquo;Compare DataDog pricing tiers and tell me the cheapest tier with 15-month metric retention.&rdquo;
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
                    &ldquo;What are the mandatory permit steps and penalties for a short-term rental in San Francisco?&rdquo;
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
                    &ldquo;Refine this pricing page URL: https://... and extract the table into JSON.&rdquo;
                  </div>
                </div>
              </div>

              {/* Step-by-step setup cards */}
              <div className="pt-2">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-xs text-white">Live Production Endpoint to use:</div>
                  <code className="text-xs font-mono text-orange-400 bg-slate-900 px-3 py-1.5 rounded block select-all">
                    https://data-refinery-worker.juanquy.workers.dev/mcp
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: STRIPE BILLING & API KEYS */}
        {activeTab === "billing" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Data Refinery Pricing & API Key Management
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Fuel your autonomous agents with enterprise-grade edge intelligence. Subscriptions powered securely by Stripe.
              </p>
            </div>

            {/* Success Key Banner if user just completed checkout */}
            {purchasedKey && (
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-6 space-y-4 shadow-xl shadow-emerald-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Payment Successful! Your {purchasedPlan} API Key is Live:</span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    10,000 Quota / mo
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={purchasedKey}
                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-4 py-3 text-sm font-mono text-emerald-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyApiKeyToClipboard(purchasedKey)}
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all flex-shrink-0"
                  >
                    {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedKey ? "Copied Key!" : "Copy Key"}
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  Pass this key in your requests via header: <code className="text-emerald-400 font-mono">X-Refinery-Key: {purchasedKey}</code> or in your MCP headers configuration.
                </p>
              </div>
            )}

            {/* Pricing Tier Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Tier */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200">Hobby / Starter</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Free
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-white">$0</span>
                    <span className="text-xs text-slate-400"> / forever</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Great for developers exploring the data refinery locally or testing MCP tool calls.
                  </p>
                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>50 free queries / day</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>Public Dev, Pricing & Municipal feeds</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>Standard MCP & REST access</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs cursor-default"
                >
                  Current Free Tier
                </button>
              </div>

              {/* Pro Tier (Stripe Checkout) */}
              <div className="bg-gradient-to-b from-[#131d36] to-[#0f172a] border-2 border-emerald-500/60 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-emerald-500/10">
                <div className="absolute -top-3 right-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md">
                    Recommended
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Data Refinery Pro</span>
                  </div>
                  <div>
                    <span className="text-4xl font-black text-white">$49</span>
                    <span className="text-xs text-slate-300"> / month</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    For AI startups, agent developers, and teams requiring high-frequency, verified machine fuel.
                  </p>
                  <div className="space-y-2.5 text-xs pt-2">
                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span><strong>10,000 refined queries</strong> / month</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Priority Cloudflare Workers AI edge execution</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Live breaking changes & pricing increase diffs</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>On-demand URL refinement & custom schemas</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Multi-agent MCP concurrency support</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubscribePro}
                  disabled={checkoutLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting to Stripe...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Subscribe with Stripe ($49/mo)
                    </>
                  )}
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200">Enterprise PaaS</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Custom
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-white">$299+</span>
                    <span className="text-xs text-slate-400"> / month</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Custom data refineries deployed to your enterprise Cloudflare zone with custom schemas.
                  </p>
                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>100,000+ queries / month</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>Dedicated private D1 SQL & Vectorize index</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>Custom webhooks & SLA uptime guarantee</span>
                    </div>
                  </div>
                </div>

                <a
                  href="mailto:support@freshbeats.ai?subject=Enterprise%20Data%20Refinery%20Inquiry"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center block transition-colors"
                >
                  Contact Enterprise Sales
                </a>
              </div>
            </div>

            {/* API Key Quota Inspector */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Verify Existing API Key & Check Remaining Quota</span>
              </div>

              <form onSubmit={handleCheckKey} className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Paste your API key (e.g., rf_live_... or rf_test_...)"
                  value={keyToCheck}
                  onChange={(e) => setKeyToCheck(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={checkingKey}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  {checkingKey ? "Checking..." : "Inspect Key"}
                </button>
              </form>

              {keyInspectResult && (
                <div className={`p-4 rounded-xl text-xs space-y-2 border ${
                  keyInspectResult.valid ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300" : "bg-red-950/20 border-red-800/40 text-red-300"
                }`}>
                  <div className="font-bold flex items-center gap-2">
                    {keyInspectResult.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{keyInspectResult.valid ? "Valid Active API Key" : "Invalid Key"}</span>
                  </div>
                  {keyInspectResult.valid && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-slate-200">
                      <div><span className="text-slate-400">Plan:</span> <strong className="text-white">{keyInspectResult.plan}</strong></div>
                      <div><span className="text-slate-400">Remaining:</span> <strong className="text-emerald-400">{keyInspectResult.remainingQueries} queries</strong></div>
                      <div><span className="text-slate-400">Monthly Quota:</span> {keyInspectResult.monthlyQuota}</div>
                      <div><span className="text-slate-400">Email:</span> {keyInspectResult.userEmail}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-[#0a0f1d] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>Universal Data Refinery • Built with Cloudflare Workers AI, D1 SQL, and Model Context Protocol</div>
          <div className="flex items-center gap-4">
            <a href="https://data-refinery-worker.juanquy.workers.dev/mcp/manifest" target="_blank" rel="noreferrer" className="hover:text-slate-300 flex items-center gap-1">
              MCP Manifest <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://data-refinery-worker.juanquy.workers.dev/api/v1/dev" target="_blank" rel="noreferrer" className="hover:text-slate-300 flex items-center gap-1">
              REST Endpoints <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
