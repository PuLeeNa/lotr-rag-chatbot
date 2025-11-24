import { DataAPIClient } from "@datastax/astra-db-ts"
import { Ollama } from "ollama"
import { NextRequest, NextResponse } from "next/server"

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN } = process.env

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })
const ollama = new Ollama({ host: 'http://localhost:11434' })

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const startTime = Date.now()

    // Generate embedding for the user's question
    const embedding = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: message
    })

    const embeddingTime = Date.now() - startTime

    // Search for similar documents in the vector database (reduced to 3 for speed)
    const collection = db.collection(ASTRA_DB_COLLECTION)
    const cursor = collection.find({}, {
      sort: {
        $vector: embedding.embedding,
      },
      limit: 3, // Reduced from 5 to 3
      projection: {
        text: 1,
        _id: 0
      }
    })

    const documents = await cursor.toArray()
    const searchTime = Date.now() - startTime - embeddingTime

    // Prepare context from retrieved documents (limit to 2000 chars)
    const context = documents
      .map((doc: any) => doc.text)
      .join("\n\n")
      .substring(0, 2000) // Limit context size

    // Generate response using Ollama
    const systemPrompt = `You are a friendly and knowledgeable assistant specializing in The Lord of the Rings universe. 

Your guidelines:
- Respond naturally to greetings, thanks, and casual conversation
- When asked about LOTR topics, use the provided context to give accurate, detailed answers
- If the context doesn't contain the answer, use your general knowledge about LOTR but acknowledge when you're unsure
- Be conversational, warm, and engaging like a real person
- Keep responses concise but informative (2-4 paragraphs max)
- Show enthusiasm about Middle-earth and Tolkien's work
- Do not mention I know more than wikipedia `

    const userPrompt = context.trim()
      ? `Here's some relevant information from my knowledge base:

${context}

User's message: ${message}

Please respond naturally and helpfully.`
      : `User's message: ${message}

Please respond naturally and helpfully.`

    const response = await ollama.chat({
      model: "phi3:mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: false,
      options: {
        num_predict: 256, // Limit response length
        temperature: 0.8, // Slightly higher for more natural conversation
      }
    })

    const totalTime = Date.now() - startTime

    console.log(`⚡ Performance: Embedding=${embeddingTime}ms, Search=${searchTime}ms, Total=${totalTime}ms`)

    return NextResponse.json({
      message: response.message.content,
      sources: documents.length,
      performance: {
        embeddingTime,
        searchTime,
        totalTime
      }
    })

  } catch (error) {
    console.error("Error in chat route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

