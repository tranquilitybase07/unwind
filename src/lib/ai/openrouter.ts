export interface OpenRouterChatCompletionParams {
  model: string
  messages: {
    role: 'system' | 'user' | 'assistant'
    content: string
  }[]
  response_format?: {
    type: 'json_object'
  }
}

export async function openRouterChatCompletion(params: OpenRouterChatCompletionParams) {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not defined')
  }

  const MAX_RETRIES = 3
  let attempt = 0

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://unwind.app', // Optional, for OpenRouter rankings
          'X-Title': 'Unwind App', // Optional, for OpenRouter rankings
        },
        body: JSON.stringify(params),
      })

      if (response.status === 429) {
        attempt++
        if (attempt >= MAX_RETRIES) {
          const errorText = await response.text()
          throw new Error(`OpenRouter API rate limit exceeded after ${MAX_RETRIES} attempts: ${errorText}`)
        }
        // Exponential backoff: 1000ms, 2000ms, 4000ms
        const delay = 1000 * Math.pow(2, attempt - 1)
        console.warn(`OpenRouter rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt}/${MAX_RETRIES})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      // If it's a network error (fetch failed), we might also want to retry, 
      // but for now let's focus on the 429 loop explicitly or just rethrow if it's not a status check.
      // If it was our explicitly thrown error above, rethrow it.
      if (error instanceof Error && error.message.includes('OpenRouter API')) {
        throw error
      }
      
      // For network connection errors, we could also retry
      attempt++
      if (attempt >= MAX_RETRIES) {
        console.error('OpenRouter API call failed:', error)
        throw error
      }
      const delay = 1000 * Math.pow(2, attempt - 1)
      console.warn(`OpenRouter network error. Retrying in ${delay}ms...`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
