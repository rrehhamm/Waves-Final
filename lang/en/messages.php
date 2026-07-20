<?php

// رسائل النجاح/الخطأ اللي بترجعها الـ Controllers (بالإنجليزي)
// بنستخدمها هيك بالكود: __('messages.category_created')
return [

    // ===== Auth =====
    'invalid_credentials' => 'Invalid login credentials.',
    'login_success' => 'Logged in successfully',
    'logout_success' => 'Logged out successfully',
    'register_success' => 'Account created successfully',

    // ===== Categories =====
    'category_created' => 'Category created successfully',
    'category_updated' => 'Category updated successfully',
    'category_deleted' => 'Category deleted successfully',
    'category_has_products' => 'This category cannot be deleted because it has associated products. Delete or reassign those products first.',

    // ===== Brands =====
    'brand_created' => 'Brand created successfully',
    'brand_updated' => 'Brand updated successfully',
    'brand_deleted' => 'Brand deleted successfully',
    'brand_has_products' => 'This brand cannot be deleted because it has associated products. Delete or reassign those products first.',

    // ===== Products =====
    'product_created' => 'Product created successfully',
    'product_updated' => 'Product updated successfully',
    'product_deleted' => 'Product deleted successfully',
    'product_restored' => 'Product restored successfully',
    'product_force_deleted' => 'Product permanently deleted successfully',

    // ===== Banners =====
    'banner_created' => 'Banner created successfully',
    'banner_updated' => 'Banner updated successfully',
    'banner_deleted' => 'Banner deleted successfully',
    'banner_status_changed' => 'Banner status changed successfully',

    // ===== Gallery =====
    'gallery_created' => 'Image added successfully',
    'gallery_updated' => 'Image updated successfully',
    'gallery_deleted' => 'Image deleted successfully',
    'gallery_sorted' => 'Images order updated successfully',

    // ===== Contact Messages =====
    'contact_sent' => 'Your message has been sent successfully, we will contact you soon',
    'contact_marked_read' => 'Message marked as read',
    'contact_deleted' => 'Message deleted successfully',

    // ===== Orders =====
    'order_created' => 'Your order has been created successfully, order number: :number',
    'order_status_updated' => 'Order status updated successfully',
    'order_products_required' => 'You must add at least one product to the order.',
    'order_product_not_found' => 'One of the selected products was not found.',

];
