// src/features/admin/plans/components/PlanForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plan, CreatePlanRequest, UpdatePlanRequest } from "@/api/types/plans.types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader } from "@/components/common/Loader";
import { Plus, Minus, Check } from "lucide-react";

// اسکیما برای اعتبارسنجی فرم
const planSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().min(0, { message: "Price cannot be negative" }),
  duration: z.coerce.number().min(1, { message: "Duration must be at least 1 day" }),
  features: z.array(z.string()),
  requestLimit: z.object({
    monthly: z.coerce.number().min(1, { message: "Monthly limit must be at least 1" }),
    total: z.coerce.number().min(1, { message: "Total limit must be at least 1" }),
  }),
  defaultSdkFeatures: z.object({
    features: z.array(z.string()),
    patterns: z.record(z.array(z.string())),
    mediaFeatures: z.object({
      allowedSources: z.array(z.string()),
      allowedViews: z.array(z.string()),
      comparisonModes: z.array(z.string()),
    }).optional(),
  }),
  active: z.boolean(),
  specialOffer: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  plan?: Plan;
  isSubmitting: boolean;
  onSubmit: (data: CreatePlanRequest | UpdatePlanRequest) => void;
}

export function PlanForm({ plan, isSubmitting, onSubmit }: PlanFormProps) {
  const { t } = useLanguage();
  const [featureInput, setFeatureInput] = useState("");
  const [sdkFeatureInput, setSdkFeatureInput] = useState("");
  const [patternKeyInput, setPatternKeyInput] = useState("");
  const [patternValueInput, setPatternValueInput] = useState("");
  const [mediaSourceInput, setMediaSourceInput] = useState("");
  const [mediaViewInput, setMediaViewInput] = useState("");
  const [comparisonModeInput, setComparisonModeInput] = useState("");

  // تنظیم مقادیر پیش‌فرض برای فرم
  const defaultValues: PlanFormValues = {
    name: plan?.name || "",
    description: plan?.description || "",
    price: plan?.price || 0,
    duration: plan?.duration || 30,
    features: plan?.features || [],
    requestLimit: {
      monthly: plan?.requestLimit?.monthly || 1000,
      total: plan?.requestLimit?.total || 30000,
    },
    defaultSdkFeatures: {
      features: plan?.defaultSdkFeatures?.features || [],
      patterns: plan?.defaultSdkFeatures?.patterns || {},
      mediaFeatures: {
        allowedSources: plan?.defaultSdkFeatures?.mediaFeatures?.allowedSources || [],
        allowedViews: plan?.defaultSdkFeatures?.mediaFeatures?.allowedViews || [],
        comparisonModes: plan?.defaultSdkFeatures?.mediaFeatures?.comparisonModes || [],
      },
    },
    active: plan?.active !== undefined ? plan.active : true,
    specialOffer: plan?.specialOffer || false,
  };

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  // منطق افزودن ویژگی عادی
  const handleFeatureAdd = () => {
    if (!featureInput.trim()) return;
    
    const currentFeatures = form.getValues("features") || [];
    
    // بررسی تکراری بودن
    if (currentFeatures.includes(featureInput)) {
      form.setError("features", {
        type: "manual",
        message: t("plans.featureExists"),
      });
      return;
    }

    form.setValue("features", [...currentFeatures, featureInput]);
    setFeatureInput("");
    form.clearErrors("features");
  };

  // منطق حذف ویژگی عادی
  const handleFeatureRemove = (feature: string) => {
    const currentFeatures = form.getValues("features") || [];
    form.setValue(
      "features",
      currentFeatures.filter((f) => f !== feature)
    );
  };

  // منطق افزودن ویژگی SDK
  const handleSdkFeatureAdd = () => {
    if (!sdkFeatureInput.trim()) return;
    
    const currentFeatures = form.getValues("defaultSdkFeatures.features") || [];
    
    // بررسی تکراری بودن
    if (currentFeatures.includes(sdkFeatureInput)) {
      form.setError("defaultSdkFeatures.features", {
        type: "manual",
        message: t("plans.featureExists"),
      });
      return;
    }

    form.setValue("defaultSdkFeatures.features", [...currentFeatures, sdkFeatureInput]);
    setSdkFeatureInput("");
    form.clearErrors("defaultSdkFeatures.features");
  };

  // منطق حذف ویژگی SDK
  const handleSdkFeatureRemove = (feature: string) => {
    const currentFeatures = form.getValues("defaultSdkFeatures.features") || [];
    form.setValue(
      "defaultSdkFeatures.features",
      currentFeatures.filter((f) => f !== feature)
    );
  };

  // منطق افزودن الگو (pattern)
  const handlePatternAdd = () => {
    if (!patternKeyInput.trim() || !patternValueInput.trim()) return;
    
    const currentPatterns = form.getValues("defaultSdkFeatures.patterns") || {};
    
    // اگر کلید وجود ندارد، یک آرایه جدید ایجاد می‌کنیم
    if (!currentPatterns[patternKeyInput]) {
      currentPatterns[patternKeyInput] = [];
    }
    
    // بررسی تکراری بودن مقدار
    if (currentPatterns[patternKeyInput].includes(patternValueInput)) {
      form.setError("defaultSdkFeatures.patterns", {
        type: "manual",
        message: t("plans.patternValueExists"),
      });
      return;
    }
    
    // افزودن مقدار به آرایه متناظر با کلید
    currentPatterns[patternKeyInput].push(patternValueInput);
    
    form.setValue("defaultSdkFeatures.patterns", { ...currentPatterns });
    setPatternValueInput("");
    form.clearErrors("defaultSdkFeatures.patterns");
  };

  // منطق حذف الگو (pattern)
  const handlePatternRemove = (key: string, value: string) => {
    const currentPatterns = form.getValues("defaultSdkFeatures.patterns") || {};
    
    if (currentPatterns[key]) {
      // حذف مقدار از آرایه
      currentPatterns[key] = currentPatterns[key].filter((v) => v !== value);
      
      // اگر آرایه خالی شد، کلید را هم حذف می‌کنیم
      if (currentPatterns[key].length === 0) {
        delete currentPatterns[key];
      }
      
      form.setValue("defaultSdkFeatures.patterns", { ...currentPatterns });
    }
  };

  // منطق افزودن منبع مدیا
  const handleMediaSourceAdd = () => {
    if (!mediaSourceInput.trim()) return;
    
    const currentSources = form.getValues("defaultSdkFeatures.mediaFeatures.allowedSources") || [];
    
    // بررسی تکراری بودن
    if (currentSources.includes(mediaSourceInput)) {
      form.setError("defaultSdkFeatures.mediaFeatures.allowedSources", {
        type: "manual",
        message: t("plans.sourceExists"),
      });
      return;
    }

    form.setValue("defaultSdkFeatures.mediaFeatures.allowedSources", [...currentSources, mediaSourceInput]);
    setMediaSourceInput("");
    form.clearErrors("defaultSdkFeatures.mediaFeatures.allowedSources");
  };

  // منطق حذف منبع مدیا
  const handleMediaSourceRemove = (source: string) => {
    const currentSources = form.getValues("defaultSdkFeatures.mediaFeatures.allowedSources") || [];
    form.setValue(
      "defaultSdkFeatures.mediaFeatures.allowedSources",
      currentSources.filter((s) => s !== source)
    );
  };

  // منطق افزودن نمای مدیا
  const handleMediaViewAdd = () => {
    if (!mediaViewInput.trim()) return;
    
    const currentViews = form.getValues("defaultSdkFeatures.mediaFeatures.allowedViews") || [];
    
    // بررسی تکراری بودن
    if (currentViews.includes(mediaViewInput)) {
      form.setError("defaultSdkFeatures.mediaFeatures.allowedViews", {
        type: "manual",
        message: t("plans.viewExists"),
      });
      return;
    }

    form.setValue("defaultSdkFeatures.mediaFeatures.allowedViews", [...currentViews, mediaViewInput]);
    setMediaViewInput("");
    form.clearErrors("defaultSdkFeatures.mediaFeatures.allowedViews");
  };

  // منطق حذف نمای مدیا
  const handleMediaViewRemove = (view: string) => {
    const currentViews = form.getValues("defaultSdkFeatures.mediaFeatures.allowedViews") || [];
    form.setValue(
      "defaultSdkFeatures.mediaFeatures.allowedViews",
      currentViews.filter((v) => v !== view)
    );
  };

  // منطق افزودن حالت مقایسه
  const handleComparisonModeAdd = () => {
    if (!comparisonModeInput.trim()) return;
    
    const currentModes = form.getValues("defaultSdkFeatures.mediaFeatures.comparisonModes") || [];
    
    // بررسی تکراری بودن
    if (currentModes.includes(comparisonModeInput)) {
      form.setError("defaultSdkFeatures.mediaFeatures.comparisonModes", {
        type: "manual",
        message: t("plans.modeExists"),
      });
      return;
    }

    form.setValue("defaultSdkFeatures.mediaFeatures.comparisonModes", [...currentModes, comparisonModeInput]);
    setComparisonModeInput("");
    form.clearErrors("defaultSdkFeatures.mediaFeatures.comparisonModes");
  };

  // منطق حذف حالت مقایسه
  const handleComparisonModeRemove = (mode: string) => {
    const currentModes = form.getValues("defaultSdkFeatures.mediaFeatures.comparisonModes") || [];
    form.setValue(
      "defaultSdkFeatures.mediaFeatures.comparisonModes",
      currentModes.filter((m) => m !== mode)
    );
  };

  const handleSubmit = (values: PlanFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">{t("plans.form.general")}</TabsTrigger>
            <TabsTrigger value="features">{t("plans.form.features")}</TabsTrigger>
            <TabsTrigger value="sdkFeatures">{t("plans.form.sdkFeatures")}</TabsTrigger>
            <TabsTrigger value="mediaFeatures">{t("plans.form.mediaFeatures")}</TabsTrigger>
          </TabsList>
          
          {/* اطلاعات اصلی */}
          <TabsContent value="general">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("plans.form.name")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("plans.form.namePlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("plans.form.price")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t("plans.form.pricePlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("plans.form.duration")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t("plans.form.durationPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("plans.form.durationDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="requestLimit.monthly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("plans.form.monthlyLimit")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t("plans.form.limitPlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requestLimit.total"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("plans.form.totalLimit")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t("plans.form.limitPlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{t("plans.form.description")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("plans.form.descriptionPlaceholder")}
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t("plans.form.active")}
                          </FormLabel>
                          <FormDescription>
                            {t("plans.form.activeDescription")}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialOffer"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t("plans.form.specialOffer")}
                          </FormLabel>
                          <FormDescription>
                            {t("plans.form.specialOfferDescription")}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ویژگی‌های عادی */}
          <TabsContent value="features">
            <Card>
              <CardContent className="pt-6">
                <FormItem>
                  <FormLabel>{t("plans.form.features")}</FormLabel>
                  <FormDescription>
                    {t("plans.form.featuresDescription")}
                  </FormDescription>
                  <div className="flex mt-2 mb-2">
                    <Input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder={t("plans.form.featurePlaceholder")}
                      className="mr-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleFeatureAdd();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleFeatureAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("plans.form.addFeature")}
                    </Button>
                  </div>
                  <FormMessage />
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      {t("plans.form.currentFeatures")}
                    </h4>
                    <div className="space-y-2">
                      {form.watch("features")?.length ? (
                        form.watch("features")?.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center justify-between bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm"
                          >
                            <div className="flex items-center">
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              {feature}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeatureRemove(feature)}
                            >
                              <Minus className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {t("plans.form.noFeatures")}
                        </p>
                      )}
                    </div>
                  </div>
                </FormItem>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ویژگی‌های SDK */}
          <TabsContent value="sdkFeatures">
            <Card>
              <CardContent className="pt-6">
                <FormItem>
                  <FormLabel>{t("plans.form.sdkFeatures")}</FormLabel>
                  <FormDescription>
                    {t("plans.form.sdkFeaturesDescription")}
                  </FormDescription>
                  <div className="flex mt-2 mb-2">
                    <Input
                      value={sdkFeatureInput}
                      onChange={(e) => setSdkFeatureInput(e.target.value)}
                      placeholder={t("plans.form.sdkFeaturePlaceholder")}
                      className="mr-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSdkFeatureAdd();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleSdkFeatureAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("plans.form.addSdkFeature")}
                    </Button>
                  </div>
                  <FormMessage />
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-