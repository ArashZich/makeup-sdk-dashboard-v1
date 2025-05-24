// src/features/sdk/components/SdkIntegrationCard.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useClipboard } from "@/hooks/useClipboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Copy, Check, ExternalLink, Info, BookOpen } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

interface SdkIntegrationCardProps {
  token: string;
  className?: string;
}

export function SdkIntegrationCard({
  token,
  className,
}: SdkIntegrationCardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("setup");
  const { isCopied, copyToClipboard } = useClipboard({
    successMessage: t("common.copied"),
  });

  // کد HTML برای اضافه کردن به index
  const htmlCode = `<!-- اضافه کردن این خطوط به head سند HTML -->
<link rel="stylesheet" href="https://sdk.armogroup.tech/makeup/v2/makeup.min.css">
<script src="https://sdk.armogroup.tech/makeup/v2/makeup.js"></script>`;

  // کد HTML برای div
  const divCode = `<!-- اضافه کردن این div به جایی که می‌خواهید SDK نمایش داده شود -->
<div id="armo-makeup-view"></div>`;

  // کد JavaScript برای راه‌اندازی
  const jsCode = `// تنظیم توکن SDK
window.Makeup.token = "${token}";

// ایجاد نمونه SDK آرایش با تنظیمات پیش‌فرض
const makeupApp = new window.Makeup({
  productUid: "YOUR_PRODUCT_UID", // UID محصول خود را اینجا قرار دهید
  onReady: () => {
    console.log("SDK آماده شد");
    const availableFeatures = makeupApp.getAvailableFeatures();
    console.log("ویژگی‌های فعال:", availableFeatures);
  },
  onError: (error) => {
    console.error("خطای SDK:", error);
  },
});`;

  // کد React برای پیاده‌سازی
  const reactCode = `import { useEffect, useRef } from 'react';

function MakeupComponent({ productUid }) {
  const makeupRef = useRef(null);

  useEffect(() => {
    // بررسی وجود SDK در window
    if (window.Makeup) {
      // تنظیم توکن
      window.Makeup.token = "${token}";

      // ایجاد نمونه SDK
      const makeupApp = new window.Makeup({
        productUid: productUid,
        container: makeupRef.current, // استفاده از ref
        onReady: () => {
          console.log("SDK آماده شد");
        },
        onError: (error) => {
          console.error("خطای SDK:", error);
        },
      });

      // پاکسازی هنگام unmount
      return () => {
        if (makeupApp && makeupApp.destroy) {
          makeupApp.destroy();
        }
      };
    }
  }, [productUid]);

  return <div id="armo-makeup-view" ref={makeupRef}></div>;
}`;

  const handleCopyCode = (code: string) => {
    copyToClipboard(code);
  };

  const CodeBlock = ({
    code,
    language = "html",
  }: {
    code: string;
    language?: string;
  }) => (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-xs">
          {language.toUpperCase()}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopyCode(code)}
          className="h-6 text-xs"
        >
          {isCopied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {isCopied ? t("common.copied") : t("common.copy")}
        </Button>
      </div>
      <div className="rounded-md overflow-hidden">
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            fontSize: "0.875rem",
            lineHeight: "1.5",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          {t("sdk.integration.title")}
        </CardTitle>
        <CardDescription>{t("sdk.integration.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup" className="text-xs">
              {t("sdk.integration.setup")}
            </TabsTrigger>
            <TabsTrigger value="html" className="text-xs">
              HTML
            </TabsTrigger>
            <TabsTrigger value="javascript" className="text-xs">
              JavaScript
            </TabsTrigger>
            <TabsTrigger value="react" className="text-xs">
              React
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t("sdk.integration.setupDescription")}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t("sdk.integration.step1")}
                </h4>
                <CodeBlock code={htmlCode} language="html" />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t("sdk.integration.step2")}
                </h4>
                <CodeBlock code={divCode} language="html" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t("sdk.integration.htmlDescription")}
              </AlertDescription>
            </Alert>
            <CodeBlock code={htmlCode} language="html" />
          </TabsContent>

          <TabsContent value="javascript" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t("sdk.integration.jsDescription")}
              </AlertDescription>
            </Alert>
            <CodeBlock code={jsCode} language="javascript" />
          </TabsContent>

          <TabsContent value="react" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t("sdk.integration.reactDescription")}
              </AlertDescription>
            </Alert>
            <CodeBlock code={reactCode} language="jsx" />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button asChild className="flex-1">
            <a
              href="https://sdk.armogroup.tech/makeup/guide-v2/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              {t("sdk.integration.viewDocs")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <a
              href="https://makeup.armogroup.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              {t("sdk.integration.examples")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
