
"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, ExternalLink } from 'lucide-react';

interface ProductDisplayCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAddedToCart: boolean;
}

export function ProductDisplayCard({ product, onAddToCart, isAddedToCart }: ProductDisplayCardProps) {
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'Preço sob consulta';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0 relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.imageUrl || "https://placehold.co/400x300.png"}
          alt={product.nome}
          layout="fill"
          objectFit="cover"
          data-ai-hint="product 3dprint"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">{product.nome}</CardTitle>
        {product.descricao && (
          <CardDescription className="text-xs text-muted-foreground mb-2 line-clamp-3 flex-grow">
            {product.descricao}
          </CardDescription>
        )}
        <p className="text-xl font-bold text-primary mt-auto pt-2">
          {formatCurrency(product.custoDetalhado?.precoVendaCalculado)}
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button
          className="w-full"
          onClick={() => onAddToCart(product)}
          disabled={isAddedToCart}
          variant={isAddedToCart ? "secondary" : "default"}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAddedToCart ? "Adicionado" : "Adicionar ao Orçamento"}
        </Button>
      </CardFooter>
    </Card>
  );
}
