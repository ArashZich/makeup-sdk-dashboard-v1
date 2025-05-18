// src/features/products/components/ProductForm.tsx - اصلاح شده
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product, Pattern, Color } from "@/api/types/products.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/common/Loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusIcon, TrashIcon, SwatchBookIcon } from "lucide-react";
import { ColorPicker } from "./ColorPicker";

// Schema for product form
const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  type: z.enum([
    "lips",
    "eyeshadow",
    "eyepencil",
    "eyelashes",
    "blush",
    "eyeliner",
  ]),
  code: z.string().min(1, {
    message: "Code is required.",
  }),
  thumbnail: z.string().optional(),
  active: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function ProductForm({
  product,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const { t } = useLanguage();
  const [patterns, setPatterns] = useState<Pattern[]>(product?.patterns || []);
  const [colors, setColors] = useState<Color[]>(product?.colors || []);

  // New pattern/color form state
  const [newPattern, setNewPattern] = useState<Pattern>({
    name: "",
    code: "",
    imageUrl: "",
  });
  const [newColor, setNewColor] = useState<Color>({
    name: "",
    hexCode: "",
    imageUrl: "",
  });

  // Initialize form with existing product or defaults
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      type: product?.type || "lips",
      code: product?.code || "",
      thumbnail: product?.thumbnail || "",
      active: product?.active ?? true, // اصلاح اینجا با استفاده از nullish coalescing
    },
  });

  // Add a new pattern
  const handleAddPattern = () => {
    if (newPattern.name && newPattern.code) {
      setPatterns([...patterns, { ...newPattern }]);
      setNewPattern({ name: "", code: "", imageUrl: "" });
    }
  };

  // Remove a pattern
  const handleRemovePattern = (index: number) => {
    setPatterns(patterns.filter((_, i) => i !== index));
  };

  // Add a new color
  const handleAddColor = () => {
    if (newColor.name && newColor.hexCode) {
      setColors([...colors, { ...newColor }]);
      setNewColor({ name: "", hexCode: "", imageUrl: "" });
    }
  };

  // Remove a color
  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // Submit the form
  const handleFormSubmit = (values: ProductFormValues) => {
    // Combine form values with patterns and colors
    const formData = {
      ...values,
      patterns,
      colors,
    };

    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? t("products.editProduct") : t("products.addProduct")}
          </DialogTitle>
          <DialogDescription>
            {product
              ? t("products.editProductDescription")
              : t("products.addProductDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("products.form.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.form.code")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("products.form.codePlaceholder")}
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
                    <FormLabel>{t("products.form.type")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("products.form.typePlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lips">
                          {t("products.types.lips")}
                        </SelectItem>
                        <SelectItem value="eyeshadow">
                          {t("products.types.eyeshadow")}
                        </SelectItem>
                        <SelectItem value="eyepencil">
                          {t("products.types.eyepencil")}
                        </SelectItem>
                        <SelectItem value="eyelashes">
                          {t("products.types.eyelashes")}
                        </SelectItem>
                        <SelectItem value="blush">
                          {t("products.types.blush")}
                        </SelectItem>
                        <SelectItem value="eyeliner">
                          {t("products.types.eyeliner")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thumbnail */}
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.form.thumbnail")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("products.form.thumbnailPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description - Full width */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-1 sm:col-span-2">
                    <FormLabel>{t("products.form.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("products.form.descriptionPlaceholder")}
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("products.form.active")}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Patterns Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">
                  {t("products.form.patterns")}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {patterns.length} {t("products.form.patternsCount")}
                </span>
              </div>

              {/* Existing patterns */}
              {patterns.length > 0 && (
                <div className="space-y-2">
                  {patterns.map((pattern, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      <SwatchBookIcon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pattern.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {pattern.code}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemovePattern(index)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new pattern */}
              <div className="flex gap-2 items-end">
                <div className="space-y-2 flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs">
                        {t("products.form.patternName")}
                      </label>
                      <Input
                        value={newPattern.name}
                        onChange={(e) =>
                          setNewPattern({ ...newPattern, name: e.target.value })
                        }
                        placeholder={t("products.form.patternNamePlaceholder")}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs">
                        {t("products.form.patternCode")}
                      </label>
                      <Input
                        value={newPattern.code}
                        onChange={(e) =>
                          setNewPattern({ ...newPattern, code: e.target.value })
                        }
                        placeholder={t("products.form.patternCodePlaceholder")}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs">
                      {t("products.form.patternImageUrl")}
                    </label>
                    <Input
                      value={newPattern.imageUrl}
                      onChange={(e) =>
                        setNewPattern({
                          ...newPattern,
                          imageUrl: e.target.value,
                        })
                      }
                      placeholder={t(
                        "products.form.patternImageUrlPlaceholder"
                      )}
                      className="h-8"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddPattern}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {t("products.form.addPattern")}
                </Button>
              </div>
            </div>

            {/* Colors Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">
                  {t("products.form.colors")}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {colors.length} {t("products.form.colorsCount")}
                </span>
              </div>

              {/* Existing colors */}
              {colors.length > 0 && (
                <div className="space-y-2">
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      <div
                        className="h-5 w-5 rounded-full"
                        style={{ backgroundColor: color.hexCode }}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{color.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {color.hexCode}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemoveColor(index)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new color */}
              <div className="flex gap-2 items-end">
                <div className="space-y-2 flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs">
                        {t("products.form.colorName")}
                      </label>
                      <Input
                        value={newColor.name}
                        onChange={(e) =>
                          setNewColor({ ...newColor, name: e.target.value })
                        }
                        placeholder={t("products.form.colorNamePlaceholder")}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs">
                        {t("products.form.colorHexCode")}
                      </label>
                      <ColorPicker
                        value={newColor.hexCode}
                        onChange={(color) =>
                          setNewColor({
                            ...newColor,
                            hexCode: color,
                          })
                        }
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs">
                      {t("products.form.colorImageUrl")}
                    </label>
                    <Input
                      value={newColor.imageUrl}
                      onChange={(e) =>
                        setNewColor({ ...newColor, imageUrl: e.target.value })
                      }
                      placeholder={t("products.form.colorImageUrlPlaceholder")}
                      className="h-8"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddColor}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {t("products.form.addColor")}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader size="sm" variant="spinner" />
                ) : product ? (
                  t("common.update")
                ) : (
                  t("common.create")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
