# prompts.py
from langchain_core.prompts import PromptTemplate

# Template that enforces a line-range (for the summary/default/custom with length constraints)
LENGTHED_PROMPT = PromptTemplate(
    input_variables=["document", "task", "min_lines", "max_lines"],
    template=(
        "You are an intelligent assistant.\n\n"
        "Produce the response in exactly between {min_lines} and {max_lines} lines.\n\n"
        "If the task is 'summarize', then summarize the document.\n"
        "If the task is a custom user query, answer the query using the document.\n\n"
        "--- DOCUMENT ---\n{document}\n--- END DOCUMENT ---\n\n"
        "TASK: {task}\n\n"
        "Now produce the answer."
    ),
)

# Free-form template for domain tasks (maths/history/student/research)
FREE_PROMPT = PromptTemplate(
    input_variables=["document", "task"],
    template=(
        "You are an intelligent assistant specialized in extracting information from documents.\n\n"
        "Use only the information present in the document to answer the task below. If exact dates or numbers are not present, say so.\n\n"
        "--- DOCUMENT ---\n{document}\n--- END DOCUMENT ---\n\n"
        "TASK: {task}\n\n"
        "Provide a clear, structured output (use bullets or numbered lists where appropriate)."
    ),
)
