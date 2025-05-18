"use client";

import React, { useState } from 'react';
import { useFormBuilderStore, ClientFormField } from '@/lib/store/formBuilderStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    Trash2, PlusCircle, Settings2, GripVertical, EyeIcon,
    Save, ArrowDownAZ, Code, Copy, Shuffle
} from 'lucide-react';
import { FieldEditor } from './FieldEditor';
import { ThemeSelector, COLOR_THEMES } from './ThemeSelector';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

// Field type definitions with icons for visual representation
const fieldTypes: { value: ClientFormField['fieldType']; label: string; icon: React.ReactNode; description: string }[] = [
    {
        value: 'text',
        label: 'Text Input',
        icon: <span className="text-blue-500">Aa</span>,
        description: "Short text responses like names, titles, etc."
    },
    {
        value: 'email',
        label: 'Email Input',
        icon: <span className="text-green-500">@</span>,
        description: "Email addresses with validation"
    },
    {
        value: 'number',
        label: 'Number Input',
        icon: <span className="text-purple-500">#</span>,
        description: "Numeric values only"
    },
    {
        value: 'date',
        label: 'Date Picker',
        icon: <span className="text-red-500">📅</span>,
        description: "Date selection with calendar"
    },
    {
        value: 'select',
        label: 'Dropdown Select',
        icon: <span className="text-amber-500">▼</span>,
        description: "Choose from predefined options"
    },
    {
        value: 'file',
        label: 'File Upload',
        icon: <span className="text-teal-500">📎</span>,
        description: "File or document uploads"
    },
];

// Field templates for quick adding
const fieldTemplates = [
    {
        name: "Contact Information",
        fields: [
            {
                label: "Full Name",
                fieldType: "text",
                placeholder: "Enter your full name",
                required: true,
            },
            {
                label: "Email Address",
                fieldType: "email",
                placeholder: "your.email@example.com",
                required: true,
            },
            {
                label: "Phone Number",
                fieldType: "text",
                placeholder: "+1 (123) 456-7890",
                required: false,
            }
        ]
    },
    {
        name: "Feedback Form",
        fields: [
            {
                label: "Rating",
                fieldType: "select",
                placeholder: "Select your rating",
                required: true,
                options: [
                    { label: "Excellent", value: "5" },
                    { label: "Good", value: "4" },
                    { label: "Average", value: "3" },
                    { label: "Below Average", value: "2" },
                    { label: "Poor", value: "1" }
                ]
            },
            {
                label: "Comments",
                fieldType: "text",
                placeholder: "Please share your feedback",
                required: false,
            }
        ]
    },
    {
        name: "Event Registration",
        fields: [
            {
                label: "Event Date",
                fieldType: "date",
                required: true,
            },
            {
                label: "Number of Attendees",
                fieldType: "number",
                placeholder: "How many people?",
                required: true,
            },
            {
                label: "Special Requirements",
                fieldType: "text",
                placeholder: "Any special needs or requests?",
                required: false,
            }
        ]
    }
];

// Sortable field component
function SortableField({ field, index, removeField, updateField }: {
    field: ClientFormField;
    index: number;
    removeField: (id: string) => void;
    updateField: (id: string, updates: Partial<ClientFormField>) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: field._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border p-4 rounded-lg bg-white shadow-sm mb-4 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab text-gray-400 hover:text-gray-600 touch-none"
                        aria-label="Drag to reorder"
                    >
                        <GripVertical size={20} />
                    </button>
                    <Badge>{field.fieldType}</Badge>
                    <span className="font-semibold">{field.label || `Field ${index + 1}`}</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(field._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 size={18} />
                </Button>
            </div>
            <FieldEditor field={field} index={index} updateField={updateField} />
        </div>
    );
}

export function FormBuilder() {
    const {
        formName,
        formDescription,
        fields,
        colorScheme,
        published,
        currentTheme,
        setFormDetails,
        addField,
        removeField,
        updateField,
        moveField,
        setTheme,
        setPublishedStatus,
    } = useFormBuilderStore();

    const [activeTab, setActiveTab] = useState('fields');
    const [showPreview, setShowPreview] = useState(true);

    // Setup for drag-and-drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle field reordering with DnD
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex(field => field._id === active.id);
            const newIndex = fields.findIndex(field => field._id === over.id);
            moveField(oldIndex, newIndex);
        }
    };

    // Add a field template (multiple fields at once)
    const addFieldTemplate = (templateName: string) => {
        const template = fieldTemplates.find(t => t.name === templateName);
        if (!template) return;

        template.fields.forEach(fieldTemplate => {
            const newField: ClientFormField = {
                _id: generateUniqueId(),
                ...fieldTemplate,  // Spread the template field properties
                fieldType: fieldTemplate.fieldType as ClientFormField['fieldType']
            };
            addField(fieldTemplate.fieldType as ClientFormField['fieldType']);
        });

        toast.success(`Added ${template.fields.length} fields from template`);
    };

    // Toggle preview mode
    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    // Update the form preview section with better dark mode styles
    const getPreviewStyles = (theme: string) => {
        const themeData = COLOR_THEMES[theme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;

        const isDarkTheme = themeData.darkMode;

        // Base styles
        const styles = {
            card: {
                backgroundColor: themeData.backgroundColor,
                color: themeData.textColor,
                boxShadow: isDarkTheme ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease'
            },
            heading: {
                color: themeData.primaryColor,
                textShadow: isDarkTheme ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
            },
            description: {
                color: `${themeData.textColor}cc`,
            },
            divider: {
                borderColor: `${themeData.textColor}22`
            },
            input: {
                backgroundColor: isDarkTheme ? `${themeData.backgroundColor}dd` : themeData.backgroundColor,
                color: themeData.textColor,
                borderColor: `${themeData.primaryColor}33`,
                boxShadow: isDarkTheme ? 'inset 0 1px 2px rgba(0, 0, 0, 0.2)' : 'none'
            },
            button: {
                backgroundColor: themeData.primaryColor,
                color: isDarkTheme ? '#ffffff' : '#ffffff',
                boxShadow: isDarkTheme ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
            },
            label: {
                color: themeData.textColor,
                fontWeight: '500'
            }
        };

        return styles;
    };

    return (
        <div className="space-y-6">
            {/* Top bar with theme selector and form status */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-card p-4 rounded-lg border mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <ThemeSelector
                        currentTheme={currentTheme}
                        onThemeChange={setTheme}
                    />
                    <div className="h-6 w-px bg-muted mx-2"></div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="publishedStatus"
                            checked={published}
                            onCheckedChange={setPublishedStatus}
                        />
                        <Label htmlFor="publishedStatus" className="text-sm font-medium">
                            {published ? "Published" : "Draft"}
                        </Label>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={togglePreview}
                        className="flex items-center gap-1"
                    >
                        <EyeIcon size={16} />
                        {showPreview ? "Hide Preview" : "Preview Form"}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
                            // Copy JSON representation to clipboard
                            navigator.clipboard.writeText(JSON.stringify({
                                name: formName,
                                description: formDescription,
                                fields: fields.map(({ _id, ...rest }) => rest),
                                theme: currentTheme
                            }, null, 2));
                            toast.success("Form configuration copied to clipboard");
                        }}
                    >
                        <Copy size={16} />
                        Export JSON
                    </Button>
                </div>
            </div>

            {/* Main form builder content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Form Fields */}
                <div className={showPreview ? "lg:col-span-2 space-y-6" : "lg:col-span-2 space-y-6"}>

                    {/* Form Meta Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Details</CardTitle>
                            <CardDescription>Set the name and description for your form.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="formName" className="text-sm font-medium">Form Name</Label>
                                <Input
                                    id="formName"
                                    placeholder="e.g., Event Registration, Feedback Survey"
                                    value={formName}
                                    onChange={(e) => setFormDetails({ name: e.target.value, description: formDescription })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="formDescription" className="text-sm font-medium">Form Description (Optional)</Label>
                                <Textarea
                                    id="formDescription"
                                    placeholder="Provide a brief overview of your form's purpose."
                                    value={formDescription}
                                    onChange={(e) => setFormDetails({ name: formName, description: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs for Fields and Templates */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4 grid w-full grid-cols-2">
                            <TabsTrigger value="fields">Form Fields</TabsTrigger>
                            <TabsTrigger value="templates">Field Templates</TabsTrigger>
                        </TabsList>

                        {/* Fields Tab */}
                        <div className={activeTab === 'fields' ? 'block' : 'hidden'}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Fields</CardTitle>
                                    <CardDescription>Add, configure, and reorder fields for your form.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {fields.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                            <h3 className="text-lg font-medium mb-2">No Fields Added Yet</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Start by adding fields to build your form.
                                            </p>
                                            <div className="flex justify-center gap-2 flex-wrap">
                                                {fieldTypes.slice(0, 3).map(type => (
                                                    <Button
                                                        key={type.value}
                                                        variant="outline"
                                                        onClick={() => addField(type.value)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <PlusCircle size={16} />
                                                        {type.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {fields.length > 0 && (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={fields.map(field => field._id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {fields.map((field, index) => (
                                                    <SortableField
                                                        key={field._id}
                                                        field={field}
                                                        index={index}
                                                        removeField={removeField}
                                                        updateField={updateField}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    )}

                                    {/* Add Field UI */}
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium mb-3">Add a New Field</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {fieldTypes.map((type) => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => addField(type.value)}
                                                    className="flex flex-col items-center p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="text-2xl mb-1">{type.icon}</div>
                                                    <span className="text-sm font-medium">{type.label}</span>
                                                    <span className="text-xs text-muted-foreground text-center mt-1">
                                                        {type.description}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Field Tools */}
                                    {fields.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // Randomize field order
                                                    const shuffled = [...fields].sort(() => Math.random() - 0.5);
                                                    // Replace all fields with shuffled ones
                                                    shuffled.forEach((field, index) => {
                                                        moveField(fields.findIndex(f => f._id === field._id), index);
                                                    });
                                                    toast.success("Fields reordered randomly");
                                                }}
                                                className="flex items-center gap-1"
                                            >
                                                <Shuffle size={14} />
                                                Shuffle Fields
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // Sort fields alphabetically by label
                                                    const sorted = [...fields].sort((a, b) =>
                                                        (a.label || '').localeCompare(b.label || '')
                                                    );
                                                    // Replace all fields with sorted ones
                                                    sorted.forEach((field, index) => {
                                                        moveField(fields.findIndex(f => f._id === field._id), index);
                                                    });
                                                    toast.success("Fields sorted alphabetically");
                                                }}
                                                className="flex items-center gap-1"
                                            >
                                                <ArrowDownAZ size={14} />
                                                Sort Alphabetically
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Templates Tab */}
                        <div className={activeTab === 'templates' ? 'block' : 'hidden'}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Field Templates</CardTitle>
                                    <CardDescription>Add pre-configured sets of fields to your form quickly.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {fieldTemplates.map((template, idx) => (
                                            <Card key={idx} className="overflow-hidden">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                                    <CardDescription className="text-xs">
                                                        {template.fields.length} fields
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="text-xs">
                                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                        {template.fields.map((field, i) => (
                                                            <li key={i}>{field.label}</li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                                <CardFooter className="pt-0">
                                                    <Button
                                                        onClick={() => addFieldTemplate(template.name)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        Add to Form
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </Tabs>
                </div>

                {/* Right Panel: Form Preview */}
                {showPreview && (
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4 overflow-hidden" style={getPreviewStyles(currentTheme).card}>
                            <CardHeader>
                                <CardTitle className="text-lg" style={getPreviewStyles(currentTheme).heading}>
                                    Form Preview
                                </CardTitle>
                                <CardDescription style={getPreviewStyles(currentTheme).description}>
                                    This is how your form will appear to users
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold" style={getPreviewStyles(currentTheme).heading}>
                                        {formName || "Untitled Form"}
                                    </h2>
                                    {formDescription && (
                                        <p className="text-sm" style={getPreviewStyles(currentTheme).description}>
                                            {formDescription}
                                        </p>
                                    )}
                                    <div className="border-t pt-4" style={getPreviewStyles(currentTheme).divider}></div>

                                    {fields.map((field, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <label className="text-sm font-medium block" style={getPreviewStyles(currentTheme).label}>
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>

                                            {field.fieldType === 'text' && (
                                                <input
                                                    type="text"
                                                    placeholder={field.placeholder}
                                                    className="w-full px-3 py-2 border rounded-md transition-all duration-200"
                                                    style={getPreviewStyles(currentTheme).input}
                                                    disabled
                                                />
                                            )}

                                            {field.fieldType === 'email' && (
                                                <input
                                                    type="email"
                                                    placeholder={field.placeholder}
                                                    className="w-full px-3 py-2 border rounded-md transition-all duration-200"
                                                    style={getPreviewStyles(currentTheme).input}
                                                    disabled
                                                />
                                            )}

                                            {field.fieldType === 'number' && (
                                                <input
                                                    type="number"
                                                    placeholder={field.placeholder}
                                                    className="w-full px-3 py-2 border rounded-md transition-all duration-200"
                                                    style={getPreviewStyles(currentTheme).input}
                                                    disabled
                                                />
                                            )}

                                            {field.fieldType === 'date' && (
                                                <input
                                                    type="date"
                                                    className="w-full px-3 py-2 border rounded-md transition-all duration-200"
                                                    style={getPreviewStyles(currentTheme).input}
                                                    disabled
                                                />
                                            )}

                                            {field.fieldType === 'select' && (
                                                <select
                                                    className="w-full px-3 py-2 border rounded-md transition-all duration-200"
                                                    style={getPreviewStyles(currentTheme).input}
                                                    disabled
                                                >
                                                    <option value="">{field.placeholder || "Select an option"}</option>
                                                    {field.options?.map((opt, i) => (
                                                        <option key={i} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {field.fieldType === 'file' && (
                                                <input
                                                    type="file"
                                                    className="w-full"
                                                    disabled
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {fields.length > 0 && (
                                        <div className="pt-4">
                                            <button
                                                style={getPreviewStyles(currentTheme).button}
                                                className="mt-2 disabled:opacity-50 px-4 py-2 rounded-md font-medium transition-all duration-200"
                                                disabled
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    )}

                                    {fields.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                            <p>No fields added yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

// Remove any direct imports of MongoDB or Types
// import { Types } from 'mongodb'; // REMOVE THIS

// Instead, generate IDs client-side without MongoDB dependency
function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

// Then where you were using Types.ObjectId()
// Replace:
// _id: new Types.ObjectId().toString()
// With:
// _id: generateUniqueId()