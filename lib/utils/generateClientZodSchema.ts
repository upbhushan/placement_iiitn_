import { z } from 'zod';
import { FormField as FormFieldType } from '@/lib/db/models/formTemplate';

interface CompatibleFormFieldForSchema extends Omit<FormFieldType, '_id' | 'fieldType'> {
  _id: { toString(): string } | string;
  fieldType: FormFieldType['fieldType'] | 'textarea';
}

export function generateClientZodSchema(fields: CompatibleFormFieldForSchema[]): z.ZodObject<any, any, any> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  fields.forEach(field => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.fieldType) {
      case 'email':
        fieldSchema = z.string().email({ message: "Invalid email address" });
        break;
      case 'number':
        fieldSchema = z.preprocess(
          (val) => (typeof val === 'string' && val.trim() !== '' ? Number(val) : val),
          z.number({ invalid_type_error: "Must be a number" })
        );
        break;
      case 'date':
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)");
        break;
      case 'select':
        fieldSchema = z.string();
        break;
      case 'file':
        if (typeof window !== 'undefined') {
          fieldSchema = z.instanceof(FileList).optional();
        } else {
          fieldSchema = z.any().optional();
        }
        break;
      case 'textarea': // Special case for textarea
        fieldSchema = z.string();
        break;
      default:
        fieldSchema = z.string();
    }

    // Handle required validation based on field type
    if (field.required) {
      if (field.fieldType === 'file' && typeof window !== 'undefined') {
        fieldSchema = fieldSchema.refine((files: FileList | undefined) => files && files.length > 0, "This field is required.");
      } else if (field.fieldType === 'number') {
        // For numbers, use refine to check if it's not undefined/null
        fieldSchema = fieldSchema.refine((val) => val !== undefined && val !== null, {
          message: "This field is required"
        });
      } else if (field.fieldType !== 'file') {
        // For strings and other types that support .min()
        if ('min' in fieldSchema) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, { message: "This field is required" });
        } else {
          // Fallback for any other type
          fieldSchema = fieldSchema.refine((val) => val !== undefined && val !== null && val !== '', {
            message: "This field is required"
          });
        }
      }
    } else {
      fieldSchema = fieldSchema.optional();
    }

    schemaShape[field._id.toString()] = fieldSchema;
  });

  return z.object(schemaShape);
}
