import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Shot } from "@/store/useAnalysisStore"

export async function detectShots(apiKey: string, imageBase64: string): Promise<Shot[]> {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
    Analyze this image of a shooting target. 
    Identify the exact coordinates of all bullet holes on the target.
    IMPORTANT:
    - Ignore any tape, stickers, or patches used to cover old holes.
    - Ignore the printed numbers or rings.
    - Focus ONLY on the actual holes made by bullets.
    - Return a JSON array of objects, where each object has 'x' and 'y' properties representing the percentage coordinates (0-100) relative to the top-left corner of the image.
    Example: [{"x": 50.5, "y": 45.2}, {"x": 30.1, "y": 60.8}]
    Do not include markdown formatting or explanations, just the raw JSON string.
  `

    const imagePart = {
        inlineData: {
            data: imageBase64.split(",")[1],
            mimeType: "image/jpeg", // Assuming JPEG or compatible
        },
    }

    try {
        const result = await model.generateContent([prompt, imagePart])
        const response = await result.response
        const text = response.text()

        // Clean up potential markdown code blocks
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim()
        console.log("Gemini Response (Shots):", jsonString) // Debug log

        try {
            const coordinates = JSON.parse(jsonString)
            if (!Array.isArray(coordinates)) throw new Error("Response is not an array")

            return coordinates.map((coord: { x: number; y: number }) => ({
                x: coord.x,
                y: coord.y,
                id: crypto.randomUUID(),
            }))
        } catch (parseError) {
            throw new Error("Failed to parse Gemini response")
        }
    } catch (error) {
        throw error
    }
}

export async function generateAIAnalysis(
    apiKey: string,
    imageBase64: string,
    shots: Shot[],
    profile: any,
    language: 'pt' | 'en'
): Promise<any> {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
    You are an expert firearms instructor. Analyze this shooting target and the shooter's profile.
    
    Shooter Profile:
    - Handedness: ${profile.handedness}
    - Eye Dominance: ${profile.eyeDominance}
    - Firearm: ${profile.firearmModel} (${profile.caliber})
    - Experience: ${profile.shootingExperience}
    - Vision Issues: ${profile.visionIssues || "None"}
    - Medications: ${profile.medications || "None"}
    - Physical Limitations: ${profile.physicalLimitations || "None"}

    Shot Data (0-100% coordinates from top-left):
    ${JSON.stringify(shots)}

    Please provide a detailed analysis in ${language === 'pt' ? 'Portuguese (Brazil)' : 'English'}.
    
    Return the response as a valid JSON object with the following structure:
    {
      "diagnosis": "Detailed diagnosis of the shooting errors based on handedness and shot placement.",
      "grouping": "Analysis of the shot grouping tightness and consistency.",
      "corrections": ["Actionable correction 1", "Actionable correction 2", "Actionable correction 3"],
      "equipment": "Comments on equipment or health factors if relevant, otherwise null or empty string."
    }

    Do not include markdown formatting (like \`\`\`json), just the raw JSON string.
  `

    const imagePart = {
        inlineData: {
            data: imageBase64.split(",")[1],
            mimeType: "image/jpeg",
        },
    }

    try {
        const result = await model.generateContent([prompt, imagePart])
        const response = await result.response
        const text = response.text()
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim()
        return JSON.parse(jsonString)
    } catch (error) {
        console.error("Error generating analysis:", error)
        throw new Error("Failed to generate analysis using Gemini AI.")
    }
}
