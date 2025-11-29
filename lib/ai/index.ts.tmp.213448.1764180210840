import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { AICompletionRequest, AICompletionResponse, AIProviderType } from './types';

class AIService {
  private providers: Map<AIProviderType, OpenAIProvider | AnthropicProvider> = new Map();
  private initialized = false;

  private ensureInitialized() {
    if (this.initialized) return;

    // Initialize providers if API keys are available
    // Lazy initialization to avoid issues during Next.js build
    if (process.env.OPENAI_API_KEY) {
      try {
        this.providers.set('openai', new OpenAIProvider());
      } catch (error) {
        console.warn('Failed to initialize OpenAI provider:', error);
      }
    }

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        this.providers.set('anthropic', new AnthropicProvider());
      } catch (error) {
        console.warn('Failed to initialize Anthropic provider:', error);
      }
    }

    this.initialized = true;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    this.ensureInitialized();

    // Use specified provider or fall back to the first available
    const provider = request.provider || this.getDefaultProvider();

    if (!provider) {
      throw new Error(
        'No AI provider configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.'
      );
    }

    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} is not available`);
    }

    return providerInstance.complete(request);
  }

  private getDefaultProvider(): AIProviderType | null {
    this.ensureInitialized();
    // Prefer OpenAI for general content, but return first available
    if (this.providers.has('openai')) return 'openai';
    if (this.providers.has('anthropic')) return 'anthropic';
    return null;
  }

  hasProvider(provider: AIProviderType): boolean {
    this.ensureInitialized();
    return this.providers.has(provider);
  }

  getAvailableProviders(): AIProviderType[] {
    this.ensureInitialized();
    return Array.from(this.providers.keys());
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types
export * from './types';
