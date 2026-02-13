import Products from "./pages/Products";
import RawMaterials from "./pages/RawMaterials";
import Production from "./pages/Production";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function App() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-3 p-3 sm:gap-4 sm:p-4">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Autoflex Stock Control</h1>
        <p className="text-sm text-muted-foreground">Frontend (RF005–RF008)</p>
      </div>

      <Card className="p-2 sm:p-3">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 sm:grid-cols-3">
            <TabsTrigger value="products" className="w-full">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="raw" className="w-full">
              Matérias-Primas
            </TabsTrigger>
            <TabsTrigger value="production" className="w-full">
              Produção
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-3 sm:mt-4">
            <Products />
          </TabsContent>

          <TabsContent value="raw" className="mt-3 sm:mt-4">
            <RawMaterials />
          </TabsContent>

          <TabsContent value="production" className="mt-3 sm:mt-4">
            <Production />
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}
