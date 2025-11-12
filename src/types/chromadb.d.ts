declare module 'chromadb' {
  interface QueryResponse {
    ids?: string[][]
    documents?: string[][]
    metadatas?: Record<string, unknown>[][]
    distances?: number[][]
  }

  interface AddOptions {
    ids: string[]
    documents: string[]
    embeddings?: number[][]
    metadatas?: Record<string, unknown>[]
  }

  interface QueryOptions {
    queryTexts?: string[]
    queryEmbeddings?: number[][]
    nResults?: number
    where?: Record<string, unknown>
  }

  interface Collection {
    add(options: AddOptions): Promise<void>
    query(options: QueryOptions): Promise<QueryResponse>
  }

  interface ClientOptions {
    path?: string
    apiKey?: string
  }

  export class ChromaClient {
    constructor(options?: ClientOptions)
    listCollections(): Promise<Array<{ name: string }>>
    getCollection(options: { name: string }): Promise<Collection>
    createCollection(options: { name: string }): Promise<Collection>
    getOrCreateCollection(options: { name: string }): Promise<Collection>
  }
}