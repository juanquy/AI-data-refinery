/**
 * LangChain Official Loaders & Tools for Universal Data Refinery
 */
export interface RefineryClientConfig {
    baseUrl?: string;
    apiKey?: string;
}
export declare class DataRefineryClient {
    private baseUrl;
    private apiKey?;
    constructor(config?: RefineryClientConfig);
    private getHeaders;
    getBreakingChanges(pkg: string): Promise<any>;
    getPricingMatrix(product: string): Promise<any>;
    getRegulatoryOrdinance(jurisdiction: string, topic?: string): Promise<any>;
    search(query: string, domain?: string): Promise<any>;
    refineUrl(url: string, instructionPrompt?: string): Promise<any>;
}
/**
 * LangChain Document Loader
 */
export declare class DataRefineryLoader {
    private client;
    private target;
    constructor(options: {
        domain: "dev" | "pricing" | "regulatory" | "search";
        query: string;
        apiKey?: string;
        baseUrl?: string;
    });
    load(): Promise<Array<{
        pageContent: string;
        metadata: Record<string, any>;
    }>>;
}
/**
 * LangChain Agent Tool Definition (Compatible with LangChain & LangGraph)
 */
export declare function createDataRefineryTools(config?: RefineryClientConfig): {
    name: string;
    description: string;
    func: (pkg: string) => Promise<string>;
}[];
