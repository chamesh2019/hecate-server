import { z } from 'zod';

export const secretKeyValidator = z.string().min(1, { message: "Key cannot be empty" }).max(255, { message: "Key is too long" });

export const secretValueValidator = z.string().min(1, { message: "Value cannot be empty" });
