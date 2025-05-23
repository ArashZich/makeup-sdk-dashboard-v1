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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/common/Loader";
import { ImageUpload } from "@/components/common/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductTypeSelect } from "./ProductTypeSelect";
import { PatternSelect } from "./PatternSelect";
import { ColorPicker } from "./ColorPicker";
import { PlusIcon, TrashIcon } from "lucide-react";

// Schema for product form
const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  type: z.string().min(1, {
    message: "Product type is required.",
  }),
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
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(
    product?.patterns.map((p) => p.code) || []
  );
  const [colors, setColors] = useState<Color[]>(product?.colors || []);

  // New color form state
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
      type: product?.type || "",
      code: product?.code || "",
      thumbnail: product?.thumbnail || "",
      active: product?.active ?? true,
    },
  });

  // Watch type changes to reset patterns
  const selectedType = form.watch("type");

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

  // Update color
  const handleUpdateColor = (
    index: number,
    field: keyof Color,
    value: string
  ) => {
    const updatedColors = [...colors];
    updatedColors[index] = { ...updatedColors[index], [field]: value };
    setColors(updatedColors);
  };

  // Submit the form
  const handleFormSubmit = (values: ProductFormValues) => {
    // تبدیل patterns از array of strings به array of Pattern objects
    const patterns: Pattern[] = selectedPatterns.map((patternCode) => ({
      name: patternCode, // یا می‌تونیم از API mapping بگیریم
      code: patternCode,
      imageUrl: "", // اختیاری
    }));

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
                  <FormItem className="col-span-1 sm:col-span-2">
                    <ProductTypeSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("products.form.typePlaceholder")}
                    />
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

              {/* Thumbnail Upload */}
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.form.thumbnail")}</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        type="product"
                        size="md"
                        placeholder={t("products.form.uploadThumbnail")}
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
            {selectedType && (
              <PatternSelect
                productType={selectedType}
                selectedPatterns={selectedPatterns}
                onChange={setSelectedPatterns}
              />
            )}

            {/* Colors Section */}
            <div className="space-y-4">
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
                <div className="space-y-3">
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-muted rounded-md"
                    >
                      <div
                        className="h-8 w-8 rounded-full border-2 border-background flex-shrink-0"
                        style={{ backgroundColor: color.hexCode }}
                      ></div>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={color.name}
                          onChange={(e) =>
                            handleUpdateColor(index, "name", e.target.value)
                          }
                          placeholder={t("products.form.colorNamePlaceholder")}
                          className="h-8"
                        />
                        <ColorPicker
                          value={color.hexCode}
                          onChange={(value) =>
                            handleUpdateColor(index, "hexCode", value)
                          }
                          imageUrl={color.imageUrl}
                          onImageChange={(url) =>
                            handleUpdateColor(index, "imageUrl", url)
                          }
                          showImageUpload={true}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => handleRemoveColor(index)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new color */}
              <div className="border rounded-md p-3 space-y-3">
                <h4 className="text-sm font-medium">
                  {t("products.form.addNewColor")}
                </h4>
                <div className="flex items-start gap-3">
                  <div
                    className="h-8 w-8 rounded-full border-2 border-background flex-shrink-0"
                    style={{
                      backgroundColor: newColor.hexCode || "#f0f0f0",
                    }}
                  ></div>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={newColor.name}
                      onChange={(e) =>
                        setNewColor({ ...newColor, name: e.target.value })
                      }
                      placeholder={t("products.form.colorNamePlaceholder")}
                      className="h-8"
                    />
                    <ColorPicker
                      value={newColor.hexCode}
                      onChange={(value) =>
                        setNewColor({ ...newColor, hexCode: value })
                      }
                      imageUrl={newColor.imageUrl}
                      onImageChange={(url) =>
                        setNewColor({ ...newColor, imageUrl: url })
                      }
                      showImageUpload={true}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddColor}
                    disabled={!newColor.name || !newColor.hexCode}
                    className="flex-shrink-0"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    {t("products.form.addColor")}
                  </Button>
                </div>
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
