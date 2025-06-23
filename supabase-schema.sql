-- Script SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de marcas
CREATE TABLE IF NOT EXISTS marcas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome_marca VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID REFERENCES auth.users(id)
);

-- Tabela de tipos de filamento
CREATE TABLE IF NOT EXISTS tipos_filamentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de filamentos
CREATE TABLE IF NOT EXISTS filamentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    tipo_id UUID NOT NULL REFERENCES tipos_filamentos(id),
    cor VARCHAR(100) NOT NULL,
    densidade DECIMAL(5,3) NOT NULL CHECK (densidade > 0),
    marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL,
    modelo VARCHAR(100),
    temperatura_bico_ideal INTEGER,
    temperatura_mesa_ideal INTEGER,
    preco_por_kg DECIMAL(10,2) CHECK (preco_por_kg >= 0),
    quantidade_estoque_gramas INTEGER DEFAULT 0 CHECK (quantidade_estoque_gramas >= 0),
    notas_filamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de impressoras
CREATE TABLE IF NOT EXISTS impressoras (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL,
    modelo VARCHAR(100),
    valor_equipamento DECIMAL(10,2) NOT NULL CHECK (valor_equipamento >= 0),
    consumo_energia_w INT,
    vida_util_anos INTEGER NOT NULL CHECK (vida_util_anos > 0),
    trabalho_horas_dia INTEGER NOT NULL CHECK (trabalho_horas_dia > 0),
    depreciacao_calculada DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    nome_produto VARCHAR(200) NOT NULL,
    descricao TEXT,
    filamento_id UUID NOT NULL REFERENCES filamentos(id),
    impressora_id UUID NOT NULL REFERENCES impressoras(id),
    tempo_impressao_h DECIMAL(5,2) NOT NULL CHECK (tempo_impressao_h > 0),
    peso_peca_g INTEGER NOT NULL CHECK (peso_peca_g > 0),
    image_url TEXT,
    custo_modelagem DECIMAL(10,2) DEFAULT 0 CHECK (custo_modelagem >= 0),
    custos_extras DECIMAL(10,2) DEFAULT 0 CHECK (custos_extras >= 0),
    percentual_lucro DECIMAL(5,2) DEFAULT 20 CHECK (percentual_lucro >= 0),
    custo_total_calculado DECIMAL(10,2),
    preco_venda_calculado DECIMAL(10,2),
    custo_detalhado JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    nome_orcamento VARCHAR(200) NOT NULL,
    cliente_nome VARCHAR(200) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovado', 'Rejeitado', 'Concluído')),
    observacao TEXT,
    valor_total_calculado DECIMAL(10,2) DEFAULT 0 CHECK (valor_total_calculado >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens do orçamento
CREATE TABLE IF NOT EXISTS orcamento_itens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id),
    produto_nome VARCHAR(200) NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
    valor_total_item DECIMAL(10,2) NOT NULL CHECK (valor_total_item >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_marcas_updated_at BEFORE UPDATE ON marcas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tipos_filamentos_updated_at BEFORE UPDATE ON tipos_filamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_filamentos_updated_at BEFORE UPDATE ON filamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_impressoras_updated_at BEFORE UPDATE ON impressoras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orcamento_itens_updated_at BEFORE UPDATE ON orcamento_itens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO marcas (nome_marca) VALUES 
    ('Creality'),
    ('Prusa Research'),
    ('Voolt')
ON CONFLICT (nome_marca) DO NOTHING;

INSERT INTO tipos_filamentos (tipo) VALUES 
    ('PLA'),
    ('ABS'),
    ('PETG'),
    ('TPU')
ON CONFLICT (tipo) DO NOTHING;

INSERT INTO filamentos (tipo_id, cor, densidade, marca_id, modelo, preco_por_kg, quantidade_estoque_gramas) VALUES 
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'PLA'), 'Branco', 1.24, (SELECT id FROM marcas WHERE nome_marca = 'Voolt'), 'Standard', 120.50, 5000),
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'PLA'), 'Preto', 1.24, (SELECT id FROM marcas WHERE nome_marca = 'Voolt'), 'Standard', 120.50, 3000),
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'PETG'), 'Vermelho Translúcido', 1.27, (SELECT id FROM marcas WHERE nome_marca = 'Voolt'), 'Standard', 150.75, 2000)
ON CONFLICT DO NOTHING;

INSERT INTO impressoras (marca_id, modelo, valor_equipamento, vida_util_anos, trabalho_horas_dia) VALUES 
    ((SELECT id FROM marcas WHERE nome_marca = 'Creality'), 'Ender 3 V2', 1500.00, 3, 8),
    ((SELECT id FROM marcas WHERE nome_marca = 'Prusa Research'), 'MK3S+', 3000.00, 5, 8)
ON CONFLICT DO NOTHING;

-- Configuração de Row Level Security (RLS) para as tabelas principais
-- Habilitar RLS nas tabelas
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_filamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE filamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE impressoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;

-- Políticas para marcas
CREATE POLICY "Permitir acesso total para usuários autenticados" ON marcas
    FOR ALL TO authenticated USING (true);

-- Políticas para tipos_filamentos
CREATE POLICY "Permitir acesso total para usuários autenticados" ON tipos_filamentos
    FOR ALL TO authenticated USING (true);

-- Políticas para filamentos
CREATE POLICY "Permitir acesso total para usuários autenticados" ON filamentos
    FOR ALL TO authenticated USING (true);

-- Políticas para impressoras
CREATE POLICY "Permitir acesso total para usuários autenticados" ON impressoras
    FOR ALL TO authenticated USING (true);

-- Políticas para produtos
CREATE POLICY "Permitir acesso total para usuários autenticados" ON produtos
    FOR ALL TO authenticated USING (true);

-- Políticas para orcamentos
CREATE POLICY "Permitir acesso total para usuários autenticados" ON orcamentos
    FOR ALL TO authenticated USING (true);

-- Políticas para orcamento_itens
CREATE POLICY "Permitir acesso total para usuários autenticados" ON orcamento_itens
    FOR ALL TO authenticated USING (true); 