// Exemplo de componente React básico
// Em uma aplicação Next.js, componentes geralmente ficam na estrutura de diretórios src/components ou src/app.
import React from 'react';

interface IndexComponentProps {
  message?: string;
}

const IndexComponent: React.FC<IndexComponentProps> = ({ message = "Olá do Componente TSX!" }) => {
  return (
    <div style={{ border: '1px solid #FFB347', padding: '10px', borderRadius: '5px', backgroundColor: '#fff', marginTop: '20px' }}>
      <h2>Componente React TSX</h2>
      <p>{message}</p>
    </div>
  );
};

export default IndexComponent;

// Para usar este componente em uma página Next.js (ex: src/app/page.tsx):
// import IndexComponent from '../../index'; // Ajuste o caminho conforme necessário, se este arquivo estiver na raiz.
//
// export default function HomePage() {
//   return (
//     <div>
//       {/* Outro conteúdo da página */}
//       <IndexComponent message="Bem-vindo ao app!" />
//     </div>
//   );
// }
