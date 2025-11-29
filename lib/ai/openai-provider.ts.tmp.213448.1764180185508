import OpenAI from 'openai';
import { AICompletionRequest, AICompletionResponse } from './types';

export class OpenAIProvider {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
      }
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.client;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || 'gpt-4o-mini';

    const response = await this.getClient().chat.completions.create({
      model,
      messages: request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    });

    const choice = response.choices[0];
    if (!choice || !choice.message.content) {
      throw new Error('No response from OpenAI');
    }

    return {
      content: choice.message.content,
      provider: 'openai',
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }
}
