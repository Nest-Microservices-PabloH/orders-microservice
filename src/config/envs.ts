
import 'dotenv/config';
import { z } from 'zod';

// Primero defines el schema
const envSchema = z.object({
    // NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive(),
})

// Luego haces el parsing:
const { success, data, error } = envSchema.safeParse(process.env);

if (!success) {
    console.error(error.flatten().fieldErrors);
    throw new Error('Config validation error.');
}

export const envs = {
    PORT: data.PORT,
}

