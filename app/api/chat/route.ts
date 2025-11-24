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
    const prompt = `Context: ${context}

Question: ${message}

Provide a concise answer based on the context. If not in context, say so briefly.

Answer:`

    const response = await ollama.chat({
      model: "llama3.1", // For faster responses, use "phi3:mini" or "qwen2.5:7b"
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      stream: false,
      options: {
        num_predict: 256, // Limit response length
        temperature: 0.7,
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

