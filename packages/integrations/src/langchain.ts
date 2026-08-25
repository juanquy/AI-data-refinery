/**
 * LangChain Official Loaders & Tools for Universal Data Refinery
 */

export interface RefineryClientConfig {
  baseUrl?: string;
  apiKey?: string;
}

const DEFAULT_BASE_URL = "https://data-refinery-worker.juanquy.workers.dev";

export class DataRefineryClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: RefineryClientConfig = {}) {
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.apiKey = config.apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["X-Refinery-Key"] = this.apiKey;
    }
    return headers;
  }

  async getBreakingChanges(pkg: string) {
    const res = await fetch(`${this.baseUrl}/api/v1/dev/${encodeURIComponent(pkg)}`, {
      headers: this.getHeaders()
    });
    return await res.json();
  }

  async getPricingMatrix(product: string) {
    const res = await fetch(`${this.baseUrl}/api/v1/pricing/${encodeURIComponent(product)}`, {
      headers: this.getHeaders()
    });
    return await res.json();
  }

  async getRegulatoryOrdinance(jurisdiction: string, topic?: string) {
    const url = topic
      ? `${this.baseUrl}/api/v1/regulatory/${encodeURIComponent(jurisdiction)}?topic=${encodeURIComponent(topic)}`
      : `${this.baseUrl}/api/v1/regulatory/${encodeURIComponent(jurisdiction)}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    return await res.json();
  }

  async search(query: string, domain?: string) {
    const url = domain
      ? `${this.baseUrl}/api/v1/search?q=${encodeURIComponent(query)}&domain=${encodeURIComponent(domain)}`
      : `${this.baseUrl}/api/v1/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    return await res.json();
  }

  async refineUrl(url: string, instructionPrompt?: string) {
    const res = await fetch(`${this.baseUrl}/api/v1/custom/refine`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ sourceUrl: url, instructionPrompt })
    });
    return await res.json();
  }
}

/**
 * LangChain Document Loader
 */
export class DataRefineryLoader {
  private client: DataRefineryClient;
  private target: { domain: "dev" | "pricing" | "regulatory" | "search"; query: string };

  constructor(options: { domain: "dev" | "pricing" | "regulatory" | "search"; query: string; apiKey?: string; baseUrl?: string }) {
    this.client = new DataRefineryClient({ apiKey: options.apiKey, baseUrl: options.baseUrl });
    this.target = { domain: options.domain, query: options.query };
  }

  async load(): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
    let result: any;
    switch (this.target.domain) {
      case "dev":
        result = await this.client.getBreakingChanges(this.target.query);
        break;
      case "pricing":
        result = await this.client.getPricingMatrix(this.target.query);
        break;
      case "regulatory":
        result = await this.client.getRegulatoryOrdinance(this.target.query);
        break;
      case "search":
        result = await this.client.search(this.target.query);
        break;
    }

    return [
      {
        pageContent: JSON.stringify(result, null, 2),
        metadata: {
          source: "Universal Data Refinery",
          domain: this.target.domain,
          query: this.target.query,
          timestamp: new Date().toISOString()
        }
      }
    ];
  }
}

/**
 * LangChain Agent Tool Definition (Compatible with LangChain & LangGraph)
 */
export function createDataRefineryTools(config?: RefineryClientConfig) {
  const client = new DataRefineryClient(config);

  return [
    {
      name: "refinery_breaking_changes",
      description: "Check if upgrading an SDK or API library introduces breaking changes or deprecations.",
      func: async (pkg: string) => JSON.stringify(await client.getBreakingChanges(pkg))
    },
    {
      name: "refinery_pricing_lookup",
      description: "Lookup verified B2B SaaS pricing tiers, feature checklists, and hidden overage costs.",
      func: async (product: string) => JSON.stringify(await client.getPricingMatrix(product))
    },
    {
      name: "refinery_semantic_search",
      description: "Perform edge semantic vector search across all refined developer, pricing, and regulatory knowledge.",
      func: async (query: string) => JSON.stringify(await client.search(query))
    }
  ];
}
