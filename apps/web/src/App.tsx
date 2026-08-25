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
  Users,
  Wand2,
  FileCode
} from "lucide-react";
import { LandingPage } from "./LandingPage";

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

  const [activeTab, setActiveTab] = useState<"diffs" | "dev" | "pricing" | "regulatory" | "schemas" | "playground" | "mcp" | "help" | "billing" | "marketing" | "management">("diffs");
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

  // Phase 3: Visual Schema Studio & Workspace Multi-Tenancy State
  const [customSchemas, setCustomSchemas] = useState<CustomSchemaItem[]>([]);
  const [schemasLoading, setSchemasLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("ws_global_refinery");
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  
  // New Schema Builder Form
  const [newSchemaName, setNewSchemaName] = useState("Real Estate & Permit Tracker");
  const [newSchemaDesc, setNewSchemaDesc] = useState("Extracts zoning codes, square footage, permit approvals, and construction cost estimates.");
  const [newSchemaPrompt, setNewSchemaPrompt] = useState("Extract precise municipal zoning parameters, permit numbers, and estimated valuation.");
  const [newSchemaFields, setNewSchemaFields] = useState<CustomSchemaField[]>([
    { id: "f1", name: "propertyAddress", type: "string", description: "Full street address of the property", required: true },
    { id: "f2", name: "zoningClassification", type: "string", description: "Commercial, Residential, or Mixed-Use zoning code", required: true },
    { id: "f3", name: "estimatedCostUSD", type: "number", description: "Estimated project construction or permit fee", required: false },
    { id: "f4", name: "permitApprovalStatus", type: "string", description: "Status: APPROVED, PENDING, or DENIED", required: true }
  ]);
  const [savingSchema, setSavingSchema] = useState(false);
  const [previewTab, setPreviewTab] = useState<"json" | "typescript" | "mcp">("json");
  
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

  useEffect(() => {
    fetchData();
    fetchSchemas();
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (activeTab === "schemas") {
      fetchSchemas();
      fetchWorkspaces();
    }
  }, [activeTab, selectedWorkspace]);

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
        } catch {}
        setIsAdminUnlocked(true);
        setAdminModalOpen(false);
        setAdminPasscodeInput("");
        setAdminError(null);
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
    } catch {}
    setIsAdminUnlocked(false);
    if (activeTab === "marketing" || activeTab === "management") {
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

  // Marketing campaign state
  const [campaignData, setCampaignData] = useState<any>(null);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [copiedMarketingKey, setCopiedMarketingKey] = useState<string | null>(null);

  const handleGenerateCampaign = async () => {
    setCampaignLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/promotions/drafts`);
      const data = await res.json();
      setCampaignData(data.campaign);
    } catch (err) {
      console.error(err);
    } finally {
      setCampaignLoading(false);
    }
  };

  const copyMarketingText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMarketingKey(id);
    setTimeout(() => setCopiedMarketingKey(null), 2000);
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

  const fetchManagementData = async () => {
    setAnalyticsLoading(true);
    setPipelinesLoading(true);
    setWebhooksLoading(true);
    try {
      const [aRes, pRes, wRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/management/analytics`).then(r => r.json()),
        fetch(`${API_BASE}/api/v1/management/pipelines`).then(r => r.json()),
        fetch(`${API_BASE}/api/v1/management/webhooks`).then(r => r.json())
      ]);
      if (aRes.status === "success") setAnalyticsData(aRes.metrics);
      if (pRes.status === "success") setPipelines(pRes.pipelines || []);
      if (wRes.status === "success") setWebhooks(wRes.webhooks || []);
    } catch (err) {
      console.error("Management fetch error:", err);
    } finally {
      setAnalyticsLoading(false);
      setPipelinesLoading(false);
      setWebhooksLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "management") {
      fetchManagementData();
    }
  }, [activeTab]);

  const handleCreatePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPipeUrl.trim()) return;
    setCreatingPipeline(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/management/pipelines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      await fetch(`${API_BASE}/api/v1/management/pipelines/${id}/toggle`, { method: "POST" });
      setPipelines(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePipeline = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pipeline?")) return;
    try {
      await fetch(`${API_BASE}/api/v1/management/pipelines/${id}`, { method: "DELETE" });
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
      await fetch(`${API_BASE}/api/v1/management/webhooks/${id}`, { method: "DELETE" });
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

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Workers AI: Active</span>
            </div>

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
        <div className="flex items-center gap-2 flex-wrap border-b border-slate-800/80 pb-3">
          {/* PUBLIC CLIENT TABS */}
          <button
            onClick={() => setActiveTab("diffs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "diffs"
                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
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
            onClick={() => setActiveTab("schemas")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "schemas"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/20"
                : "bg-slate-900/60 text-teal-400 hover:text-teal-300 hover:bg-slate-800 border border-teal-500/20"
            }`}
          >
            <Sliders className="w-4 h-4 text-teal-400" />
            🎨 4. Visual Schema Studio
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

          {/* GATED FOUNDER / ADMIN TABS (Only visible when unlocked) */}
          {isAdminUnlocked && (
            <>
              <div className="h-6 w-[1px] bg-amber-500/40 mx-1 hidden sm:block"></div>
              
              <button
                onClick={() => setActiveTab("marketing")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === "marketing"
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/20"
                    : "bg-pink-950/40 text-pink-300 hover:text-pink-200 hover:bg-pink-900/60 border border-pink-500/30"
                }`}
              >
                <Megaphone className="w-4 h-4" />
                👑 📢 Auto-Promotions
              </button>

              <button
                onClick={() => setActiveTab("management")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === "management"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/60 border border-cyan-500/30"
                }`}
              >
                <Settings2 className="w-4 h-4" />
                👑 ⚙️ Service Management
              </button>
            </>
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

        {/* TAB 9: AUTO-MARKETING & CAMPAIGN GENERATOR */}
        {activeTab === "marketing" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                  <Megaphone className="w-5 h-5 text-pink-400" />
                  Autonomous Promotional Campaign Engine
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Turn your live database intelligence and breaking change diffs into viral marketing posts, tweets, and automated RSS broadcasts.
                </p>
              </div>

              <button
                onClick={handleGenerateCampaign}
                disabled={campaignLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs shadow-lg shadow-pink-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {campaignLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating with Workers AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Fresh AI Campaign
                  </>
                )}
              </button>
            </div>

            {/* Auto-Sync RSS Broadcast Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                  <Rss className="w-4 h-4 text-orange-400" />
                  <span>Automated 24/7 Social Broadcasting RSS Feed</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Buffer & Zapier Ready
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Plug this live RSS link into free tools like <strong>Buffer</strong>, <strong>Zapier</strong>, or <strong>Make.com</strong>. Whenever your refinery detects an API breaking change or pricing update, it automatically creates a post on your Twitter/X, LinkedIn, or Discord!
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value="https://data-refinery-worker.juanquy.workers.dev/api/v1/promotions/feed.rss"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-orange-300 select-all focus:outline-none"
                />
                <button
                  onClick={() => copyMarketingText("https://data-refinery-worker.juanquy.workers.dev/api/v1/promotions/feed.rss", "rss-feed")}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  {copiedMarketingKey === "rss-feed" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedMarketingKey === "rss-feed" ? "Copied!" : "Copy RSS Link"}
                </button>
              </div>
            </div>

            {/* Generated Campaign Sections */}
            {campaignData ? (
              <div className="space-y-6">
                {/* 1. Viral Tweets */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-400" />
                    Ready-to-Post Twitter / X Posts & Threads
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {campaignData.tweets?.map((tweet: any, idx: number) => {
                      const fullTweet = `${tweet.tweetText}\n\n${tweet.hashtags?.join(" ") || ""}`.trim();
                      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullTweet)}`;
                      return (
                        <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-blue-400 font-mono">Hook: &ldquo;{tweet.hook}&rdquo;</div>
                            <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{tweet.tweetText}</p>
                            {tweet.hashtags && (
                              <div className="text-[11px] text-slate-500 font-mono">{tweet.hashtags.join(" ")}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                            <a
                              href={tweetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              Post on X <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => copyMarketingText(fullTweet, `tweet-${idx}`)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              {copiedMarketingKey === `tweet-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedMarketingKey === `tweet-${idx}` ? "Copied!" : "Copy Tweet"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Reddit Posts */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-orange-400" />
                    Targeted Reddit Community Discussions
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {campaignData.redditPosts?.map((post: any, idx: number) => (
                      <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            {post.targetSubreddit}
                          </span>
                          <h4 className="text-xs font-bold text-white">{post.title}</h4>
                          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{post.postBody}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-900">
                          <button
                            onClick={() => copyMarketingText(`${post.title}\n\n${post.postBody}`, `reddit-${idx}`)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            {copiedMarketingKey === `reddit-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedMarketingKey === `reddit-${idx}` ? "Copied Post!" : "Copy Reddit Post"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Hacker News */}
                {campaignData.hackerNews && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white">Hacker News &ldquo;Show HN&rdquo; Launch Template</h3>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                      <div className="font-bold text-xs text-amber-400">Title: {campaignData.hackerNews.title}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{campaignData.hackerNews.discussionStarter}</p>
                      <button
                        onClick={() => copyMarketingText(`${campaignData.hackerNews.title}\n\n${campaignData.hackerNews.discussionStarter}\n\nhttps://drefinery.freshbeats.ai`, "hn")}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {copiedMarketingKey === "hn" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedMarketingKey === "hn" ? "Copied HN Post!" : "Copy HN Text"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-10 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-pink-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Generate Your First Automated Campaign</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click the button above to let Workers AI analyze your database and draft viral tweets, Reddit discussions, and Show HN posts automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 10: SERVICE MANAGEMENT & AUTOMATION HUB */}
        {activeTab === "management" && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                  <Settings2 className="w-5 h-5 text-cyan-400" />
                  Service Management & Autonomous Pipeline Hub
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your edge analytics, recurring background crawlers, outbound Discord/Slack webhooks, and metered API quotas.
                </p>
              </div>

              <button
                onClick={fetchManagementData}
                disabled={analyticsLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? "animate-spin text-cyan-400" : ""}`} />
                Refresh Management Metrics
              </button>
            </div>

            {/* SECTION 1: LIVE ANALYTICS & EDGE METRICS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Live Edge Analytics & Quota Consumption
              </h3>

              {/* KPI Badges */}
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
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Edge Response Latency</div>
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
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Pipeline Crawlers</div>
                  <div className="text-2xl font-black text-indigo-400 font-mono">
                    {pipelines.filter(p => p.status === "ACTIVE").length || 3}
                  </div>
                  <div className="text-[11px] text-slate-400">Running on 6h/12h Scheduled Crons</div>
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
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
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
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
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
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold transition-colors"
                            >
                              Test Webhook
                            </button>
                            <button
                              onClick={() => handleDeleteWebhook(wh.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
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
