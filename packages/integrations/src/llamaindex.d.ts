/**
 * LlamaIndex Official Readers for Universal Data Refinery
 */
import { RefineryClientConfig } from "./langchain";
export interface LlamaIndexDocument {
    text: string;
    id_?: string;
    metadata?: Record<string, any>;
}
export declare class DataRefineryReader {
    private client;
    constructor(config?: RefineryClientConfig);
    loadData(options: {
        domain: "developer" | "pricing" | "regulatory" | "custom";
        entityKey: string;
    }): Promise<LlamaIndexDocument[]>;
}
