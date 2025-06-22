-- Script SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de marcas
CREATE TABLE IF NOT EXISTS brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tipos de filamento
CREATE TABLE IF NOT EXISTS filament_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de filamentos
CREATE TABLE IF NOT EXISTS filaments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    cor VARCHAR(100) NOT NULL,
    densidade DECIMAL(5,3) NOT NULL CHECK (densidade > 0),
    marca_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    modelo VARCHAR(100),
    temperatura_bico_ideal INTEGER,
    temperatura_mesa_ideal INTEGER,
    preco_por_kg DECIMAL(10,2) CHECK (preco_por_kg >= 0),
    quantidade_estoque_gramas INTEGER DEFAULT 0 CHECK (quantidade_estoque_gramas >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de impressoras
CREATE TABLE IF NOT EXISTS printers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    marca_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    modelo VARCHAR(100),
    custo_aquisicao DECIMAL(10,2) NOT NULL CHECK (custo_aquisicao >= 0),
    taxa_depreciacao_hora DECIMAL(10,2) NOT NULL CHECK (taxa_depreciacao_hora >= 0),
    vida_util_anos INTEGER NOT NULL CHECK (vida_util_anos > 0),
    horas_trabalho_dia INTEGER NOT NULL CHECK (horas_trabalho_dia > 0),
    custo_energia_kwh DECIMAL(10,4) CHECK (custo_energia_kwh >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    filamento_id UUID NOT NULL REFERENCES filaments(id) ON DELETE CASCADE,
    impressora_id UUID NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
    tempo_impressao_horas DECIMAL(5,2) NOT NULL CHECK (tempo_impressao_horas > 0),
    peso_gramas INTEGER NOT NULL CHECK (peso_gramas > 0),
    image_url TEXT,
    custo_modelagem DECIMAL(10,2) DEFAULT 0 CHECK (custo_modelagem >= 0),
    custos_extras DECIMAL(10,2) DEFAULT 0 CHECK (custos_extras >= 0),
    margem_lucro_percentual DECIMAL(5,2) DEFAULT 20 CHECK (margem_lucro_percentual >= 0),
    custo_detalhado JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS orcamento_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    produto_nome VARCHAR(200) NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
    valor_total_item DECIMAL(10,2) NOT NULL CHECK (valor_total_item >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de power overrides
CREATE TABLE IF NOT EXISTS power_overrides (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    printer_id UUID NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
    printer_name VARCHAR(200) NOT NULL,
    filament_type_id UUID NOT NULL REFERENCES filament_types(id) ON DELETE CASCADE,
    filament_type_name VARCHAR(200) NOT NULL,
    power_watts INTEGER NOT NULL CHECK (power_watts > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(printer_id, filament_type_id)
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
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_filament_types_updated_at BEFORE UPDATE ON filament_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_filaments_updated_at BEFORE UPDATE ON filaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_printers_updated_at BEFORE UPDATE ON printers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orcamento_items_updated_at BEFORE UPDATE ON orcamento_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_power_overrides_updated_at BEFORE UPDATE ON power_overrides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO brands (nome) VALUES 
    ('Creality'),
    ('Prusa Research'),
    ('Voolt')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO filament_types (nome) VALUES 
    ('PLA'),
    ('ABS'),
    ('PETG'),
    ('TPU')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO filaments (tipo, cor, densidade, marca_id, modelo, preco_por_kg, quantidade_estoque_gramas) VALUES 
    ('PLA', 'Branco', 1.24, (SELECT id FROM brands WHERE nome = 'Voolt'), 'Standard', 120.50, 5000),
    ('PLA', 'Preto', 1.24, (SELECT id FROM brands WHERE nome = 'Voolt'), 'Standard', 120.50, 3000),
    ('PETG', 'Vermelho Translúcido', 1.27, (SELECT id FROM brands WHERE nome = 'Voolt'), 'Standard', 150.75, 2000)
ON CONFLICT DO NOTHING;

INSERT INTO printers (marca_id, modelo, custo_aquisicao, taxa_depreciacao_hora, vida_util_anos, horas_trabalho_dia, custo_energia_kwh) VALUES 
    ((SELECT id FROM brands WHERE nome = 'Creality'), 'Ender 3 V2', 1500.00, 0.65, 3, 8, 0.75),
    ((SELECT id FROM brands WHERE nome = 'Prusa Research'), 'MK3S+', 3000.00, 1.00, 5, 8, 0.75)
ON CONFLICT DO NOTHING; 