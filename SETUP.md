# 🚀 Guia de Configuração - AC3DStudio

Este guia te ajudará a configurar o AC3DStudio com Supabase e hospedagem gratuita.

## 📋 Pré-requisitos

1. **Node.js** (versão 18 ou superior)
   - Baixe em: https://nodejs.org/
   - Verifique a instalação: `node --version`

2. **Git** (opcional, para controle de versão)
   - Baixe em: https://git-scm.com/

## 🗄️ Configurando o Supabase

### 1. Criar conta no Supabase
1. Acesse: https://supabase.com/
2. Clique em "Start your project"
3. Faça login com GitHub ou crie uma conta
4. Clique em "New Project"

### 2. Configurar o projeto
1. **Nome do projeto**: `ac3dstudio` (ou outro nome)
2. **Database Password**: Crie uma senha forte
3. **Region**: Escolha a região mais próxima (ex: São Paulo)
4. Clique em "Create new project"

### 3. Executar o script SQL
1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Clique em **Run** para executar

### 4. Obter as credenciais
1. No dashboard, vá para **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://xyz.supabase.co`)
   - **anon public** key (começa com `eyJ...`)

## 🔧 Configurando o Projeto

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### 3. Instalar Supabase (se necessário)
```bash
npm install @supabase/supabase-js
```

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento local
```bash
npm run dev
```

O projeto estará disponível em: http://localhost:9002

## 🌐 Hospedagem Gratuita

### Opção 1: Vercel (Recomendado)
1. Acesse: https://vercel.com/
2. Faça login com GitHub
3. Clique em "New Project"
4. Conecte seu repositório GitHub
5. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clique em "Deploy"

### Opção 2: Netlify
1. Acesse: https://netlify.com/
2. Faça login com GitHub
3. Clique em "New site from Git"
4. Conecte seu repositório
5. Configure as variáveis de ambiente
6. Clique em "Deploy site"

### Opção 3: Railway
1. Acesse: https://railway.app/
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Configure as variáveis de ambiente
6. O deploy será automático

## 🔐 Configurando Autenticação

### 1. Habilitar autenticação no Supabase
1. No dashboard do Supabase, vá para **Authentication** → **Settings**
2. Em **Site URL**, adicione sua URL de produção
3. Em **Redirect URLs**, adicione:
   - `http://localhost:9002/auth/callback`
   - `https://seu-dominio.vercel.app/auth/callback`

### 2. Configurar provedores (opcional)
1. Vá para **Authentication** → **Providers**
2. Habilite os provedores desejados (Google, GitHub, etc.)

## 📱 Testando a Aplicação

1. Acesse a aplicação
2. Teste o login/registro
3. Verifique se os dados estão sendo salvos no Supabase
4. Teste as funcionalidades principais:
   - Dashboard
   - Cadastro de produtos
   - Orçamentos
   - Configurações

## 🐛 Solução de Problemas

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique se as tabelas foram criadas corretamente

### Erro de build
- Verifique se todas as dependências estão instaladas
- Confirme se o Node.js está na versão correta
- Limpe o cache: `npm run build -- --clean`

### Erro de autenticação
- Verifique as configurações de autenticação no Supabase
- Confirme se as URLs de redirecionamento estão corretas
- Verifique se o domínio está na lista de sites permitidos

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Consulte a documentação do Supabase
3. Verifique os logs da aplicação em produção

## 🎉 Próximos Passos

Após a configuração inicial:
1. Personalize o design da aplicação
2. Adicione mais funcionalidades
3. Configure backups automáticos no Supabase
4. Implemente monitoramento e analytics
5. Adicione testes automatizados

---

**Boa sorte com seu projeto! 🚀** 