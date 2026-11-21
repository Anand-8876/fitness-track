import { z } from "zod";

export const FoodInput = z.object({
  name: z.string().trim().min(1).max(120),
  portion: z.string().trim().max(120).nullish(),
  grams: z.number().min(0).max(5000).nullish(),
  kcal: z.number().min(0).max(10000),
  protein: z.number().min(0).max(1000),
  carbs: z.number().min(0).max(1000),
  fat: z.number().min(0).max(1000),
  fiber: z.number().min(0).max(500).default(0),
});
