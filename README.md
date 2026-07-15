# RideNow 🚗

Clone do Uber desenvolvido com tecnologias modernas. Plataforma completa de mobilidade urbana com experiências dedicadas para passageiros, motoristas e administradores.

## Tecnologias

- **Frontend:** React 19 + TypeScript + Vite 6
- **Estilização:** Tailwind CSS 4 + shadcn/ui
- **Backend & Banco de dados:** Convex
- **Autenticação:** Hercules Auth (OIDC)
- **Animações:** Motion (Framer Motion)
- **Roteamento:** React Router v7

## Funcionalidades

### Passageiro
- Solicitar corridas com origem e destino
- Visualizar opções de categoria (RideX, RideXL, Moto)
- Acompanhar status da corrida em tempo real
- Cancelar corrida ativa
- Histórico de corridas

### Motorista
- Alternar entre status online/offline
- Visualizar e aceitar corridas disponíveis
- Iniciar e concluir viagens
- Painel com ganhos, total de corridas e avaliação
- Histórico de corridas realizadas

### Administrador
- Visão geral da plataforma (KPIs)
- Gerenciamento de usuários (ativar/desativar)
- Listagem completa de todas as corridas
- Filtros por papel (passageiro / motorista)

## Estrutura do Projeto

```
├── convex/              # Backend (queries, mutations, schema)
│   ├── schema.ts
│   ├── users.ts
│   └── rides.ts
├── src/
│   ├── components/ui/   # Componentes shadcn/ui
│   ├── hooks/           # Hooks customizados
│   ├── pages/
│   │   ├── Index.tsx
│   │   ├── role-select/ # Seleção de perfil
│   │   ├── passenger/   # Dashboard do passageiro
│   │   ├── driver/      # Dashboard do motorista
│   │   └── admin/       # Painel administrativo
│   ├── App.tsx
│   └── main.tsx
```

## Como Executar

```bash
# Instalar dependências
pnpm install

# Iniciar em desenvolvimento
pnpm dev
```

## Fluxo da Aplicação

1. Usuário faz login via Hercules Auth
2. Escolhe seu perfil: **Passageiro**, **Motorista** ou **Administrador**
3. É redirecionado para o dashboard correspondente
4. Passageiros solicitam corridas → Motoristas online recebem e aceitam → Admin monitora tudo

## Licença

MIT
