-- Script para inserir dados de teste
-- Execute este script no SQL Editor do Supabase se as tabelas estiverem vazias

-- 1. Inserir marcas de teste
INSERT INTO marcas (nome_marca) VALUES 
    ('Creality'),
    ('Prusa Research'),
    ('Voolt'),
    ('Polymaker'),
    ('Hatchbox')
ON CONFLICT (nome_marca) DO NOTHING;

-- 2. Inserir tipos de filamento de teste
INSERT INTO tipos_filamentos (tipo) VALUES 
    ('PLA'),
    ('ABS'),
    ('PETG'),
    ('TPU'),
    ('PLA+'),
    ('ASA')
ON CONFLICT (tipo) DO NOTHING;

-- 3. Inserir filamentos de teste
INSERT INTO filamentos (tipo_id, cor, densidade, marca_id, modelo, preco_por_kg, quantidade_estoque_gramas) VALUES 
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'PLA'), 'Branco', 1.24, (SELECT id FROM marcas WHERE nome_marca = 'Voolt'), 'Standard', 120.50, 5000),
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'PLA'), 'Preto', 1.24, (SELECT id FROM marcas WHERE nome_marca = 'Voolt'), 'Standard', 120.50, 3000),
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'PETG'), 'Vermelho Translúcido', 1.27, (SELECT id FROM marcas WHERE nome_marca = 'Voolt'), 'Standard', 150.75, 2000),
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'PLA'), 'Azul', 1.24, (SELECT id FROM marcas WHERE nome_marca = 'Creality'), 'Premium', 140.00, 1000),
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'ABS'), 'Cinza', 1.04, (SELECT id FROM marcas WHERE nome_marca = 'Hatchbox'), 'Professional', 180.00, 2500),
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'TPU'), 'Amarelo', 1.21, (SELECT id FROM marcas WHERE nome_marca = 'Polymaker'), 'Flexible', 200.00, 800),
    ((SELECT id FROM tipos_filamentos WHERE tipo = 'PLA+'), 'Verde', 1.24, (SELECT id FROM marcas WHERE nome_marca = 'Prusa Research'), 'Enhanced', 160.00, 1500)
ON CONFLICT DO NOTHING;

-- 4. Verificar se os dados foram inseridos
SELECT 
    'filamentos' as tabela,
    COUNT(*) as total_registros
FROM filamentos;

SELECT 
    'marcas' as tabela,
    COUNT(*) as total_registros
FROM marcas;

SELECT 
    'tipos_filamentos' as tabela,
    COUNT(*) as total_registros
FROM tipos_filamentos;

-- 5. Mostrar alguns filamentos inseridos
SELECT 
    f.id,
    tf.tipo,
    f.cor,
    f.densidade,
    b.nome_marca,
    f.modelo,
    f.preco_por_kg,
    f.quantidade_estoque_gramas
FROM filamentos f
LEFT JOIN marcas b ON f.marca_id = b.id
LEFT JOIN tipos_filamentos tf ON f.tipo_id = tf.id
ORDER BY f.created_at DESC
LIMIT 10; 