
# -------------------------
# File: embeddings_store.py
# -------------------------
import os
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_db")


def get_embeddings_provider():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")



def create_vectorstore(documents: list[Document], embeddings, persist_directory: str = CHROMA_DIR):
    # documents: list of langchain Document
    vectordb = Chroma.from_documents(documents, embeddings, persist_directory=persist_directory)
    vectordb.persist()
    return vectordb


def load_vectorstore(embeddings, persist_directory: str = CHROMA_DIR):
    if not os.path.isdir(persist_directory):
        return None
    return Chroma(persist_directory=persist_directory, embedding_function=embeddings)