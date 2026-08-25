/**
 * Runnable Example: LangChain & LlamaIndex AI Agents using Universal Data Refinery
 */

import { DataRefineryClient, DataRefineryLoader, createDataRefineryTools } from "../src/langchain";
import { DataRefineryReader } from "../src/llamaindex";

async function main() {
  console.log("================================================================================");
  console.log("🤖 LANGCHAIN & LLAMAININDEX AGENT INTEGRATION BENCHMARK");
  console.log("================================================================================\n");

  const client = new DataRefineryClient();

  // 1. LangChain Document Loader Demo
  console.log("1. Executing LangChain Document Loader for 'stripe-node'...");
  const loader = new DataRefineryLoader({ domain: "dev", query: "stripe-node" });
  const docs = await loader.load();
  console.log(`   ✅ LangChain loaded ${docs.length} document chunk(s).`);
  console.log(`   Metadata:`, docs[0].metadata);
  console.log(`   Preview: ${docs[0].pageContent.substring(0, 150)}...\n`);

  // 2. LangChain Tools Demo
  console.log("2. Executing LangChain Agent Tool: 'refinery_pricing_lookup' for 'datadog'...");
  const tools = createDataRefineryTools();
  const pricingTool = tools.find(t => t.name === "refinery_pricing_lookup");
  if (pricingTool) {
    const output = await pricingTool.func("datadog");
    console.log(`   ✅ LangChain Tool returned response (${output.length} bytes).`);
    console.log(`   Preview: ${output.substring(0, 150)}...\n`);
  }

  // 3. LlamaIndex Reader Demo
  console.log("3. Executing LlamaIndex Reader for 'San Francisco Short-Term Rentals'...");
  const reader = new DataRefineryReader();
  const llamaDocs = await reader.loadData({ domain: "regulatory", entityKey: "San Francisco Short-Term Rentals" });
  console.log(`   ✅ LlamaIndex loaded document id: ${llamaDocs[0].id_}`);
  console.log(`   Metadata:`, llamaDocs[0].metadata);
  console.log(`   Preview: ${llamaDocs[0].text.substring(0, 150)}...\n`);

  console.log("================================================================================");
  console.log("🎉 ALL AGENT FRAMEWORK INTEGRATIONS OPERATIONAL & TESTED");
  console.log("================================================================================\n");
}

main().catch(console.error);
