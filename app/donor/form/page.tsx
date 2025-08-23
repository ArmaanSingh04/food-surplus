"use client";

import { useState, useRef } from 'react';
import { createPost } from '@/app/actions';

export default function DonorForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const formRef = useRef<HTMLFormElement>(null);

    // Controlled food name to enable programmatic updates from the model
    const [foodName, setFoodName] = useState<string>("");
    // Store the latest prediction coming from the model
    const [predictedName, setPredictedName] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const MODEL_URL = 'http://localhost:8000/predict';

    const predictFromImage = async (image: File): Promise<string | null> => {
        try {
            const fd = new FormData();
            // Common FastAPI pattern is field name 'file'
            fd.append('file', image);
            const res = await fetch(MODEL_URL, {
                method: 'POST',
                body: fd,
            });
            if (!res.ok) return null;
            const data = await res.json();
            console.log('Prediction API response:', data);
            // Accept common shapes, prioritize FastAPI format: { predictions: [{ class, confidence }] }
            const name: string | undefined =
                data?.predictions?.[0]?.class ??
                data?.label ??
                data?.class ??
                data?.prediction ??
                data?.name ??
                data?.food_name;
            return name ?? null;
        } catch (err) {
            console.error('Prediction API error:', err);
            return null;
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedImages(filesArray);
            // Instantly upload first image to get a quick name suggestion
            if (filesArray.length > 0) {
                setIsGenerating(true);
                const name = await predictFromImage(filesArray[0]);
                if (name) {
                    setPredictedName(name);
                    // Do not overwrite user's manual entry if present
                    setFoodName(prev => (prev && prev.trim().length > 0 ? prev : name));
                }
                setIsGenerating(false);
            }
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const clearForm = () => {
        // Reset the form
        if (formRef.current) {
            formRef.current.reset();
        }
        // Clear selected images
        setSelectedImages([]);
        // Clear any file input
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        // Clear controlled and prediction states
        setFoodName("");
        setPredictedName("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const formData = new FormData(e.currentTarget);

            // Add all selected images to formData
            selectedImages.forEach((image, index) => {
                formData.append(`image_${index}`, image);
            });

            // Add the count of images
            formData.append('imageCount', selectedImages.length.toString());

            const result = await createPost(formData);

            if (result.success) {
                setMessage({ type: 'success', text: 'Food donation posted successfully!' });
                // Clear the form completely
                clearForm();
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to post donation' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Fill the form for the surplus food</h2>
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`mb-4 p-3 rounded-md ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="food_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Food Name
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="food_name"
                                    name="food_name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="Enter food name"
                                    required
                                    value={foodName}
                                    onChange={(e) => setFoodName(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (selectedImages.length === 0) return;
                                        setIsGenerating(true);
                                        const name = await predictFromImage(selectedImages[0]);
                                        if (name) {
                                            setPredictedName(name);
                                            setFoodName(name);
                                        }
                                        setIsGenerating(false);
                                    }}
                                    className="shrink-0 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    disabled={selectedImages.length === 0 || isGenerating}
                                    aria-label="Generate food name from image"
                                >
                                    {isGenerating ? 'Generating...' : 'Generate'}
                                </button>
                            </div>
                            {predictedName && (
                                <p className="text-xs text-gray-500 mt-1">Suggestion: {predictedName}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="food_type" className="block text-sm font-medium text-gray-700 mb-2">
                                Food Type
                            </label>
                            <select
                                id="food_type"
                                name="food_type"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                required
                            >
                                <option value="veg">Vegetarian</option>
                                <option value="nonveg">Non-Vegetarian</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="quantity_value" className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    id="quantity_value"
                                    name="quantity_value"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="0"
                                    min="1"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="quantity_type" className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit
                                </label>
                                <select
                                    id="quantity_type"
                                    name="quantity_type"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    required
                                >
                                    <option value="plates">Plates</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="items">Items</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="Enter pickup address"
                            />
                            <p className="text-xs text-gray-500 mt-1">This helps recipients know where to pick up.</p>
                        </div>

                        <div>
                            <label htmlFor="expiry_timer" className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Time
                            </label>
                            <input
                                type="datetime-local"
                                id="expiry_timer"
                                name="expiry_timer"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="freshness_status" className="block text-sm font-medium text-gray-700 mb-2">
                                Freshness Status
                            </label>
                            <select
                                id="freshness_status"
                                name="freshness_status"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                required
                            >
                                <option value="freshcooked">Fresh Cooked</option>
                                <option value="packaged">Packaged</option>
                                <option value="near_expiry">Near Expiry</option>
                                <option value="unknown">Unknown</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                                Food Images (Multiple)
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">You can select multiple images</p>
                            <p className="text-xs text-gray-500 mt-1">Images are uploaded to the model instantly to suggest a name.</p>
                        </div>

                        {/* Selected Images Preview */}
                        {selectedImages.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Selected Images ({selectedImages.length})
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-md border border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || selectedImages.length === 0}
                            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Posting...' : 'Donate Food'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
