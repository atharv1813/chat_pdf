from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai
import base64
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('API_KEY')
if not API_KEY:
    raise EnvironmentError("API_KEY not found in .env file")

genai.configure(api_key=API_KEY)

app = Flask(__name__)
CORS(app)

@app.route("/api/autosummarize", methods=["POST"])
def auto_summarize():
    try:
        data = request.form if request.form else request.json
        summary_level = int(data.get("summary_level", 3))
        uploaded_file = request.files.get("uploaded_file")

        if not uploaded_file:
            return jsonify({"error": "No file uploaded"}), 400

        # Read and encode the uploaded file
        title = uploaded_file.filename
        pdf_content = base64.b64encode(uploaded_file.read()).decode("utf-8")

        model = genai.GenerativeModel("gemini-1.5-flash")
        result = model.generate_content(
            [{'mime_type': 'application/pdf', 'data': pdf_content},
             f"Summarize this document in a concise format with a length of level {summary_level} (ranging from 1 to 5 where lvl1 is 2 lines lvl2 is 3 lines lvl3 is 4 lines lvl4 is 6 lines lvl5 is 7 lines). Output as: \nfile: {title}\n\n"]
        )

        summary = f"file: {title}\n{result.text.strip() if result and result.text else 'No summary generated.'}"
        return jsonify({"auto_summary": summary})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/customprompt", methods=["POST"])
def custom_prompt():
    try:
        data = request.form if request.form else request.json
        prompt = data.get("prompt")
        uploaded_file = request.files.get("uploaded_file")

        if not prompt:
            return jsonify({"error": "Missing 'prompt' in request"}), 400

        if not uploaded_file:
            return jsonify({"error": "No file uploaded"}), 400

        user_prompt = f"Explain in depth about the following prompt: {prompt}"
        
        # Read and encode the uploaded file
        pdf_content = base64.b64encode(uploaded_file.read()).decode("utf-8")

        model = genai.GenerativeModel("gemini-1.5-flash")
        result = model.generate_content(
            [{'mime_type': 'application/pdf', 'data': pdf_content}, user_prompt]
        )

        output_text = result.text.strip() if result and result.text else "No response generated."
        return jsonify({"output": output_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
