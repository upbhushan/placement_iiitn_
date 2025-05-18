"use client";

import React from 'react';
import { ClientFormField } from '@/lib/store/formBuilderStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { studentAutoFillableFields, StudentAutoFillKey } from '@/lib/config/studentAutoFillKeys'; // Import the keys
import { useFormBuilderStore } from "@/lib/store/formBuilderStore"; // Or however you pass update functions

// This is a likely list of options used. Ensure no 'value' is an empty string.
const FIELD_TYPE_OPTIONS = [
    { value: "text", label: "Text" },
    { value: "email", label: "Email" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "file", label: "File" },
    { value: "select", label: "Select (Dropdown)" },
    // { value: "", label: "--- Select ---" } // <<-- THIS IS THE PROBLEM IF IT EXISTS
];

interface FieldEditorProps {
    field: ClientFormField; // Assuming ClientFormField is the type for a field from your store
    index: number;
    updateField: (id: string, updates: Partial<ClientFormField>) => void; // Add this line
    // ... other props like removeField
}

export function FieldEditor({ field, index, updateField }: FieldEditorProps) { // Added index here as it was in props but not destructured
    // const { updateFieldType } = useFormBuilderStore(); // Example: Get update function from store

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateField(field._id, { [e.target.name]: e.target.value });
    };

    const handleSwitchChange = (checked: boolean, name: keyof ClientFormField) => {
        updateField(field._id, { [name]: checked });
    };

    const handleSelectChange = (value: string, name: keyof ClientFormField) => {
        updateField(field._id, { [name]: value || undefined }); // Send undefined if empty to clear it
    };

    // Specific handlers for select options
    const handleOptionChange = (optionIndex: number, property: 'label' | 'value', newValue: string) => {
        const newOptions = [...(field.options || [])];
        newOptions[optionIndex] = { ...newOptions[optionIndex], [property]: newValue };
        updateField(field._id, { options: newOptions });
    };

    const addOption = () => {
        const newOptions = [...(field.options || []), { label: `Option ${(field.options?.length || 0) + 1}`, value: `option${(field.options?.length || 0) + 1}` }];
        updateField(field._id, { options: newOptions });
    };

    const removeOption = (optionIndex: number) => {
        const newOptions = field.options?.filter((_, index) => index !== optionIndex);
        updateField(field._id, { options: newOptions });
    };


    return (
        <div className="space-y-4 p-1">
            {/* Common Fields: Label, Placeholder, Required */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={`label-${field._id}`} className="text-xs font-medium">Field Label / Question</Label>
                    <Input
                        id={`label-${field._id}`}
                        name="label"
                        value={field.label}
                        onChange={handleInputChange}
                        placeholder="e.g., Your Name, Email Address"
                        className="mt-1 text-sm"
                    />
                </div>
                {field.fieldType !== 'file' && field.fieldType !== 'date' && ( // Placeholder not typical for file/date
                    <div>
                        <Label htmlFor={`placeholder-${field._id}`} className="text-xs font-medium">Placeholder (Optional)</Label>
                        <Input
                            id={`placeholder-${field._id}`}
                            name="placeholder"
                            value={field.placeholder || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., John Doe"
                            className="mt-1 text-sm"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                    <Switch
                        id={`required-${field._id}`}
                        checked={field.required}
                        onCheckedChange={(checked) => handleSwitchChange(checked, 'required')}
                    />
                    <Label htmlFor={`required-${field._id}`} className="text-xs cursor-pointer">Required Field</Label>
                </div>
            </div>

            {/* Auto-fill Key Selector */}
            <div className="pt-2">
                <Label htmlFor={`autoFillKey-${field._id}`} className="text-xs font-medium">
                    Auto-fill from Student Profile (Optional)
                </Label>
                <Select
                    name="autoFillKey"
                    value={field.autoFillKey || "none"}  // Changed from "" to "none"
                    onValueChange={(value) => handleSelectChange(value as StudentAutoFillKey, 'autoFillKey')}
                >
                    <SelectTrigger id={`autoFillKey-${field._id}`} className="mt-1 text-sm">
                        <SelectValue placeholder="None (Manual Input)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None (Manual Input)</SelectItem>  {/* Changed from "" to "none" */}
                        {studentAutoFillableFields.map(keyOption => (
                            <SelectItem key={keyOption.value} value={keyOption.value}>
                                {keyOption.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {field.autoFillKey && (
                    <p className="text-xs text-blue-600 mt-1">
                        This field will be pre-filled and read-only for students.
                    </p>
                )}
            </div>


            {/* Field-Specific Options: e.g., for 'select' type */}
            {field.fieldType === 'select' && (
                <div className="pt-3">
                    <Label className="text-xs font-medium mb-1 block">Dropdown Options</Label>
                    <div className="space-y-2">
                        {(field.options || []).map((option, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50/50">
                                <Input
                                    value={option.label}
                                    onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                                    placeholder="Option Label"
                                    className="text-sm flex-grow"
                                />
                                <Input
                                    value={option.value}
                                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                    placeholder="Option Value"
                                    className="text-sm flex-grow"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-red-500 hover:text-red-600 shrink-0">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={addOption} className="mt-2 text-xs">
                        <PlusCircle size={14} className="mr-1" /> Add Option
                    </Button>
                </div>
            )}

            {/* Field Type Selector - New Addition */}
            <div className="flex flex-col space-y-1">
                <label htmlFor={`fieldType-${field._id}`} className="text-sm font-medium">Field Type</label>
                <Select
                    value={field.fieldType} // This value must correspond to one of the non-empty FIELD_TYPE_OPTIONS values
                    onValueChange={(newType) => {
                        updateField(field._id, { fieldType: newType as ClientFormField['fieldType'] });
                        // Ensure newType is one of the valid, non-empty values.
                    }}
                >
                    <SelectTrigger id={`fieldType-${field._id}`}>
                        <SelectValue placeholder="Select field type..." /> {/* Placeholder is handled here */}
                    </SelectTrigger>
                    <SelectContent>
                        {FIELD_TYPE_OPTIONS.map((option) => (
                            // THE 'value' PROP HERE MUST NOT BE AN EMPTY STRING
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Add more conditional rendering for other field types if they have unique settings */}
            {/* e.g., min/max for number, file type restrictions for file upload */}

        </div>
    );
}