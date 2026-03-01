import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'stakeholder-form',
  points: 10,
  duration: 60,
});

export async function checkRateLimit(identifier: string): Promise<Response | null> {
  try {
    await rateLimiter.consume(identifier);
    return null;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'remainingPoints' in error) {
      return Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    // Redis unavailable — fail open
    console.warn('Rate limiter unavailable, allowing request through:', error);
    return null;
  }
}
