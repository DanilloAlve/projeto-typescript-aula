import { z } from "zod";

export const createPesquisadorSchema = z.object({
    nome: z.preprocess(
        (val) => (val === undefined ? "" : val),
        z.string().min(1, "Nome é obrigatório")
    ),
    
    email: z.preprocess(
        (val) => (val === undefined ? "".toLowerCase() : val),
        z.string().email("Formato de email inválido")
    ),
    senha: z.preprocess(
        (val) => (val === undefined ? "": val),
         z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
        ),
    especialidade: z.preprocess(
        (val) => (val === undefined ? "" : val),
        z.string().min(1, "Especialidade é obrigatória")
    ),

    titulacao: z.enum(["Graduação", "Especialização", "Mestrado", "Doutorado"], {
        message: "Titulação inválida. Escolha entre: Graduação, Especialização, Mestrado ou Doutorado"
    }),

    matricula: z.preprocess(
        (val) => (val === undefined ? "" : val),
        z.string().min(1, "Matrícula é obrigatória")
    ),

    linhaPesquisa: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().optional()
    ),

    dataNascimento: z.preprocess(
        (val) => (val === undefined || val === "" ? undefined : val),
        z.string({ error: "Data de nascimento é obrigatória" })
            .min(1, "Data de nascimento é obrigatória")
            .refine((val) => !isNaN(Date.parse(val)), "Data de nascimento inválida")
    ),
});