
import React, { useState, useRef } from 'react';
import type { ImageInfo } from '../types';

interface ImageUploadProps {
    title: string;
    imageInfo: ImageInfo;
    onImageChange: (file: File) => void;
    onNotesChange: (notes: string) => void;
    isReadOnly?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ title, imageInfo, onImageChange, onNotesChange, isReadOnly = false }) => {
    const [preview, setPreview] = useState<string | null>(imageInfo.url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                onImageChange(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onNotesChange(event.target.value);
    }
    
    const triggerFileSelect = () => {
        if (!isReadOnly) {
            fileInputRef.current?.click();
        }
    }

    return (
        <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-medium text-neutral-700 text-center">{title}</h4>
            <div
                className={`relative w-full aspect-square bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-500 overflow-hidden ${!isReadOnly ? 'cursor-pointer hover:border-primary' : 'cursor-not-allowed'}`}
                onClick={triggerFileSelect}
            >
                {preview ? (
                    <img src={preview} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="mt-2 block text-xs font-medium">Click to upload</span>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                    disabled={isReadOnly}
                />
            </div>
            <textarea
                value={imageInfo.notes}
                onChange={handleNotesChange}
                placeholder="Add notes..."
                rows={2}
                className="block w-full text-sm border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                readOnly={isReadOnly}
            />
        </div>
    );
};

export default ImageUpload;