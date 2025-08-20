"use client";

import { useState, useRef } from 'react';
import { createPost } from '@/app/actions';

export default function DonorForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const formRef = useRef<HTMLFormElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedImages(filesArray);
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
                            <input
                                type="text"
                                id="food_name"
                                name="food_name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="Enter food name"
                                required
                            />
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
