"use client";

import React from 'react';
import { useFormBuilderStore, ClientFormField } from '@/lib/store/formBuilderStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Palette, Settings2, GripVertical } from 'lucide-react';
import { FieldEditor } from './FieldEditor'; // We will create this next
// For Drag and Drop (Example using react-beautiful-dnd, you can choose another like dnd-kit)
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';


// Define available field types for the "Add Field" button
const fieldTypes: { value: ClientFormField['fieldType']; label: string }[] = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'date', label: 'Date Picker' },
    { value: 'select', label: 'Dropdown Select' },
    { value: 'file', label: 'File Upload' },
    // Add more types as needed (e.g., textarea, checkbox, radio group)
];


export function FormBuilder() {
    const {
        formName,
        formDescription,
        fields,
        colorScheme,
        published,
        setFormDetails,
        addField,
        removeField,
        updateField,
        // moveField, // For drag and drop
        setColorScheme,
        setPublishedStatus,
    } = useFormBuilderStore();

    // Handler for drag and drop (example)
    // const onDragEnd = (result: DropResult) => {
    //   if (!result.destination) return;
    //   moveField(result.source.index, result.destination.index);
    // };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
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

                {/* Dynamic Fields Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Form Fields</CardTitle>
                        <CardDescription>Add and configure the fields for your form. Drag to reorder.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for Drag and Drop Context */}
                        {/* <DragDropContext onDragEnd={onDragEnd}> */}
                        {/*   <Droppable droppableId="formFields"> */}
                        {/*     {(provided) => ( */}
                        {/*       <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4"> */}
                        {fields.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No fields added yet. Click "Add Field" below to get started.
                            </p>
                        )}
                        {fields.map((field, index) => (
                            // <Draggable key={field._id} draggableId={field._id} index={index}>
                            //   {(providedDraggable) => (
                            //     <div
                            //       ref={providedDraggable.innerRef}
                            //       {...providedDraggable.draggableProps}
                            //       className="border p-4 rounded-lg bg-white shadow-sm"
                            //     >
                            //       <div className="flex items-center justify-between mb-3">
                            //         <div className="flex items-center gap-2">
                            //            <button {...providedDraggable.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                            //              <GripVertical size={20} />
                            //            </button>
                            //           <p className="font-semibold">{field.label || `Field ${index + 1}`}</p>
                            //         </div>
                            //         <Button variant="ghost" size="icon" onClick={() => removeField(field._id)} className="text-red-500 hover:text-red-700">
                            //           <Trash2 size={18} />
                            //         </Button>
                            //       </div>
                            //       <FieldEditor field={field} updateField={updateField} />
                            //     </div>
                            //   )}
                            // </Draggable>
                            // Simplified version without DND for now:
                            <div key={field._id} className="border p-4 rounded-lg bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-semibold">{field.label || `Field ${index + 1}`}</p>
                                    <Button variant="ghost" size="icon" onClick={() => removeField(field._id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                                <FieldEditor field={field} index={index} updateField={updateField} />
                            </div>
                        ))}
                        {/*         {provided.placeholder} */}
                        {/*       </div> */}
                        {/*     )} */}
                        {/*   </Droppable> */}
                        {/* </DragDropContext> */}

                        <div className="mt-6">
                            <Select onValueChange={(value: ClientFormField['fieldType']) => addField(value)}>
                                <SelectTrigger className="w-full md:w-[280px]">
                                    <SelectValue placeholder="Select a field type to add" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fieldTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Panel: Settings & Preview */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings2 size={20} /> Form Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="publishedStatus" className="text-sm font-medium">Publish Form</Label>
                            <Switch
                                id="publishedStatus"
                                checked={published}
                                onCheckedChange={setPublishedStatus}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            {published ? "Students can access this form." : "Form is a draft and not accessible by students."}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette size={20} /> Color Scheme</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="primaryColor" className="text-sm">Primary Color</Label>
                            <Input
                                id="primaryColor"
                                type="color"
                                value={colorScheme.primaryColor}
                                onChange={(e) => setColorScheme({ ...colorScheme, primaryColor: e.target.value })}
                                className="mt-1 h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="backgroundColor" className="text-sm">Background Color</Label>
                            <Input
                                id="backgroundColor"
                                type="color"
                                value={colorScheme.backgroundColor}
                                onChange={(e) => setColorScheme({ ...colorScheme, backgroundColor: e.target.value })}
                                className="mt-1 h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="textColor" className="text-sm">Text Color</Label>
                            <Input
                                id="textColor"
                                type="color"
                                value={colorScheme.textColor}
                                onChange={(e) => setColorScheme({ ...colorScheme, textColor: e.target.value })}
                                className="mt-1 h-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Optional: Live Preview Section (can be complex) */}
                {/* <Card>
          <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Preview of how the form will look to students.</p>
            {/* Render a simplified version of the form here based on current state */}
                {/* </CardContent>
        </Card> */}
            </div>
        </div>
    );
}