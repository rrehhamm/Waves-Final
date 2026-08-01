import React, { useState } from 'react';
import { FiMaximize2, FiImage } from 'react-icons/fi';

const GalleryCard = ({ item, onClick }) => {
    const imageSrc = item.image || item.image_url;
    const [imageFailed, setImageFailed] = useState(false);
    const title = item.title || item.name;

    return (
        <div
            onClick={onClick}
            className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-gray-900 group cursor-pointer border border-gray-100"
        >
            {imageSrc && !imageFailed ? (
                <img
                    src={imageSrc}
                    alt={title || 'Gallery image'}
                    onError={() => setImageFailed(true)}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                    <FiImage className="w-10 h-10" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity p-6 flex flex-col justify-end">
                {title && <h3 className="text-white text-lg font-bold uppercase">{title}</h3>}
                {item.description && <p className="text-xs text-gray-300 line-clamp-1">{item.description}</p>}
            </div>
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <FiMaximize2 className="w-4 h-4" />
            </div>
        </div>
    );
};

export default GalleryCard;