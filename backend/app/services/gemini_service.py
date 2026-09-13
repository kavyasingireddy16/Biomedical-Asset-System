import os

from dotenv import load_dotenv
from google import genai

# Load .env
load_dotenv()

# Gemini API Key
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_ai_recommendation(asset_data, prediction_result):

    prompt = f"""
You are a senior biomedical equipment engineer.

Analyze the biomedical asset below and provide:

1. Equipment Health Analysis
2. Possible Failure Reasons
3. Maintenance Recommendation
4. Safety Risk
5. Estimated Urgency

Asset Details:

{asset_data}

Prediction Result:

{prediction_result}

Respond in simple professional English.
"""

    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )

        return response.text

    except Exception as e:
        print(f"Gemini AI unavailable: {e}")

        return (
            "AI engineering analysis is temporarily unavailable. "
            "The core equipment failure prediction is still available."
        )