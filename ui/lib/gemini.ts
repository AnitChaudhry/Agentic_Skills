import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export async function generateImage(prompt: string, userImagePath?: string) {
  try {
    // Note: As of now, Gemini API doesn't support direct image generation
    // This is a placeholder for future implementation or integration with Imagen
    // For now, we'll return a structured response

    return {
      success: false,
      error: 'Image generation not yet implemented. Please use Imagen API separately.',
      prompt,
    }
  } catch (error) {
    console.error('Image generation error:', error)
    throw error
  }
}

export async function generateVisionBoardPrompt(
  challenge: any,
  userGoals: string[],
  userImagePath?: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = `You are a vision board creator. Create a detailed, inspiring prompt for generating a vision board image.

Challenge: ${challenge.name}
Type: ${challenge.type}
Goals: ${userGoals.join(', ')}

Create a detailed image generation prompt that:
1. Visualizes the user achieving their goals
2. Is motivating and specific to their challenge
3. Includes visual elements that represent success
4. Has a positive, aspirational tone

Return only the image generation prompt, nothing else.`

    const result = await model.generateContent(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error('Vision board prompt generation error:', error)
    throw error
  }
}

export async function analyzeImage(imagePath: string, question: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // Note: This requires implementing file upload
    // Placeholder for now

    return {
      success: false,
      error: 'Image analysis not yet fully implemented',
    }
  } catch (error) {
    console.error('Image analysis error:', error)
    throw error
  }
}

export async function generateMotivation(context: {
  challengeName: string
  currentStreak: number
  recentWins: string[]
  goals: string[]
}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = `You are an accountability coach. Generate a personalized, context-aware motivational message.

Challenge: ${context.challengeName}
Current Streak: ${context.currentStreak} days
Recent Wins: ${context.recentWins.join(', ')}
Goals: ${context.goals.join(', ')}

Create a motivational message that:
1. References their specific achievements (no generic quotes!)
2. Connects past wins to future goals
3. Is encouraging but realistic
4. Uses their actual streak number
5. Is 2-3 sentences max

Return only the motivational message, nothing else.`

    const result = await model.generateContent(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error('Motivation generation error:', error)
    throw error
  }
}
