import fs from 'fs/promises';
import path from 'path';

export class VectorStore {
  constructor() {
    this.vectors = new Map();
    this.metadata = new Map();
    this.storePath = path.join(process.cwd(), 'data', 'vectors.json');
    this.initialized = false;
  }

  async initialize() {
    try {
      await this.loadVectors();
      this.initialized = true;
      console.log('Vector store initialized');
    } catch (error) {
      console.error('Vector store initialization error:', error);
      this.initialized = true; // Continue with empty store
    }
  }

  async loadVectors() {
    try {
      const data = await fs.readFile(this.storePath, 'utf8');
      const parsed = JSON.parse(data);
      
      this.vectors = new Map(parsed.vectors || []);
      this.metadata = new Map(parsed.metadata || []);
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      console.log('Starting with empty vector store');
    }
  }

  async saveVectors() {
    try {
      const dataDir = path.dirname(this.storePath);
      await fs.mkdir(dataDir, { recursive: true });
      
      const data = {
        vectors: Array.from(this.vectors.entries()),
        metadata: Array.from(this.metadata.entries())
      };
      
      await fs.writeFile(this.storePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving vectors:', error);
    }
  }

  async addDocument(id, text, embedding, metadata = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.vectors.set(id, embedding);
    this.metadata.set(id, { text, ...metadata, timestamp: new Date().toISOString() });
    
    // Save periodically
    if (this.vectors.size % 10 === 0) {
      await this.saveVectors();
    }
  }

  async search(queryEmbedding, topK = 5, threshold = 0.7) {
    if (!this.initialized) {
      await this.initialize();
    }

    const similarities = [];
    
    for (const [id, embedding] of this.vectors.entries()) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      if (similarity >= threshold) {
        similarities.push({
          id,
          similarity,
          metadata: this.metadata.get(id)
        });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async getDocumentCount() {
    return this.vectors.size;
  }

  async clear() {
    this.vectors.clear();
    this.metadata.clear();
    await this.saveVectors();
  }
}

export default VectorStore;