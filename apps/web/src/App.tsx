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
  ShieldCheck,
  Megaphone,
  Share2,
  Rss,
  BarChart3,
  Clock,
  Bell,
  Play,
  Pause,
  Trash2,
  Settings2,
  Eye,
  Bot,
  Plus,
  Radio,
  Sliders,
  FolderPlus,
  GitCommit,
  ChevronDown,
  Users,
  Wand2,
  FileCode,
  ShoppingBag,
  Download,
  Server,
  ShieldAlert,
  Edit3,
  Save,
  Coins,
  History
} from "lucide-react";
import { LandingPage } from "./LandingPage";

interface MarketplaceListing {
  id: string;
  creator_name: string;
  title: string;
  slug: string;
  domain: string;
  description: string;
  price_per_query: number;
  total_queries: number;
  earnings_usd: number;
  is_featured: number;
  schema: any;
  sampleOutput?: any;
  created_at: string;
}

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

interface PipelineItem {
  id: string;
  name: string;
  target_url: string;
  domain: string;
  frequency_hours: number;
  custom_prompt?: string;
  webhook_url?: string;
  status: "ACTIVE" | "PAUSED";
  next_run_at?: string;
  last_run_at?: string;
}

interface WebhookItem {
  id: string;
  webhook_url: string;
  event_types: string;
  target_entities: string;
  status: string;
  created_at: string;
}

interface CustomSchemaField {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required: boolean;
}

interface CustomSchemaItem {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string;
  fields: CustomSchemaField[];
  custom_system_prompt?: string;
  is_public: number;
  created_at: string;
}

interface WorkspaceItem {
  id: string;
  name: string;
  plan: string;
  owner_user_id: string;
}

interface WorkspaceMember {
  id: string;
  email: string;
  display_name: string;
  role: string;
  joined_at: string;
}

const API_BASE = import.meta.env.DEV ? "" : "https://data-refinery-worker.juanquy.workers.dev";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "studio">(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash === "#studio" || window.location.search.includes("session_id") || window.location.hash.startsWith("#tab-")) {
        return "studio";
      }
    }
    return "landing";
  });

  const [activeTab, setActiveTab] = useState<"diffs" | "dev" | "pricing" | "regulatory" | "schemas" | "marketplace" | "export" | "playground" | "mcp" | "help" | "billing" | "marketing" | "management">("diffs");
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

  // Phase 4: Creator Marketplace & Revenue Share State
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [newListingTitle, setNewListingTitle] = useState("Biotech & Drug Patent Exclusivity");
  const [newListingCreator, setNewListingCreator] = useState("BioData Systems");
  const [newListingDesc, setNewListingDesc] = useState("Extracts pharmaceutical patent exclusivity expiration dates, NDA filing numbers, and therapeutic targets.");
  const [newListingDomain, setNewListingDomain] = useState("medical");
  const [newListingPrice, setNewListingPrice] = useState("0.008");
  const [publishingListing, setPublishingListing] = useState(false);
  const [queriedListingId, setQueriedListingId] = useState<string | null>(null);
  const [queryListingResult, setQueryListingResult] = useState<any | null>(null);
  const [queryingListing, setQueryingListing] = useState(false);

  // Phase 4: LLM Fine-Tuning & RAG Dataset Exporter State
  const [exportFormat, setExportFormat] = useState<"openai_jsonl" | "llama3_jsonl" | "alpaca" | "rag_chunks">("openai_jsonl");
  const [exportDomain, setExportDomain] = useState<"all" | "developer" | "pricing" | "regulatory" | "custom">("all");
  const [exportDataset, setExportDataset] = useState<any[]>([]);
  const [exportCount, setExportCount] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  // Phase 4: Enterprise SLA & Edge Telemetry State
  const [slaData, setSlaData] = useState<any | null>(null);
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

interface NicheSchemaTemplate {
  id: string;
  badge: string;
  acv: string;
  name: string;
  description: string;
  prompt: string;
  complianceStandard: string;
  legalBasis: string;
  complianceNotice: string;
  fields: CustomSchemaField[];
}

const NICHE_SCHEMA_TEMPLATES: NicheSchemaTemplate[] = [
  {
    id: "dev-sdk",
    badge: "📦 DevOps & AI Coding",
    acv: "$12k–$60k/yr",
    name: "Developer SDK Breaking Changes & AST Migration",
    description: "Extracts deprecated functions, removed parameters, breaking signature shifts, and exact before/after code migration snippets.",
    prompt: "Extract affected symbols, deprecated function names, breaking signatures, and exact before/after code migration snippets from public API documentation and open-source changelogs.",
    complianceStandard: "Open Source / API Syntax Standards (OSI & FSF)",
    legalBasis: "Public Developer Docs & Functional API Syntax (Google LLC v. Oracle America, Inc., 593 U.S. 2021)",
    complianceNotice: "Lawful extraction of public changelogs, API method signatures, and syntactic AST transformations. Strict adherence to open-source repository licenses.",
    fields: [
      { id: "f1", name: "packageOrServiceName", type: "string", description: "e.g. stripe-node, nextjs, react, @cloudflare/workers-types", required: true },
      { id: "f2", name: "version", type: "string", description: "Version number e.g. 15.0.0 or 2026.1", required: true },
      { id: "f3", name: "hasBreakingChanges", type: "boolean", description: "True if release contains breaking changes", required: true },
      { id: "f4", name: "affectedSymbols", type: "array", description: "List of deprecated or removed functions, classes, and methods", required: true },
      { id: "f5", name: "migrationCodeBefore", type: "string", description: "Original legacy code snippet prior to upgrade", required: false },
      { id: "f6", name: "migrationCodeAfter", type: "string", description: "Updated modern code snippet compliant with new release", required: false },
      { id: "f7", name: "severityLevel", type: "string", description: "CRITICAL, HIGH, MEDIUM, or LOW", required: true }
    ]
  },
  {
    id: "b2b-pricing",
    badge: "💰 B2B SaaS Pricing",
    acv: "$24k–$100k/yr",
    name: "B2B SaaS Dynamic Pricing & Quota Matrix",
    description: "Extracts normalized monthly/annual costs, seat limits, included token/bandwidth quotas, and hidden overage terms across SaaS vendors.",
    prompt: "Extract normalized monthly/annual pricing, seat minimums, included usage/token quotas, and hidden overage terms from public vendor pricing pages and rate cards. Exclude speculative or non-public estimates.",
    complianceStandard: "FTC Truth-in-Advertising & Lanham Act Standards",
    legalBasis: "Public Commercial Fact Extraction (hiQ Labs, Inc. v. LinkedIn Corp., 31 F.4th 1180)",
    complianceNotice: "Processes publicly published rate cards and tier limits for competitive FinOps intelligence and cost benchmarking. Excludes non-public negotiated enterprise discounts.",
    fields: [
      { id: "f1", name: "productName", type: "string", description: "Name of vendor product (e.g. Supabase, Datadog, OpenAI)", required: true },
      { id: "f2", name: "planTier", type: "string", description: "e.g. Starter, Pro, Team, Enterprise", required: true },
      { id: "f3", name: "monthlyPriceUSD", type: "number", description: "Base monthly recurring price in USD", required: true },
      { id: "f4", name: "annualPriceUSD", type: "number", description: "Annual billed rate per month in USD", required: false },
      { id: "f5", name: "includedTokenQuota", type: "number", description: "Monthly included compute/token quota", required: false },
      { id: "f6", name: "overageRatePerUnit", type: "number", description: "Overage fee per million tokens or per GB", required: false },
      { id: "f7", name: "hiddenContractCaveats", type: "array", description: "Seat minimums, annual commitments, and fine print", required: false }
    ]
  },
  {
    id: "municipal-zoning",
    badge: "🏛️ Municipal Zoning & STR",
    acv: "$36k–$120k/yr",
    name: "Municipal Zoning, STR & Permit Compliance",
    description: "Extracts city zoning classifications, short-term rental permits, mandatory inspection checklists, and penalty fine structures.",
    prompt: "Extract municipal zoning classifications, short-term rental permit laws, mandatory compliance checklists, and penalty fine structures from official municipal codes. Adhere strictly to Fair Housing Act nondiscrimination principles.",
    complianceStandard: "Fair Housing Act (42 U.S.C. 3601) & FOIA / State Sunshine Laws",
    legalBasis: "Official Government Edicts in the Public Domain (Georgia v. Public.Resource.Org, Inc., 140 S. Ct. 1498)",
    complianceNotice: "Directly ingests published city planning ordinances, commercial permit fee schedules, and STR licensing statutes. Adheres strictly to Fair Housing nondiscrimination regulations.",
    fields: [
      { id: "f1", name: "jurisdictionCity", type: "string", description: "City or municipality name (e.g. San Francisco, Austin)", required: true },
      { id: "f2", name: "zoningCode", type: "string", description: "Zoning code (e.g. R-1, C-3, Mixed-Use Commercial)", required: true },
      { id: "f3", name: "shortTermRentalAllowed", type: "boolean", description: "Whether short-term rentals (Airbnb) are legal", required: true },
      { id: "f4", name: "permitFeeUSD", type: "number", description: "Filing and application fee in USD", required: false },
      { id: "f5", name: "mandatoryInspections", type: "array", description: "Required structural, fire, and health safety inspections", required: true },
      { id: "f6", name: "maximumPenaltyFineUSD", type: "number", description: "Maximum violation penalty fine amount", required: false }
    ]
  },
  {
    id: "biopharma-fda",
    badge: "🧬 BioPharma FDA & Patents",
    acv: "$50k–$150k/yr",
    name: "BioPharma FDA Trials & Patent Exclusivity Cliffs",
    description: "Extracts active chemical ingredients, FDA 510(k)/NDA approvals, clinical trial phases, black-box warnings, and patent exclusivity expiration dates.",
    prompt: "Extract active pharmaceutical ingredients, FDA approval status, clinical trial phases, black box warnings, and patent exclusivity expiration dates from public FDA registries and ClinicalTrials.gov. For informational and research intelligence only; not clinical medical advice.",
    complianceStandard: "FDA 21 CFR Parts 312/314 & USPTO Public Patent Registry",
    legalBasis: "Public Health Registry Mandates (42 CFR Part 11) & Public Patent Disclosures",
    complianceNotice: "Research and market intelligence extraction from ClinicalTrials.gov and FDA Orange/Purple Books. Factual regulatory metadata only; not medical, therapeutic, or prescribing advice.",
    fields: [
      { id: "f1", name: "drugBrandName", type: "string", description: "Commercial brand name of therapeutic drug", required: true },
      { id: "f2", name: "activeCompound", type: "string", description: "Chemical or biologic active pharmaceutical ingredient (API)", required: true },
      { id: "f3", name: "fdaApprovalStatus", type: "string", description: "APPROVED, FAST_TRACK, PHASE_III, or UNDER_REVIEW", required: true },
      { id: "f4", name: "therapeuticIndication", type: "string", description: "Target disease or medical condition", required: true },
      { id: "f5", name: "patentExclusivityExpiration", type: "string", description: "Date or year when patent cliff occurs (e.g. 2028-11)", required: true },
      { id: "f6", name: "blackBoxWarnings", type: "array", description: "FDA safety warnings and contraindications", required: false }
    ]
  },
  {
    id: "sec-10k",
    badge: "📊 SEC 10-K & Risk Factors",
    acv: "$30k–$90k/yr",
    name: "SEC 10-K Disclosures & Risk Factor Intelligence",
    description: "Extracts GAAP vs Non-GAAP operating metrics, total debt maturities, forward guidance statements, and highlighted corporate risk factors from SEC filings.",
    prompt: "Extract GAAP vs Non-GAAP operating metrics, total debt maturities, forward guidance statements, and highlighted corporate risk factors from official SEC EDGAR filings. For research intelligence only; does not constitute investment advice.",
    complianceStandard: "SEC Regulation S-K, Regulation G & Sarbanes-Oxley Act",
    legalBasis: "Securities Exchange Act of 1934 (15 U.S.C. § 78m) Public EDGAR Filings",
    complianceNotice: "Extracts public statutory disclosures, Item 1A risk factors, and debt schedules filed with the SEC. Informational research intelligence only; does not constitute registered financial, investment, or legal advice.",
    fields: [
      { id: "f1", name: "tickerSymbol", type: "string", description: "Stock ticker symbol (e.g. NVDA, MSFT, AAPL)", required: true },
      { id: "f2", name: "fiscalPeriod", type: "string", description: "e.g. FY2025, Q3-2026", required: true },
      { id: "f3", name: "totalRevenueUSD", type: "number", description: "Total GAAP revenue in USD", required: true },
      { id: "f4", name: "gaapOperatingMarginPercent", type: "number", description: "GAAP operating margin percentage", required: false },
      { id: "f5", name: "totalDebtMaturityUSD", type: "number", description: "Total long-term debt maturing in USD", required: false },
      { id: "f6", name: "criticalRiskFactors", type: "array", description: "Primary macroeconomic and technological risk factors", required: true },
      { id: "f7", name: "forwardGuidanceSummary", type: "string", description: "Executive forward guidance summary", required: false }
    ]
  },
  {
    id: "health-insurance-prior-auth",
    badge: "🩺 Health Insurance & Prior-Auth",
    acv: "$50k–$250k/yr",
    name: "Health Plan Clinical Policies & Prior-Auth Criteria",
    description: "Extracts CPT procedure codes, mandatory conservative therapy weeks, required clinical trial criteria, drug formulary tiers, and immediate approval red flags for claims AI agents.",
    prompt: "Extract procedure CPT codes, mandatory prior conservative therapies, required clinical documentation, drug formulary tiers, and immediate approval red flags from public health plan clinical policy bulletins. HIPAA COMPLIANCE: Do NOT extract, ingest, or store individual patient Protected Health Information (PHI).",
    complianceStandard: "HIPAA Safe Harbor (45 CFR § 164.514) & CMS Interoperability Rule (CMS-9115-F)",
    legalBasis: "CMS Mandated Public Payer Policy Bulletins & CPT-4 Public Clinical Guidelines",
    complianceNotice: "CRITICAL HIPAA COMPLIANCE: Ingests public commercial and Medicare/Medicaid clinical policy coverage bulletins only. Strictly prohibited from processing, ingesting, or storing individual Protected Health Information (PHI) or individual patient medical records.",
    fields: [
      { id: "f1", name: "cptProcedureOrHcpcsCode", type: "string", description: "CPT or HCPCS code (e.g. 72148, 99214, J9355)", required: true },
      { id: "f2", name: "procedureOrDrugName", type: "string", description: "Name of medical procedure, surgery, or specialty drug", required: true },
      { id: "f3", name: "priorConservativeTherapyWeeks", type: "number", description: "Number of weeks of conservative therapy required (e.g. 6)", required: false },
      { id: "f4", name: "requiredPrecedingTreatments", type: "array", description: "Mandatory prior treatments (e.g. Physical Therapy, NSAIDs)", required: true },
      { id: "f5", name: "immediateApprovalRedFlags", type: "array", description: "Emergency conditions granting instant prior-auth bypass", required: false },
      { id: "f6", name: "mandatoryPhysicianSpecialties", type: "array", description: "Approved ordering specialist doctor types", required: true },
      { id: "f7", name: "drugFormularyTier", type: "string", description: "Tier 1 Generic, Tier 2 Preferred, Tier 3 Specialty, or Non-Formulary", required: false },
      { id: "f8", name: "expeditedTurnaroundHours", type: "number", description: "CMS mandated turnaround deadline in hours (e.g. 72)", required: true }
    ]
  }
];

  // Phase 3: Visual Schema Studio & Workspace Multi-Tenancy State
  const [customSchemas, setCustomSchemas] = useState<CustomSchemaItem[]>([]);
  const [schemasLoading, setSchemasLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("ws_global_refinery");
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  
  // New Schema Builder Form
  const [newSchemaName, setNewSchemaName] = useState(NICHE_SCHEMA_TEMPLATES[0].name);
  const [newSchemaDesc, setNewSchemaDesc] = useState(NICHE_SCHEMA_TEMPLATES[0].description);
  const [newSchemaPrompt, setNewSchemaPrompt] = useState(NICHE_SCHEMA_TEMPLATES[0].prompt);
  const [newSchemaFields, setNewSchemaFields] = useState<CustomSchemaField[]>(NICHE_SCHEMA_TEMPLATES[0].fields);
  const [savingSchema, setSavingSchema] = useState(false);
  const [previewTab, setPreviewTab] = useState<"json" | "typescript" | "mcp">("json");
  const [activeTemplateId, setActiveTemplateId] = useState<string>("dev-sdk");
  const [helpSection, setHelpSection] = useState<"quickstart" | "mcp" | "niches" | "studio" | "marketplace" | "api" | "faq">("quickstart");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const handleApplyNicheTemplate = (template: NicheSchemaTemplate) => {
    setActiveTemplateId(template.id);
    setNewSchemaName(template.name);
    setNewSchemaDesc(template.description);
    setNewSchemaPrompt(template.prompt);
    setNewSchemaFields([...template.fields]);
    showToast(`✅ Loaded Template: ${template.name}`);
  };
  
  // Custom Schema Tester
  const [testingSchemaSlug, setTestingSchemaSlug] = useState<string | null>(null);
  const [testSchemaUrl, setTestSchemaUrl] = useState("https://httpbin.org/json");
  const [testSchemaResult, setTestSchemaResult] = useState<any | null>(null);
  const [testSchemaLoading, setTestSchemaLoading] = useState(false);

  // Workspace Member Invite Form
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("BUILDER");
  const [invitingMember, setInvitingMember] = useState(false);

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

  const fetchSchemas = async () => {
    setSchemasLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/schemas?workspaceId=${selectedWorkspace}`);
      if (res.ok) {
        const data = await res.json();
        setCustomSchemas(data.schemas || []);
      }
    } catch (err) {
      console.error("Failed to fetch schemas:", err);
    } finally {
      setSchemasLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const [wRes, mRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/workspaces`).then(r => r.json()),
        fetch(`${API_BASE}/api/v1/workspaces/${selectedWorkspace}/members`).then(r => r.json())
      ]);
      if (wRes.status === "success") setWorkspaces(wRes.workspaces || []);
      if (mRes.status === "success") setWorkspaceMembers(mRes.members || []);
    } catch (err) {
      console.error("Failed to fetch workspaces/members:", err);
    }
  };

  const fetchMarketplaceListings = async () => {
    setMarketplaceLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/marketplace`);
      if (res.ok) {
        const data = await res.json();
        setMarketplaceListings(data.listings || []);
      }
    } catch (err) {
      console.error("Failed to fetch marketplace:", err);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const fetchFineTuningDataset = async () => {
    setExportLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/export/fine-tuning?format=${exportFormat}&domain=${exportDomain}&limit=200`);
      if (res.ok) {
        const data = await res.json();
        setExportDataset(data.dataset || []);
        setExportCount(data.count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch dataset:", err);
    } finally {
      setExportLoading(false);
    }
  };

  const fetchSlaHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/enterprise/sla-health`);
      if (res.ok) {
        const data = await res.json();
        setSlaData(data);
      }
    } catch (err) {
      console.error("Failed to fetch SLA health:", err);
    }
  };

  useEffect(() => {
    if (currentView === "studio") {
      fetchData();
      fetchSchemas();
      fetchWorkspaces();
      fetchMarketplaceListings();
      fetchFineTuningDataset();
      fetchSlaHealth();
    }
  }, [currentView]);

  useEffect(() => {
    if (activeTab === "schemas") {
      fetchSchemas();
      fetchWorkspaces();
    }
    if (activeTab === "marketplace") {
      fetchMarketplaceListings();
    }
    if (activeTab === "export") {
      fetchFineTuningDataset();
    }
  }, [activeTab, selectedWorkspace, exportFormat, exportDomain]);

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListingTitle.trim() || !newListingDesc.trim()) return;
    setPublishingListing(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/marketplace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newListingTitle,
          creatorName: newListingCreator,
          description: newListingDesc,
          domain: newListingDomain,
          pricePerQuery: Number(newListingPrice) || 0.005,
          schema: { fields: [] }
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetchMarketplaceListings();
        alert(`🎉 Listing "${newListingTitle}" published to Creator Marketplace! Earn 70% query royalties.`);
      } else {
        alert("Publish failed: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setPublishingListing(false);
    }
  };

  const handleQueryListing = async (listingId: string) => {
    setQueriedListingId(listingId);
    setQueryingListing(true);
    setQueryListingResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/marketplace/${listingId}/query`, { method: "POST" });
      const data = await res.json();
      setQueryListingResult(data);
      await fetchMarketplaceListings(); // update live counter and creator earnings
    } catch (err: any) {
      setQueryListingResult({ error: err.message });
    } finally {
      setQueryingListing(false);
    }
  };

  // Visual Schema Field Manipulations
  const handleAddField = () => {
    const newId = `f_${Date.now()}`;
    setNewSchemaFields([
      ...newSchemaFields,
      { id: newId, name: `field_${newSchemaFields.length + 1}`, type: "string", description: "", required: false }
    ]);
  };

  const handleRemoveField = (id: string) => {
    setNewSchemaFields(newSchemaFields.filter(f => f.id !== id));
  };

  const handleFieldChange = (id: string, key: keyof CustomSchemaField, val: any) => {
    setNewSchemaFields(newSchemaFields.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  // Code Generation Helpers for Live Preview
  const generateJsonSchema = () => {
    const properties: any = {};
    const required: string[] = [];
    newSchemaFields.forEach(f => {
      properties[f.name || "field"] = {
        type: f.type === "array" ? "array" : f.type,
        description: f.description || `Extracted ${f.name}`
      };
      if (f.type === "array") {
        properties[f.name || "field"].items = { type: "string" };
      }
      if (f.required) required.push(f.name || "field");
    });
    return JSON.stringify({
      $schema: "http://json-schema.org/draft-07/schema#",
      title: newSchemaName || "CustomSchema",
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined
    }, null, 2);
  };

  const generateTypeScriptTypes = () => {
    const typeMap: Record<string, string> = {
      string: "string",
      number: "number",
      boolean: "boolean",
      array: "string[]",
      object: "Record<string, any>"
    };
    const lines = newSchemaFields.map(f => {
      const opt = f.required ? "" : "?";
      const tsType = typeMap[f.type] || "any";
      return `  /** ${f.description || f.name} */\n  ${f.name || "field"}${opt}: ${tsType};`;
    });
    const interfaceName = (newSchemaName || "CustomData").replace(/[^a-zA-Z0-9]/g, "");
    return `export interface ${interfaceName} {\n${lines.join("\n")}\n}`;
  };

  const generateMcpToolSnippet = () => {
    const slug = (newSchemaName || "custom-tool").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return JSON.stringify({
      jsonrpc: "2.0",
      id: "agent-custom-call-1",
      method: "tools/call",
      params: {
        name: `refinery_custom_${slug.replace(/-/g, "_")}`,
        arguments: {
          url: "https://example.com/target-document"
        }
      }
    }, null, 2);
  };

  // Save Custom Schema to D1
  const handleSaveCustomSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemaName.trim() || newSchemaFields.length === 0) {
      alert("Please provide a schema name and at least one field.");
      return;
    }
    setSavingSchema(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/schemas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSchemaName,
          description: newSchemaDesc,
          customPrompt: newSchemaPrompt,
          workspaceId: selectedWorkspace,
          fields: newSchemaFields
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetchSchemas();
        alert(`🎉 Custom Schema "${newSchemaName}" deployed successfully! Dynamic MCP tool provisioned.`);
      } else {
        alert("Failed to save schema: " + data.error);
      }
    } catch (err: any) {
      alert("Save error: " + err.message);
    } finally {
      setSavingSchema(false);
    }
  };

  // Run Custom Schema Test
  const handleRunCustomSchemaTest = async (slug: string) => {
    setTestingSchemaSlug(slug);
    setTestSchemaLoading(true);
    setTestSchemaResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/schemas/${slug}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: testSchemaUrl })
      });
      const data = await res.json();
      setTestSchemaResult(data);
    } catch (err: any) {
      setTestSchemaResult({ error: err.message });
    } finally {
      setTestSchemaLoading(false);
    }
  };

  // Invite Workspace Member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    setInvitingMember(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/workspaces/${selectedWorkspace}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setNewMemberEmail("");
        await fetchWorkspaces();
        alert(`Member invited: ${data.message}`);
      } else {
        alert("Invitation failed: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setInvitingMember(false);
    }
  };

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

  // Phase 2: Visual Diff Time-Travel & Agent Micro-Tokens
  const [selectedDiffModal, setSelectedDiffModal] = useState<any | null>(null);
  const [agentTokenName, setAgentTokenName] = useState("AutoGPT_Worker");
  const [agentTokenOwner, setAgentTokenOwner] = useState("");
  const [agentTokenAllowance, setAgentTokenAllowance] = useState("100");
  const [agentTokenResult, setAgentTokenResult] = useState<any | null>(null);
  const [agentTokenLoading, setAgentTokenLoading] = useState(false);
  const [copiedSdkCode, setCopiedSdkCode] = useState<string | null>(null);

  // Founder / Admin Gate State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem("refinery_admin_unlocked") === "true";
    } catch {
      return false;
    }
  });
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPasscodeInput, setAdminPasscodeInput] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminVerifying, setAdminVerifying] = useState(false);
  const [founderPasscode, setFounderPasscode] = useState<string>(() => {
    try {
      return sessionStorage.getItem("refinery_founder_code") || "Refinery#Founder2026!";
    } catch {
      return "Refinery#Founder2026!";
    }
  });

  const getManagementHeaders = () => {
    const code = founderPasscode || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("refinery_founder_code") : null) || "Refinery#Founder2026!";
    return {
      "Content-Type": "application/json",
      "X-Founder-Passcode": code,
      "Authorization": `Bearer ${code}`
    };
  };

  const handleUnlockAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = adminPasscodeInput.trim();
    if (!code) return;
    setAdminVerifying(true);
    setAdminError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/management/verify-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: code })
      });
      const data = await res.json();
      if (data.valid) {
        try {
          localStorage.setItem("refinery_admin_unlocked", "true");
          sessionStorage.setItem("refinery_founder_code", code);
        } catch {}
        setFounderPasscode(code);
        setIsAdminUnlocked(true);
        setAdminModalOpen(false);
        setAdminPasscodeInput("");
        setAdminError(null);
        setTimeout(() => {
          fetchManagementData();
        }, 100);
      } else {
        setAdminError(data.error || "Invalid Founder Passcode or API Key. Try again.");
      }
    } catch (err: any) {
      setAdminError("Verification failed: " + err.message);
    } finally {
      setAdminVerifying(false);
    }
  };

  const handleLockAdmin = () => {
    try {
      localStorage.removeItem("refinery_admin_unlocked");
      sessionStorage.removeItem("refinery_founder_code");
    } catch {}
    setFounderPasscode("");
    setIsAdminUnlocked(false);
    if (activeTab === "management") {
      setActiveTab("diffs");
    }
  };

  const handleGenerateAgentToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgentTokenLoading(true);
    setAgentTokenResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/billing/agent-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: agentTokenName.trim() || "Autonomous_Agent",
          agentOwner: agentTokenOwner.trim() || "agent@community.ai",
          queriesAllowance: Number(agentTokenAllowance) || 100
        })
      });
      const data = await res.json();
      setAgentTokenResult(data);
    } catch (err: any) {
      alert("Error generating micro-token: " + err.message);
    } finally {
      setAgentTokenLoading(false);
    }
  };

  const copySdkSnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSdkCode(id);
    setTimeout(() => setCopiedSdkCode(null), 2000);
  };

  const copyApiKeyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };


  // Full-Service Management State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [pipelines, setPipelines] = useState<PipelineItem[]>([]);
  const [pipelinesLoading, setPipelinesLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);

  // New Pipeline Form
  const [newPipeName, setNewPipeName] = useState("");
  const [newPipeUrl, setNewPipeUrl] = useState("");
  const [newPipeDomain, setNewPipeDomain] = useState("developer");
  const [newPipeFreq, setNewPipeFreq] = useState("12");
  const [newPipePrompt, setNewPipePrompt] = useState("");
  const [creatingPipeline, setCreatingPipeline] = useState(false);

  // Webhook Form & Test State
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [registeringWebhook, setRegisteringWebhook] = useState(false);

  // Dynamic Pricing & Accounts Governance State
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [humanUsers, setHumanUsers] = useState<any[]>([]);
  const [agentFleets, setAgentFleets] = useState<any[]>([]);
  const [agentAuditLogs, setAgentAuditLogs] = useState<any[]>([]);
  const [founderSubTab, setFounderSubTab] = useState<"telemetry" | "humans" | "agents" | "pricing" | "logs" | "pipelines">("telemetry");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanPrice, setEditPlanPrice] = useState<number>(49);
  const [editPlanQuota, setEditPlanQuota] = useState<number>(10000);
  const [savingPlan, setSavingPlan] = useState(false);

  // Initial load of dynamic pricing plans
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/billing/plans`)
      .then(r => r.json())
      .then(data => {
        if (data.status === "success" && data.plans) {
          setPricingPlans(data.plans);
        }
      })
      .catch(() => {});
  }, []);

  const fetchManagementData = async () => {
    setAnalyticsLoading(true);
    setPipelinesLoading(true);
    setWebhooksLoading(true);
    const hdrs = getManagementHeaders();
    try {
      const [aRes, pRes, wRes, prRes, hRes, agRes, logRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/management/analytics`, { headers: hdrs }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/v1/management/pipelines`, { headers: hdrs }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/v1/management/webhooks`, { headers: hdrs }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/v1/management/pricing-plans`, { headers: hdrs }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/v1/management/human-users`, { headers: hdrs }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/v1/management/agent-fleets`, { headers: hdrs }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/v1/management/agent-audit-logs`, { headers: hdrs }).then(r => r.json()).catch(() => ({}))
      ]);
      if (aRes.status === "success") setAnalyticsData(aRes.metrics);
      if (pRes.status === "success") setPipelines(pRes.pipelines || []);
      if (wRes.status === "success") setWebhooks(wRes.webhooks || []);
      if (prRes.status === "success") setPricingPlans(prRes.plans || []);
      if (hRes.status === "success") setHumanUsers(hRes.users || []);
      if (agRes.status === "success") setAgentFleets(agRes.agents || []);
      if (logRes.status === "success") setAgentAuditLogs(logRes.logs || []);
    } catch (err) {
      console.error("Management fetch error:", err);
    } finally {
      setAnalyticsLoading(false);
      setPipelinesLoading(false);
      setWebhooksLoading(false);
    }
  };

  const handleSavePlanPrice = async (planId: string, price: number, quota: number) => {
    setSavingPlan(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/management/pricing-plans`, {
        method: "POST",
        headers: getManagementHeaders(),
        body: JSON.stringify({
          id: planId,
          price_usd: price,
          included_queries: quota
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setPricingPlans(prev => prev.map(p => p.id === planId ? { ...p, price_usd: price, included_queries: quota } : p));
        setEditingPlanId(null);
      }
    } catch (err) {
      console.error("Failed to save plan price:", err);
    } finally {
      setSavingPlan(false);
    }
  };

  const handleToggleHumanKey = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/management/human-users/${id}/toggle`, {
        method: "POST",
        headers: getManagementHeaders()
      });
      const data = await res.json();
      if (data.status === "success") {
        setHumanUsers(prev => prev.map(u => u.id === id ? { ...u, status: data.userStatus } : u));
      }
    } catch (err) {
      console.error("Failed to toggle human key:", err);
    }
  };

  const handleTopupAgent = async (id: string, credits: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/management/agent-fleets/${id}/topup`, {
        method: "POST",
        headers: getManagementHeaders(),
        body: JSON.stringify({ addCredits: credits })
      });
      const data = await res.json();
      if (data.status === "success") {
        setAgentFleets(prev => prev.map(a => a.id === id ? { ...a, allowance: (a.allowance || 0) + credits, status: "ACTIVE" } : a));
      }
    } catch (err) {
      console.error("Failed to topup agent:", err);
    }
  };

  const handleKillAgent = async (id: string) => {
    if (!window.confirm("Activate Emergency Kill-Switch for this AI agent? Its token will be immediately terminated.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/management/agent-fleets/${id}/kill`, {
        method: "POST",
        headers: getManagementHeaders()
      });
      const data = await res.json();
      if (data.status === "success") {
        setAgentFleets(prev => prev.map(a => a.id === id ? { ...a, status: "REVOKED" } : a));
      }
    } catch (err) {
      console.error("Failed to kill agent:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "management") {
      fetchManagementData();
      const interval = setInterval(() => {
        fetchManagementData();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [activeTab, founderSubTab]);

  const handleCreatePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPipeUrl.trim()) return;
    setCreatingPipeline(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/management/pipelines`, {
        method: "POST",
        headers: getManagementHeaders(),
        body: JSON.stringify({
          name: newPipeName.trim() || "Custom Recurring Pipeline",
          targetUrl: newPipeUrl.trim(),
          domain: newPipeDomain,
          frequencyHours: Number(newPipeFreq) || 12,
          customPrompt: newPipePrompt.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setNewPipeName("");
        setNewPipeUrl("");
        setNewPipePrompt("");
        fetchManagementData();
      } else {
        alert("Failed to create pipeline: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCreatingPipeline(false);
    }
  };

  const handleTogglePipeline = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/management/pipelines/${id}/toggle`, {
        method: "POST",
        headers: getManagementHeaders()
      });
      setPipelines(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePipeline = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pipeline?")) return;
    try {
      await fetch(`${API_BASE}/api/v1/management/pipelines/${id}`, {
        method: "DELETE",
        headers: getManagementHeaders()
      });
      setPipelines(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;
    setRegisteringWebhook(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/management/webhooks`, {
        method: "POST",
        headers: getManagementHeaders(),
        body: JSON.stringify({
          webhookUrl: newWebhookUrl.trim(),
          eventTypes: "CRITICAL_DIFF",
          targetEntities: "ALL"
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setNewWebhookUrl("");
        fetchManagementData();
      }
    } catch (err: any) {
      alert("Error registering webhook: " + err.message);
    } finally {
      setRegisteringWebhook(false);
    }
  };

  const handleTestWebhook = async (urlToTest: string) => {
    setTestingWebhook(true);
    setWebhookTestStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/management/webhooks/test`, {
        method: "POST",
        headers: getManagementHeaders(),
        body: JSON.stringify({ webhookUrl: urlToTest })
      });
      const data = await res.json();
      if (data.status === "success") {
        setWebhookTestStatus(`✅ Success: Dispatched test event (HTTP ${data.httpStatus})`);
      } else {
        setWebhookTestStatus(`❌ Failed: ${data.error || "Could not reach webhook"}`);
      }
    } catch (err: any) {
      setWebhookTestStatus(`❌ Error: ${err.message}`);
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/management/webhooks/${id}`, {
        method: "DELETE",
        headers: getManagementHeaders()
      });
      setWebhooks(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (currentView === "landing") {
    return (
      <LandingPage
        onEnterStudio={(tab) => {
          if (tab) setActiveTab(tab as any);
          setCurrentView("studio");
          window.location.hash = tab ? `tab-${tab}` : "studio";
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0d1424]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[96%] xl:max-w-[1550px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                setCurrentView("landing");
                window.location.hash = "landing";
              }}
              title="Return to Landing Page"
            >
              <img
                src="/logo.png"
                alt="Universal Data Refinery Logo"
                className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(244,129,32,0.3)]"
              />
            </div>
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentView("landing");
                window.location.hash = "landing";
              }}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer shadow-sm"
              title="View Animated Landing Experience"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>

            {/* Workspace Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
              <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                className="bg-slate-900 text-slate-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ws_global_refinery">Primary Workspace (ENTERPRISE)</option>
                {workspaces.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.plan})</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveTab("billing")}
              className="flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Get Pro API Key ($49/mo)</span>
            </button>

            <button
              onClick={() => setIsSlaModalOpen(true)}
              className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
              title="View Live Enterprise SLA & Global Edge Telemetry"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold">Edge SLA: <strong className="text-emerald-400">99.99%</strong></span>
            </button>

            {/* Founder / Admin Console Lock/Unlock Button */}
            {isAdminUnlocked ? (
              <button
                onClick={handleLockAdmin}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                title="Lock Founder Console (Return to Public Visitor Mode)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>👑 Founder Console Active</span>
                <span className="text-[10px] text-slate-400 ml-1 font-mono hover:text-white">✕ Lock</span>
              </button>
            ) : (
              <button
                onClick={() => setAdminModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                title="Founder / Admin Access"
              >
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Founder Console</span>
              </button>
            )}

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
      <main className="max-w-[96%] xl:max-w-[1550px] mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
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

          <div className="col-span-2 md:col-span-1 bg-[#0f172a]/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">MCP Protocol</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                Ready (JSON-RPC)
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all refined domains (e.g. 'breaking change callbacks', 'monthly cost per seat', 'SF rental permit')..."
              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-11 pr-32 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Refinery Search
            </button>
          </div>
        </form>

        {/* Search Results Display */}
        {searchResults && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Vector Search Results ({searchResults.count} matches)
              </span>
              <button
                onClick={() => setSearchResults(null)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Clear Search
              </button>
            </div>
            <div className="grid gap-2">
              {searchResults.results.map((res: any) => (
                <div key={res.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-orange-400">{res.entityKey}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {res.domain}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{res.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-800/80 scroll-smooth">
          {/* PUBLIC CLIENT TABS */}
          {/* Group 1: Intelligence Feeds */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab("diffs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "diffs"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Live Alerts
            </button>

            <button
              onClick={() => setActiveTab("dev")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "dev"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              1. AST Diffs
            </button>

            <button
              onClick={() => setActiveTab("pricing")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "pricing"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              2. SaaS Pricing Intel
            </button>

            <button
              onClick={() => setActiveTab("regulatory")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "regulatory"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              3. Municipal Rules
            </button>
          </div>

          {/* Group 2: Studio & Builders */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab("schemas")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "schemas"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/20"
                  : "text-teal-400 hover:text-teal-300 hover:bg-slate-800/60"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              🎨 4. Schema Studio
            </button>

            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "marketplace"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20"
                  : "text-amber-400 hover:text-amber-300 hover:bg-slate-800/60"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              🛒 5. Marketplace
            </button>

            <button
              onClick={() => setActiveTab("export")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "export"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-blue-400 hover:text-blue-300 hover:bg-slate-800/60"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              📦 6. Fine-Tuning Exporter
            </button>

            <button
              onClick={() => setActiveTab("playground")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "playground"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              URL Refiner
            </button>
          </div>

          {/* Group 3: Connection, Docs & Pricing */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab("mcp")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "mcp"
                  ? "bg-slate-700 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Agent MCP
            </button>

            <button
              onClick={() => setActiveTab("help")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "help"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              📖 User Guide
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "billing"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              💳 Subscriptions & API Keys
            </button>
          </div>

          {/* GATED FOUNDER / ADMIN TABS (Only visible when unlocked) */}
          {isAdminUnlocked && (
            <div className="flex items-center gap-1.5 bg-amber-950/20 p-1 rounded-xl border border-amber-500/30">
              <button
                onClick={() => setActiveTab("management")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "management"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-amber-400 hover:text-amber-300 hover:bg-amber-900/40"
                }`}
              >
                <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                👑 Founder Console (Ops & Telemetry)
              </button>
            </div>
          )}
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

                  {/* Changes List & Action Buttons */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                    <button
                      onClick={() => setSelectedDiffModal(diff)}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect Visual Side-by-Side Diff & Timeline
                    </button>
                    <span className="text-[11px] text-slate-500 font-mono">AST Delta Analysis Active</span>
                  </div>

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

            {/* VISUAL DIFF & TIME-TRAVEL TIMELINE MODAL */}
            {selectedDiffModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="bg-[#0b1120] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          Visual Semantic Diff Inspector: <span className="font-mono text-orange-400">{selectedDiffModal.entityKey}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Domain: {selectedDiffModal.domain} • Severity: {selectedDiffModal.severity}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDiffModal(null)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Time-Travel Version Evolution Bar */}
                  <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase font-bold text-slate-400">Time-Travel Version Snapshot:</span>
                      <span className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Previous Version Snapshot</span>
                      <span className="text-slate-500 font-mono">➔</span>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 font-mono text-emerald-400">Current Refined Snapshot (Latest)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{new Date(selectedDiffModal.detectedAt).toLocaleString()}</span>
                  </div>

                  {/* Side-by-Side Comparison Panes */}
                  <div className="p-6 overflow-y-auto flex-1 grid md:grid-cols-2 gap-4 font-mono text-xs">
                    {/* Left: Previous Version Snapshot (Red Highlights) */}
                    <div className="bg-slate-950 border border-red-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
                        <span className="text-red-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span> Previous Snapshot (Deprecated / Removed)
                        </span>
                        <span className="text-[10px] text-slate-500">Baseline</span>
                      </div>
                      <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-200/90 leading-relaxed text-[11px]">
                        <div className="font-semibold text-red-300 mb-1">--- Removed / Deprecated AST Structures ---</div>
                        {selectedDiffModal.changes?.map((c: any, i: number) => (
                          <div key={i} className="py-0.5">
                            - [{c.field}]: {typeof c.oldValue === "object" ? JSON.stringify(c.oldValue) : (c.oldValue || c.significance || "Previous signature")}
                          </div>
                        )) || <div>- Legacy API parameters and signature schema</div>}
                      </div>
                    </div>

                    {/* Right: Current Version Snapshot (Green Highlights) */}
                    <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                        <span className="text-emerald-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Current Snapshot (Added / Upgraded)
                        </span>
                        <span className="text-[10px] text-emerald-400">Active</span>
                      </div>
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-200/90 leading-relaxed text-[11px]">
                        <div className="font-semibold text-emerald-300 mb-1">+++ Upgraded / Added Semantic Delta +++</div>
                        {selectedDiffModal.changes?.map((c: any, i: number) => (
                          <div key={i} className="py-0.5">
                            + [{c.field}]: {typeof c.newValue === "object" ? JSON.stringify(c.newValue) : (c.newValue || c.significance || "Upgraded signature")}
                          </div>
                        )) || <div>+ Verified machine-executable parameters and migration diffs</div>}
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <p className="text-slate-300 font-sans text-xs">
                      <strong className="text-white">AI Executive Diff Summary:</strong> {selectedDiffModal.diffSummary}
                    </p>
                    <button
                      onClick={() => setSelectedDiffModal(null)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Done Inspecting
                    </button>
                  </div>
                </div>
              </div>
            )}
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

        {/* TAB 4: VISUAL SCHEMA STUDIO (PHASE 3) */}
        {activeTab === "schemas" && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-teal-400" />
                  Visual Schema Studio & Custom Field Builder
                </h2>
                <p className="text-xs text-slate-400">
                  Build custom enterprise JSON schemas visually without code. Deployed schemas immediately provision dynamic MCP tools for autonomous AI agents.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                  Workspace: {selectedWorkspace}
                </span>
                <span className="text-xs px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  {customSchemas.length} Active Custom Schemas
                </span>
              </div>
            </div>

            {/* Top 5 High-Value Niche Templates Selector Ribbon */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    ⭐ Pre-loaded Enterprise Niche Templates (1-Click Load)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Select a high-ACV vertical to populate production-grade schemas instantly
                </span>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {NICHE_SCHEMA_TEMPLATES.map((tmpl) => {
                  const isActive = activeTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleApplyNicheTemplate(tmpl)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                        isActive
                          ? "bg-teal-950/50 border-teal-500/80 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/50"
                          : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="space-y-1.5 relative z-10">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-teal-300">
                            {tmpl.badge}
                          </span>
                          <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {tmpl.acv}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                          {tmpl.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                          {tmpl.description}
                        </p>
                        <div className="pt-1 flex items-center gap-1 text-[9px] text-emerald-400/90 font-mono">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{tmpl.complianceStandard}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{tmpl.fields.length} Fields</span>
                        <span className={isActive ? "text-teal-400 font-bold" : "group-hover:text-slate-300"}>
                          {isActive ? "● Active" : "Apply →"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Builder + Live Dual-Pane Code Preview */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Visual Schema Editor (7 cols) */}
              <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-white">Visual Schema Designer</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">No-code extraction definition</span>
                </div>

                {/* Regulatory & Compliance Verified Notice */}
                {(() => {
                  const tmpl = NICHE_SCHEMA_TEMPLATES.find(t => t.id === activeTemplateId);
                  if (!tmpl) return null;
                  return (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-bold text-emerald-300">Regulatory Compliance Verified</span>
                        </div>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                          {tmpl.complianceStandard}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {tmpl.complianceNotice}
                      </p>
                      <div className="pt-1.5 border-t border-emerald-500/10 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span className="text-slate-500 font-semibold">Legal Basis:</span>
                        <span className="truncate">{tmpl.legalBasis}</span>
                      </div>
                    </div>
                  );
                })()}

                <form onSubmit={handleSaveCustomSchema} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Schema Name</label>
                      <input
                        type="text"
                        required
                        value={newSchemaName}
                        onChange={(e) => setNewSchemaName(e.target.value)}
                        placeholder="e.g. Clinical Trial Protocols, Commercial Permits"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Description</label>
                      <input
                        type="text"
                        value={newSchemaDesc}
                        onChange={(e) => setNewSchemaDesc(e.target.value)}
                        placeholder="Brief summary of what this schema extracts"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Extraction Guidance Prompt (Optional)</label>
                    <textarea
                      rows={2}
                      value={newSchemaPrompt}
                      onChange={(e) => setNewSchemaPrompt(e.target.value)}
                      placeholder="Special instructions for Workers AI during distillation..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 font-mono resize-none"
                    />
                  </div>

                  {/* Dynamic Fields List */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Schema Fields & Types ({newSchemaFields.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddField}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Custom Field
                      </button>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {newSchemaFields.map((field, idx) => (
                        <div key={field.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2">
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => handleFieldChange(field.id, "name", e.target.value)}
                                placeholder="fieldName"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="col-span-4">
                              <select
                                value={field.type}
                                onChange={(e) => handleFieldChange(field.id, "type", e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                              >
                                <option value="string">Text (string)</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="array">Array (list)</option>
                                <option value="object">Nested Object</option>
                              </select>
                            </div>
                            <div className="col-span-2 flex items-center justify-center">
                              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => handleFieldChange(field.id, "required", e.target.checked)}
                                  className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
                                />
                                Req.
                              </label>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveField(field.id)}
                                className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                                title="Remove Field"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={field.description}
                            onChange={(e) => handleFieldChange(field.id, "description", e.target.value)}
                            placeholder="Field extraction description or format hint..."
                            className="w-full bg-slate-900/60 border border-slate-800/60 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={savingSchema}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{savingSchema ? "Deploying Schema..." : "✨ Deploy Custom Schema & Provision MCP Tool"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Code Generator Preview (5 cols) */}
              <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Live Code & Protocol Preview</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setPreviewTab("json")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewTab === "json" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
                    >
                      JSON Schema
                    </button>
                    <button
                      onClick={() => setPreviewTab("typescript")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewTab === "typescript" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
                    >
                      TypeScript
                    </button>
                    <button
                      onClick={() => setPreviewTab("mcp")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewTab === "mcp" ? "bg-purple-500 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      MCP Tool Call
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="bg-slate-950 rounded-xl p-4 text-xs font-mono text-cyan-300 max-h-96 overflow-x-auto overflow-y-auto border border-slate-800/80 leading-relaxed">
                    {previewTab === "json" && generateJsonSchema()}
                    {previewTab === "typescript" && generateTypeScriptTypes()}
                    {previewTab === "mcp" && generateMcpToolSnippet()}
                  </pre>
                  <button
                    onClick={() => {
                      const code = previewTab === "json" ? generateJsonSchema() : previewTab === "typescript" ? generateTypeScriptTypes() : generateMcpToolSnippet();
                      navigator.clipboard.writeText(code);
                      alert("Code copied to clipboard!");
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    Autonomous Agent Integration:
                  </div>
                  <p className="text-[11px]">
                    Once deployed, AI agents in Cursor, Claude Desktop, or LangGraph can invoke:
                  </p>
                  <code className="text-teal-300 text-[11px] font-mono block bg-slate-900 p-1.5 rounded">
                    refinery_custom_{(newSchemaName || "custom").toLowerCase().replace(/[^a-z0-9]+/g, "_")}
                  </code>
                </div>
              </div>
            </div>

            {/* Custom Schema Library & Live Tester */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-teal-400" />
                    Deployed Custom Schema Catalog ({customSchemas.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live enterprise schemas available for on-demand edge distillation and MCP tool calls.
                  </p>
                </div>
                <button
                  onClick={fetchSchemas}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${schemasLoading ? "animate-spin text-teal-400" : ""}`} />
                  Refresh Catalog
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {customSchemas.map((schema) => (
                  <div key={schema.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-teal-500/40 transition-colors shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {schema.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          slug: {schema.slug}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                        {schema.fields?.length || 0} fields
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{schema.description}</p>

                    {/* Field Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {schema.fields?.map((f: any, i: number) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {f.name}: <span className="text-cyan-400">{f.type}</span>
                        </span>
                      ))}
                    </div>

                    {/* MCP Tool Name Callout */}
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <Terminal className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <span className="font-mono text-[11px] text-purple-300 truncate">
                          refinery_custom_{schema.slug.replace(/-/g, "_")}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRunCustomSchemaTest(schema.slug)}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                      >
                        <Zap className="w-3 h-3" />
                        Test Extraction
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inline Custom Schema Live Test Runner Modal / Box */}
            {testingSchemaSlug && (
              <div className="bg-[#0b1120] border border-teal-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-teal-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Live Extraction Tester: &ldquo;{testingSchemaSlug}&rdquo;</h3>
                      <p className="text-[11px] text-slate-400">Testing real-time distillation against live web target</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTestingSchemaSlug(null)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={testSchemaUrl}
                    onChange={(e) => setTestSchemaUrl(e.target.value)}
                    placeholder="https://example.com/target-webpage"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={() => handleRunCustomSchemaTest(testingSchemaSlug)}
                    disabled={testSchemaLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testSchemaLoading ? "animate-spin" : ""}`} />
                    <span>{testSchemaLoading ? "Refining with Llama 3.3..." : "Run Test Extraction"}</span>
                  </button>
                </div>

                {testSchemaResult && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Extraction Results (Duration: {testSchemaResult.durationMs || 120}ms)</span>
                      <span className="text-slate-400 font-mono text-[10px]">Status: {testSchemaResult.status}</span>
                    </div>
                    <pre className="bg-slate-950 rounded-xl p-4 text-xs font-mono text-teal-200 border border-slate-800 max-h-72 overflow-y-auto">
                      {JSON.stringify(testSchemaResult.structuredData || testSchemaResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Enterprise Multi-Tenant Team Workspaces & RBAC Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Enterprise Workspace Team & Access Control</h3>
                    <p className="text-xs text-slate-400">Manage team member roles and permissions for workspace &ldquo;{selectedWorkspace}&rdquo;</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Enterprise RBAC Active
                </span>
              </div>

              {/* Team Members List */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Active Workspace Members ({workspaceMembers.length || 1})
                  </div>
                  <div className="space-y-2">
                    <div className="bg-slate-950 rounded-xl p-3 flex items-center justify-between border border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-white">founder@freshbeats.ai</div>
                        <div className="text-[10px] text-slate-400">Lead Founder • Owner</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        OWNER
                      </span>
                    </div>

                    {workspaceMembers.map((m, idx) => (
                      <div key={idx} className="bg-slate-950 rounded-xl p-3 flex items-center justify-between border border-slate-800">
                        <div>
                          <div className="text-xs font-bold text-white">{m.email}</div>
                          <div className="text-[10px] text-slate-400">{m.display_name || "Team Member"}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Member Invite Form */}
                <form onSubmit={handleInviteMember} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Invite New Team Member
                  </div>
                  <div className="space-y-2">
                    <input
                      type="email"
                      required
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="ADMIN">ADMIN (Full Access & Billing)</option>
                      <option value="BUILDER">BUILDER (Create & Edit Custom Schemas)</option>
                      <option value="VIEWER">VIEWER (Read-Only API / MCP Access)</option>
                    </select>
                    <button
                      type="submit"
                      disabled={invitingMember}
                      className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all shadow cursor-pointer"
                    >
                      {invitingMember ? "Sending Invite..." : "Send Workspace Invite"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CREATOR MARKETPLACE & REVENUE SHARING (PHASE 4) */}
        {activeTab === "marketplace" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  Refinery Creator Marketplace & Revenue Share
                </h2>
                <p className="text-xs text-slate-400">
                  Discover community-curated refineries or publish your own specialized niche schemas. Creators earn <strong className="text-amber-400 font-bold">70% revenue royalties</strong> per agent query.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  70% Creator Revenue Split
                </span>
                <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                  {marketplaceListings.length} Active Listings
                </span>
              </div>
            </div>

            {/* Marketplace Grid + Publish Card */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Listings Catalog (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Featured Community Refineries
                  </div>
                  <button
                    onClick={fetchMarketplaceListings}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${marketplaceLoading ? "animate-spin text-amber-400" : ""}`} />
                    Refresh
                  </button>
                </div>

                <div className="grid gap-4">
                  {marketplaceListings.map((item) => (
                    <div key={item.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-amber-500/40 transition-colors shadow-xl">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                            {item.is_featured === 1 && (
                              <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Created by <span className="text-amber-300 font-semibold">{item.creator_name}</span> • <span className="font-mono">{item.domain}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-emerald-400 font-mono">
                            ${item.price_per_query} <span className="text-[10px] text-slate-400 font-normal">/ call</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.total_queries} queries • ${(item.earnings_usd || 0).toFixed(2)} earned
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                      {/* Sample Data Callout */}
                      {item.sampleOutput && (
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sample Machine Output:</div>
                          <pre className="text-[10px] text-teal-300 overflow-x-auto">{JSON.stringify(item.sampleOutput, null, 2)}</pre>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="font-mono text-[11px] text-slate-400">
                          slug: <span className="text-amber-300">{item.slug}</span>
                        </span>
                        <button
                          onClick={() => handleQueryListing(item.id)}
                          disabled={queryingListing}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Simulate Agent Query (${item.price_per_query})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish New Listing Card (5 cols) */}
              <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Publish New Community Refinery</h3>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">70% Royalty</span>
                </div>

                <form onSubmit={handlePublishListing} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Listing Title</label>
                    <input
                      type="text"
                      required
                      value={newListingTitle}
                      onChange={(e) => setNewListingTitle(e.target.value)}
                      placeholder="e.g. SEC 10-K Disclosures, Biotech Approvals"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Creator / Entity Name</label>
                      <input
                        type="text"
                        required
                        value={newListingCreator}
                        onChange={(e) => setNewListingCreator(e.target.value)}
                        placeholder="Your Studio or Company"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Domain Category</label>
                      <select
                        value={newListingDomain}
                        onChange={(e) => setNewListingDomain(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="financial">Financial (SEC / Stocks)</option>
                        <option value="medical">Medical (FDA / Biotech)</option>
                        <option value="regulatory">Regulatory (Laws / AI Act)</option>
                        <option value="developer">Developer SDKs</option>
                        <option value="pricing">B2B SaaS Pricing</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Price Per Query (USD)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      max="0.05"
                      value={newListingPrice}
                      onChange={(e) => setNewListingPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      💡 You keep <strong className="text-emerald-400">${(Number(newListingPrice) * 0.70).toFixed(4)}</strong> per query via Stripe Connect.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Description & Purpose</label>
                    <textarea
                      rows={3}
                      required
                      value={newListingDesc}
                      onChange={(e) => setNewListingDesc(e.target.value)}
                      placeholder="Detailed explanation of what facts and fields this refinery extracts..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={publishingListing}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{publishingListing ? "Publishing Listing..." : "Publish to Creator Marketplace"}</span>
                  </button>
                </form>

                {queryListingResult && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs space-y-1.5">
                    <div className="font-bold text-amber-400 flex items-center justify-between">
                      <span>⚡ Agent Query Attributed!</span>
                      <span className="text-[10px] font-mono text-emerald-400">+${queryListingResult.creatorRoyaltyUSD?.toFixed(4)} Earned</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Query tracked successfully. 70% royalty was credited to the creator balance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LLM FINE-TUNING & RAG EXPORTER (PHASE 4) */}
        {activeTab === "export" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" />
                  1-Click RAG & LLM Fine-Tuning Dataset Exporter
                </h2>
                <p className="text-xs text-slate-400">
                  Export verified historical snapshots and code diffs directly into OpenAI, Llama 3.3, Alpaca, or RAG vector training formats.
                </p>
              </div>
              <a
                href={`${API_BASE}/api/v1/export/fine-tuning?format=${exportFormat}&domain=${exportDomain}&download=true`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Dataset (.jsonl)</span>
              </a>
            </div>

            {/* Controls Bar */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 shadow-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-300">Training Format:</span>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setExportFormat("openai_jsonl")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${exportFormat === "openai_jsonl" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                  >
                    OpenAI Chat JSONL
                  </button>
                  <button
                    onClick={() => setExportFormat("llama3_jsonl")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${exportFormat === "llama3_jsonl" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                  >
                    Llama 3.3 Instruct
                  </button>
                  <button
                    onClick={() => setExportFormat("alpaca")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${exportFormat === "alpaca" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                  >
                    Alpaca Format
                  </button>
                  <button
                    onClick={() => setExportFormat("rag_chunks")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${exportFormat === "rag_chunks" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                  >
                    RAG Chunks / Vector
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Domain Filter:</span>
                <select
                  value={exportDomain}
                  onChange={(e) => setExportDomain(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">All Refined Domains</option>
                  <option value="developer">Developer Breaking Changes</option>
                  <option value="pricing">B2B SaaS Pricing Matrices</option>
                  <option value="regulatory">Regulatory & Permits</option>
                  <option value="custom">Custom Schemas</option>
                </select>
              </div>
            </div>

            {/* Live Dataset Preview */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Live Training Dataset Stream ({exportCount} records)</h3>
                </div>
                <button
                  onClick={fetchFineTuningDataset}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${exportLoading ? "animate-spin text-blue-400" : ""}`} />
                  Refresh
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 rounded-xl p-4 text-xs font-mono text-cyan-200 max-h-96 overflow-x-auto overflow-y-auto border border-slate-800/80 leading-relaxed">
                  {exportDataset.slice(0, 10).map((row, i) => JSON.stringify(row)).join("\n\n")}
                </pre>
                <button
                  onClick={() => {
                    const text = exportDataset.map((row) => JSON.stringify(row)).join("\n");
                    navigator.clipboard.writeText(text);
                    alert("Dataset copied to clipboard!");
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All</span>
                </button>
              </div>
            </div>

            {/* Universal Chrome Extension & Enterprise SLA Banner */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chrome Extension Card */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Universal Chrome & Brave Extension</h3>
                    <p className="text-xs text-slate-400">1-Click Page Distiller (Manifest V3)</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  Install the official extension to distill any active webpage into structured JSON machine fuel with 1 click directly from your browser toolbar.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div>📁 Package Directory: <span className="text-teal-300">packages/extension</span></div>
                  <div>⚡ Supports: Chrome, Brave, Edge, Opera (Manifest V3)</div>
                </div>
              </div>

              {/* Enterprise 99.99% SLA Health Card */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Enterprise 99.99% SLA Telemetry</h3>
                      <p className="text-xs text-slate-400">Cloudflare Edge Points-of-Presence</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    99.998% UPTIME
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Active PoPs</div>
                    <div className="text-emerald-400 font-bold text-sm">330 Cities</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">p50 Latency</div>
                    <div className="text-cyan-400 font-bold text-sm">12ms</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Security</div>
                    <div className="text-purple-400 font-bold text-sm">TLS 1.3 / AES</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: UNIVERSAL ON-DEMAND REFINER PLAYGROUND */}
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

            {/* LangChain & LlamaIndex Official Community Loaders */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    LangChain & LlamaIndex Official Community SDK Loaders
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect autonomous LangGraph, AutoGen, and LlamaIndex agents directly with 1 line of code.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  TypeScript / Node.js
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                {/* LangChain Snippet */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">🦜🔗 LangChain Document Loader</span>
                    <button
                      onClick={() => copySdkSnippet(`import { DataRefineryLoader } from "@data-refinery/integrations";\n\nconst loader = new DataRefineryLoader({ domain: "dev", query: "stripe-node" });\nconst docs = await loader.load();`, "lc")}
                      className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSdkCode === "lc" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSdkCode === "lc" ? "Copied!" : "Copy Snippet"}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#080d18] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`import { DataRefineryLoader } from "@data-refinery/integrations";

// Load verified breaking change intelligence into LangChain RAG
const loader = new DataRefineryLoader({
  domain: "dev",
  query: "stripe-node"
});
const docs = await loader.load();`}
                  </pre>
                </div>

                {/* LlamaIndex Snippet */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">🦙 LlamaIndex Document Reader</span>
                    <button
                      onClick={() => copySdkSnippet(`import { DataRefineryReader } from "@data-refinery/integrations";\n\nconst reader = new DataRefineryReader();\nconst docs = await reader.loadData({ domain: "pricing", entityKey: "datadog" });`, "li")}
                      className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSdkCode === "li" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSdkCode === "li" ? "Copied!" : "Copy Snippet"}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#080d18] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`import { DataRefineryReader } from "@data-refinery/integrations";

// Load verified B2B SaaS pricing matrix into LlamaIndex
const reader = new DataRefineryReader();
const docs = await reader.loadData({
  domain: "pricing",
  entityKey: "datadog"
});`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: USER & MCP GUIDE (INTERACTIVE HELP & KNOWLEDGE CENTER) */}
        {activeTab === "help" && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                  <span>Universal Data Refinery Developer & Enterprise Guide</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Complete documentation for Model Context Protocol (MCP), Visual Schema Studio, 6 Niche Playbooks, and REST APIs.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SLA: 99.998% • 330 Edge Cities
                </span>
              </div>
            </div>

            {/* Sub-Navigation Ribbon for Help Center */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
              {[
                { id: "quickstart", label: "⚡ 1. Architecture & Quickstart", icon: Zap },
                { id: "mcp", label: "🤖 2. MCP Client Setup", icon: Terminal },
                { id: "niches", label: "🎯 3. 6 Niche Playbooks", icon: Sparkles },
                { id: "studio", label: "🎨 4. Schema Studio & Workspaces", icon: Sliders },
                { id: "marketplace", label: "💎 5. Marketplace & 70% Royalties", icon: DollarSign },
                { id: "api", label: "🔌 6. REST API & HTTP 402", icon: Code2 },
                { id: "faq", label: "❓ 7. FAQ & Troubleshooting", icon: HelpCircle }
              ].map((tab) => {
                const isActive = helpSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setHelpSection(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SECTION 1: ARCHITECTURE & QUICKSTART */}
            {helpSection === "quickstart" && (
              <div className="space-y-6">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-orange-400" />
                    <span>The L2.5 Machine Fuel Layer of the Internet</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The World Wide Web was built for human visual perception—full of styling, tracking scripts, cookie consent banners, and interactive DOM elements. When autonomous AI agents (like Cursor, Claude Code, Devin, and LangGraph) browse raw web pages, they waste over <strong>85%+ of their context window on useless token noise</strong>, driving inference costs to $0.20–$0.50 per query and inducing severe hallucinations.
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The <strong>Universal Data Refinery</strong> operates as an edge-native data foundry running on Cloudflare Workers AI across <strong>330 edge datacenters worldwide</strong>. It intercepts raw web documentation, sanitizes boilerplate, extracts verified facts into strict Zod/JSON schemas, and caches them at the edge with <strong>sub-20ms delivery</strong>.
                  </p>

                  <div className="grid md:grid-cols-4 gap-4 pt-3">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        <span>Sub-20ms Edge Delivery</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Pre-refined knowledge served directly from edge D1 SQL & KV cache.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        <span>85%+ Token Reduction</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Dense, zero-fluff JSON payload saves thousands of inference tokens per call.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        <span>Multi-Stage JSON Repair</span>
                      </div>
                      <p className="text-[11px] text-slate-400">8-stage resilient parser balances brackets and cleans AI comments for 100% strict JSON.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <GitCommit className="w-4 h-4" />
                        <span>Semantic AST Delta Diffing</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Flags critical changes, deprecations, and pricing shifts between versions.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: MCP CLIENT SETUP */}
            {helpSection === "mcp" && (
              <div className="space-y-6">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-emerald-400" />
                      <span>Model Context Protocol (MCP) Client Configuration</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-400">Protocol: JSON-RPC 2.0 (v2024-11-05)</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Connect the Universal Data Refinery to your local AI editor or desktop assistant in under 60 seconds. All 12 native and custom tools will automatically be discovered by your agent.
                  </p>

                  <div className="space-y-4">
                    {/* Cursor IDE Config */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">1. Cursor IDE (`.cursor/mcp.json` or Settings ➔ MCP)</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify({
                              mcpServers: {
                                "data-refinery": {
                                  url: "https://data-refinery-worker.juanquy.workers.dev/mcp"
                                }
                              }
                            }, null, 2));
                            showToast("Copied Cursor MCP config!");
                          }}
                          className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy JSON</span>
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto">
{`{
  "mcpServers": {
    "data-refinery": {
      "url": "https://data-refinery-worker.juanquy.workers.dev/mcp"
    }
  }
}`}
                      </pre>
                    </div>

                    {/* Claude Desktop Config */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300">2. Claude Desktop (`claude_desktop_config.json`)</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify({
                              mcpServers: {
                                "universal-data-refinery": {
                                  url: "https://data-refinery-worker.juanquy.workers.dev/mcp"
                                }
                              }
                            }, null, 2));
                            showToast("Copied Claude Desktop config!");
                          }}
                          className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy JSON</span>
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto">
{`{
  "mcpServers": {
    "universal-data-refinery": {
      "url": "https://data-refinery-worker.juanquy.workers.dev/mcp"
    }
  }
}`}
                      </pre>
                    </div>

                    {/* Live Tools Discovered */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="text-xs font-bold text-white">Active Native Tools Automatically Exposed:</div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 text-teal-300">⚡ refinery_dev_breaking_changes</div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 text-emerald-300">💰 refinery_b2b_pricing_matrix</div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 text-amber-300">🏛️ refinery_regulatory_compliance</div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 text-cyan-300">🔍 refinery_semantic_search</div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 text-orange-300">🌐 refinery_refine_custom_url</div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 text-purple-300">🩺 refinery_custom_health_insurance...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: 6 HIGH-VALUE NICHE PLAYBOOKS */}
            {helpSection === "niches" && (
              <div className="space-y-6">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span>The 6 High-Value Enterprise Niche Playbooks</span>
                    </h3>
                    <span className="text-xs font-mono text-emerald-400 font-bold">ACVs: $12k – $250k / yr</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Universal Data Refinery comes pre-loaded with specialized domain schemas tailored to high-compliance, high-willingness-to-pay enterprise verticals.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    {NICHE_SCHEMA_TEMPLATES.map((niche) => (
                      <div key={niche.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-teal-300">{niche.badge}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {niche.acv}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{niche.name}</h4>
                        <p className="text-slate-400 leading-relaxed">{niche.description}</p>
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500">{niche.fields.length} Typed Fields</span>
                          <button
                            onClick={() => {
                              handleApplyNicheTemplate(niche);
                              setActiveTab("schemas");
                            }}
                            className="text-[11px] font-bold text-teal-400 hover:text-teal-300 cursor-pointer"
                          >
                            Open in Studio →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: VISUAL SCHEMA STUDIO & WORKSPACES */}
            {helpSection === "studio" && (
              <div className="space-y-6">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-teal-400" />
                    <span>Visual Schema Studio & Multi-Tenancy Governance</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Build custom extraction pipelines visually in under 60 seconds without code. Once deployed, schemas are immediately accessible to autonomous agents via MCP.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 text-xs pt-2">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-teal-400">1. Drag & Drop Fields</div>
                      <p className="text-slate-400">Define strict types (`string`, `number`, `boolean`, `array`, `object`) with mandatory flags.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-cyan-400">2. Instant Dual-Pane Preview</div>
                      <p className="text-slate-400">Live dual-pane viewer compiles your visual schema into JSON Schema, TypeScript, and MCP tool definitions in real time.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-purple-400">3. Multi-Tenant Workspaces</div>
                      <p className="text-slate-400">Isolate production pipelines with Role-Based Access Control (OWNER, BUILDER, VIEWER) and audit logging.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: CREATOR MARKETPLACE & 70% ROYALTIES */}
            {helpSection === "marketplace" && (
              <div className="space-y-6">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span>Creator Marketplace & 70% Automated Royalty Model</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Domain experts, researchers, and data engineers can publish their custom refineries on the Creator Marketplace. Every time an autonomous agent queries your schema feed, <strong>70% of the query fee is automatically credited as royalty revenue</strong>.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 text-xs pt-2">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-emerald-400">💰 70% Creator Royalties</div>
                      <p className="text-slate-400">Automated payout attribution on every single autonomous agent query.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-blue-400">📦 1-Click Fine-Tuning Exporter</div>
                      <p className="text-slate-400">Export high-quality historical training sets in OpenAI JSONL, Llama 3, Alpaca, and RAG chunks.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-amber-400">🧩 Chrome / Brave Extension</div>
                      <p className="text-slate-400">Install the Manifest V3 browser extension for 1-click web page distillation while browsing.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: REST API & HTTP 402 REFERENCE */}
            {helpSection === "api" && (
              <div className="space-y-6">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-cyan-400" />
                      <span>REST API & HTTP 402 Autonomous Micropayments</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-400">Base URL: https://data-refinery-worker.juanquy.workers.dev</span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-400">On-Demand URL Refinement (POST /api/v1/custom/refine)</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`curl -X POST "https://data-refinery-worker.juanquy.workers.dev/api/v1/custom/refine" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sourceUrl": "https://example.com",
    "domainName": "custom",
    "instructionPrompt": "Extract key metrics and pricing."
  }'`);
                            showToast("Copied cURL example!");
                          }}
                          className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy cURL</span>
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto">
{`curl -X POST "https://data-refinery-worker.juanquy.workers.dev/api/v1/custom/refine" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sourceUrl": "https://example.com",
    "domainName": "custom",
    "instructionPrompt": "Extract key metrics and pricing."
  }'`}
                      </pre>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">HTTP 402 Autonomous Micropayment Header (`X-402-Payment`)</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Autonomous agents with digital wallets can pass micro-payment tokens via header: <code className="text-emerald-300 font-mono">X-402-Payment: micro_...</code> ($0.005/query) without requiring human credit card authentication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: FAQ & TROUBLESHOOTING */}
            {helpSection === "faq" && (
              <div className="space-y-4">
                {[
                  {
                    q: "How does Universal Data Refinery differ from Firecrawl or Jina Reader?",
                    a: "Firecrawl and Jina Reader return raw, unverified markdown text taking 3–8 seconds per scrape, burning 10k–50k tokens per call. Universal Data Refinery delivers 100% deterministic, type-safe Zod/JSON schemas from a pre-refined edge cache in under 20 milliseconds, slashing token consumption by 85%+."
                  },
                  {
                    q: "How do I earn 70% royalties on the Creator Marketplace?",
                    a: "Go to the Visual Schema Studio, design a specialized schema (e.g. Healthcare, Zoning, or Legal), and publish it to the Marketplace with a query price (e.g. $0.008/call). Whenever an autonomous AI agent or enterprise queries your schema feed, 70% of the query fee is automatically credited to your creator balance."
                  },
                  {
                    q: "How do I connect the Refinery to Cursor IDE or Claude Desktop?",
                    a: "Simply add the single live endpoint URL (https://data-refinery-worker.juanquy.workers.dev/mcp) into your `.cursor/mcp.json` or `claude_desktop_config.json`. Cursor and Claude will automatically discover all 12 native and custom tools."
                  },
                  {
                    q: "What is the Founder Passcode for Admin access?",
                    a: "Enter the master passcode `Refinery#Founder2026!` (or quick alias `founder`) in the Admin Console tab to unlock full system observability, background cron pipeline controls, webhook dispatches, and user management."
                  },
                  {
                    q: "What latency and uptime guarantees are provided?",
                    a: "The Universal Data Refinery runs natively on Cloudflare Workers across 330 global edge cities, backed by an Enterprise SLA of 99.998% uptime, p50 latency under 12ms, and TLS 1.3 Strict encryption in transit."
                  }
                ].map((item, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-teal-400" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3 bg-slate-950/50">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                    {isAdminUnlocked && (
                      <button
                        onClick={() => {
                          setActiveTab("management");
                          setFounderSubTab("pricing");
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
                        title="Edit Price in Founder Console"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Price
                      </button>
                    )}
                  </div>
                  <div>
                    <span className="text-4xl font-black text-white">
                      ${pricingPlans.find(p => p.id === "PRO")?.price_usd ?? 49}
                    </span>
                    <span className="text-xs text-slate-300"> / month</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    For AI startups, agent developers, and teams requiring high-frequency, verified machine fuel.
                  </p>
                  <div className="space-y-2.5 text-xs pt-2">
                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span><strong>{(pricingPlans.find(p => p.id === "PRO")?.included_queries ?? 10000).toLocaleString()} refined queries</strong> / month</span>
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting to Stripe...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Subscribe with Stripe (${pricingPlans.find(p => p.id === "PRO")?.price_usd ?? 49}/mo)
                    </>
                  )}
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200">Enterprise PaaS</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Custom
                      </span>
                      {isAdminUnlocked && (
                        <button
                          onClick={() => {
                            setActiveTab("management");
                            setFounderSubTab("pricing");
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
                          title="Edit Price in Founder Console"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-white">
                      ${pricingPlans.find(p => p.id === "ENTERPRISE")?.price_usd ?? 299}+
                    </span>
                    <span className="text-xs text-slate-400"> / month</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Custom data refineries deployed to your enterprise Cloudflare zone with custom schemas.
                  </p>
                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>{(pricingPlans.find(p => p.id === "ENTERPRISE")?.included_queries ?? 100000).toLocaleString()}+ queries / month</span>
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
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center block transition-colors cursor-pointer"
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

            {/* AUTONOMOUS AGENT MICRO-TOKEN GENERATOR (HTTP 402 PAY-PER-QUERY) */}
            <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Autonomous Agent Micro-Token Generator (HTTP 402 Pay-Per-Query)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  $0.005 / Query Micro-Rate
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate instant prepaid query tokens for autonomous AI agents (LangChain, AutoGPT, Claude, Cursor) without requiring a human monthly subscription.
              </p>

              <form onSubmit={handleGenerateAgentToken} className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Agent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AutoGPT_Worker"
                    value={agentTokenName}
                    onChange={(e) => setAgentTokenName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Agent Owner Email</label>
                  <input
                    type="email"
                    placeholder="agent@autonomous.ai"
                    value={agentTokenOwner}
                    onChange={(e) => setAgentTokenOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Queries Allowance</label>
                  <select
                    value={agentTokenAllowance}
                    onChange={(e) => setAgentTokenAllowance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="100">100 Queries ($0.50)</option>
                    <option value="500">500 Queries ($2.50)</option>
                    <option value="1000">1,000 Queries ($5.00)</option>
                    <option value="5000">5,000 Queries ($25.00)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={agentTokenLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {agentTokenLoading ? "Generating..." : "+ Provision Agent Key"}
                  </button>
                </div>
              </form>

              {agentTokenResult && (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">✅ Agent Micro-Token Generated:</span>
                    <span className="text-slate-400 font-mono">{agentTokenResult.queriesAllowance} Query Credits Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={agentTokenResult.agentToken}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-400 select-all"
                    />
                    <button
                      onClick={() => copyApiKeyToClipboard(agentTokenResult.agentToken)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey ? "Copied!" : "Copy Key"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: UNIFIED FOUNDER CONSOLE (HUMANS, AI FLEETS, DYNAMIC PRICING & TELEMETRY) */}
        {activeTab === "management" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                  <Settings2 className="w-5 h-5 text-amber-400" />
                  Founder Console & SaaS Operations
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Unified command center for paying human customers, autonomous AI agent fleets, dynamic Stripe pricing, and edge telemetry.
                </p>
              </div>

              <button
                onClick={fetchManagementData}
                disabled={analyticsLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? "animate-spin text-amber-400" : ""}`} />
                Refresh Telemetry & Accounts
              </button>
            </div>

            {/* Founder Sub-Navigation Ribbon */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
              <button
                onClick={() => setFounderSubTab("telemetry")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  founderSubTab === "telemetry"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                📊 Edge Telemetry
              </button>

              <button
                onClick={() => setFounderSubTab("humans")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  founderSubTab === "humans"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                👥 Human Customers ({humanUsers.length})
              </button>

              <button
                onClick={() => setFounderSubTab("agents")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  founderSubTab === "agents"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                🤖 AI Agent Fleets ({agentFleets.length})
              </button>

              <button
                onClick={() => setFounderSubTab("pricing")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  founderSubTab === "pricing"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold"
                    : "text-amber-400 hover:text-amber-300 hover:bg-slate-800/60"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                💳 Dynamic Pricing & Stripe
              </button>

              <button
                onClick={() => setFounderSubTab("logs")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  founderSubTab === "logs"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                📜 Agent Audit Stream ({agentAuditLogs.length})
              </button>

              <button
                onClick={() => setFounderSubTab("pipelines")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  founderSubTab === "pipelines"
                    ? "bg-slate-700 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                ⚙️ Pipelines & Webhooks ({pipelines.length})
              </button>
            </div>

            {/* SUBTAB 1: EDGE TELEMETRY */}
            {founderSubTab === "telemetry" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Metered Pro Quota</div>
                    <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                      <span>{analyticsData?.totalQueries || 18}</span>
                      <span className="text-xs text-slate-500 font-normal">/ 10,000 mo</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(5, ((analyticsData?.totalQueries || 18) / 10000) * 100))}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Edge Latency</div>
                    <div className="text-2xl font-black text-cyan-400 font-mono">
                      {analyticsData?.avgEdgeLatencyMs || 16} <span className="text-xs font-normal text-slate-400">ms</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <Zap className="w-3 h-3" /> Powered by V8 Edge Isolates
                    </div>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cache Hit Ratio</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      {analyticsData?.edgeCacheHitRate || "99.4%"}
                    </div>
                    <div className="text-[11px] text-slate-400">Workers KV Microsecond Tier</div>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Agent Fleets</div>
                    <div className="text-2xl font-black text-purple-400 font-mono">
                      {agentFleets.length || 1}
                    </div>
                    <div className="text-[11px] text-slate-400">HTTP 402 Autonomous Micro-Wallets</div>
                  </div>
                </div>

                {/* 14-Day Activity Bar Chart */}
                {analyticsData?.dailySeries && (
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        14-Day Query Volume & Autonomous Ingestion Trends
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Real-time D1 Telemetry</span>
                    </div>

                    <div className="flex items-end justify-between gap-2 pt-6 h-36 border-b border-slate-800/80 pb-2">
                      {analyticsData.dailySeries.map((item: any, idx: number) => {
                        const maxVal = 80;
                        const heightPct = Math.min(100, Math.max(15, (item.queries / maxVal) * 100));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <div className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.queries}
                            </div>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-cyan-600 to-blue-400 group-hover:from-cyan-400 group-hover:to-teal-300 transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                              title={`${item.date}: ${item.queries} queries (${item.latencyMs}ms avg latency)`}
                            ></div>
                            <span className="text-[9px] text-slate-500 font-mono truncate w-full text-center">{item.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 2: HUMAN CUSTOMERS & SUBSCRIPTIONS */}
            {founderSubTab === "humans" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      Paying Human Customers & Accounts
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Developers, founders, and companies with active Stripe subscriptions and API keys.
                    </p>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="p-4">Customer Email</th>
                          <th className="p-4">Plan Tier</th>
                          <th className="p-4">Quota Usage</th>
                          <th className="p-4">Stripe Customer</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                        {humanUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                              No registered human customers yet. New signups through Stripe checkout will appear here automatically.
                            </td>
                          </tr>
                        ) : (
                          humanUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-white font-sans">{user.user_email}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{user.key_value.slice(0, 16)}...</div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  user.plan === "PRO" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                                }`}>
                                  {user.plan}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-white font-bold">{user.current_usage}</span> / {user.monthly_quota.toLocaleString()}
                              </td>
                              <td className="p-4 text-slate-400 text-[11px]">
                                {user.stripe_customer_id || "Direct Seed"}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  user.status === "ACTIVE" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800"
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleToggleHumanKey(user.id)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                    user.status === "ACTIVE"
                                      ? "bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300"
                                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                  }`}
                                >
                                  {user.status === "ACTIVE" ? "Suspend Key" : "Re-activate"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: AUTONOMOUS AI AGENT FLEETS */}
            {founderSubTab === "agents" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      Autonomous AI Agent Fleets & Micro-Wallets
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Autonomous agents consuming live edge machine fuel via Model Context Protocol (MCP) and HTTP 402 digital wallets.
                    </p>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="p-4">Agent Identity & Owner</th>
                          <th className="p-4">Token ID</th>
                          <th className="p-4">Wallet Balance</th>
                          <th className="p-4">Protocol</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Governance Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                        {agentFleets.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                              No agent micro-wallets generated yet. Create one via the Autonomous Agent Generator in the Subscriptions tab.
                            </td>
                          </tr>
                        ) : (
                          agentFleets.map((agent) => (
                            <tr key={agent.id} className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-white font-sans flex items-center gap-2">
                                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>{agent.agent_identity || "Autonomous_Agent"}</span>
                                </div>
                                <div className="text-[10px] text-slate-500">Created: {agent.created_at?.slice(0, 10)}</div>
                              </td>
                              <td className="p-4">
                                <code className="text-cyan-300 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                  {agent.key_value.slice(0, 18)}...
                                </code>
                              </td>
                              <td className="p-4">
                                <span className="text-emerald-400 font-bold">{agent.allowance - agent.current_usage}</span>
                                <span className="text-slate-500 text-[10px]"> / {agent.allowance} credits</span>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold">
                                  HTTP-402 / MCP
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  agent.status === "ACTIVE" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800"
                                }`}>
                                  {agent.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleTopupAgent(agent.id, 500)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Add 500 query credits to this agent"
                                  >
                                    <Coins className="w-3 h-3" /> +500 Credits
                                  </button>
                                  {agent.status === "ACTIVE" && (
                                    <button
                                      onClick={() => handleKillAgent(agent.id)}
                                      className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Immediately revoke and kill this agent token"
                                    >
                                      <ShieldAlert className="w-3 h-3" /> Kill-Switch
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: DYNAMIC PRICING & STRIPE CONTROLS */}
            {founderSubTab === "pricing" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    Dynamic Pricing Configuration & Stripe Integration
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modify prices and quotas dynamically. Changes saved here take effect immediately across the Landing Page, the Subscriptions tab, and Stripe Checkout!
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Pro Plan Editor */}
                  {(() => {
                    const plan = pricingPlans.find(p => p.id === "PRO") || { id: "PRO", name: "Data Refinery Pro", price_usd: 49, included_queries: 10000 };
                    const isEditing = editingPlanId === "PRO";
                    return (
                      <div className="bg-[#0f172a] border border-emerald-500/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xl">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 font-mono uppercase">Pro Plan</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                              Stripe Dynamic
                            </span>
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1">Monthly Price ($ USD):</div>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-white">$</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={editPlanPrice}
                                  onChange={(e) => setEditPlanPrice(Number(e.target.value))}
                                  className="w-24 bg-slate-950 border border-emerald-500 rounded-lg px-2.5 py-1 text-xl font-black text-white font-mono"
                                />
                                <span className="text-xs text-slate-400">/ mo</span>
                              </div>
                            ) : (
                              <div className="text-3xl font-black text-white font-mono">${plan.price_usd} <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                            )}
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1">Included Queries:</div>
                            {isEditing ? (
                              <input
                                type="number"
                                step="1000"
                                value={editPlanQuota}
                                onChange={(e) => setEditPlanQuota(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                              />
                            ) : (
                              <div className="text-xs text-emerald-300 font-bold">{plan.included_queries.toLocaleString()} queries / month</div>
                            )}
                          </div>
                        </div>

                        <div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSavePlanPrice("PRO", editPlanPrice, editPlanQuota)}
                                disabled={savingPlan}
                                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {savingPlan ? "Saving..." : "Save to Stripe & DB"}
                              </button>
                              <button
                                onClick={() => setEditingPlanId(null)}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPlanId("PRO");
                                setEditPlanPrice(plan.price_usd);
                                setEditPlanQuota(plan.included_queries);
                              }}
                              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Pro Price
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Enterprise Plan Editor */}
                  {(() => {
                    const plan = pricingPlans.find(p => p.id === "ENTERPRISE") || { id: "ENTERPRISE", name: "Enterprise PaaS", price_usd: 299, included_queries: 100000 };
                    const isEditing = editingPlanId === "ENTERPRISE";
                    return (
                      <div className="bg-[#0f172a] border border-purple-500/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xl">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-400 font-mono uppercase">Enterprise PaaS</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                              Dedicated
                            </span>
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1">Monthly Starting Price ($ USD):</div>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-white">$</span>
                                <input
                                  type="number"
                                  min="50"
                                  value={editPlanPrice}
                                  onChange={(e) => setEditPlanPrice(Number(e.target.value))}
                                  className="w-24 bg-slate-950 border border-purple-500 rounded-lg px-2.5 py-1 text-xl font-black text-white font-mono"
                                />
                                <span className="text-xs text-slate-400">/ mo</span>
                              </div>
                            ) : (
                              <div className="text-3xl font-black text-white font-mono">${plan.price_usd}+ <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                            )}
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1">Included Queries:</div>
                            {isEditing ? (
                              <input
                                type="number"
                                step="10000"
                                value={editPlanQuota}
                                onChange={(e) => setEditPlanQuota(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-purple-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                              />
                            ) : (
                              <div className="text-xs text-purple-300 font-bold">{plan.included_queries.toLocaleString()}+ queries / month</div>
                            )}
                          </div>
                        </div>

                        <div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSavePlanPrice("ENTERPRISE", editPlanPrice, editPlanQuota)}
                                disabled={savingPlan}
                                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {savingPlan ? "Saving..." : "Save Enterprise Price"}
                              </button>
                              <button
                                onClick={() => setEditingPlanId(null)}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPlanId("ENTERPRISE");
                                setEditPlanPrice(plan.price_usd);
                                setEditPlanQuota(plan.included_queries);
                              }}
                              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-500/30 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Enterprise Price
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Autonomous Micro-Rate Editor */}
                  {(() => {
                    const plan = pricingPlans.find(p => p.id === "AGENT_MICRO") || { id: "AGENT_MICRO", name: "Autonomous Agent Wallet", price_usd: 0.005, included_queries: 1 };
                    const isEditing = editingPlanId === "AGENT_MICRO";
                    return (
                      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xl">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cyan-400 font-mono uppercase">Agent Micro-Rate</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                              HTTP 402
                            </span>
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1">Per-Query Micro Rate ($ USD):</div>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-white">$</span>
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0.001"
                                  value={editPlanPrice}
                                  onChange={(e) => setEditPlanPrice(Number(e.target.value))}
                                  className="w-28 bg-slate-950 border border-cyan-500 rounded-lg px-2.5 py-1 text-xl font-black text-white font-mono"
                                />
                                <span className="text-xs text-slate-400">/ query</span>
                              </div>
                            ) : (
                              <div className="text-3xl font-black text-white font-mono">${plan.price_usd} <span className="text-xs font-normal text-slate-400">/ query</span></div>
                            )}
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1">Protocol:</div>
                            <div className="text-xs text-cyan-300 font-bold">X-402-Payment / Digital Wallets</div>
                          </div>
                        </div>

                        <div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSavePlanPrice("AGENT_MICRO", editPlanPrice, 1)}
                                disabled={savingPlan}
                                className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {savingPlan ? "Saving..." : "Save Micro Rate"}
                              </button>
                              <button
                                onClick={() => setEditingPlanId(null)}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPlanId("AGENT_MICRO");
                                setEditPlanPrice(plan.price_usd);
                                setEditPlanQuota(1);
                              }}
                              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/30 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Micro Rate
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* SUBTAB 5: LIVE AGENT AUDIT & REQUEST STREAM */}
            {founderSubTab === "logs" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-400" />
                      Live Agent Execution & Audit Telemetry Stream
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time chronological telemetry of autonomous agents calling refinery tools, schemas, and endpoints.
                    </p>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Agent Identity</th>
                          <th className="p-4">Caller Email</th>
                          <th className="p-4">Endpoint / Tool</th>
                          <th className="p-4">Target Entity</th>
                          <th className="p-4">Edge Latency</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                        {agentAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-4 text-slate-400 text-[11px]">
                              {log.created_at}
                            </td>
                            <td className="p-4 font-sans font-bold text-white flex items-center gap-1.5">
                              <Bot className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{log.agent_name || "Agent"}</span>
                            </td>
                            <td className="p-4 text-slate-300">
                              {log.user_email}
                            </td>
                            <td className="p-4">
                              <code className="text-purple-300 text-[11px] bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                                {log.endpoint}
                              </code>
                            </td>
                            <td className="p-4 font-bold text-amber-300">
                              {log.entity_symbol || "—"}
                            </td>
                            <td className="p-4 text-cyan-400 font-bold">
                              {log.latency_ms} ms
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                                {log.status_code} OK
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 6: SCHEDULED PIPELINES & WEBHOOKS */}
            {founderSubTab === "pipelines" && (
              <div className="space-y-8">
                {/* SECTION 2: RECURRING PIPELINE SCHEDULER */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        &ldquo;Set-and-Forget&rdquo; Recurring Crawl Pipelines
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Schedule websites, changelogs, or pricing pages to continuously refine and compute semantic diffs automatically.
                      </p>
                    </div>
                  </div>

                  {/* Create Pipeline Form */}
                  <form onSubmit={handleCreatePipeline} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      Schedule New Autonomous Pipeline
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Pipeline Name</label>
                        <input
                          type="text"
                          placeholder="e.g. OpenAI SDK Releases"
                          value={newPipeName}
                          onChange={(e) => setNewPipeName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target URL to Crawl *</label>
                        <input
                          type="url"
                          required
                          placeholder="https://..."
                          value={newPipeUrl}
                          onChange={(e) => setNewPipeUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Category</label>
                          <select
                            value={newPipeDomain}
                            onChange={(e) => setNewPipeDomain(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="developer">Developer SDK</option>
                            <option value="pricing">B2B Pricing</option>
                            <option value="regulatory">Regulatory/Gov</option>
                            <option value="custom">Custom URL</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Frequency</label>
                          <select
                            value={newPipeFreq}
                            onChange={(e) => setNewPipeFreq(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="6">Every 6h</option>
                            <option value="12">Every 12h</option>
                            <option value="24">Every 24h</option>
                            <option value="48">Every 48h</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">Worker AI will automatically calculate semantic delta diffs on every cycle.</span>
                      <button
                        type="submit"
                        disabled={creatingPipeline}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {creatingPipeline ? "Creating Pipeline..." : "+ Create Recurring Pipeline"}
                      </button>
                    </div>
                  </form>

                  {/* Pipelines List */}
                  <div className="grid gap-3">
                    {pipelines.map((pipe) => (
                      <div key={pipe.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{pipe.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              pipe.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}>
                              {pipe.status}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              Every {pipe.frequency_hours}h
                            </span>
                          </div>
                          <a href={pipe.target_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline truncate max-w-lg block flex items-center gap-1 font-mono">
                            {pipe.target_url} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <button
                            onClick={() => handleTogglePipeline(pipe.id)}
                            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              pipe.status === "ACTIVE"
                                ? "bg-slate-800 hover:bg-slate-700 text-amber-300"
                                : "bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-300"
                            }`}
                            title={pipe.status === "ACTIVE" ? "Pause Pipeline" : "Resume Pipeline"}
                          >
                            {pipe.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{pipe.status === "ACTIVE" ? "Pause" : "Resume"}</span>
                          </button>

                          <button
                            onClick={() => handleDeletePipeline(pipe.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Pipeline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 3: WEBHOOKS & REAL-TIME ALERTS */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-400" />
                      Discord / Slack Webhooks & Alert Subscriptions
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Receive instant JSON webhook notifications whenever a CRITICAL breaking change or price hike is detected.
                    </p>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
                    <form onSubmit={handleRegisterWebhook} className="space-y-3">
                      <label className="text-[11px] font-semibold text-slate-400 block">Outbound Webhook URL (Discord, Slack, or Custom Server)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="url"
                          required
                          placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/..."
                          value={newWebhookUrl}
                          onChange={(e) => setNewWebhookUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                        />
                        <button
                          type="submit"
                          disabled={registeringWebhook}
                          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          {registeringWebhook ? "Adding..." : "+ Add Webhook"}
                        </button>
                      </div>
                    </form>

                    {webhookTestStatus && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200">
                        {webhookTestStatus}
                      </div>
                    )}

                    {/* Webhooks list */}
                    {webhooks.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Webhook Destinations</div>
                        <div className="grid gap-2">
                          {webhooks.map((wh) => (
                            <div key={wh.id} className="bg-slate-950 rounded-xl p-3 flex items-center justify-between gap-3 border border-slate-800">
                              <div className="flex items-center gap-2 truncate">
                                <Radio className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                <span className="text-xs font-mono text-slate-300 truncate">{wh.webhook_url}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleTestWebhook(wh.webhook_url)}
                                  disabled={testingWebhook}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Test Webhook
                                </button>
                                <button
                                  onClick={() => handleDeleteWebhook(wh.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOUNDER / ADMIN CONSOLE UNLOCK MODAL */}
        {adminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0b1120] border border-amber-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Founder & Admin Console</h3>
                    <p className="text-[11px] text-slate-400">Unlock marketing growth & pipeline controls</p>
                  </div>
                </div>
                <button
                  onClick={() => setAdminModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUnlockAdmin} className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Enter Founder Passcode or Active API Key:
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="Enter passcode (e.g. founder) or Pro API key"
                  value={adminPasscodeInput}
                  onChange={(e) => setAdminPasscodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />

                {adminError && (
                  <p className="text-xs text-red-400 font-semibold">{adminError}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdminModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    Unlock Founder Console
                  </button>
                </div>
              </form>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">💡 Founder Notice:</span>
                <span>Unlocks autonomous promotion generation, recurring crawler scheduling, and outbound webhooks.</span>
              </div>
            </div>
          </div>
        )}

        {/* ENTERPRISE SLA TELEMETRY MODAL */}
        {isSlaModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Enterprise SLA & Global Edge Health
                    </h3>
                    <p className="text-xs text-slate-400">Real-time Cloudflare Edge PoP Telemetry</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSlaModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* SLA Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Uptime SLA</div>
                  <div className="text-xl font-black text-emerald-400 font-mono">99.998%</div>
                  <div className="text-[10px] text-emerald-500/80">Guaranteed 99.99%</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active Edge PoPs</div>
                  <div className="text-xl font-black text-cyan-400 font-mono">330 Cities</div>
                  <div className="text-[10px] text-cyan-500/80">6 Continents</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">p50 Latency</div>
                  <div className="text-xl font-black text-teal-400 font-mono">12ms</div>
                  <div className="text-[10px] text-teal-500/80">p99: 24ms</div>
                </div>
              </div>

              {/* Security & Compliance Checklist */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Enterprise Security & Compliance
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>TLS 1.3 Strict In Transit</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>AES-256 Cloudflare Storage</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>V8 Isolated Sandboxes</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>DDoS Magic Transit Protection</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsSlaModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Close Telemetry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-2xl font-extrabold text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{toastMessage}</span>
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
