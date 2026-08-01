import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

import defaultProductImg from '../assets/prada-shoe.jpg';

const ProductCard = ({ product }) => {
    const {
        id = 1,
        name = 'Prada Pumps',
        price = 145,
        oldPrice = null,
        discount_percent = null,
        final_price = null,
        discount = discount_percent,
        main_image,
        image = main_image || defaultProductImg,
    } = product || {};

    const hasDiscount = Boolean(discount_percent) && final_price != null && Number(final_price) < Number(price);

    return (
        <div className="group flex flex-col w-full bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#AACDDC] transition-all duration-300">
            <Link to={`/products/${id}`} className="block w-full">
                <div className="w-full aspect-square bg-[#F3E3D0]/30 rounded-xl overflow-hidden flex items-center justify-center p-4 relative">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                    {(hasDiscount || Boolean(discount)) && (
                        <span className="absolute top-2.5 left-2.5 bg-[#81A6C6] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                            {typeof discount === 'number' ? `-${discount}%` : discount}
                        </span>
                    )}
                </div>
            </Link>

            <div className="mt-3 flex flex-col gap-1.5 px-1">
                <Link to={`/products/${id}`}>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate tracking-tight group-hover:text-[#81A6C6] transition-colors">
                        {name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg sm:text-xl font-black text-black tracking-tight">
                        {formatCurrency(hasDiscount ? final_price : price)}
                    </span>

                    {hasDiscount ? (
                        <span className="text-xs sm:text-sm font-semibold text-gray-400 line-through">
                            {formatCurrency(price)}
                        </span>
                    ) : oldPrice ? (
                        <span className="text-xs sm:text-sm font-semibold text-gray-400 line-through">
                            {formatCurrency(oldPrice)}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;