# Guia de Solução de Problemas - Exclusão de Filamentos

## Problema: Erro ao excluir filamentos cadastrados

### Possíveis Causas:

1. **Problemas de Permissões (RLS - Row Level Security)**
2. **Dependências de Chave Estrangeira**
3. **Estrutura de Banco de Dados Inconsistente**
4. **View inexistente no banco de dados**

### Soluções:

#### 1. Executar Script de Correção de Permissões

Execute o script `fix-permissions.sql` no SQL Editor do Supabase:

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Cole o conteúdo do arquivo `fix-permissions.sql`
4. Execute o script

#### 2. Verificar Estrutura do Banco de Dados

Certifique-se de que todas as tabelas necessárias existem executando o script `supabase-schema.sql`.

#### 3. Verificar Dependências

Antes de excluir um filamento, verifique se ele não está sendo usado por:

- **Produtos**: Verifique se há produtos que usam este filamento
- **Movimentações de Estoque**: Verifique se há histórico de movimentações

#### 4. Melhorias Implementadas

O código foi atualizado para:

- ✅ Verificar autenticação do usuário
- ✅ Verificar existência do filamento
- ✅ Verificar dependências antes da exclusão
- ✅ Tratar erros específicos do banco de dados
- ✅ Mostrar mensagens de erro mais claras
- ✅ Adicionar estado de loading durante a exclusão

### Como Testar:

1. **Teste com filamento sem dependências:**
   - Crie um filamento novo
   - Tente excluí-lo imediatamente
   - Deve funcionar sem problemas

2. **Teste com filamento com dependências:**
   - Crie um produto que use um filamento
   - Tente excluir o filamento
   - Deve mostrar mensagem de erro específica

3. **Teste com movimentações de estoque:**
   - Adicione estoque a um filamento
   - Tente excluir o filamento
   - Deve mostrar mensagem sobre histórico de movimentações

### Logs de Erro Comuns:

- **Erro 23503**: Violação de chave estrangeira
- **Erro 42501**: Permissão negada
- **Erro 23505**: Violação de unicidade

### Comandos Úteis para Debug:

```sql
-- Verificar se um filamento existe
SELECT * FROM filaments WHERE id = 'uuid-do-filamento';

-- Verificar produtos que usam um filamento
SELECT * FROM products WHERE filamento_id = 'uuid-do-filamento';

-- Verificar movimentações de estoque
SELECT * FROM movimentacoes_estoque WHERE filamento_id = 'uuid-do-filamento';

-- Verificar políticas RLS
SELECT * FROM information_schema.policies WHERE table_name = 'filaments';
```

### Contato para Suporte:

Se o problema persistir após seguir estas instruções, verifique:

1. Os logs do console do navegador
2. Os logs do Supabase
3. A estrutura atual do banco de dados

### Arquivos Modificados:

- `src/lib/actions/filament.actions.ts` - Função de exclusão melhorada
- `src/app/(app)/servicos/cadastros/components/FilamentsTab.tsx` - UI melhorada
- `supabase-schema.sql` - Políticas RLS adicionadas
- `fix-permissions.sql` - Script de correção criado

---

## Problema: Filamentos sumiram da tela

### Possíveis Causas:

1. **Inconsistência entre nomes de tabelas** (filamentos vs filaments)
2. **Problemas na consulta SQL** (joins incorretos)
3. **Dados não existem no banco**
4. **Problemas de RLS impedindo acesso aos dados**

### Soluções:

#### 1. Executar Script de Debug

Execute o script `debug-filaments.sql` no SQL Editor do Supabase para verificar:

- Se as tabelas existem
- Se há dados nas tabelas
- Se as políticas RLS estão corretas
- Se os joins estão funcionando

#### 2. Inserir Dados de Teste

Se as tabelas estiverem vazias, execute o script `insert-test-data.sql` para inserir dados de teste.

#### 3. Verificar Console do Navegador

Abra o console do navegador (F12) e verifique os logs de debug que foram adicionados à função `getFilaments()`:

- 🔍 Iniciando busca de filamentos...
- 📊 Dados brutos recebidos
- 📊 Total de filamentos encontrados
- 🔄 Filamento mapeado
- ✅ Filamentos processados

#### 4. Verificar Estrutura das Tabelas

Certifique-se de que as tabelas têm a estrutura correta:

```sql
-- Verificar estrutura da tabela filaments
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'filaments' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

#### 5. Testar Consulta Manualmente

Execute esta consulta no SQL Editor do Supabase:

```sql
SELECT 
    f.id,
    f.tipo,
    f.cor,
    f.densidade,
    f.marca_id,
    b.nome as marca_nome,
    f.modelo,
    f.preco_por_kg,
    f.quantidade_estoque_gramas
FROM filaments f
LEFT JOIN brands b ON f.marca_id = b.id
ORDER BY f.created_at DESC;
```

### Correções Implementadas:

- ✅ Corrigido nome da tabela de `filamentos` para `filaments`
- ✅ Corrigido mapeamento de campos (tipo_id → tipo)
- ✅ Corrigido joins com a tabela brands
- ✅ Adicionado logs de debug detalhados
- ✅ Corrigido estrutura de dados para compatibilidade

### Scripts de Apoio:

- `debug-filaments.sql` - Para diagnosticar problemas
- `insert-test-data.sql` - Para inserir dados de teste
- `fix-permissions.sql` - Para corrigir permissões

### Próximos Passos:

1. Execute `debug-filaments.sql` para verificar o estado atual
2. Se não houver dados, execute `insert-test-data.sql`
3. Verifique o console do navegador para logs de debug
4. Teste a aplicação novamente 