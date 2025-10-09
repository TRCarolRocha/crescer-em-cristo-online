import { z } from 'zod';

export const freeSignupSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export const individualSignupSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

export const churchSignupSchema = z.object({
  // Dados da Igreja
  churchName: z.string().min(3, 'Nome da igreja é obrigatório'),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().min(5, 'Endereço é obrigatório'),
  
  // Dados do Responsável
  responsibleName: z.string().min(3, 'Nome do responsável é obrigatório'),
  responsibleEmail: z.string().email('Email inválido'),
  responsiblePhone: z.string().min(10, 'Telefone inválido'),
  
  // Dados de Acesso
  loginEmail: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  
  // Plano escolhido
  planType: z.enum(['church_simple', 'church_plus', 'church_premium'])
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
}).refine(data => data.cnpj || data.cpf, {
  message: "CNPJ ou CPF é obrigatório",
  path: ["cnpj"]
});

export type FreeSignupFormData = z.infer<typeof freeSignupSchema>;
export type IndividualSignupFormData = z.infer<typeof individualSignupSchema>;
export type ChurchSignupFormData = z.infer<typeof churchSignupSchema>;
