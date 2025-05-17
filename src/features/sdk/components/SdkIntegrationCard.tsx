// src/features/sdk/components/SdkIntegrationCard.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard"; // استفاده از هوک جدید

interface SdkIntegrationCardProps {
  token: string;
}

export function SdkIntegrationCard({ token }: SdkIntegrationCardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("html");

  // استفاده از هوک useClipboard برای کپی کد
  const { isCopied, copyToClipboard } = useClipboard({
    successMessage: t("sdk.codeCopied"),
    timeout: 2000,
  });

  // کد‌های نمونه برای یکپارچه‌سازی
  const sampleCodes = {
    html: `<!-- Add to your HTML head section -->
<script src="https://cdn.makeupvirtualsdk.com/sdk.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const sdk = new MakeupVirtualSDK({
      token: '${token}',
      container: '#makeup-container'
    });
    sdk.init();
  });
</script>`,
    javascript: `// JavaScript / React example
import { MakeupVirtualSDK } from '@makeupvirtual/sdk';

// Initialize in your component
const initSDK = () => {
  const sdk = new MakeupVirtualSDK({
    token: '${token}',
    container: '#makeup-container'
  });
  sdk.init();
};

// Call initSDK when your component mounts`,
    nodejs: `// Node.js server-side example
const { MakeupSDKServer } = require('@makeupvirtual/sdk-server');

const sdk = new MakeupSDKServer({
  token: '${token}'
});

// Validate token
sdk.validateToken()
  .then(response => {
    console.log('Token is valid:', response.isValid);
  })
  .catch(error => {
    console.error('Token validation failed:', error);
  });`,
  };

  const handleCopy = () => {
    copyToClipboard(sampleCodes[activeTab as keyof typeof sampleCodes]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("sdk.integrationGuide")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="html"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="nodejs">Node.js</TabsTrigger>
          </TabsList>
          <div className="relative mt-4">
            <TabsContent value="html" className="mt-0">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                <code>{sampleCodes.html}</code>
              </pre>
            </TabsContent>
            <TabsContent value="javascript" className="mt-0">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                <code>{sampleCodes.javascript}</code>
              </pre>
            </TabsContent>
            <TabsContent value="nodejs" className="mt-0">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                <code>{sampleCodes.nodejs}</code>
              </pre>
            </TabsContent>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="absolute top-2 right-2 h-8 w-8"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Tabs>
        <p className="text-sm text-muted-foreground mt-4">
          {t("sdk.integrationGuideDescription")}
        </p>
      </CardContent>
    </Card>
  );
}
