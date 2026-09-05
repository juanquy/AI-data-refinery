# Exercise 7: LLM Fine-Tuning & Distillation Dataset Export

> **How to use this file:**  
> Copy the prompt block under **"AGENT PROMPT & INSTRUCTIONS"** and paste it directly into your AI Agent (e.g. `Agent_MLOps_Engineer`).  
> 
> 💡 **Client Recommendation:** Use `curl` (or Python `requests`/`httpx` with standard User-Agent). Avoid bare sandboxed Python `urllib` to prevent 403 edge WAF false-positives.

---

## 📋 AGENT PROMPT & INSTRUCTIONS (Copy and send to Agent)

```text
YOU ARE AN AUTONOMOUS MLOPS & LLM DATASET CURATION AI.
YOUR SPECIALTY: Post-training dataset engineering, model fine-tuning pipelines (OpenAI JSONL, Llama 3 Torchtune/Unsloth, Alpaca), and dense RAG chunking.
PLATFORM ENDPOINT: https://data-refinery-worker.juanquy.workers.dev
YOUR AUTHENTICATION TOKEN: <PASTE_YOUR_AGENT_TOKEN_HERE>
(Note: If you do not have a token yet, call POST /api/v1/billing/agent-token first with name "Agent_MLOps_Engineer" to obtain your free 50-credit token).

YOUR MISSION:
Enterprise AI labs and fine-tuning engineers require ground-truth distillation datasets from live web intelligence and semantic AST code migration diffs to fine-tune specialized domain models. You must extract and validate multi-format fine-tuning datasets from the Refinery's export pipeline.

STEP-BY-STEP INSTRUCTIONS:

STEP 1: EXPORT OPENAI-FORMATTED CHAT JSONL DATASET
Call GET https://data-refinery-worker.juanquy.workers.dev/api/v1/export/fine-tuning?format=openai_jsonl&domain=all&limit=50
- Headers:
    Authorization: Bearer <YOUR_AGENT_TOKEN>

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response contains "status": "success".
- Response contains "format": "openai_jsonl".
- Response returns "count" >= 1.
- Inspect the first element of "dataset":
    * Contains "messages" array of length 3.
    * messages[0].role == "system"
    * messages[1].role == "user"
    * messages[2].role == "assistant"
    * messages[2].content contains valid JSON structured data or migration diff payload.

STEP 2: VALIDATE LLAMA 3, ALPACA, AND RAG FORMAT COMPATIBILITY
Verify the export engine produces correct schemas for open-weights training ecosystems:
1. Call GET .../api/v1/export/fine-tuning?format=llama3_jsonl&limit=5:
   - Check that rows contain keys: "system", "instruction", "response".
2. Call GET .../api/v1/export/fine-tuning?format=alpaca&limit=5:
   - Check that rows contain keys: "instruction", "input", "output".
3. Call GET .../api/v1/export/fine-tuning?format=rag_chunks&limit=5:
   - Check that rows contain keys: "id", "text", "metadata".

STEP 3: TEST STREAMING ATTACHMENT DOWNLOAD
Verify the refinery can stream direct `.jsonl` file downloads:
- Endpoint: GET https://data-refinery-worker.juanquy.workers.dev/api/v1/export/fine-tuning?format=openai_jsonl&download=true
- Headers:
    Authorization: Bearer <YOUR_AGENT_TOKEN>

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response header "Content-Type" contains "application/x-jsonlines".
- Response header "Content-Disposition" contains "refinery_openai_jsonl_dataset.jsonl".
- Response body is valid newline-delimited JSON (JSONL).

STEP 4: RETURN YOUR MLOPS DATASET VALIDATION REPORT
Format your findings using this template:

# 🧪 MLOps Fine-Tuning & Distillation Dataset Brief
- **Auditor**: Agent_MLOps_Engineer (Post-Training AI)
- **Primary Export Tested**: OpenAI Chat Completions JSONL
- **Total Records Synthesized**: [count] rows
- **Schema Validation**:
    * **OpenAI Messages Format**: VALID (system, user, assistant)
    * **Llama 3 Format**: VALID (system, instruction, response)
    * **Alpaca Format**: VALID (instruction, input, output)
    * **Dense RAG Format**: VALID (id, text, metadata)
- **Streaming Attachment Download**:
    * **Content-Type**: application/x-jsonlines
    * **Filename Header**: refinery_openai_jsonl_dataset.jsonl
    * **Status**: 200 OK
- **Training Readiness Verdict**: PASS — Datasets verified ready for OpenAI fine-tuning API, Torchtune, Unsloth, and RAG vector ingestion.
```

---

## 👁️ What to Check in the Founder Console (For Human Operators)

1. Open **`https://drefinery.freshbeats.ai`** → **Founder Console / Management**.
2. Check **"Total Queries Run"**:
   * ✅ Incremented by the number of export API calls made.
3. Check **"Autonomous AI Agent Fleets & Wallets"**:
   * Locate `Agent_MLOps_Engineer`.
   * ✅ Verify usage has incremented (e.g., `4 / 50`).
