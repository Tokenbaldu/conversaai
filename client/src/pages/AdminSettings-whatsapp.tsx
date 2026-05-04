// This is a tab content to be added to AdminSettings.tsx
// Add this to the Tabs component after the general tab

{/* WhatsApp */}
<TabsContent value="whatsapp" className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle>Configuração do WhatsApp</CardTitle>
      <CardDescription>Gerencie o link do WhatsApp de suporte flutuante</CardDescription>
    </CardHeader>
    <CardContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Use settings router to update WhatsApp link
          updateWhatsAppMutation.mutate({
            whatsappSupportLink: siteSettings.whatsappSupportLink,
          });
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="whatsappLink">Link do WhatsApp de Suporte</Label>
          <Input
            id="whatsappLink"
            value={siteSettings.whatsappSupportLink}
            onChange={(e) => setSiteSettings({ ...siteSettings, whatsappSupportLink: e.target.value })}
            placeholder="https://wa.me/5511999999999 ou +55 11 99999-9999"
            type="text"
          />
          <p className="text-xs text-gray-500 mt-2">
            Exemplo: https://wa.me/5511999999999 ou apenas o número com código do país
          </p>
        </div>

        <Button type="submit" disabled={updateWhatsAppMutation.isPending} className="w-full">
          {updateWhatsAppMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar Link do WhatsApp
        </Button>
      </form>
    </CardContent>
  </Card>
</TabsContent>
