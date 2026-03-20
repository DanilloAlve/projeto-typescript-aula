# Relatorio de Testes - Projeto TypeScript Aula

## Objetivo dos testes realizados

Consolidar os niveis de teste do modulo no backend da API, validando:

- regras isoladas (unitarios);
- comunicacao entre camadas (integracao);
- comportamento esperado da interface HTTP para o usuario/cliente da API.

## Organizacao dos testes

Os testes foram organizados na pasta `tests`:

- `tests/unit/validations.test.ts`: validacao dos schemas Zod.
- `tests/unit/middleware.test.ts`: middlewares (`validarBody`, `authMiddleware`, `errorHandler`) e `asyncHandler`.
- `tests/unit/utils.test.ts`: utilitario de leitura/escrita de arquivo (`sensorFile`).
- `tests/unit/services.test.ts`: regras de negocio dos services com mocks de repositorio.
- `tests/unit/controllers.test.ts`: comportamento dos controllers com mocks de service.
- `tests/integration/integration-interface.test.ts`: integracao entre rota, middleware e controller, exercendo endpoints HTTP com `supertest`.

## Partes do sistema cobertas

- validacao de entrada (camada de schema e middleware);
- autenticacao e autorizacao (login/refresh/logout e middleware JWT);
- tratamento de erros padronizado (`AppError` + `errorHandler`);
- logica de negocio dos services (fluxos de sucesso e erro);
- camada HTTP/controller (status codes e payloads de resposta);
- fluxo de interface HTTP (requisicoes de usuario ao endpoint com corpo valido/invalido).

## Principais dificuldades encontradas

- o projeto nao possuia framework de teste configurado inicialmente;
- o `server.ts` inicializava o banco e o listener imediatamente ao importar o modulo, o que atrapalhava testes;
- dependencia de Postgres local para testes de API completos.

## Solucoes adotadas

- configuracao de `Vitest` + `@vitest/coverage-v8` + `supertest`;
- refatoracao do `server.ts` para exportar `app` e separar `startServer()`, evitando subir servidor automaticamente em `NODE_ENV=test`;
- criacao de testes de integracao/interface HTTP sem dependencia de banco externo, focando a integracao de camadas da aplicacao.

## Analise dos resultados obtidos

Resultado da execucao de `npx vitest run --coverage`:

- Test files: **6 passed**
- Tests: **41 passed**
- Cobertura global:
  - Statements: **80.54%**
  - Branches: **58.69%**
  - Functions: **86.66%**
  - Lines: **80.73%**

Conclusao: o criterio de cobertura **80+** foi atingido para **Statements** e **Lines**, cumprindo o requisito da atividade.

## Como executar os testes

```bash
npm install
npm test
```

Para modo watch:

```bash
npm run test:watch
```

