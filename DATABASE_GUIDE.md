# 🗄️ Guia do Banco de Dados - AC3DStudio

## 📋 Como Usar Este Guia

Este guia foi criado para evitar erros de nomenclatura e facilitar o desenvolvimento. **SEMPRE** consulte este documento antes de trabalhar com o banco de dados.

## 🚀 Formas de Me Ajudar a Conhecer Seu Banco

### 1. **Documentação Atualizada** ✅
- ✅ `DATABASE_SCHEMA.md` - Esquema completo do banco
- ✅ `src/lib/database-types.ts` - Tipos TypeScript corretos
- ✅ `scripts/validate-database-names.js` - Script de validação

### 2. **Executar Validação Automática**
```bash
npm run validate-db
```
Este comando verifica todo o código em busca de nomes incorretos de tabelas.

### 3. **Compartilhar Informações Adicionais**
Se você tiver informações específicas sobre seu banco, pode:

#### A. **Compartilhar o resultado de queries de diagnóstico:**
```sql
-- Execute no Supabase SQL Editor e me envie o resultado
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

#### B. **Compartilhar estrutura de tabelas específicas:**
```sql
-- Para uma tabela específica
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'nome_da_tabela' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

#### C. **Compartilhar relacionamentos:**
```sql
-- Verificar chaves estrangeiras
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

## 🔧 Como Atualizar a Documentação

### 1. **Se você adicionar uma nova tabela:**
1. Atualize `supabase-schema.sql`
2. Atualize `DATABASE_SCHEMA.md`
3. Atualize `src/lib/database-types.ts`
4. Atualize `scripts/validate-database-names.js`

### 2. **Se você modificar uma tabela existente:**
1. Execute a query de alteração no Supabase
2. Atualize a documentação correspondente
3. Execute `npm run validate-db` para verificar

### 3. **Se você renomear uma tabela:**
1. **NUNCA** renomeie tabelas em produção sem backup
2. Use `ALTER TABLE` para renomear
3. Atualize TODA a documentação
4. Execute validação completa

## 🚨 Regras Importantes

### ✅ **FAÇA:**
- Use sempre nomes em português para tabelas
- Consulte `DATABASE_SCHEMA.md` antes de escrever código
- Execute `npm run validate-db` antes de commits
- Use os tipos do `database-types.ts`

### ❌ **NÃO FAÇA:**
- Use nomes em inglês como `brands`, `filaments`, `products`
- Assuma que uma tabela existe sem verificar
- Ignore erros de validação
- Use nomes diferentes em diferentes partes do código

## 📝 Exemplos de Uso Correto

### ✅ **Correto:**
```typescript
// Usando constantes para evitar erros
import { TABLE_NAMES } from '@/lib/database-types';

const { data } = await supabase
  .from(TABLE_NAMES.FILAMENTOS)
  .select('*');
```

### ❌ **Incorreto:**
```typescript
// Nomes hardcoded podem causar erros
const { data } = await supabase
  .from('filaments') // ❌ Erro! Deveria ser 'filamentos'
  .select('*');
```

## 🔍 Troubleshooting

### **Problema:** "Tabela não existe"
**Solução:**
1. Verifique o nome no `DATABASE_SCHEMA.md`
2. Execute `npm run validate-db`
3. Consulte o Supabase SQL Editor

### **Problema:** "Coluna não existe"
**Solução:**
1. Verifique a estrutura da tabela no `DATABASE_SCHEMA.md`
2. Use os tipos do `database-types.ts`
3. Execute query de diagnóstico no Supabase

### **Problema:** "Erro de chave estrangeira"
**Solução:**
1. Verifique os relacionamentos no `DATABASE_SCHEMA.md`
2. Confirme se as tabelas referenciadas existem
3. Verifique se os IDs estão corretos

## 📞 Como Me Informar Sobre Mudanças

### **Opção 1: Compartilhar Queries de Diagnóstico**
Execute estas queries e me envie os resultados:

```sql
-- 1. Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Estrutura de uma tabela específica
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'nome_da_tabela'
ORDER BY ordinal_position;

-- 3. Verificar dados de exemplo
SELECT * FROM nome_da_tabela LIMIT 5;
```

### **Opção 2: Compartilhar Scripts SQL**
Se você tiver scripts SQL que criam ou modificam tabelas, compartilhe-os comigo.

### **Opção 3: Descrever Mudanças**
Descreva as mudanças que você fez no banco e eu atualizarei a documentação.

## 🎯 Benefícios Desta Abordagem

1. **Menos Erros:** Validação automática previne erros de nomenclatura
2. **Desenvolvimento Mais Rápido:** Documentação clara e acessível
3. **Manutenção Mais Fácil:** Tipos TypeScript corretos
4. **Consistência:** Padrões claros para todo o projeto

## 📚 Recursos Adicionais

- `DATABASE_SCHEMA.md` - Esquema completo
- `src/lib/database-types.ts` - Tipos TypeScript
- `scripts/validate-database-names.js` - Validação automática
- `supabase-schema.sql` - Script de criação do banco

---

**💡 Dica:** Execute `npm run validate-db` sempre que fizer mudanças no código para garantir que está usando os nomes corretos! 