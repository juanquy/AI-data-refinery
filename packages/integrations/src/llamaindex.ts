/**
 * LlamaIndex Official Readers for Universal Data Refinery
 */

import { DataRefineryClient, type RefineryClientConfig } from "./langchain";

export interface LlamaIndexDocument {
  text: string;
  id_?: string;
  metadata?: Record<string, any>;
}

export class DataRefineryReader {
  private client: DataRefineryClient;

  constructor(config?: RefineryClientConfig) {
    this.client = new DataRefineryClient(config);
  }

  async loadData(options: {
    domain: "developer" | "pricing" | "regulatory" | "custom";
    entityKey: string;
  }): Promise<LlamaIndexDocument[]> {
    let result: any;
    if (options.domain === "developer") {
      result = await this.client.getBreakingChanges(options.entityKey);
    } else if (options.domain === "pricing") {
      result = await this.client.getPricingMatrix(options.entityKey);
    } else if (options.domain === "regulatory") {
      result = await this.client.getRegulatoryOrdinance(options.entityKey);
    } else {
      result = await this.client.search(options.entityKey);
    }

    const docText = typeof result === "string" ? result : JSON.stringify(result, null, 2);

    return [
      {
        text: docText,
        id_: `refinery_${options.domain}_${options.entityKey}`,
        metadata: {
          domain: options.domain,
          entityKey: options.entityKey,
          source: "Universal Data Refinery",
          verified: true
        }
      }
    ];
  }
}
