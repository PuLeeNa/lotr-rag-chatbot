import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { Ollama } from "ollama"

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"
//import { SimilarityMetric } from "@langchain/community/vectorstores/rockset";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN } = process.env

const ollama = new Ollama({ host: 'http://localhost:11434' })

const lotr = [
    'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings_(film_series)',
    'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings:_The_Fellowship_of_the_Ring',
    'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings:_The_Two_Towers',
    'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings:_The_Return_of_the_King',    
    'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings',
    'https://en.wikipedia.org/wiki/Rings_of_Power',
    'https://en.wikipedia.org/wiki/The_Hobbit',
    'https://en.wikipedia.org/wiki/Middle-earth',
    'https://en.wikipedia.org/wiki/Sauron',
    'https://en.wikipedia.org/wiki/The_Silmarillion'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE})

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
})

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    // Drop existing collection if it exists (to handle dimension change from 1536 to 384)
    try {
        await db.dropCollection(ASTRA_DB_COLLECTION)
        console.log(`Dropped existing collection: ${ASTRA_DB_COLLECTION}`)
    } catch (error) {
        console.log(`Collection ${ASTRA_DB_COLLECTION} doesn't exist or couldn't be dropped, continuing...`)
    }
    
    // Create new collection with correct dimensions
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 768, // nomic-embed-text actually uses 768 dimensions
            metric: similarityMetric,
        }
    })
    console.log(`Created collection: ${ASTRA_DB_COLLECTION}`)
    console.log(res)
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await ( const url of lotr) {
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await ( const chunk of chunks) {
            const embedding = await ollama.embeddings({
                model: "nomic-embed-text",
                prompt: chunk
            })

            const vector = embedding.embedding

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
    }
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (pageXOffset, browser) => {
            const result = await pageXOffset.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }
    })
    return ( await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}

createCollection().then(() => loadSampleData())