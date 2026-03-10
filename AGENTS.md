# AGENTS.md - Agentic Coding Guidelines

This file provides guidelines for agentic coding agents operating in this repository.

## Project Overview

This is a React + TypeScript + Vite + Tailwind CSS management system for a nail salon (Juliana Miranda Concept). It uses Firebase for authentication and data storage.

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run preview      # Preview production build
```

### Building
```bash
npm run build        # TypeScript check + Vite build (outputs to dist/)
```

### Linting
```bash
npm run lint         # Run ESLint on entire project
```

### Testing
```bash
npm test             # Run all tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage# Run tests with coverage report

# Run a single test file
npx vitest run src/utils/format.test.ts

# Run a single test by name
npx vitest run -t "should format a valid CPF"
```

## Recent Improvements (2026-03-03)

### NFSe System - PlugNotas Integration (2026-03-09)

#### Files Modified
- `src/services/nfse.ts` - Fixed PlugNotas payload format
- `functions/src/index.ts` - Cloud Function proxy for PlugNotas API

#### Supported Providers
- `simplified` - Test mode (no certificate required)
- `national` - Sistema Nacional NFS-e (Production) - Requires certificate
- `national_homolog` - Sistema Nacional NFS-e (Homologation) - Requires certificate
- `webiss_juazeiro` - WebISS Juazeiro BA - SOAP/ABRASF format - Requires certificate
- `isss` - ISSS Salvador - Requires certificate
- `plugnotas` - PlugNotas (TecnoSpeed) - API Key only, NO certificate required

#### PlugNotas Payload Format (CORRECT - TESTED)
```typescript
const plugNotasPayload = {
    idIntegracao: "NFSE-123456",
    naturezaTributacao: 1,  // NUMBER, not string
    prestador: {
        cpfCnpj: "08187168000160",
        inscricaoMunicipal: "12345678",
    },
    tomador: {
        cpfCnpj: "12345678901",
        razaoSocial: "Cliente Nome",
        email: "cliente@email.com",
        telefone: {
            ddd: "74",
            numero: "999999999",
        },
        endereco: {
            tipoLogradouro: "",
            logradouro: "Rua Principal",
            numero: "100",
            complemento: "",
            tipoBairro: "",
            bairro: "Centro",
            codigoPais: "1058",
            descricaoPais: "Brasil",
            codigoCidade: "2918407",
            descricaoCidade: "",
            estado: "BA",
            cep: "48900000",
        },
    },
    servico: [
        {
            codigo: "0104",
            discriminacao: "Serviço de beleza e cuidados pessoais",
            iss: {
                tipoTributacao: 3,    // NUMBER, not string
                exigibilidade: 1,       // NUMBER, not string
                retido: false,
                aliquota: 5,
                valor: 25.00,
                valorRetido: 0,
            },
            valor: {
                servico: 500.00,
                baseCalculo: 500.00,
                deducoes: 0,
                descontoCondicionado: 0,
                descontoIncondicionado: 0,
                liquido: 500.00,
            },
        },
    ],
    cidadePrestacao: {
        codigo: "2918407",
    },
};
```

#### Key Points
- All numeric fields must be numbers, NOT strings
- API requires array format: `[payload]`
- Uses Cloud Function (`emitNFSe`) to avoid CORS
- Environments: Sandbox `api.sandbox.plugnotas.com.br`, Production `api.plugnotas.com.br`
- Authentication via `X-API-KEY` header
- Company must be registered in PlugNotas first

#### Cloud Function
- `functions/src/index.ts` - Contains `emitNFSe` function
- Handles CORS and wraps payload in array
- Endpoint: `https://southamerica-east1-julianamirandaconcept.cloudfunctions.net/emitNFSe`

#### Test Results
- NFSe emitted successfully via curl (NFSe #4455)
- Status: AUTORIZADA
- Sandbox API confirmed working

### NFSe System (Nota Fiscal de Serviço Eletrônica)

#### Files Created/Modified
- `src/services/nfse.ts` - Complete NFSe service with multiple provider support
- `src/sections/NFSeRecords.tsx` - NFSe history page
- `src/routes/index.tsx` - Added NFSe route
- `src/types/index.ts` - Added NFSeRecord type
- `src/contexts/DataContext.tsx` - Added NFSe records state and functions

#### Supported Providers
- `simplified` - Test mode (no certificate required)
- `national` - Sistema Nacional NFS-e (Production) - Requires certificate
- `national_homolog` - Sistema Nacional NFS-e (Homologation) - Requires certificate
- `webiss_juazeiro` - WebISS Juazeiro BA - SOAP/ABRASF format - Requires certificate
- `isss` - ISSS Salvador - Requires certificate
- `focusnfe` - Focus NFe (Paid)
- `plugnotas` - PlugNotas (TecnoSpeed) - API Key only, NO certificate required

#### Features
- XML DPS generation (National Standard format)
- XML ABRASF generation (WebISS format)
- GZip compression + Base64 encoding
- SOAP envelope for WebISS
- NFSe records stored in Firebase
- Certificate upload (.pfx/.p12)
- Automatic NFSe emission on payment completion

### Bug Fixes

1. **Settings.tsx JSX Error** - Fixed missing closing div tag
2. **CPF/CNPJ Formatting** - Added automatic formatting in Settings company tab
3. **Address Auto-fill** - Fixed toast showing when address already filled
4. **NFSe Permission** - Added separate nfse permission to roles
5. **NFSe Certificate Upload** - Shows for all providers requiring certificate
6. **Accessibility Fixes (2026-03-04)** - Fixed all form accessibility issues from Lighthouse audit:
   - Added id, name, and htmlFor attributes to all form fields
   - Fixed duplicate IDs (removed duplicate "company-phone" in Settings.tsx, changed "active" to "service-active" in Services.tsx)
   - Fixed CSP for PWA (added unsafe-eval and other necessary CSP directives in firebase.json)
7. **Login.tsx (2026-03-04)** - Removed duplicate password field
8. **Services.tsx (2026-03-04)** - Removed duplicate form fields (price, duration, commission, color, description)

### Recent Fixes & Improvements (2026-03-04)

#### Duplicate Fields Removed
- `src/sections/Login.tsx` - Removed duplicate password field (was showing 2 password inputs)
- `src/sections/Services.tsx` - Removed 5 sets of duplicate form fields (price, duration, commission, color, description appeared twice in the form)

#### Componentization & Performance
- `src/sections/Dashboard.tsx` - Extracted `BirthdayWidget` and `ServiceListWidget` logic to eliminate inline code duplication.
- `src/contexts/DataContext.tsx` - Implemented lazy-loading for `financialRecords` and `nfseRecords` to drastically reduce initial DB fetch overhead (down from 6 mandatory collections to 4). Added corresponding trigger `useEffect`s in `Finance`, `Reports` and `NFSeRecords`.

#### Security Hardening
- `firestore.rules` - Restricted `clients`, `appointments` mutations to admins and staff. Restricted `financialRecords` and `nfseRecords` mutations strictly to `admin` roles, eliminating the risk of arbitrary logged-in users creating or editing critical data.

#### Multi-Payment Support
- `src/sections/appointments/PaymentForm.tsx` & `useAppointmentManagement.ts` - Replaced single payment format to allow a customer to split the payment of a single appointment across multiple methods (e.g. part in Pix, part in Cash). Automatically registers multiple discrete incomes in the Cashbook.

### Accessibility Improvements (2026-03-04)

#### Files Fixed
- `src/components/ClientForm.tsx` - Added id, name, htmlFor to all 16 form fields
- `src/sections/Finance.tsx` - Fixed period filter selects with labels/ids
- `src/sections/Services.tsx` - Added id, name, htmlFor to all form fields, fixed duplicate "active" ID
- `src/sections/Login.tsx` - Added id, name, htmlFor to email and password fields
- `src/sections/Settings.tsx` - Added htmlFor to ~20 labels, removed duplicate phone fields
- `src/sections/NFSeRecords.tsx` - Added id, name, htmlFor to search and filter fields
- `src/sections/Staff.tsx` - Added id, name, htmlFor to search and all form fields
- `firebase.json` - Updated CSP to allow PWA (Workbox) to function properly

### Livro Caixa System (2026-03-03)

#### Files Modified
- `src/types/index.ts` - Added `nfseId` and `conciliated` fields to FinancialRecord
- `src/contexts/DataContext.tsx` - Added `updateFinancialRecord` function
- `src/sections/Finance.tsx` - Complete rewrite with livro caixa features

#### Features Implemented
- **Saldo Acumulado**: Opening balance from previous periods + running balance
- **Ordem Cronológica**: Records sorted by date with progressive balance calculation
- **Link com NFSe**: Icon link for income records linked to NFSe
- **Exportação CSV**: Export financial records to CSV file
- **Conciliação Bancária**: Toggle to mark records as conciliated

#### New FinancialRecord Fields
```typescript
interface FinancialRecord {
    // ... existing fields
    nfseId?: string;        // Link to NFSe record
   conciliated?: boolean;    // Bank reconciliation status
}
```

### Test Results
- 50 tests passing
- All utils covered (format, date, validation, formatters)

## Code Style Guidelines

### General Principles
- Use TypeScript for all new code - avoid `any` when possible
- Prefer functional components with hooks over class components
- Keep components small and focused on single responsibilities
- Use meaningful variable and function names in Portuguese or English (match existing codebase)

### Imports
```typescript
// React imports first
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Third-party imports
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

// Local imports (use relative paths)
import { auth, db } from '../lib/firebase';
import type { User } from '../types';
```

### Naming Conventions
- **Components**: PascalCase (e.g., `AuthContext.tsx`, `AppointmentCard.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useAuth`, `useAppointmentManagement`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `Appointment`, `Service`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `INCOME_CATEGORIES`)
- **Files**: kebab-case for utilities (e.g., `format.ts`, `viacep.ts`)

### TypeScript Guidelines
- Always define return types for functions when not trivial
- Use `interface` for object shapes, `type` for unions/aliases
- Use optional properties (`?`) when property may be undefined
- Prefer explicit types over type inference for function parameters

```typescript
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'employee';
    active: boolean;
}

function formatCPF(value: string): string {
    return value.replace(/\D/g, '');
}
```

### Component Structure
```typescript
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import type { User } from '../types';

interface Props {
    userId: string;
    onSuccess?: () => void;
}

export function UserCard({ userId, onSuccess }: Props) {
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        // effect logic
    }, [userId]);

    const handleAction = async () => {
        try {
            // logic
            onSuccess?.();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to perform action');
        }
    };

    return <div>{/* JSX */}</div>;
}
```

### Error Handling
- Use try/catch for async operations
- Show user-friendly error messages via `toast.error()`
- Log errors to console with descriptive messages
- Handle Firebase errors with specific error codes

```typescript
try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success('Login successful');
} catch (error) {
    console.error('Login error:', error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (error as any).code;
    if (code === 'auth/user-not-found') {
        toast.error('User not found');
    } else {
        toast.error('Login failed');
    }
}
```

### Formatting
- Use 4 spaces for indentation
- Add JSDoc comments for exported utility functions
- Group related functionality with blank lines
- Keep lines under 120 characters when practical

### Testing
- Test files should be named `*.test.ts` or `*.test.tsx`
- Place tests next to the code they test
- Use Vitest with `describe`/`it`/`expect` syntax

```typescript
import { describe, it, expect } from 'vitest';
import { formatCPF } from './format';

describe('formatCPF', () => {
    it('should format a valid CPF with 11 digits', () => {
        expect(formatCPF('12345678900')).toBe('123.456.789-00');
    });
});
```

### Tailwind CSS
- Use Tailwind utility classes for all styling
- Follow existing color scheme (pink/purple gradients)
- Use `gradient-bg` custom class for branded backgrounds

### Firebase Patterns
- Initialize Firebase in `src/lib/firebase.ts`
- Use context providers for Firebase data (AuthContext, DataContext)
- Use Cloud Functions for sensitive operations
- Handle null checks for optional Firebase services

### New Shared Components

Use these components instead of duplicating code:

```typescript
import { PhoneInput } from '../components/shared/PhoneInput';
import { CurrencyInput } from '../components/shared/CurrencyInput';
import { APPOINTMENT_TIMES_ARRAY, MONTHS } from '../utils/constants';
```

## Global OpenCode Skills

The following skills are available globally in OpenCode (stored in `~/.config/opencode/skill/`):

### Available Skills (978+ Capabilities)

The repository now has access to **978+ specialized agentic skills** from the [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) collection, covering:
- Advanced Frontend/Backend (Next.js, Go, Python, Rust)
- Cloud Infrastructure (AWS, GCP, Terraform)
- Security & Red Teaming (Web Security, Pen-testing)
- Automation & APIs (WhatsApp, Telegram, Zapier, Twilio)
- Performance & SEO (Lighthouse, Core Web Vitals)
- Data Science & Vector DBs (Neon, Upstash, Vector Search)

### How to use
Reference any skill from the catalog by its slug:
```
Use @vibe-code-auditor to analyze the aesthetics
Use @whatsapp-automation to implement notification triggers
Use @perfomance-profiling-nextjs for build speed
```

### Using Global Skills

To use a global skill, reference it in your prompt:

```
Use @code-review skill to review this PR
Use @tdd methodology to implement this feature
Use @debugging approach to fix this bug
```

### Installing More Skills

You can install additional skills from:
- [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) - 900+ skills
- [Antigravity Kit](https://github.com/vudovn/antigravity-kit) - 37 skills + 20 agents

```bash
# Install to global skills
npx antigravity-awesome-skills --path ~/.config/opencode/skill
```
