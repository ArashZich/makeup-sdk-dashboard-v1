// src/features/admin/products/components/ProductForm.tsx
"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useAdminUsers } from "@/api/hooks/useUsers";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ProductType,
  getAllProductTypes,
  getAllowedPatternsForType,
} from "@/constants/product-patterns";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Image } from "lucide-react";
import { Product } from "@/api/types/products.types";
import { Label } from "@/components/ui/label";

// Schema validation - ساده‌سازی شده
const patternSchema = z.object({
  name: z.string().min(1, "patternNameRequired"), // همان code
  code: z.string().min(1, "patternCodeRequired"), // همان name
  imageUrl: z.string().optional(), // اختیاری شده
});

const colorSchema = z.object({
  name: z.string().min(1, "colorNameRequired"),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "invalidHexCode"),
  imageUrl: z.string().optional(), // اختیاری شده
});

// Schema validation - برای create و update جداگانه
const baseSchema = {
  name: z.string().min(1, "nameRequired"),
  description: z.string().min(1, "descriptionRequired"),
  type: z.enum(
    [
      "lips",
      "eyeshadow",
      "eyepencil",
      "eyelashes",
      "blush",
      "eyeliner",
      "concealer",
      "foundation",
      "brows",
    ],
    {
      required_error: "typeRequired",
    }
  ),
  code: z.string().min(1, "codeRequired"),
  thumbnail: z.string().optional(),
  active: z.boolean(),
  patterns: z.array(patternSchema).min(1, "patternsRequired"),
  colors: z.array(colorSchema).min(1, "colorsRequired"),
};

// Schema برای ایجاد محصول (شامل userId)
const createSchema = z.object({
  ...baseSchema,
  userId: z.string().min(1, "userRequired"),
});

// Schema برای به‌روزرسانی محصول (بدون userId)
const updateSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  description: z.string().min(1, "descriptionRequired"),
  thumbnail: z.string().optional(),
  active: z.boolean(),
  patterns: z.array(patternSchema).min(1, "patternsRequired"),
  colors: z.array(colorSchema).min(1, "colorsRequired"),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;
type CreateProductData = CreateFormData;
type UpdateProductData = UpdateFormData;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: CreateProductData | UpdateProductData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProductFormProps) {
  const { t } = useLanguage();
  const isEditMode = Boolean(product);

  // Fetch users for selection
  const { getUsers } = useAdminUsers();
  const { data: usersData, isLoading: isLoadingUsers } = getUsers({
    limit: 100,
  });

  const users = usersData?.results || [];

  const form = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(isEditMode ? updateSchema : createSchema),
    defaultValues: isEditMode
      ? {
          name: "",
          description: "",
          thumbnail: "",
          active: true,
          patterns: [{ name: "", code: "", imageUrl: "" }],
          colors: [{ name: "", hexCode: "#000000", imageUrl: "" }],
        }
      : {
          name: "",
          description: "",
          type: undefined,
          code: "",
          thumbnail: "",
          userId: "",
          active: true,
          patterns: [{ name: "", code: "", imageUrl: "" }],
          colors: [{ name: "", hexCode: "#000000", imageUrl: "" }],
        },
  });

  const {
    fields: patternFields,
    append: appendPattern,
    remove: removePattern,
  } = useFieldArray({
    control: form.control,
    name: "patterns",
  });

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control: form.control,
    name: "colors",
  });

  // Watch selected type to show available patterns
  const selectedType = form.watch("type");
  const availablePatterns = selectedType
    ? getAllowedPatternsForType(selectedType)
    : [];

  // Load product data for editing
  useEffect(() => {
    if (product && isEditMode) {
      form.reset({
        name: product.name,
        description: product.description,
        thumbnail: product.thumbnail || "",
        active: product.active,
        patterns:
          product.patterns.length > 0
            ? product.patterns.map((p) => ({
                name: p.name,
                code: p.code,
                imageUrl: p.imageUrl || "",
              }))
            : [{ name: "", code: "", imageUrl: "" }],
        colors:
          product.colors.length > 0
            ? product.colors.map((c) => ({
                name: c.name,
                hexCode: c.hexCode,
                imageUrl: c.imageUrl || "",
              }))
            : [{ name: "", hexCode: "#000000", imageUrl: "" }],
      });
    } else {
      // Reset for create mode
      form.reset({
        name: "",
        description: "",
        type: undefined,
        code: "",
        thumbnail: "",
        userId: "",
        active: true,
        patterns: [{ name: "", code: "", imageUrl: "" }],
        colors: [{ name: "", hexCode: "#000000", imageUrl: "" }],
      });
    }
  }, [product, isEditMode, form]);

  // تمام انواع محصولات از constants
  const productTypes = getAllProductTypes().map((type) => ({
    value: type,
    label: t(`admin.products.types.${type}`),
  }));

  const handleSubmit = (data: CreateFormData | UpdateFormData) => {
    console.log("🎯 Form submitting with data:", data);
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode
            ? t("admin.products.editProduct")
            : t("admin.products.createProduct")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {t("admin.products.details.basicInfo")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("admin.products.form.nameLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin.products.form.namePlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("admin.products.form.typeLabel")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "admin.products.form.typeSelectPlaceholder"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("admin.products.form.descriptionLabel")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          "admin.products.form.descriptionPlaceholder"
                        )}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("admin.products.form.codeLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin.products.form.codePlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* User Selection - فقط در حالت ایجاد نمایش داده بشه */}
                {!isEditMode && (
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("admin.products.form.userLabel")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoadingUsers}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingUsers
                                    ? t("common.loading")
                                    : t(
                                        "admin.products.form.userSelectPlaceholder"
                                      )
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user._id} value={user._id}>
                                {user.name} ({user.phone})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* نمایش اطلاعات کاربر در حالت ویرایش */}
                {isEditMode && product && (
                  <div className="space-y-2">
                    <Label>{t("admin.products.form.userLabel")}</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        {typeof product.userId === "string"
                          ? product.userId
                          : `${(product.userId as any).name} (${
                              (product.userId as any).phone
                            })`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.products.form.userCannotChange")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("admin.products.form.thumbnailLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "admin.products.form.thumbnailPlaceholder"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      {t("admin.products.form.thumbnailOptional")}
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("admin.products.form.statusLabel")}
                      </FormLabel>
                      <FormDescription>
                        {field.value
                          ? t("admin.products.status.active")
                          : t("admin.products.status.inactive")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Patterns Section - ساده‌سازی شده */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {t("admin.products.form.patternsLabel")}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendPattern({ name: "", code: "", imageUrl: "" })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("admin.products.form.addPattern")}
                </Button>
              </div>
              <FormDescription>
                {selectedType && (
                  <span>
                    {t("admin.products.form.availablePatternsForType")}:{" "}
                    {availablePatterns
                      .map((p) => t(`patterns.${p}`))
                      .join(", ")}
                  </span>
                )}
              </FormDescription>

              {patternFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {t("common.pattern")} {index + 1}
                      </h4>
                      {patternFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePattern(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("admin.products.form.removePattern")}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pattern Code (Select) */}
                      <FormField
                        control={form.control}
                        name={`patterns.${index}.code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("admin.products.form.patternCode")}
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                // همچنین name رو هم ست کن
                                form.setValue(`patterns.${index}.name`, value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t(
                                      "admin.products.form.selectPattern"
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availablePatterns.map((pattern) => (
                                  <SelectItem key={pattern} value={pattern}>
                                    {t(`patterns.${pattern}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Pattern Image URL (Optional) */}
                      <FormField
                        control={form.control}
                        name={`patterns.${index}.imageUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("admin.products.form.patternImageUrl")} (
                              {t("common.optional")})
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Colors Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {t("admin.products.form.colorsLabel")}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendColor({ name: "", hexCode: "#000000", imageUrl: "" })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("admin.products.form.addColor")}
                </Button>
              </div>
              <FormDescription>
                {t("admin.products.form.colorsDescription")}
              </FormDescription>

              {colorFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {t("common.color")} {index + 1}
                      </h4>
                      {colorFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeColor(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("admin.products.form.removeColor")}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`colors.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("admin.products.form.colorName")}
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`colors.${index}.hexCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("admin.products.form.colorHexCode")}
                            </FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input {...field} placeholder="#000000" />
                                <div
                                  className="w-10 h-10 rounded border-2 border-gray-300 shrink-0"
                                  style={{ backgroundColor: field.value }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`colors.${index}.imageUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("admin.products.form.colorImageUrl")} (
                              {t("common.optional")})
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t("admin.products.form.cancelButton")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? t("admin.products.form.updating")
                    : t("admin.products.form.creating")
                  : isEditMode
                  ? t("admin.products.form.updateButton")
                  : t("admin.products.form.createButton")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
