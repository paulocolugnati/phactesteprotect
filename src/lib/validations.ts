import { z } from "zod";

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[0-9]/, "A senha deve conter pelo menos 1 número")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "A senha deve conter pelo menos 1 caractere especial")
  .regex(/[a-zA-Z]/, "A senha deve conter pelo menos 1 letra");

// Step 1: Personal and company info
export const stepOneSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  companyName: z
    .string()
    .trim()
    .min(1, "Nome da empresa/servidor é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  age: z.coerce
    .number()
    .min(18, "Você deve ter pelo menos 18 anos")
    .max(120, "Idade inválida"),
});

// Step 2: Password
export const stepTwoSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Login schema
export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type StepOneData = z.infer<typeof stepOneSchema>;
export type StepTwoData = z.infer<typeof stepTwoSchema>;
export type LoginData = z.infer<typeof loginSchema>;
