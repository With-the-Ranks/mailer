"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface SignupFormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string | null;
  options: string[];
  order: number;
}

interface SignupForm {
  id: string;
  name: string;
  slug: string;
  fields: SignupFormField[];
}

interface PublicSignupFormProps {
  signupForm: SignupForm;
  theme?: {
    buttonBg?: string;
    buttonText?: string;
    inputBg?: string;
    inputText?: string;
  };
}

export default function PublicSignupForm({
  signupForm,
  theme,
}: PublicSignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Create validation schema based on form fields
  const createValidationSchema = (fields: SignupFormField[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case "email":
        case "firstName":
        case "lastName":
        case "phone":
        case "defaultAddressZip":
        case "defaultAddressCity":
        case "defaultAddressProvinceCode":
        case "defaultAddressCountryCode":
        case "defaultAddressAddress1":
        case "defaultAddressAddress2":
        case "defaultAddressCompany":
        case "note":
        case "tags":
          if (field.type === "email") {
            fieldSchema = z
              .string()
              .email("Please enter a valid email address");
          } else if (field.type === "phone") {
            fieldSchema = z
              .string()
              .min(10, "Please enter a valid phone number");
          } else {
            fieldSchema = z.string().min(1, "This field is required");
          }
          break;
        case "textarea":
          fieldSchema = z.string().min(1, "This field is required");
          break;
        case "select":
        case "radio":
          fieldSchema = z.string().min(1, "Please select an option");
          break;
        case "checkbox":
          fieldSchema = z
            .array(z.string())
            .min(1, "Please select at least one option");
          break;
        default:
          fieldSchema = z.string().min(1, "This field is required");
      }

      if (field.required) {
        schemaFields[field.name] = fieldSchema;
      } else {
        schemaFields[field.name] = fieldSchema.optional();
      }
    });

    return z.object(schemaFields);
  };

  const validationSchema = createValidationSchema(signupForm.fields);
  type FormData = z.infer<typeof validationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/signup-forms/${signupForm.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error("Error submitting form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="mb-4 text-6xl text-green-600">✓</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Thank you for signing up!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your information has been submitted successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {signupForm.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </Label>

          {field.type === "text" ||
          field.type === "email" ||
          field.type === "firstName" ||
          field.type === "lastName" ||
          field.type === "phone" ||
          field.type === "defaultAddressZip" ||
          field.type === "defaultAddressCity" ||
          field.type === "defaultAddressProvinceCode" ||
          field.type === "defaultAddressCountryCode" ||
          field.type === "defaultAddressAddress1" ||
          field.type === "defaultAddressAddress2" ||
          field.type === "defaultAddressCompany" ||
          field.type === "note" ||
          field.type === "tags" ? (
            <Input
              id={field.name}
              type={
                field.type === "email"
                  ? "email"
                  : field.type === "phone"
                    ? "tel"
                    : "text"
              }
              placeholder={field.placeholder || undefined}
              {...register(field.name)}
              className={errors[field.name] ? "border-red-500" : ""}
              style={
                theme?.inputBg
                  ? {
                      backgroundColor: theme.inputBg,
                      color: `#${theme.inputText || "ffffff"}`,
                      borderColor: "transparent",
                    }
                  : undefined
              }
            />
          ) : field.type === "textarea" ? (
            <Textarea
              id={field.name}
              placeholder={field.placeholder || undefined}
              {...register(field.name)}
              className={errors[field.name] ? "border-red-500" : ""}
              style={
                theme?.inputBg
                  ? {
                      backgroundColor: theme.inputBg,
                      color: `#${theme.inputText || "ffffff"}`,
                      borderColor: "transparent",
                    }
                  : undefined
              }
            />
          ) : field.type === "select" ? (
            <Select onValueChange={(value) => setValue(field.name, value)}>
              <SelectTrigger
                className={errors[field.name] ? "border-red-500" : ""}
              >
                <SelectValue
                  placeholder={field.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === "radio" ? (
            <RadioGroup onValueChange={(value) => setValue(field.name, value)}>
              {field.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${field.name}-${option}`}
                  />
                  <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : field.type === "checkbox" ? (
            <div className="space-y-2">
              {field.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option}`}
                    value={option}
                    onCheckedChange={(checked) => {
                      const currentValues = watch(field.name) || [];
                      if (checked) {
                        setValue(field.name, [...currentValues, option]);
                      } else {
                        setValue(
                          field.name,
                          currentValues.filter((v: string) => v !== option),
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          ) : null}

          {errors[field.name] && (
            <p className="text-sm text-red-500">
              {String(errors[field.name]?.message || "Invalid input")}
            </p>
          )}
        </div>
      ))}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        style={
          theme?.buttonBg
            ? {
                backgroundColor: `#${theme.buttonBg}`,
                color: `#${theme.buttonText || "000000"}`,
              }
            : undefined
        }
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
