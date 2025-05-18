import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
// Corrected import path: formVlaidation -> formValidation
import { FormFieldInput, FormFieldOption } from '@/lib/validators/formValidation';
import { Types } from 'mongoose'; // For generating temporary client-side IDs

// Re-define or import FormField and FormColorScheme interfaces if not directly available from validation types
// For simplicity, let's use the types from formValidation.ts and adapt as needed.

export interface ClientFormField extends Omit<FormFieldInput, '_id' | 'options'> {
    _id: string; // Client-side temporary ID (e.g., new Types.ObjectId().toString())
    options?: FormFieldOption[];
}

interface FormBuilderState {
    formId: string | null; // For editing existing forms
    formName: string;
    formDescription: string;
    fields: ClientFormField[];
    colorScheme: {
        primaryColor: string;
        backgroundColor: string;
        textColor: string;
    };
    published: boolean;
    currentTheme: string; // Theme key like 'default', 'dark', etc.

    // Actions
    setFormDetails: (details: { name: string; description: string }) => void;
    addField: (fieldType: ClientFormField['fieldType']) => void;
    removeField: (fieldId: string) => void;
    updateField: (fieldId: string, updates: Partial<ClientFormField>) => void;
    moveField: (dragIndex: number, hoverIndex: number) => void;
    setColorScheme: (scheme: FormBuilderState['colorScheme']) => void;
    setPublishedStatus: (published: boolean) => void;
    setTheme: (themeKey: string) => void;
    resetFormBuilder: (initialState?: Partial<FormBuilderState>) => void;
    loadFormForEditing: (formData: {
        _id: string;
        name: string;
        description?: string;
        fields: ClientFormField[]; // Ensure fields have string _ids
        colorScheme: FormBuilderState['colorScheme'];
        published: boolean;
        // sharedWith?: string[];
    }) => void;
}

const initialColorScheme = {
    primaryColor: '#007bff',
    backgroundColor: '#ffffff',
    textColor: '#333333',
};

const initialFields: ClientFormField[] = [
    {
        _id: new Types.ObjectId().toString(),
        label: 'Example Text Field',
        fieldType: 'text',
        placeholder: 'Enter text here',
        required: false,
    },
];

const initialState: Omit<FormBuilderState, 'setFormDetails' | 'addField' | 'removeField' | 'updateField' | 'moveField' | 'setColorScheme' | 'setPublishedStatus' | 'setTheme' | 'resetFormBuilder' | 'loadFormForEditing'> = {
    formId: null,
    formName: 'Untitled Form',
    formDescription: '',
    fields: initialFields,
    colorScheme: { ...initialColorScheme },
    published: false,
    currentTheme: 'default',
    // sharedWith: [],
};

export const useFormBuilderStore = create<FormBuilderState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setFormDetails: (details) => set({ formName: details.name, formDescription: details.description }),

            addField: (fieldType) => {
                const newField: ClientFormField = {
                    _id: new Types.ObjectId().toString(), // Using MongoDB ObjectId
                    label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
                    fieldType: fieldType,
                    placeholder: '',
                    required: false,
                    ...(fieldType === 'select' && { options: [{ label: 'Option 1', value: 'option1' }] }),
                };
                set((state) => ({ fields: [...state.fields, newField] }));
            },

            removeField: (fieldId) => {
                set((state) => ({
                    fields: state.fields.filter((field) => field._id !== fieldId),
                }));
            },

            updateField: (fieldId, updates) => {
                set((state) => ({
                    fields: state.fields.map((field) =>
                        field._id === fieldId ? { ...field, ...updates } : field
                    ),
                }));
            },

            moveField: (dragIndex, hoverIndex) => {
                set((state) => {
                    const newFields = [...state.fields];
                    const draggedField = newFields[dragIndex];
                    newFields.splice(dragIndex, 1);
                    newFields.splice(hoverIndex, 0, draggedField);
                    return { fields: newFields };
                });
            },

            setColorScheme: (scheme) => set({ colorScheme: scheme }),
            setPublishedStatus: (published) => set({ published }),
            setTheme: (themeKey) => {
                const { COLOR_THEMES } = require('@/components/admin/forms/ThemeSelector');
                const theme = COLOR_THEMES[themeKey];

                if (theme) {
                    set({
                        currentTheme: themeKey,
                        colorScheme: {
                            primaryColor: theme.primaryColor,
                            backgroundColor: theme.backgroundColor,
                            textColor: theme.textColor,
                        }
                    });
                }
            },

            resetFormBuilder: (newInitialState) => set({ ...initialState, ...newInitialState, formId: newInitialState?.formId || null, fields: newInitialState?.fields || initialFields.map(f => ({ ...f, _id: new Types.ObjectId().toString() })) }),

            loadFormForEditing: (formData) => {
                set({
                    formId: formData._id,
                    formName: formData.name,
                    formDescription: formData.description || '',
                    fields: formData.fields.map(f => ({ ...f, _id: f._id || new Types.ObjectId().toString() })), // Ensure _id is string
                    colorScheme: formData.colorScheme || { ...initialColorScheme },
                    published: formData.published || false,
                    // sharedWith: formData.sharedWith || [],
                });
            }
        }),
        { name: 'FormBuilderStore' }
    )
);