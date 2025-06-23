#!/usr/bin/env node

/**
 * Script para validar se o código está usando os nomes corretos das tabelas
 * Execute com: node scripts/validate-database-names.js
 */

const fs = require('fs');
const path = require('path');

// Nomes corretos das tabelas (em português) - baseado no esquema real
const CORRECT_TABLE_NAMES = {
  'marcas': 'marcas',
  'tipos_filamentos': 'tipos_filamentos', 
  'filamentos': 'filamentos',
  'impressoras': 'impressoras',
  'produtos': 'produtos',
  'orcamentos': 'orcamentos',
  'orcamento_itens': 'orcamento_itens',
  'estoque_filamentos': 'estoque_filamentos',
  'configuracoes': 'configuracoes',
  'consumo_filamento_producao': 'consumo_filamento_producao',
  'perfil_usuarios': 'perfil_usuarios'
};

// Nomes corretos das views
const CORRECT_VIEW_NAMES = {
  'v_filamentos_com_estoque': 'v_filamentos_com_estoque',
  'v_produtos_detalhados': 'v_produtos_detalhados'
};

// Nomes incorretos que devem ser evitados (em inglês)
const INCORRECT_TABLE_NAMES = [
  'brands',
  'filament_types', 
  'filaments',
  'printers',
  'products',
  'quotes',
  'quote_items',
  'movimentacoes_estoque',
  'settings',
  'power_overrides'
];

// Campos incorretos que devem ser evitados
const INCORRECT_FIELD_NAMES = [
  'nomeProduto', // deveria ser 'nome_produto'
  'tempoImpressaoH', // deveria ser 'tempo_impressao_h'
  'pesoPecaG', // deveria ser 'peso_peca_g'
  'nomeOrcamento', // deveria ser 'nome_orcamento'
  'clienteNome', // deveria ser 'cliente_nome'
  'dataCriacao', // deveria ser 'data_criacao'
  'valorTotalCalculado', // deveria ser 'valor_total_calculado'
  'custoModelagem', // deveria ser 'custo_modelagem'
  'custosExtras', // deveria ser 'custos_extras'
  'percentualLucro', // deveria ser 'percentual_lucro'
  'custoTotalCalculado', // deveria ser 'custo_total_calculado'
  'precoVendaCalculado', // deveria ser 'preco_venda_calculado'
  'orcamento_items' // deveria ser 'orcamento_itens'
];

// Extensões de arquivo para verificar
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.sql'];

// Diretórios para ignorar
const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build'];

function findFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.includes(item)) {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Verificar nomes incorretos de tabelas
  for (const incorrectName of INCORRECT_TABLE_NAMES) {
    const regex = new RegExp(`\\b${incorrectName}\\b`, 'gi');
    const matches = content.match(regex);
    
    if (matches) {
      issues.push({
        type: 'INCORRECT_TABLE_NAME',
        message: `Nome de tabela incorreto encontrado: "${incorrectName}"`,
        suggestions: getTableSuggestions(incorrectName),
        matches: matches.length
      });
    }
  }
  
  // Verificar nomes incorretos de campos
  for (const incorrectField of INCORRECT_FIELD_NAMES) {
    const regex = new RegExp(`\\b${incorrectField}\\b`, 'gi');
    const matches = content.match(regex);
    
    if (matches) {
      issues.push({
        type: 'INCORRECT_FIELD_NAME',
        message: `Nome de campo incorreto encontrado: "${incorrectField}"`,
        suggestions: getFieldSuggestions(incorrectField),
        matches: matches.length
      });
    }
  }
  
  // Verificar se há referências a tabelas que podem não existir
  const tableReferences = content.match(/\.from\(['"`]([^'"`]+)['"`]\)/g);
  if (tableReferences) {
    for (const ref of tableReferences) {
      const tableName = ref.match(/\.from\(['"`]([^'"`]+)['"`]\)/)?.[1];
      if (tableName && !CORRECT_TABLE_NAMES[tableName] && !CORRECT_VIEW_NAMES[tableName] && !tableName.startsWith('auth.')) {
        issues.push({
          type: 'UNKNOWN_TABLE',
          message: `Referência a tabela/view desconhecida: "${tableName}"`,
          suggestions: [`Verifique se a tabela/view "${tableName}" existe no banco de dados`]
        });
      }
    }
  }
  
  return issues;
}

function getTableSuggestions(incorrectName) {
  const suggestions = {
    'brands': 'Use "marcas" em vez de "brands"',
    'filament_types': 'Use "tipos_filamentos" em vez de "filament_types"',
    'filaments': 'Use "filamentos" em vez de "filaments"',
    'printers': 'Use "impressoras" em vez de "printers"',
    'products': 'Use "produtos" em vez de "products"',
    'quotes': 'Use "orcamentos" em vez de "quotes"',
    'quote_items': 'Use "orcamento_itens" em vez de "quote_items"',
    'movimentacoes_estoque': 'Use "estoque_filamentos" em vez de "movimentacoes_estoque"',
    'settings': 'Use "configuracoes" em vez de "settings"',
    'power_overrides': 'Esta tabela não existe no esquema atual'
  };
  
  return [suggestions[incorrectName] || `Verifique o nome correto da tabela "${incorrectName}"`];
}

function getFieldSuggestions(incorrectField) {
  const suggestions = {
    'nomeProduto': 'Use "nome_produto" em vez de "nomeProduto"',
    'tempoImpressaoH': 'Use "tempo_impressao_h" em vez de "tempoImpressaoH"',
    'pesoPecaG': 'Use "peso_peca_g" em vez de "pesoPecaG"',
    'nomeOrcamento': 'Use "nome_orcamento" em vez de "nomeOrcamento"',
    'clienteNome': 'Use "cliente_nome" em vez de "clienteNome"',
    'dataCriacao': 'Use "data_criacao" em vez de "dataCriacao"',
    'valorTotalCalculado': 'Use "valor_total_calculado" em vez de "valorTotalCalculado"',
    'custoModelagem': 'Use "custo_modelagem" em vez de "custoModelagem"',
    'custosExtras': 'Use "custos_extras" em vez de "custosExtras"',
    'percentualLucro': 'Use "percentual_lucro" em vez de "percentualLucro"',
    'custoTotalCalculado': 'Use "custo_total_calculado" em vez de "custoTotalCalculado"',
    'precoVendaCalculado': 'Use "preco_venda_calculado" em vez de "precoVendaCalculado"',
    'orcamento_items': 'Use "orcamento_itens" em vez de "orcamento_items"'
  };
  
  return [suggestions[incorrectField] || `Verifique o nome correto do campo "${incorrectField}"`];
}

function main() {
  console.log('🔍 Validando nomes de tabelas e campos no código...\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const files = findFiles(projectRoot, FILE_EXTENSIONS);
  
  let totalIssues = 0;
  let filesWithIssues = 0;
  
  for (const file of files) {
    const issues = checkFile(file);
    
    if (issues.length > 0) {
      filesWithIssues++;
      const relativePath = path.relative(projectRoot, file);
      console.log(`❌ ${relativePath}:`);
      
      for (const issue of issues) {
        totalIssues++;
        console.log(`   ${issue.type}: ${issue.message}`);
        if (issue.suggestions) {
          for (const suggestion of issue.suggestions) {
            console.log(`     💡 ${suggestion}`);
          }
        }
        if (issue.matches) {
          console.log(`     📊 Encontrado ${issue.matches} vez(es)`);
        }
      }
      console.log('');
    }
  }
  
  if (totalIssues === 0) {
    console.log('✅ Nenhum problema encontrado! Todos os nomes de tabelas e campos estão corretos.');
  } else {
    console.log(`📊 Resumo:`);
    console.log(`   - Arquivos com problemas: ${filesWithIssues}`);
    console.log(`   - Total de problemas: ${totalIssues}`);
    console.log(`\n💡 Dica: Consulte o arquivo DATABASE_SCHEMA.md para ver os nomes corretos das tabelas e campos.`);
    console.log(`📋 Tabelas disponíveis: ${Object.keys(CORRECT_TABLE_NAMES).join(', ')}`);
    console.log(`👁️ Views disponíveis: ${Object.keys(CORRECT_VIEW_NAMES).join(', ')}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, findFiles, CORRECT_TABLE_NAMES, CORRECT_VIEW_NAMES, INCORRECT_TABLE_NAMES, INCORRECT_FIELD_NAMES }; 