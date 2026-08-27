/**
 * LlamaIndex Official Readers for Universal Data Refinery
 */
import { DataRefineryClient } from "./langchain";
export class DataRefineryReader {
    client;
    constructor(config) {
        this.client = new DataRefineryClient(config);
    }
    async loadData(options) {
        let result;
        if (options.domain === "developer") {
            result = await this.client.getBreakingChanges(options.entityKey);
        }
        else if (options.domain === "pricing") {
            result = await this.client.getPricingMatrix(options.entityKey);
        }
        else if (options.domain === "regulatory") {
            result = await this.client.getRegulatoryOrdinance(options.entityKey);
        }
        else {
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
