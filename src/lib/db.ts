import { Redis } from '@upstash/redis';

const UPSTASH_REDIS_REST_URL: string = process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_REDIS_REST_TOKEN: string = process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const db = new Redis({
   url: UPSTASH_REDIS_REST_URL,
   token: UPSTASH_REDIS_REST_TOKEN,
});


