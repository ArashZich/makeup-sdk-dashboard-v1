// src/features/admin/plans/components/PlanForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  TargetPlatform,
} from "@/api/types/plans.types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader } from "@/components/common/Loader";
import {
  Plus,
  Minus,
  Check,
  Globe,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { getPlanPlatformConfigs } from "@/constants/platform-configs";

// اسکیما برای اعتبارسنجی فرم - آپدیت شده
const planSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().min(0, { message: "Price cannot be negative" }),
  duration: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 day" }),
  features: z.array(z.string()),
  requestLimit: z.object({
    total: z.coerce
      .number()
      .min(-1, { message: "Total limit must be at least -1 (unlimited)" }),
  }),
  defaultSdkFeatures: z.object({
    features: z.array(z.string()),
    patterns: z.record(z.array(z.string())),
    mediaFeatures: z
      .object({
        allowedSources: z.array(z.string()),
        allowedViews: z.array(z.string()),
        comparisonModes: z.array(z.string()),
      })
      .optional(),
  }),
  targetPlatforms: z
    .array(z.enum(["all", "normal", "divar", "torob", "basalam"]))
    .min(1, { message: "At least one platform must be selected" }),
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

  // تنظیم مقادیر پیش‌فرض برای فرم - آپدیت شده
  const defaultValues: PlanFormValues = {
    name: plan?.name || "",
    description: plan?.description || "",
    price: plan?.price || 0,
    duration: plan?.duration || 30,
    features: plan?.features || [],
    requestLimit: {
      total: plan?.requestLimit?.total || 1000,
    },
    defaultSdkFeatures: {
      features: plan?.defaultSdkFeatures?.features || [],
      patterns: plan?.defaultSdkFeatures?.patterns || {},
      mediaFeatures: {
        allowedSources:
          plan?.defaultSdkFeatures?.mediaFeatures?.allowedSources || [],
        allowedViews:
          plan?.defaultSdkFeatures?.mediaFeatures?.allowedViews || [],
        comparisonModes:
          plan?.defaultSdkFeatures?.mediaFeatures?.comparisonModes || [],
      },
    },
    targetPlatforms: plan?.targetPlatforms || ["normal"],
    active: plan?.active !== undefined ? plan.active : true,
    specialOffer: plan?.specialOffer || false,
  };

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  // تابع نمایش آیکون پلتفرم
  const getPlatformIcon = (platform: TargetPlatform) => {
    switch (platform) {
      case "all":
        return <Globe className="h-4 w-4" />;
      case "normal":
        return <Smartphone className="h-4 w-4" />;
      case "divar":
        return <ExternalLink className="h-4 w-4" />;
      case "torob":
      case "basalam":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

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

    form.setValue("defaultSdkFeatures.features", [
      ...currentFeatures,
      sdkFeatureInput,
    ]);
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

    const currentSources =
      form.getValues("defaultSdkFeatures.mediaFeatures.allowedSources") || [];

    // بررسی تکراری بودن
    if (currentSources.includes(mediaSourceInput)) {
      form.setError("defaultSdkFeatures.mediaFeatures.allowedSources", {
        type: "manual",
        message: t("plans.sourceExists"),
      });
      return;
    }

    form.setValue("defaultSdkFeatures.mediaFeatures.allowedSources", [
      ...currentSources,
      mediaSourceInput,
    ]);
    setMediaSourceInput("");
    form.clearErrors("defaultSdkFeatures.mediaFeatures.allowedSources");
  };

  // منطق حذف منبع مدیا
  const handleMediaSourceRemove = (source: string) => {
    const currentSources =
      form.getValues("defaultSdkFeatures.mediaFeatures.allowedSources") || [];
    form.setValue(
      "defaultSdkFeatures.mediaFeatures.allowedSources",
      currentSources.filter((s) => s !== source)
    );
  };

  // منطق افزودن نمای مدیا
  const handleMediaViewAdd = () => {
    if (!mediaViewInput.trim()) return;

    const currentViews =
      form.getValues("defaultSdkFeatures.mediaFeatures.allowedViews") || [];

    // بررسی تکراری بودن
    if (currentViews.includes(mediaViewInput)) {
      form.setError("defaultSdkFeatures.mediaFeatures.allowedViews", {
        type: "manual",
        message: t("plans.viewExists"),
      });
      return;
    }

    form.setValue("defaultSdkFeatures.mediaFeatures.allowedViews", [
      ...currentViews,
      mediaViewInput,
    ]);
    setMediaViewInput("");
    form.clearErrors("defaultSdkFeatures.mediaFeatures.allowedViews");
  };

  // منطق حذف نمای مدیا
  const handleMediaViewRemove = (view: string) => {
    const currentViews =
      form.getValues("defaultSdkFeatures.mediaFeatures.allowedViews") || [];
    form.setValue(
      "defaultSdkFeatures.mediaFeatures.allowedViews",
      currentViews.filter((v) => v !== view)
    );
  };

  // منطق افزودن حالت مقایسه
  const handleComparisonModeAdd = () => {
    if (!comparisonModeInput.trim()) return;

    const currentModes =
      form.getValues("defaultSdkFeatures.mediaFeatures.comparisonModes") || [];

    // بررسی تکراری بودن
    if (currentModes.includes(comparisonModeInput)) {
      form.setError("defaultSdkFeatures.mediaFeatures.comparisonModes", {
        type: "manual",
        message: t("plans.modeExists"),
      });
      return;
    }

    form.setValue("defaultSdkFeatures.mediaFeatures.comparisonModes", [
      ...currentModes,
      comparisonModeInput,
    ]);
    setComparisonModeInput("");
    form.clearErrors("defaultSdkFeatures.mediaFeatures.comparisonModes");
  };

  // منطق حذف حالت مقایسه
  const handleComparisonModeRemove = (mode: string) => {
    const currentModes =
      form.getValues("defaultSdkFeatures.mediaFeatures.comparisonModes") || [];
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
            <TabsTrigger value="platforms">
              {t("plans.form.platforms")}
            </TabsTrigger>
            <TabsTrigger value="features">
              {t("plans.form.features")}
            </TabsTrigger>
            <TabsTrigger value="sdkFeatures">
              {t("plans.form.sdkFeatures")}
            </TabsTrigger>
            <TabsTrigger value="mediaFeatures">
              {t("plans.form.mediaFeatures")}
            </TabsTrigger>
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

                  {/* آپدیت شده: فقط total limit */}
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
                        <FormDescription>
                          {t("plans.form.totalLimitDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          <FormLabel>{t("plans.form.active")}</FormLabel>
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
                          <FormLabel>{t("plans.form.specialOffer")}</FormLabel>
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

          {/* تنظیمات پلتفرم‌ها - جدید */}
          <TabsContent value="platforms">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="targetPlatforms"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t("plans.form.targetPlatforms")}</FormLabel>
                      <FormDescription>
                        {t("plans.form.targetPlatformsDescription")}
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {getPlanPlatformConfigs(t).map((platform) => (
                          <FormField
                            key={platform.value}
                            control={form.control}
                            name="targetPlatforms"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={platform.value}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50"
                                >
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value?.includes(
                                        platform.value
                                      )}
                                      onChange={(e) => {
                                        const updatedValue = e.target.checked
                                          ? [
                                              ...(field.value || []),
                                              platform.value,
                                            ]
                                          : field.value?.filter(
                                              (value) =>
                                                value !== platform.value
                                            ) || [];
                                        field.onChange(updatedValue);
                                      }}
                                      className="mt-1 h-4 w-4"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none flex-1">
                                    <FormLabel className="flex items-center gap-2 cursor-pointer">
                                      {platform.icon}
                                      {platform.label}
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      {platform.description}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />

                      {/* نمایش پلتفرم‌های انتخاب شده */}
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-3">
                          {t("plans.form.selectedPlatforms")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {form.watch("targetPlatforms")?.length ? (
                            form.watch("targetPlatforms")?.map((platform) => (
                              <Badge
                                key={platform}
                                variant="secondary"
                                className="gap-2"
                              >
                                {getPlatformIcon(platform)}
                                {t(`plans.platforms.${platform}`)}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {t("plans.form.noPlatformsSelected")}
                            </p>
                          )}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
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
                    <h4 className="text-sm font-medium mb-2">
                      {t("plans.form.currentSdkFeatures")}
                    </h4>
                    <div className="space-y-2">
                      {form.watch("defaultSdkFeatures.features")?.length ? (
                        form
                          .watch("defaultSdkFeatures.features")
                          ?.map((feature) => (
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
                                onClick={() => handleSdkFeatureRemove(feature)}
                              >
                                <Minus className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {t("plans.form.noSdkFeatures")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">
                      {t("plans.form.patterns")}
                    </h4>
                    <FormDescription>
                      {t("plans.form.patternsDescription")}
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-2">
                      <Input
                        value={patternKeyInput}
                        onChange={(e) => setPatternKeyInput(e.target.value)}
                        placeholder={t("plans.form.patternKeyPlaceholder")}
                      />
                      <div className="flex">
                        <Input
                          value={patternValueInput}
                          onChange={(e) => setPatternValueInput(e.target.value)}
                          placeholder={t("plans.form.patternValuePlaceholder")}
                          className="mr-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handlePatternAdd();
                            }
                          }}
                        />
                        <Button type="button" onClick={handlePatternAdd}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                    <div className="mt-4">
                      <div className="space-y-4">
                        {Object.entries(
                          form.watch("defaultSdkFeatures.patterns") || {}
                        ).length ? (
                          Object.entries(
                            form.watch("defaultSdkFeatures.patterns") || {}
                          ).map(([key, values]) => (
                            <div key={key} className="border rounded-md p-3">
                              <h5 className="font-medium mb-2">{key}</h5>
                              <div className="flex flex-wrap gap-2">
                                {values.map((value) => (
                                  <div
                                    key={`${key}-${value}`}
                                    className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                                  >
                                    {value}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto p-0 ml-1"
                                      onClick={() =>
                                        handlePatternRemove(key, value)
                                      }
                                    >
                                      <Minus className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("plans.form.noPatterns")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </FormItem>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ویژگی‌های مدیا */}
          <TabsContent value="mediaFeatures">
            <Card>
              <CardContent className="pt-6">
                <FormItem>
                  <FormLabel>{t("plans.form.mediaFeatures")}</FormLabel>
                  <FormDescription>
                    {t("plans.form.mediaFeaturesDescription")}
                  </FormDescription>

                  {/* منابع مجاز */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      {t("plans.form.allowedSources")}
                    </h4>
                    <div className="flex mt-2 mb-2">
                      <Input
                        value={mediaSourceInput}
                        onChange={(e) => setMediaSourceInput(e.target.value)}
                        placeholder={t("plans.form.sourceInputPlaceholder")}
                        className="mr-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleMediaSourceAdd();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleMediaSourceAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("plans.form.addSource")}
                      </Button>
                    </div>
                    <FormMessage />
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {form.watch(
                          "defaultSdkFeatures.mediaFeatures.allowedSources"
                        )?.length ? (
                          form
                            .watch(
                              "defaultSdkFeatures.mediaFeatures.allowedSources"
                            )
                            ?.map((source) => (
                              <div
                                key={source}
                                className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                              >
                                {source}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 ml-1"
                                  onClick={() =>
                                    handleMediaSourceRemove(source)
                                  }
                                >
                                  <Minus className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("plans.form.noSources")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* نماهای مجاز */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">
                      {t("plans.form.allowedViews")}
                    </h4>
                    <div className="flex mt-2 mb-2">
                      <Input
                        value={mediaViewInput}
                        onChange={(e) => setMediaViewInput(e.target.value)}
                        placeholder={t("plans.form.viewInputPlaceholder")}
                        className="mr-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleMediaViewAdd();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleMediaViewAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("plans.form.addView")}
                      </Button>
                    </div>
                    <FormMessage />
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {form.watch(
                          "defaultSdkFeatures.mediaFeatures.allowedViews"
                        )?.length ? (
                          form
                            .watch(
                              "defaultSdkFeatures.mediaFeatures.allowedViews"
                            )
                            ?.map((view) => (
                              <div
                                key={view}
                                className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                              >
                                {view}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 ml-1"
                                  onClick={() => handleMediaViewRemove(view)}
                                >
                                  <Minus className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("plans.form.noViews")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* حالت‌های مقایسه */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">
                      {t("plans.form.comparisonModes")}
                    </h4>
                    <div className="flex mt-2 mb-2">
                      <Input
                        value={comparisonModeInput}
                        onChange={(e) => setComparisonModeInput(e.target.value)}
                        placeholder={t("plans.form.modeInputPlaceholder")}
                        className="mr-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleComparisonModeAdd();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleComparisonModeAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("plans.form.addMode")}
                      </Button>
                    </div>
                    <FormMessage />
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {form.watch(
                          "defaultSdkFeatures.mediaFeatures.comparisonModes"
                        )?.length ? (
                          form
                            .watch(
                              "defaultSdkFeatures.mediaFeatures.comparisonModes"
                            )
                            ?.map((mode) => (
                              <div
                                key={mode}
                                className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                              >
                                {mode}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 ml-1"
                                  onClick={() =>
                                    handleComparisonModeRemove(mode)
                                  }
                                >
                                  <Minus className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("plans.form.noModes")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </FormItem>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader size="sm" className="mr-2" />}
            {plan ? t("common.update") : t("common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
