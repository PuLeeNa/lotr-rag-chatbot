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

    // Generate embedding for the user's question
    const embedding = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: message
    })

    // Search for similar documents in the vector database
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    const cursor = collection.find({}, {
      sort: {
        $vector: embedding.embedding,
      },
      limit: 5,
    })

    const documents = await cursor.toArray()

    // Prepare context from retrieved documents
    const context = documents
      .map((doc: any) => doc.text)
      .join("\n\n")

    // Generate response using Ollama
    const prompt = `Context: ${context}

Question: ${message}

Please provide a helpful answer based on the context above. If the answer is not in the context, say so politely.

Answer:`

    const response = await ollama.chat({
      model: "llama3.1", // You can change this to other models like qwen2.5, mistral, etc.
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      stream: false
    })

    return NextResponse.json({ 
      message: response.message.content,
      sources: documents.length 
    })

  } catch (error) {
    console.error("Error in chat route:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
