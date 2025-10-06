# Painel de Usuários - GAITHGIO

Este diretório contém todos os componentes relacionados ao painel de usuários do site GAITHGIO.

## Componentes

### MemberDashboardComponent
- **Arquivo**: `member-dashboard.component.*`
- **Descrição**: Dashboard principal do usuário logado
- **Funcionalidades**:
  - Visualização do perfil do usuário
  - Histórico de pedidos
  - Gerenciamento de endereços
  - Edição de perfil
  - Adição de novos endereços

### MemberLoginComponent
- **Arquivo**: `member-login.component.*`
- **Descrição**: Componente de login e registro de usuários
- **Funcionalidades**:
  - Login com email e senha
  - Registro de novos usuários
  - Validação de formulários
  - Interface responsiva

## Serviços Relacionados

### AuthService
- **Arquivo**: `../../services/auth.service.ts`
- **Descrição**: Serviço de autenticação e gerenciamento de usuários
- **Funcionalidades**:
  - Login e logout
  - Registro de usuários
  - Gerenciamento de sessão
  - Atualização de dados do usuário

## Modelos

### User, Address, Order
- **Arquivo**: `../../models/user.ts`
- **Descrição**: Interfaces TypeScript para dados de usuário
- **Estruturas**:
  - `User`: Dados principais do usuário
  - `Address`: Endereços de entrega/cobrança
  - `Order`: Pedidos do usuário
  - `OrderItem`: Itens dos pedidos

## Rotas

- `/member/login` - Página de login/registro
- `/member/dashboard` - Dashboard do usuário
- `/member` - Redireciona para login

## Características de Design

- **Cores**: Segue a identidade visual do site (#624725)
- **Fontes**: Montserrat e Cinzel
- **Responsivo**: Adaptado para desktop e mobile
- **UX**: Interface intuitiva e moderna

## Funcionalidades Implementadas

✅ Login e registro de usuários
✅ Dashboard com navegação por abas
✅ Visualização e edição de perfil
✅ Gerenciamento de endereços
✅ Histórico de pedidos
✅ Integração com navbar principal
✅ Design responsivo
✅ Validação de formulários
✅ Gerenciamento de estado de autenticação
