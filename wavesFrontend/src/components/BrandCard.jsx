import React from 'react';
import { Link } from 'react-router-dom';

import nikeLogo from '../assets/nike-shoe.jpg';
import adidasLogo from '../assets/adidas-shoe.jpg';
import pumaLogo from '../assets/puma-shoe.jpg';
import pradaLogo from '../assets/prada-shoe.jpg';

export const MAIN_BRANDS = [
    {
        id: 'nike',
        name: 'Nike',
        tagline: 'Just Do It',
        logo: nikeLogo,
        description: 'Premium athletic footwear & sportswear.',
        link: '/brands?brand=nike',
    },
    {
        id: 'adidas',
        name: 'Adidas',
        tagline: 'Impossible is Nothing',
        logo: adidasLogo,
        description: 'Iconic streetwear & performance gear.',
        link: '/brands?brand=adidas',
    },
    {
        id: 'puma',
        name: 'Puma',
        tagline: 'Forever Faster',
        logo: pumaLogo,
        description: 'Sleek sportstyle sneakers & apparel.',
        link: '/brands?brand=puma',
    },
    {
        id: 'prada',
        name: 'Prada',
        tagline: 'Luxury Refined',
        logo: pradaLogo,
        description: 'High-fashion footwear design.',
        link: '/brands?brand=prada',
    },
];

const BrandCard = ({ name, tagline, logo, description, link }) => {
    return (
        <div className="flex flex-col group">
            <Link
                to={link || '#'}
                className="bg-neutral-900 rounded-[32px] h-[380px] sm:h-[420px] w-full flex items-center justify-center relative overflow-hidden mb-3 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-[#81A6C6]/20 border border-white/10 group-hover:border-[#81A6C6]/40"
            >
                <img
                    src={logo}
                    alt={name}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/600x600?text=Brand+Image';
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                <div className="absolute inset-x-3 bottom-3 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex flex-col justify-end transition-all duration-300 group-hover:bg-black/60 group-hover:border-[#81A6C6]/30">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                        <span className="text-white font-bold text-base sm:text-lg tracking-wide group-hover:text-[#81A6C6] transition-colors">
                            {name}
                        </span>
                        {tagline && (
                            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-200 font-semibold bg-[#81A6C6]/20 text-[#81A6C6] px-2.5 py-0.5 rounded-full border border-[#81A6C6]/30 backdrop-blur-sm whitespace-nowrap">
                                {tagline}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>
            </Link>
        </div>
    );
};

export default BrandCard;