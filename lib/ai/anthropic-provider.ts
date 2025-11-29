import Anthropic from '@anthropic-ai/sdk';
import { AICompletionRequest, AICompletionResponse } from './types';

export class AnthropicProvider {
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is not set');
      }
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    return this.client;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || 'claude-3-5-sonnet-20241022';

    // Separate system messages from user/assistant messages
    const systemMessages = request.messages.filter((m) => m.role === 'system');
    const conversationMessages = request.messages.filter(
      (m) => m.role !== 'system'
    );

    const systemPrompt =
      systemMessages.length > 0
        ? systemMessages.map((m) => m.content).join('\n\n')
        : undefined;

    const response = await this.getClient().messages.create({
      model,
      system: systemPrompt,
      messages: conversationMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Anthropic');
    }

    return {
      content: textContent.text,
      provider: 'anthropic',
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }
}
