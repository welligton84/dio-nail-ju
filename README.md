# Juliana Miranda Concept - Sistema de Gestão

Sistema de gestão completo para salão de unhas desenvolvido com React, TypeScript, Vite e Tailwind CSS.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)

## 📋 Funcionalidades

### 🔐 Autenticação
- Login com email e senha
- Suporte a Firebase Authentication (opcional)
- Modo demo com credenciais de teste

### 📊 Dashboard
- Resumo de estatísticas do studio
- Agendamentos do dia
- Serviços disponíveis
- Cards com métricas financeiras

### 👥 Clientes
- Cadastro completo de clientes
- Busca por nome ou telefone
- Histórico de visitas
- Edição e exclusão

### 💅 Serviços
- Gerenciamento de serviços oferecidos
- Categorias (Manicure, Pedicure, Alongamento, etc.)
- Preços e duração
- Cores personalizadas para cada serviço
- Toggle ativo/inativo

### 📅 Agendamentos
- Seleção de data via calendário
- Múltiplos serviços por agendamento
- Status (Agendado, Confirmado, Concluído, Cancelado)
- Cálculo automático de valor total

### 💰 Financeiro
- Registro de receitas e despesas
- Categorização de lançamentos
- Filtros por tipo
- Resumo mensal (receitas, despesas, saldo)

### 📈 Relatórios
- Serviços mais populares
- Clientes mais frequentes
- Receitas por categoria
- Despesas por categoria

### 👤 Usuários
- Visualização do usuário atual
- Lista de usuários do sistema

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/studio-nail-ju.git

# Entre na pasta do projeto
cd studio-nail-ju

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

### Credenciais Demo
- **Email:** well@well.com
- **Senha:** 123456

## 🔧 Configuração do Firebase (Opcional)

Para usar com Firebase, crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Preencha com suas credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📁 Estrutura do Projeto

```
studio-nail-ju/
├── src/
│   ├── lib/
│   │   └── firebase.ts          # Configuração Firebase
│   ├── hooks/
│   │   ├── useAuth.tsx          # Hook de autenticação
│   │   └── useData.tsx          # Hook de dados
│   ├── components/
│   │   └── MainLayout.tsx       # Layout principal
│   ├── sections/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Clients.tsx
│   │   ├── Appointments.tsx
│   │   ├── Services.tsx
│   │   ├── Finance.tsx
│   │   ├── Reports.tsx
│   │   └── Users.tsx
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos utilitários
- **Lucide React** - Ícones
- **Firebase** - Backend (opcional)

## 📱 Responsividade

O sistema é totalmente responsivo, funcionando em:
- Desktop
- Tablet
- Mobile

## 🎨 Design

- Gradientes rosa e roxo
- Cards com hover effects
- Animações suaves
- Fonte Inter

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ para Juliana Miranda Concept
