import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrandSchema, type InsertBrand, type Brand } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateBrand } from "@/hooks/use-brands";
import { useToast } from "@/hooks/use-toast";

interface BrandCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (brand: Brand) => void;
}

export default function BrandCreateModal({ 
  open, 
  onOpenChange, 
  onSuccess 
}: BrandCreateModalProps) {
  const { toast } = useToast();
  const createBrand = useCreateBrand();
  
  // Enhanced validation schema with custom error messages
  const enhancedBrandSchema = insertBrandSchema.extend({
    name: z.string()
      .min(1, "Brand name is required")
      .min(2, "Brand name must be at least 2 characters long")
      .max(100, "Brand name cannot exceed 100 characters")
      .trim(),
    logo: z.string()
      .optional()
      .refine((val) => !val || val === "" || /^https?:\/\/.+/.test(val), {
        message: "Logo must be a valid URL starting with http:// or https://"
      }),
  });

  const form = useForm<InsertBrand>({
    resolver: zodResolver(enhancedBrandSchema),
    defaultValues: {
      name: "",
      logo: "",
      colorPalette: [],
    },
    mode: "onChange", // Enable real-time validation
  });

  const onSubmit = async (data: InsertBrand) => {
    try {
      console.log('Form submission data:', data);
      console.log('Form errors:', form.formState.errors);
      
      // Validate required fields
      if (!data.name || data.name.trim().length === 0) {
        toast({
          title: "Validation Error",
          description: "Brand name is required and cannot be empty.",
          variant: "destructive",
        });
        return;
      }

      if (data.name.trim().length < 2) {
        toast({
          title: "Validation Error", 
          description: "Brand name must be at least 2 characters long.",
          variant: "destructive",
        });
        return;
      }

      // Validate logo URL if provided
      if (data.logo && data.logo.trim().length > 0) {
        try {
          new URL(data.logo);
        } catch {
          toast({
            title: "Invalid Logo URL",
            description: "Please enter a valid URL for the logo (e.g., https://example.com/logo.png).",
            variant: "destructive",
          });
          return;
        }
      }

      // Clean the data
      const cleanData = {
        name: data.name.trim(),
        logo: data.logo?.trim() || null,
        colorPalette: data.colorPalette || []
      };

      const brand = await createBrand.mutateAsync(cleanData);
      toast({
        title: "Success!",
        description: `Brand "${brand.name}" has been created successfully.`,
      });
      onSuccess?.(brand);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Brand creation error:', error);
      
      let errorTitle = "Failed to Create Brand";
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      // Handle specific server error responses
      if (error?.message && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        const serverError = error.response.data;
        if (serverError.message) {
          errorMessage = serverError.message;
        }
        
        if (serverError.error === "duplicate") {
          errorTitle = "Brand Already Exists";
        } else if (serverError.error === "validation") {
          errorTitle = "Invalid Input";
        } else if (serverError.error === "server") {
          errorTitle = "Server Error";
        }
      } else if (error?.message) {
        // Handle fetch/network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          errorTitle = "Connection Error";
          errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
        } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
          errorTitle = "Brand Already Exists";
          errorMessage = "A brand with this name already exists. Please choose a different name.";
        } else if (error.message.includes('validation')) {
          errorTitle = "Invalid Input";
          errorMessage = "Please check all fields and try again.";
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Brand</DialogTitle>
          <DialogDescription>
            Add a new brand to manage social media content for different companies or products.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., TechFlow Solutions" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/logo.png" 
                      type="url"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createBrand.isPending}
              >
                {createBrand.isPending ? "Creating..." : "Create Brand"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}