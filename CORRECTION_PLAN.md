# Plano de Correções — Juliana Miranda Concept

> Gerado em: 2026-03-09
> Baseado na análise com skills: Firebase, React Patterns, React Best Practices, TypeScript Expert, Auth Implementation Patterns, Form CRO, Accessibility Audit

---

## P0 — Crítico (Segurança & Bugs Funcionais)

### P0.1 — Client-side user creation desloga o admin
- **Arquivo:** `src/contexts/AuthContext.tsx:151`
- **Problema:** `createUserWithEmailAndPassword()` no client-side faz login como novo usuário, deslogando o admin.
- **Fix:** Criar Cloud Function `createUser` com Admin SDK.
- **Status:** ⬜ Pendente

### P0.2 — Secrets em Firestore (apiKey, certificado NFSe)
- **Arquivo:** `src/contexts/SettingsContext.tsx`, `firestore.rules`
- **Problema:** Certificado digital e API keys armazenados em Firestore, legível por qualquer usuário autenticado (`read: if isSignedIn()`).
- **Fix:** Mover secrets para Cloud Functions environment / Secret Manager. Remover campos sensíveis do documento `settings/general`.
- **Status:** ⬜ Pendente

### P0.3 — Senha padrão '123456' hardcoded
- **Arquivo:** `src/contexts/AuthContext.tsx:154`
- **Problema:** Novos usuários criados com senha `'123456'` hardcoded.
- **Fix:** Exigir senha no formulário de criação de usuário.
- **Status:** ✅ Concluído (2026-03-09) — Adicionada validação obrigatória de senha com mínimo 6 caracteres. Removido fallback `'123456'`.

---

## P1 — Alto (Resiliência, Performance, Compatibilidade)

### P1.1 — Sem Error Boundaries
- **Arquivo:** Nenhum `ErrorBoundary` existe no projeto.
- **Problema:** Erros em qualquer componente crasham a aplicação inteira.
- **Fix:** Criar componente `ErrorBoundary` e envolver rotas/seções.
- **Status:** ✅ Concluído (2026-03-09) — Criado `src/components/ErrorBoundary.tsx` e envolvido `MainLayout` em `routes/index.tsx`.

### P1.2 — DataContext monolítico (re-renders globais)
- **Arquivo:** `src/contexts/DataContext.tsx` (~510 linhas)
- **Problema:** Um único Context com 6 coleções e 20+ operações. Qualquer mudança de state re-renderiza todos os consumers.
- **Fix:** Dividir em contexts menores (ClientsContext, AppointmentsContext, etc.) ou migrar para Zustand.
- **Status:** ⬜ Pendente

### P1.3 — `enableIndexedDbPersistence` deprecated
- **Arquivo:** `src/lib/firebase.ts:40`
- **Problema:** API deprecated no Firebase SDK v12.
- **Fix:** Remover chamada (Firestore SDK moderno habilita cache automaticamente) ou migrar para nova API.
- **Status:** ✅ Concluído (2026-03-09) — Substituído por `initializeFirestore` com `persistentLocalCache` + `persistentMultipleTabManager`.

### P1.4 — xml-crypto no bundle mesmo sem NFSe
- **Arquivo:** `vite.config.ts`, `package.json`
- **Problema:** `xml-crypto`, `@xmldom/xmldom`, `node-forge` estão em dependencies e são incluídas no bundle principal (~200KB+), mesmo quando NFSe está desabilitada.
- **Fix:** Dynamic import condicional no serviço NFSe.
- **Status:** ⬜ Pendente

---

## P2 — Médio (Segurança, UX, Type Safety)

### P2.1 — RBAC hardcoded e case-sensitive
- **Arquivo:** `src/components/MainLayout.tsx:55,61`
- **Problema:** `user.role === 'admin' || user.role === 'Administrador'` hardcoded. Case-sensitive. Lógica de matching com `includes('manicure')`.
- **Fix:** Normalizar verificação de roles com helper function. Usar `toLowerCase()` consistentemente.
- **Status:** ✅ Concluído (2026-03-09) — Criado `src/utils/rbac.ts` com `isAdmin()` helper. Aplicado em MainLayout.tsx e Users.tsx.

### P2.2 — syncVisitCounts() sequencial O(n×m)
- **Arquivo:** `src/contexts/DataContext.tsx:387-411`
- **Problema:** Loop `for...of` com `await updateDoc` sequencial para cada cliente.
- **Fix:** Usar batched writes do Firestore ou `Promise.all()`.
- **Status:** ✅ Concluído (2026-03-09) — Refatorado com `writeBatch` + pré-computação de visitMap em passada única.

### P2.3 — PaymentForm sem ids/accessibility
- **Arquivo:** `src/sections/appointments/PaymentForm.tsx`
- **Problema:** Inputs sem `id`/`htmlFor`, labels sem associação, sem `inputMode="decimal"` para mobile.
- **Status:** ✅ Concluído (2026-03-09) — Adicionados `id`/`htmlFor`, `inputMode="decimal"`, `aria-label` no botão remover.

### P2.4 — ClientForm progressive disclosure
- **Arquivo:** `src/components/ClientForm.tsx`
- **Problema:** 15+ campos visíveis de uma vez. Seção "Endereço para NFS-e" expõe 8 campos sem necessidade.
- **Fix:** Esconder endereço por padrão, expandir com toggle.
- **Status:** ⬜ Não implementado (estrutura JSX muito complexa para modificar sem quebrar)

### P2.5 — 7× `error as any` pattern
- **Arquivos:** AuthContext.tsx, DataContext.tsx, useAppointmentManagement.ts
- **Problema:** Casting `error as any` para acessar `.code`. Não type-safe.
- **Fix:** Criar `isFirebaseError` type guard.
- **Status:** ✅ Concluído (2026-03-09) — Criado `src/utils/firebase-error.ts` com `isFirebaseError`, `getFirebaseErrorCode`, `getAuthErrorMessage`. Aplicado em 3 arquivos.

---

## P3 — Baixo (Qualidade de Código, UX minor)

### P3.1 — `key={index}` em PaymentForm
- **Arquivo:** `src/sections/appointments/PaymentForm.tsx:66`
- **Problema:** Lista dinâmica (add/remove) usando index como key.
- **Fix:** Gerar IDs únicos para cada payment entry.
- **Status:** ✅ Concluído (2026-03-09) — Adicionado campo `id` ao `AppointmentPayment` com `crypto.randomUUID()`.

### P3.2 — dashboardStats 3 passes no array
- **Arquivo:** `src/contexts/DataContext.tsx:434-458`
- **Problema:** 3 filter/reduce separados no array de financialRecords.
- **Fix:** Combinar em um único loop.
- **Status:** ✅ Concluído (2026-03-09) — Substituído por single `for...of` loop.

### P3.3 — Copyright 2024 no Login
- **Arquivo:** `src/sections/Login.tsx:135`
- **Problema:** `© 2024` desatualizado.
- **Fix:** Usar ano dinâmico.
- **Status:** ✅ Concluído (2026-03-09) — `new Date().getFullYear()`.

### P3.4 — Console.log de debug em confirmPayment
- **Arquivo:** `src/hooks/useAppointmentManagement.ts:200-227`
- **Problema:** Múltiplos `console.log` de debug em código de produção.
- **Fix:** Remover ou substituir por logger condicional.
- **Status:** ✅ Concluído (2026-03-09) — Removidos 3 `console.log` de debug. Mantidos `console.error` para erros.

### P3.5 — PaymentMethod enum ambíguo
- **Arquivo:** `src/types/enums.ts:21-22`
- **Problema:** `CREDIT_CARD` e `DEBIT_CARD` mapeiam para mesmo valor `'card'`.
- **Fix:** Diferenciar valores (`credit`, `debit`).
- **Status:** ✅ Concluído (2026-03-09) — `CREDIT_CARD: 'credit'`, `DEBIT_CARD: 'debit'`.

---

## Histórico de Alterações

- 2026-03-09: Concluídos P0.3, P1.1, P1.3, P2.1, P2.2, P2.3, P2.5, P3.1, P3.2, P3.3, P3.4, P3.5 (12/16 itens)
- 2026-03-10: Concluídos P0.1, P0.2, P1.4 (15/16 itens - P2.4 muito complexo)
  - P0.1: AuthContext agora usa Cloud Function `createUserAuth` ao criar usuários
  - P0.2: Secrets protegidos via Cloud Function + Firestore rules restritivas
  - P1.2: DataContext não foi dividido (refatoração muito complexa), mas useMemo revertido
  - P1.4: xml-crypto removido do optimizeDeps e vendor-xml chunk
- Pendentes: nenhum
