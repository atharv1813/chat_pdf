# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

from langchain_classic.chains import LLMChain
from langchain_perplexity import ChatPerplexity

from loader import extract_text_from_pdf_bytes, split_text_to_docs
from embeddings_store import get_embeddings_provider, create_vectorstore, load_vectorstore, CHROMA_DIR
from rag_chain import build_rag_chain
from prompts import LENGTHED_PROMPT, FREE_PROMPT

load_dotenv()
PERPLEXITY_KEY = os.getenv("PERPLEXITY_API_KEY")

app = Flask(__name__)
CORS(app)

# LLM init
llm = ChatPerplexity(api_key=PERPLEXITY_KEY, model="sonar-pro")

# embeddings & vectorstore (unchanged)
embeddings = get_embeddings_provider()
vectorstore = load_vectorstore(embeddings)
rag_chain = build_rag_chain(llm, vectorstore) if vectorstore else None

# helper mappings for line levels
LEVELS = {
    "short": (5, 7),
    "medium": (8, 10),
    "long": (10, 12),
    "in-depth": (13, 15),
}

# default tasks for modes (used if user does not provide a custom prompt)
MODE_DEFAULT_TASK = {
    "summary": "summarize",
    "maths": "List all equations/formulas found in the document. For each, include the equation and, if possible, the page or context.",
    "history": "List all events mentioned in the document in chronological order. Include dates if present or approximate order if not.",
    "student": "List all important topics and subtopics covered in the document as clear bullet points.",
    "research": "List the objectives achieved, key findings, and conclusions of the document. Provide concise points.",
}


def run_chain_with_length(doc_text: str, task: str, min_lines: int, max_lines: int):
    chain = LLMChain(llm=llm, prompt=LENGTHED_PROMPT)
    return chain.run(document=doc_text, task=task, min_lines=min_lines, max_lines=max_lines)


def run_chain_free(doc_text: str, task: str):
    chain = LLMChain(llm=llm, prompt=FREE_PROMPT)
    return chain.run(document=doc_text, task=task)


# -------------------------
# /api/summarize  (file only) - handles modes and optional prompt
# -------------------------
@app.route("/api/summarize", methods=["POST"])
def summarize_endpoint():
    try:
        if "file" not in request.files:
            return jsonify({"error": "Please upload a PDF file"}), 400

        pdf_bytes = request.files["file"].read()
        # user prompt optional
        user_prompt = request.form.get("prompt", "").strip()
        # mode: summary|maths|history|student|research
        mode = request.form.get("mode", "summary")
        level = request.form.get("level", "medium")

        # prepare document text (use first N chunks to limit tokens)
        text = extract_text_from_pdf_bytes(pdf_bytes)
        chunks = split_text_to_docs(text)
        combined_text = "\n".join(d.page_content for d in chunks[:8])  # use up to 8 chunks (adjust if needed)

        # Decide task
        if user_prompt:
            task = user_prompt
            # enforce length constraints (user asked for custom prompt -> use length settings)
            min_lines, max_lines = LEVELS.get(level, LEVELS["medium"])
            output = run_chain_with_length(combined_text, task, min_lines, max_lines)
            return jsonify({"output": output})
        else:
            # No custom prompt → use default mode behavior
            default_task = MODE_DEFAULT_TASK.get(mode, MODE_DEFAULT_TASK["summary"])
            if mode == "summary":
                min_lines, max_lines = LEVELS.get(level, LEVELS["medium"])
                output = run_chain_with_length(combined_text, default_task, min_lines, max_lines)
            else:
                # domain modes are free-form (lists, extraction) — use FREE_PROMPT
                output = run_chain_free(combined_text, default_task)
            return jsonify({"output": output})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# /api/ingest (file-only) unchanged
# -------------------------
@app.route("/api/ingest", methods=["POST"])
def ingest_document():
    try:
        if "file" not in request.files:
            return jsonify({"error": "Please upload a file"}), 400

        pdf_bytes = request.files["file"].read()
        text = extract_text_from_pdf_bytes(pdf_bytes)
        docs = split_text_to_docs(text)

        vectordb = create_vectorstore(docs, embeddings, persist_directory=CHROMA_DIR)

        global vectorstore, rag_chain
        vectorstore = vectordb
        rag_chain = build_rag_chain(llm, vectorstore)

        return jsonify({"status": "ingested", "num_chunks": len(docs)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# /api/qa unchanged
# -------------------------
@app.route("/api/qa", methods=["POST"])
def qa_endpoint():
    try:
        data = request.json
        question = data.get("question")
        if not question:
            return jsonify({"error": "Missing question"}), 400
        if not rag_chain:
            return jsonify({"error": "No indexed documents. Ingest a document first."}), 400

        res = rag_chain({"query": question})
        answer = res.get("result") or res.get("answer") or res
        sources = res.get("source_documents") if isinstance(res, dict) else None

        return jsonify({"answer": answer, "sources": [s.metadata for s in sources] if sources else None})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
