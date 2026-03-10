# DOCUMENTAÇÃO COMPLETA DO PROJETO

## Juliana Miranda Concept - Sistema de Gestão para Salão de Unhas

Este documento fornece uma visão abrangente do projeto, incluindo análise de código, problemas identificados, sugestões de melhorias e diretrizes de desenvolvimento.

---

## 1. Visão Geral do Projeto

### 1.1 Descrição

Sistema de gestão completo para salão de unhas desenvolvido com React, TypeScript, Vite e Tailwind CSS. Utiliza Firebase para autenticação e armazenamento de dados, com modo demo disponível para testes locais.

### 1.2 Tecnologias Principais

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Estilização**: Tailwind CSS 4
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Ícones**: Lucide React
- **Notificações**: Sonner
- **Validação**: Zod
- **Testes**: Vitest

### 1.3 Estrutura de Diretórios

```
src/
├── components/
│   ├── shared/           # Componentes compartilhados
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── StatCard.tsx
│   │   ├── Skeleton.tsx
│   │   ├── WhatsAppModal.tsx
│   │   ├── InstallPrompt.tsx
│   │   ├── PhoneInput.tsx
│   │   └── CurrencyInput.tsx
│   ├── MainLayout.tsx
│   ├── ClientForm.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   ├── AuthContext.tsx    # Contexto de autenticação
│   ├── DataContext.tsx    # Contexto de dados global
│   ├── ThemeContext.tsx   # Contexto de tema (claro/escuro)
│   ├── SettingsContext.tsx # Contexto de configurações
│   ├── useAuth.ts
│   ├── useData.ts
│   ├── useSettings.ts
│   └── useTheme.ts
├── hooks/
│   ├── useAppointmentManagement.ts
│   └── useToast.tsx
├── lib/
│   └── firebase.ts        # Configuração do Firebase
├── sections/               # Páginas principais
│   ├── appointments/       # Componentes de agendamento
│   │   ├── AppointmentCard.tsx
│   │   ├── AppointmentForm.tsx
│   │   ├── AppointmentHeader.tsx
│   │   ├── DateSelector.tsx
│   │   └── PaymentForm.tsx
│   ├── Dashboard.tsx
│   ├── Clients.tsx
│   ├── Services.tsx
│   ├── Staff.tsx
│   ├── Appointments.tsx
│   ├── Finance.tsx
│   ├── Reports.tsx
│   ├── Users.tsx
│   ├── Settings.tsx
│   ├── NFSeRecords.tsx    # Histórico de Notas Fiscais
│   └── Login.tsx
├── services/
│   └── nfse.ts           # Serviço de NFSe
├── types/
│   └── index.ts           # Definições de tipos TypeScript
├── utils/
│   ├── format.ts          # Funções de formatação (CPF, CNPJ, etc)
│   ├── date.ts            # Funções de data
│   ├── currency.ts        # Funções de moeda
│   ├── birthday.ts        # Funções de aniversário
│   ├── validation.ts      # Funções de validação
│   ├── viacep.ts          # Integração ViaCEP
│   ├── haptics.ts         # Feedback háptico
│   ├── constants.ts       # Constantes compartilhadas
│   ├── format.test.ts     # Testes de formatação
│   ├── date.test.ts       # Testes de data
│   ├── validation.test.ts  # Testes de validação
│   └── formatters.test.ts  # Testes de formatters
├── routes/
│   └── index.tsx         # Configuração de rotas
├── App.tsx
├── main.tsx
└── index.css
```

---

## 2. NFSe - Sistema de Nota Fiscal de Serviço Eletrônica

### 2.1 Provedores Suportados

| Provedor | Tipo | Certificado | Ambiente | URL |
|----------|------|-------------|----------|-----|
| Modo Teste | - | Não | - | - |
| Sistema Nacional (Produção) | REST | Sim | - | `sefin.nfse.gov.br` |
| Sistema Nacional (Homologação) | REST | Sim | - | `sefin.producaorestrita.nfse.gov.br` |
| WebISS Juazeiro BA | SOAP | Sim | - | `juazeiroba.webiss.com.br` |
| ISSS Salvador | REST | Sim | - | `isss.salvador.ba.gov.br` |
| **FocusNFe** | REST | Não | Sim | `focusnfe.com.br` (homologação disponível) |

### 2.2 Configuração

Para configurar a NFSe:

1. Acesse **Configurações → NFSe**
2. Habilite a NFSe
3. Selecione o provedor
4. Configure:
   - Código Município (IBGE): `2918407` para Juazeiro BA
   - Código Serviço (ISS): ex: `0104`
   - CNAE: ex: `9602`
   - Aliquota ISS: ex: `5`
   - Ambiente: `homologacao` (testes) ou `producao` (emissão real)
5. Para provedores que exigem certificado, carregue o arquivo .pfx ou .p12
6. Para FocusNFe, insira o token API e selecione o ambiente (homologação ou produção)

### 2.3 Dados da Empresa para NFSe

Para emissão de NFSe, configure em **Configurações → Empresa**:
- **CNPJ** (obrigatório)
- **Inscrição Municipal** (obrigatório para NFSe) - obtido na prefeitura
- **Inscrição Estadual** (opcional)
- Endereço completo (CEP, estado, etc)

### 2.4 Status da Integração FocusNFe (2026-03-03)

**Situação Atual**: ❌ Aguardando habilitação da empresa

A API do FocusNFe está funcionando corretamente, mas a empresa ainda não foi habilitada para emissão de NFSe. Testes via curl confirmam:

```bash
# Erro retornado pela API
{"codigo": "empresa_nao_habilitada", "mensagem": "Empresa ainda não habilitada para emissão de NFSe, por favor contate o suporte técnico."}
```

**O que foi verificado**:
- ✅ Autenticação funciona (token validado)
- ✅ Payload está correto com todos os campos obrigatórios
- ✅ Código do município correto: `2918407` (Juazeiro-BA)
- ✅ Provedor: WebISS (requer certificado)
- ❌ Empresa não habilitada no painel da FocusNFe
- ⚠️ Certificado mostra "Pendente" no painel

**Próximos Passos**:
1. Entrar em contato com suporte@focusnfe.com.br para habilitar a empresa
2. Verificar/configurar certificado digital (necessário para Juazeiro-BA)
3. Após habilitação, testar emissão novamente

### 2.3 Funcionalidades

- Geração de XML no formato DPS (Padrão Nacional)
- Geração de XML no formato ABRASF (WebISS)
- Compressão GZip + Base64
- Envelope SOAP para WebISS
- Registro automático das notas no Firebase
- Histórico de notas fiscais
- Permissão separada para acesso
- Suporte a ambiente de homologação (FocusNfe)
- Processamento assíncrono com polling (FocusNfe)
- Campos adicionados para dados da empresa:
  - Inscrição Municipal (obrigatório para NFSe)
  - Inscrição Estadual (opcional)

---

## 3. Sistema de Permissões

### 3.1 Permissões Disponíveis

```typescript
const permissionsList = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'clients', label: 'Clientes' },
    { id: 'appointments', label: 'Agendamentos' },
    { id: 'services', label: 'Serviços' },
    { id: 'finance', label: 'Financeiro' },
    { id: 'nfse', label: 'Notas Fiscais' },
    { id: 'reports', label: 'Relatórios' },
    { id: 'staff', label: 'Equipe' },
    { id: 'settings', label: 'Configurações' },
];
```

### 3.2 Funções Padrão

- **Administrador**: acesso total (`permissions: ['all']`)
- **Manicure**: appointments, clients, services
- **Pedicure**: appointments, clients, services
- **Recepção**: appointments, clients

---

## 4. Análise de Código e Problemas Identificados

> ⚠️ **Status: RESOLVIDOS em 2026-03-02**
> 
> Todos os problemas abaixo foram corrigidos nesta data.

### 4.1 Problemas Críticos

#### 4.1.1 Código de Limpeza Temporário (Dashboard.tsx) ✅ RESOLVIDO

**Localização**: `src/sections/Dashboard.tsx` - linhas 75-101

**Problema**: Existia um código de limpeza temporário e hardcoded que removia duplicatas para um cliente específico.

**Solução**: O código temporário foi removido.

#### 4.1.2 Uso de `any` em TypeScript ✅ RESOLVIDO

**Localizações**:
- `src/sections/Services.tsx:51` - `handleEdit(service: any)` → agora usa tipo `Service`
- `src/sections/Reports.tsx:291` - `accessor: (m: any)` → agora usa tipo `StaffCommission`

**Solução**: Tipos apropriados foram definidos e utilizados.

### 4.2 Problemas Médios

#### 4.2.1 Validação de Formulários ⚠️ Pendente

Alguns formulários não possuem validação robusta:
- `ClientForm.tsx` - CPF/CNPJ não validado formatado
- `Finance.tsx` - Valor pode ser negativo
- `Services.tsx` - Preço pode ser 0

**Recomendação**: Implementar validação com Zod em todos os formulários.

#### 4.2.2 Tratamento de Erros ✅ RESOLVIDO

**Problema**: Alguns lugares usavam `alert()` em vez de `toast.error()`

**Solução**: Todo tratamento de erros agora usa `sonner` (toast.error/toast.success).

#### 4.2.3 Carga de Dados ⚠️ Pendente

O `DataContext.tsx` carrega 6 coleções simultaneamente:
- clients
- services
- appointments
- financialRecords
- staff
- nfseRecords

### 4.4 Melhorias de Acessibilidade e Performance (2026-03-04)

- **Acessibilidade**: Implementado `id`, `name` e `htmlFor` em todos os campos de formulário críticos (`ClientForm`, `Services`, `Settings`, etc).
- **Security Rules**: Regras do Firestore endurecidas para restringir escrita de registros financeiros/NFSe apenas para admins.
- **Componentização**: Dashboard refatorado com widgets independentes (`BirthdayWidget`, `ServiceListWidget`).
- **Lazy Loading**: Redução da carga inicial de dados atrasando a subscrição de coleções pesadas (Financeiro/NFSe).

### 4.5 Múltiplas Formas de Pagamento (2026-03-04)

O sistema agora suporta divisões de pagamento no mesmo atendimento (ex: parte em dinheiro, parte em pix).
- Registra múltiplos lançamentos individuais no Livro Caixa vinculados ao mesmo agendamento.
- Validação visual da soma total vs valor esperado do serviço.

Mas não há retry automático em caso de falha.

### 4.3 Problemas Menores

#### 4.3.1 Código Duplicado ✅ RESOLVIDO

- Constante `TIMES` definida em `Appointments.tsx` e `Dashboard.tsx` → agora exportada de `constants.ts`
- Função `formatPhone` duplicada em `Staff.tsx` → agora usa `utils/format.ts`

#### 4.3.2 Nomenclatura Inconsistente ⚠️ Pendente

- Alguns arquivos usam `onClose`, outros usam `onCancel`
- Mixed usage de `handle` vs `on` prefixes

---

## 5. Configuração e Ambiente

### 5.1 Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 5.2 Scripts Disponíveis

```bash
# desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (http://localhost:5173)
npm run preview      # Pré-visualização do build de produção

# Build
npm run build       # Verificação TypeScript + Build Vite (saída para dist/)

# Linting
npm run lint        # Executa ESLint em todo o projeto

# Testes
npm test            # Executa todos os testes uma vez (Vitest)
npm run test:watch  # Executa testes em modo watch
npm run test:coverage # Executa testes com relatório de coverage
```

---

## 6. Padrões de Código

### 6.1 Estrutura de Componentes

```typescript
// 1. Imports (ordem: React → Terceiros → Locais)
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { auth, db } from '../lib/firebase';
import type { User } from '../types';

// 2. Tipos e Interfaces
interface Props {
    userId: string;
    onSuccess?: () => void;
}

// 3. Componente
export function UserCard({ userId, onSuccess }: Props) {
    // 4. State
    const [user, setUser] = useState<User | null>(null);
    
    // 5. Effects
    useEffect(() => {
        // effect logic
    }, [userId]);

    // 6. Handlers
    const handleAction = async () => {
        try {
            // logic
            onSuccess?.();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to perform action');
        }
    };

    // 7. Render
    return <div>{/* JSX */}</div>;
}
```

### 6.2 Convenções de Nomenclatura

- **Componentes**: PascalCase (`AuthContext.tsx`, `AppointmentCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth`, `useAppointmentManagement`)
- **Tipos/Interfaces**: PascalCase (`User`, `Appointment`, `Service`)
- **Constantes**: SCREAMING_SNAKE_CASE (`INCOME_CATEGORIES`)
- **Arquivos de utilitários**: kebab-case (`format.ts`, `viacep.ts`)

### 6.3 Padrões de Firebase

```typescript
// Verificação antes de operações
if (!db) return;

// Tratamento de erros
try {
    await operation();
    toast.success('Operação realizada com sucesso');
} catch (error) {
    console.error('Erro:', error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (error as any).code;
    if (code === 'permission-denied') {
        toast.error('Permissão negada');
    } else {
        toast.error('Erro ao realizar operação');
    }
}
```

---

## 7. Glossário de Termos

| Termo | Descrição |
|-------|-----------|
| **Firestore** | Banco de dados NoSQL do Firebase |
| **onSnapshot** | Listener em tempo real do Firestore |
| **Cloud Functions** | Funções serverless do Firebase |
| **Auth** | Sistema de autenticação do Firebase |
| **NFSe** | Nota Fiscal de Serviço Eletrônica |
| **DPS** | Declaração de Prestação de Serviço |
| **ABRASF** | Associação Brasileira de Automação de Tributos |
| **ICP-Brasil** | Infraestrutura de Chaves Públicas Brasileira |
| **mTLS** | Mutual TLS - autenticação bidirecional com certificado |
| **Livro Caixa** | Registro cronológico de receitas e despesas com saldo acumulado |
| **Conciliação Bancária** | Verificação de registros financeiros com extrato bancário |

---

## 8. Histórico de Desenvolvimento

### Funcionalidades Implementadas

1. **Autenticação**
   - Login com email/senha
   - Suporte a Firebase Authentication
   - Bloqueio de usuários inativos
   - Redirecionamento por função (admin → dashboard, outros → appointments)

2. **Gestão de Clientes**
   - Cadastro completo com CPF/CNPJ formatado
   - Busca por nome/telefone/CPF
   - Histórico de visitas
   - Integração WhatsApp

3. **Gestão de Serviços**
   - Cadastro de serviços com preço e duração
   - Categorias personalizáveis
   - Comissão por serviço
   - Toggle ativo/inativo

4. **Gestão de Agendamentos**
   - Calendário diário
   - Múltiplos serviços por agendamento
   - Status (Agendado, Confirmado, Concluído, Cancelado, Não Compareceu)
   - **Múltiplas Formas de Pagamento**: Registro de pagamentos parciais (split) em diferentes métodos (Dinheiro, Pix, Cartão)
   - Registro de pagamento
   - Emissão automática de NFSe

5. **Gestão Financeira (Livro Caixa)**
   - Receitas e despesas
   - Categorização
   - Métodos de pagamento configuráveis
   - Filtros por período (dia/mês/ano)
   - Resumo mensal
   - **Saldo Acumulado**: Saldo anterior do período + running balance
   - **Ordem Cronológica**: Registros ordenados por data com saldo progressivo
   - **Link com NFSe**: Ícone para receitas vinculadas a notas fiscais
   - **Exportação CSV**: Exportar registros para Excel/CSV
   - **Conciliação Bancária**: Marcar registros como conciliados

6. **NFSe - Nota Fiscal de Serviço Eletrônica**
   - Múltiplos provedores (Nacional, WebISS, ISSS, FocusNfe)
   - Geração de XML DPS e ABRASF
   - Upload de certificado digital
   - Histórico de notas fiscais
   - Permissões por função
   - Emissão automática no pagamento
   - Suporte a homologação (FocusNfe)
   - Processamento assíncrono com polling

7. **Relatórios**
   - Serviços mais populares
   - Clientes mais frequentes
   - Receitas/despesas por categoria
   - Comissões por profissional

8. **Staff**
   - Cadastro de profissionais
   - Comissão padrão
   - Status ativo/inativo

9. **Permissões e Segurança**
   - Funções configuráveis
   - Permissões granulares
   - Bloqueio de usuários inativos

10. **UI/UX**
    - Tema claro/escuro
    - Design responsivo
    - Notificações toast
    - Integração WhatsApp
    - PWA (instalável)
    - Máscaras de CPF/CNPJ/CEP/Telefone
    - Auto-preenchimento de endereço por CEP

---

## 9. Credenciais de Teste

- **Email**: well@well.com
- **Senha**: 123456

---

## 10. Troubleshooting

### Problema: Dados não carregam

1. Verificar conexão com internet
2. Verificar regras do Firestore
3. Verificar console do navegador para erros
4. Executar `npm run build` para verificar erros de TypeScript

### Problema: Erro de autenticação

1. Verificar credenciais no Firebase Console
2. Verificar variável de ambiente `VITE_FIREBASE_API_KEY`
3. Limpar cache do navegador

### Problema: Build falha

1. Executar `npm run lint` para verificar erros de lint
2. Verificar erros de TypeScript com `npx tsc --noEmit`
3. Verificar dependências com `npm install`

### Problema: NFSe não emite

1. Verificar se NFSe está habilitada em Configurações
2. Verificar se provedor está selecionado
3. Para FocusNFe:
   - Verificar se o ambiente correto está selecionado (homologacao para testes)
   - Verificar se o token API está correto
   - Verificar se a Inscrição Municipal está preenchida
4. Para provedores com certificado (WebISS, Nacional):
   - Verificar se certificado está carregado (.pfx ou .p12)
   - Verificar se certificado não está vencido
5. Verificar console do navegador (F12) para erros detalhados
6. Verificar painel da FocusNFe para status da empresa

### Problema: FocusNFe retorna "empresa_nao_habilitada"

Este erro significa que a empresa ainda não foi habilitada para emissão de NFSe no painel da FocusNFe. Ação necessária:
- Entrar em contato com suporte@focusnfe.com.br
- Verificar se o certificado digital está configurado no painel

---

## 11. Status do Projeto

### ✅ Funcionalidades Prontas
- Autenticação completa
- Gestão de clientes, serviços, agendamentos
- Financeiro com métodos de pagamento configuráveis e suporte a split (múltiplos métodos por venda)
- NFSe com múltiplos provedores (código pronto)
- Sistema de permissões e segurança (regras de banco endurecidas)
- Sugestão de acessibilidade Lighthouse (100% formulários)
- Tema claro/escuro
- PWA
- Performance otimizada (Lazy Loading de dados pesados)

### ⚠️ Em Desenvolvimento / Aguardando Habilitação
- **FocusNFe**: API integrada, mas aguardando habilitação da empresa no painel
- Certificado digital ICP-Brasil para provedores que exigem (WebISS, Nacional)

### ❌ Pendente
- Integração com serviços pagos (Emita Nota, etc)
- Cloud Functions para operações sensíveis

---

## 11. Novas Funcionalidades - Livro Caixa (2026-03-03)

### Campos adicionados ao FinancialRecord

```typescript
interface FinancialRecord {
    id: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    value: number;
    date: string;
    createdAt: string;
    appointmentId?: string;
    paymentMethod: 'pix' | 'cash' | 'card';
    nfseId?: string;        // NOVO: Link para NFSe
    conciliated?: boolean;    // NOVO: Status de conciliação bancária
}
```

### Funções adicionadas ao DataContext

- `updateFinancialRecord(id, data)`: Atualiza um registro financeiro (usado para conciliação)

---

---

## 12. Kit de Desenvolvimento (Skills Agentic)

O ambiente foi expandido com o repositório **Antigravity Awesome Skills (978+ skills)**, fornecendo automação e auditoria avançada para:

- **Performance**: Auditores de latência, Core Web Vitals, tree shaking.
- **Segurança**: Scanners de vulnerabilidades OWASP 2024, Red Team tactics.
- **Arquitetura**: Geradores de ADR (Architecture Decision Records) e Diagramas C4.
- **Integrações**: WhatsApp, Telegram, Twilio, Zapier (Zapier-Make-Patterns).
- **QA/Testes**: TDD Workflow avançado e Playwright Visual Regression.

*Documento atualizado em Março de 2026*
