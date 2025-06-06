import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Layers, Printer, Package, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Painel Principal" />
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Bem-vindo ao 3D Budgeteer!</CardTitle>
            <CardDescription>
              Gerencie seus filamentos, impressoras e produtos para calcular custos de impressão 3D de forma eficiente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Utilize o menu lateral para navegar pelas seções do aplicativo.</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">Filamentos</CardTitle>
              <Layers className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Cadastre e gerencie os tipos de filamentos, seus custos e propriedades.
              </p>
              <Button asChild variant="outline" className="w-full hover:bg-accent hover:text-accent-foreground">
                <Link href="/filaments">Gerenciar Filamentos <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">Impressoras</CardTitle>
              <Printer className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Mantenha um registro das suas impressoras, seus custos operacionais e depreciação.
              </p>
              <Button asChild variant="outline" className="w-full hover:bg-accent hover:text-accent-foreground">
                <Link href="/printers">Gerenciar Impressoras <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">Produtos</CardTitle>
              <Package className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Cadastre produtos, associe materiais e calcule os custos de impressão detalhadamente.
              </p>
              <Button asChild variant="outline" className="w-full hover:bg-accent hover:text-accent-foreground">
                <Link href="/products">Gerenciar Produtos <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
