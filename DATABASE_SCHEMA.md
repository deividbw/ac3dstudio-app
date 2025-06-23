# 📊 Esquema do Banco de Dados - AC3DStudio

## 🗂️ Tabelas Principais

### 1. **marcas** (Brands)
```sql
CREATE TABLE marcas (
    id UUID PRIMARY KEY,
    nome_marca TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID
);
```

### 2. **tipos_filamentos** (Filament Types)
```sql
CREATE TABLE tipos_filamentos (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo TEXT
);
```

### 3. **filamentos** (Filaments)
```sql
CREATE TABLE filamentos (
    id UUID PRIMARY KEY,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    marca_id UUID NOT NULL,
    tipo_id UUID,
    cor TEXT,
    temperatura_bico_ideal INTEGER,
    temperatura_mesa_ideal INTEGER,
    notas_filamento TEXT,
    densidade NUMERIC,
    modelo TEXT,
    quantidade_estoque_gramas INTEGER,
    preco_por_kg NUMERIC
);
```

### 4. **impressoras** (Printers)
```sql
CREATE TABLE impressoras (
    id UUID PRIMARY KEY,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    marca_id UUID NOT NULL,
    modelo TEXT,
    valor_equipamento NUMERIC,
    consumo_energia_w INTEGER,
    vida_util_anos INTEGER,
    trabalho_horas_dia INTEGER,
    depreciacao_calculada NUMERIC
);
```

### 5. **produtos** (Products)
```sql
CREATE TABLE produtos (
    id UUID PRIMARY KEY,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    nome_produto TEXT NOT NULL,
    impressora_id UUID,
    filamento_id UUID,
    peso_peca_g NUMERIC NOT NULL,
    tempo_impressao_h NUMERIC NOT NULL,
    percentual_lucro NUMERIC NOT NULL,
    custo_modelagem NUMERIC,
    custos_extras NUMERIC,
    custo_total_calculado NUMERIC,
    preco_venda_calculado NUMERIC,
    descricao TEXT
);
```

### 6. **orcamentos** (Quotes)
```sql
CREATE TABLE orcamentos (
    id UUID PRIMARY KEY,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    nome_cliente TEXT,
    contato_cliente TEXT,
    data_orcamento DATE,
    valor_total_orcamento NUMERIC,
    status_orcamento TEXT
);
```

### 7. **orcamento_itens** (Quote Items)
```sql
CREATE TABLE orcamento_itens (
    id UUID PRIMARY KEY,
    user_id UUID,
    orcamento_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    quantidade INTEGER NOT NULL,
    preco_unitario_no_momento NUMERIC NOT NULL,
    subtotal_item NUMERIC
);
```

### 8. **estoque_filamentos** (Filament Stock)
```sql
CREATE TABLE estoque_filamentos (
    id BIGINT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    filamento_id UUID,
    quantidade_estoque_gramas INTEGER,
    preco_por_kg NUMERIC
);
```

### 9. **configuracoes** (Settings)
```sql
CREATE TABLE configuracoes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    valor_kwh NUMERIC NOT NULL
);
```

### 10. **consumo_filamento_producao** (Filament Consumption)
```sql
CREATE TABLE consumo_filamento_producao (
    id UUID PRIMARY KEY,
    user_id UUID,
    tipo_filamento_id UUID NOT NULL,
    orcamento_item_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    data_consumo TIMESTAMP WITH TIME ZONE,
    quantidade_consumida_g NUMERIC NOT NULL,
    custo_unitario_no_momento_do_consumo_por_g NUMERIC NOT NULL,
    custo_total_do_consumo NUMERIC,
    notas_consumo TEXT
);
```

### 11. **perfil_usuarios** (User Profiles)
```sql
CREATE TABLE perfil_usuarios (
    id UUID PRIMARY KEY,
    perfil TEXT NOT NULL,
    nome_completo TEXT
);
```

## 🔗 Views (Visualizações)

### 1. **v_filamentos_com_estoque** (Filaments with Stock View)
```sql
-- View que combina filamentos com informações de estoque
-- Campos: id, user_id, created_at, marca_id, tipo_id, cor, temperatura_bico_ideal, 
-- temperatura_mesa_ideal, notas_filamento, densidade, modelo, quantidade_estoque_gramas, 
-- preco_por_kg, nome_marca, tipo_nome
```

### 2. **v_produtos_detalhados** (Detailed Products View)
```sql
-- View com produtos e informações detalhadas
-- Campos: id, user_id, created_at, nome_produto, impressora_id, filamento_id, 
-- peso_peca_g, tempo_impressao_h, percentual_lucro, custo_modelagem, custos_extras, 
-- custo_total_calculado, preco_venda_calculado, descricao
```

## 🔗 Relacionamentos

### Chaves Estrangeiras:
- `filamentos.marca_id` → `marcas.id`
- `filamentos.tipo_id` → `tipos_filamentos.id`
- `filamentos.user_id` → `auth.users(id)`
- `impressoras.marca_id` → `marcas.id`
- `impressoras.user_id` → `auth.users(id)`
- `produtos.impressora_id` → `impressoras.id`
- `produtos.filamento_id` → `filamentos.id`
- `produtos.user_id` → `auth.users(id)`
- `orcamentos.user_id` → `auth.users(id)`
- `orcamento_itens.orcamento_id` → `orcamentos.id`
- `orcamento_itens.produto_id` → `produtos.id`
- `orcamento_itens.user_id` → `auth.users(id)`
- `estoque_filamentos.filamento_id` → `filamentos.id`
- `configuracoes.user_id` → `auth.users(id)`
- `consumo_filamento_producao.tipo_filamento_id` → `tipos_filamentos.id`
- `consumo_filamento_producao.orcamento_item_id` → `orcamento_itens.id`
- `consumo_filamento_producao.user_id` → `auth.users(id)`

## 📝 Convenções de Nomenclatura

### Tabelas (sempre em português):
- ✅ `marcas` (não `brands`)
- ✅ `tipos_filamentos` (não `filament_types`)
- ✅ `filamentos` (não `filaments`)
- ✅ `impressoras` (não `printers`)
- ✅ `produtos` (não `products`)
- ✅ `orcamentos` (não `quotes`)
- ✅ `orcamento_itens` (não `quote_items`)
- ✅ `estoque_filamentos` (não `movimentacoes_estoque`)
- ✅ `configuracoes` (não `settings`)
- ✅ `consumo_filamento_producao`
- ✅ `perfil_usuarios`

### Campos (snake_case):
- ✅ `nome_produto`, `tempo_impressao_h`, `peso_peca_g`
- ✅ `nome_marca`, `tipo`, `cor`, `densidade`
- ✅ `nome_cliente`, `contato_cliente`, `data_orcamento`
- ✅ `quantidade_estoque_gramas`, `preco_por_kg`

## 🚨 Pontos de Atenção

1. **SEMPRE** usar nomes de tabelas em português
2. **SEMPRE** verificar se a tabela `estoque_filamentos` existe antes de referenciar
3. **NUNCA** usar nomes em inglês como `filaments`, `brands`, `products`
4. **SEMPRE** usar `filamentos` em vez de `filaments`
5. **SEMPRE** usar `marcas` em vez de `brands`
6. **SEMPRE** usar `produtos` em vez de `products`
7. **SEMPRE** usar `impressoras` em vez de `printers`
8. **ATENÇÃO** aos campos: `nome_produto` (não `nomeProduto`), `peso_peca_g` (não `pesoPecaG`)

## 🔍 Queries Úteis

### Verificar estrutura de uma tabela:
```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'nome_da_tabela' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Verificar dados de uma tabela:
```sql
SELECT COUNT(*) as total_registros FROM nome_da_tabela;
```

### Verificar relacionamentos:
```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='nome_da_tabela';
```

### Listar todas as tabelas:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
``` 