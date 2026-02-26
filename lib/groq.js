import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function verifyDocumentWithAI(imageUrl, documentType) {
    if (!groq) {
        throw new Error("GROQ_API_KEY is not configured.");
    }

    // Define prompts based on document type
    let prompt = "";
    if (documentType === 'food_license') {
        prompt = `You are a strict compliance AI for a restaurant marketplace. Analyze this Food License image. Extract the following details and return exactly valid JSON, nothing else:
    {
      "registration_number": "number or null",
      "business_name": "name or null",
      "owner_name": "name or null",
      "expiry_date": "YYYY-MM-DD or null",
      "is_valid_format": boolean,
      "confidence_score": number between 0.0 and 1.0
    }`;
    } else if (documentType === 'aadhaar') {
        prompt = `You are a strict compliance AI for a workforce marketplace. Analyze this Aadhaar ID card image. Extract the following details and return exactly valid JSON, nothing else:
    {
      "aadhaar_number": "last 4 digits only or null",
      "name": "name or null",
      "yob": "Year of birth or null",
      "is_valid_format": boolean,
      "confidence_score": number between 0.0 and 1.0
    }`;
    } else if (documentType === 'gst_certificate') {
        prompt = `You are a strict compliance AI for a vendor marketplace. Analyze this GST Certificate image. Extract the following details and return exactly valid JSON, nothing else:
    {
      "gst_number": "number or null",
      "legal_name": "name or null",
      "trade_name": "name or null",
      "registration_date": "YYYY-MM-DD or null",
      "is_valid_format": boolean,
      "confidence_score": number between 0.0 and 1.0
    }`;
    } else {
        prompt = `Analyze this document and return a JSON summary.`;
    }

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.2-90b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: imageUrl } },
                    ],
                },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const aiResponse = response.choices[0]?.message?.content;
        return JSON.parse(aiResponse);
    } catch (error) {
        console.error("Groq Vision API Error:", error);
        throw error;
    }
}
