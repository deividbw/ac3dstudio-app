-- Script para debugar e verificar os dados dos filamentos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela filamentos existe e tem dados
SELECT 
    'filamentos' as tabela,
    COUNT(*) as total_registros,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VAZIA' END as status
FROM filamentos;

-- 2. Verificar estrutura da tabela filamentos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'filamentos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar dados dos filamentos
SELECT 
    id,
    tipo_id,
    cor,
    densidade,
    marca_id,
    modelo,
    temperatura_bico_ideal,
    temperatura_mesa_ideal,
    preco_por_kg,
    quantidade_estoque_gramas,
    created_at
FROM filamentos
ORDER BY created_at DESC;

-- 4. Verificar se há marcas
SELECT 
    'marcas' as tabela,
    COUNT(*) as total_registros,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VAZIA' END as status
FROM marcas;

-- 5. Verificar dados das marcas
SELECT 
    id,
    nome_marca,
    created_at
FROM marcas
ORDER BY nome_marca;

-- 6. Verificar se há tipos de filamento
SELECT 
    'tipos_filamentos' as tabela,
    COUNT(*) as total_registros,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VAZIA' END as status
FROM tipos_filamentos;

-- 7. Verificar dados dos tipos de filamento
SELECT 
    id,
    tipo,
    created_at
FROM tipos_filamentos
ORDER BY tipo;

-- 8. Testar join entre filamentos e marcas
SELECT 
    f.id,
    tf.tipo,
    f.cor,
    f.densidade,
    f.marca_id,
    b.nome_marca as marca_nome,
    f.modelo,
    f.preco_por_kg,
    f.quantidade_estoque_gramas
FROM filamentos f
LEFT JOIN marcas b ON f.marca_id = b.id
LEFT JOIN tipos_filamentos tf ON f.tipo_id = tf.id
ORDER BY f.created_at DESC;

-- 9. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('filamentos', 'marcas', 'tipos_filamentos')
ORDER BY tablename, policyname;

-- 10. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('filamentos', 'marcas', 'tipos_filamentos')
AND schemaname = 'public'
ORDER BY tablename; 