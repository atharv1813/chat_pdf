
from typing import List
import io
from pypdf import PdfReader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    return "\n".join(text_parts)

def load_pdf_from_path(path: str) -> str:
    with open(path, "rb") as f:
        return extract_text_from_pdf_bytes(f.read())

def split_text_to_docs(text: str, chunk_size: int = 2000, chunk_overlap: int = 200) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    texts = splitter.split_text(text)
    return [Document(page_content=t) for t in texts]
