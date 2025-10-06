# 🧙‍♂️ LOTR RAG Chatbot

A **completely free** Retrieval-Augmented Generation (RAG) chatbot that answers questions about The Lord of the Rings using local AI models. No API keys or paid services required!

## ✨ Features

- **🆓 100% Free**: Uses Ollama for local AI processing - no OpenAI or paid APIs
- **🧠 Smart RAG**: Retrieval-Augmented Generation with vector similarity search
- **📚 LOTR Knowledge**: Trained on Wikipedia articles about Middle-earth
- **💬 Beautiful UI**: Clean, responsive chat interface built with Next.js
- **🔒 Privacy-First**: Everything runs locally on your machine
- **⚡ Fast**: Local processing with efficient embedding search
- **📊 Source Tracking**: Shows how many knowledge sources were used per response

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Models**:
  - **Chat**: Llama 3.1 (via Ollama)
  - **Embeddings**: nomic-embed-text (768 dimensions)
- **Vector Database**: DataStax Astra DB
- **Data Processing**: LangChain + Puppeteer for web scraping

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** - [Download here](https://ollama.ai)
3. **DataStax Astra DB** account (free tier)

### 1. Install Ollama & Models

```bash
# Install Ollama from https://ollama.ai

# Pull required models
ollama pull nomic-embed-text   # For embeddings (274 MB)
ollama pull llama3.1          # For chat (4.7 GB)

# Alternative chat models (smaller/faster):
# ollama pull mistral          # 4.1 GB
# ollama pull qwen2.5          # 4.4 GB
# ollama pull phi3             # 2.3 GB
```

### 2. Setup Database

1. Create free account at [DataStax Astra DB](https://astra.datastax.com/)
2. Create a new database
3. Get your connection details:
   - Database API Endpoint
   - Application Token
   - Namespace (usually `default_keyspace`)

### 3. Clone & Install

```bash
git clone https://github.com/PuLeeNa/lotr-rag-chatbot.git
cd lotr-rag-chatbot
npm install
```

### 4. Environment Setup

Create `.env.local` file:

```env
ASTRA_DB_API_ENDPOINT=https://your-db-id-your-region.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=your-token-here
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=lotrgpt
```

### 5. Seed the Database

```bash
# This will scrape LOTR Wikipedia pages and create embeddings
npm run seed
```

**Note**: Seeding takes ~10-15 minutes as it:

- Scrapes 10 LOTR-related Wikipedia pages
- Splits content into chunks
- Generates embeddings using Ollama
- Stores in vector database

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and start chatting about Middle-earth! 🏔️

## 📖 Usage Examples

Try asking questions like:

- **Characters**: "Tell me about Gandalf" or "Who is Aragorn?"
- **Plot**: "What happens in The Two Towers?" or "Explain the War of the Ring"
- **Locations**: "Describe Rivendell" or "What is Mordor like?"
- **Lore**: "What are the Rings of Power?" or "Who created the One Ring?"

## 🏗️ Project Structure

```
├── app/
│   ├── api/chat/route.ts      # Chat API endpoint
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main chat interface
│   └── global.css             # Styles
├── scripts/
│   └── loadDb.ts              # Database seeding script
├── package.json
└── README.md
```

## 🔧 How It Works

1. **Knowledge Ingestion**: Web scraper collects LOTR content from Wikipedia
2. **Chunking**: Text is split into manageable 512-character chunks
3. **Embeddings**: Each chunk is converted to 768-dimensional vectors using `nomic-embed-text`
4. **Storage**: Vectors stored in Astra DB for fast similarity search
5. **Query Processing**: User questions are embedded and matched against knowledge base
6. **Response Generation**: Relevant context is fed to Llama 3.1 for natural responses

## 🎯 Cost Comparison

| Service                | OpenAI Cost             | Ollama Cost |
| ---------------------- | ----------------------- | ----------- |
| Embeddings             | $0.02 per 1M tokens     | **FREE**    |
| Chat                   | $0.50-$15 per 1M tokens | **FREE**    |
| Monthly (moderate use) | $50-200                 | **$0**      |

## 🔄 Alternative Models

You can easily switch models in the code:

**Chat Models** (`/app/api/chat/route.ts`):

```typescript
// Change line 42:
model: "llama3.1"; // Default
model: "mistral"; // Good balance
model: "qwen2.5"; // Great reasoning
model: "phi3"; // Lightweight
```

**Embedding Models** (`/scripts/loadDb.ts`):

```typescript
// Change line 52:
model: "nomic-embed-text"    // Default (768d)
model: "all-minilm"          # Alternative (384d)
```

## 🛡️ Environment Variables

| Variable                     | Description            | Example                               |
| ---------------------------- | ---------------------- | ------------------------------------- |
| `ASTRA_DB_API_ENDPOINT`      | Your Astra DB endpoint | `https://xyz.apps.astra.datastax.com` |
| `ASTRA_DB_APPLICATION_TOKEN` | Database access token  | `AstraCS:xyz...`                      |
| `ASTRA_DB_NAMESPACE`         | Database namespace     | `default_keyspace`                    |
| `ASTRA_DB_COLLECTION`        | Collection name        | `lotrgpt`                             |

## 🐛 Troubleshooting

### Ollama Issues

- **"ollama not found"**: Install from [ollama.ai](https://ollama.ai)
- **Model not pulled**: Run `ollama pull nomic-embed-text` and `ollama pull llama3.1`
- **Connection refused**: Make sure Ollama is running (`ollama serve`)

### Database Issues

- **Collection exists**: The script automatically handles existing collections
- **Vector dimension mismatch**: Delete collection and re-run `npm run seed`
- **Connection timeout**: Check your Astra DB credentials

### Performance

- **Slow responses**: Try smaller models like `phi3` or `mistral`
- **Out of memory**: Reduce chunk size in `loadDb.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and building!

## 🙏 Acknowledgments

- **Ollama** for providing free, local AI models
- **DataStax** for Astra DB vector database
- **LangChain** for RAG framework
- **Next.js** for the full-stack framework
- **Wikipedia** for LOTR knowledge base

---

**⭐ If you found this helpful, please star the repository!**

Made with ❤️ and no OpenAI API costs 😊
