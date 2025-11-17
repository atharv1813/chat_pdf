
# -------------------------
# File: rag_chain.py
# -------------------------
# ✅ Modern LangChain 1.x imports
from langchain_classic.chains import RetrievalQA         
from langchain_core.language_models import BaseChatModel  
from langchain_core.prompts import PromptTemplate        
from langchain_community.vectorstores import VectorStore 



def build_rag_chain(llm: BaseChatModel, vectorstore: VectorStore, k: int = 4):
    """Return a RetrievalQA chain using the provided LLM and vectorstore."""
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})

    # PromptTemplate for RAG (keeps LLM focused on provided context)
    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template=(
            "You are an expert assistant. Use the provided context to answer the question. "
            "If the answer is not in the context, say you don't know and suggest where to look.\n\n"
            "Context:\n{context}\n\nQuestion: {question}"
        ),
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",  # "stuff" is simplest; replace with "map_rerank" for larger corpora
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt},
    )
    return chain