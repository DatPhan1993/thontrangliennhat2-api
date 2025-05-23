import config from '~/config';
import { ImageUtils } from './api';

/**
 * Debug function to log image path processing
 * @param {string} message - The debug message
 * @param {any} data - The data to log
 */
const debugLog = (message, data) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[ImageUtil] ${message}:`, data);
    }
};

// URL hình ảnh mặc định khi không có hình
export const DEFAULT_IMAGE = '';
export const DEFAULT_SMALL_IMAGE = '';
export const DEFAULT_ERROR_IMAGE = '';

/**
 * Chuẩn hóa URL hình ảnh - Updated to use ImageUtils.fixImageUrl
 * @param {string} imageUrl - URL hình ảnh cần chuẩn hóa
 * @param {string} defaultImage - URL hình mặc định khi không có hình
 * @returns {string} URL hình ảnh đã chuẩn hóa
 */
export const normalizeImageUrl = (imageUrl, defaultImage = DEFAULT_IMAGE) => {
    // Nếu không có URL hoặc URL không hợp lệ
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        debugLog('Invalid or empty image URL, using default', defaultImage);
        return defaultImage;
    }
    
    // Use our API client's ImageUtils.fixImageUrl for consistent handling
    const fixedUrl = ImageUtils.fixImageUrl(imageUrl);
    debugLog('Fixed image URL', { original: imageUrl, fixed: fixedUrl });
    
    return fixedUrl;
};

/**
 * Xử lý mảng hình ảnh, chuyển đổi tất cả URL thành dạng chuẩn
 * @param {Array|string} images - Mảng URL hình ảnh hoặc URL đơn
 * @returns {Array} Mảng các URL hình ảnh đã chuẩn hóa
 */
export const normalizeImageArray = (images) => {
    // Nếu không có dữ liệu
    if (!images) {
        return [];
    }
    
    // Nếu là chuỗi, chuyển thành mảng có 1 phần tử
    if (typeof images === 'string') {
        return [normalizeImageUrl(images)];
    }
    
    // Nếu là mảng, chuẩn hóa từng phần tử
    if (Array.isArray(images)) {
        return images
            .filter(img => img && (typeof img === 'string' || img instanceof File))
            .map(img => {
                if (img instanceof File) return img;
                return normalizeImageUrl(img);
            });
    }
    
    // Mặc định trả về mảng rỗng
    return [];
};

/**
 * Hàm tương thích ngược cho các component cũ - Updated to use ImageUtils
 * @param {string|Array} imagePath - Đường dẫn ảnh hoặc mảng đường dẫn
 * @returns {string} URL ảnh đã chuẩn hóa
 */
export const getImageUrl = (imagePath) => {
    debugLog('getImageUrl called with', imagePath);
    
    // Xử lý trường hợp null hoặc undefined
    if (!imagePath) {
        return DEFAULT_IMAGE;
    }
    
    // Xử lý trường hợp là mảng
    if (Array.isArray(imagePath)) {
        if (imagePath.length === 0) return DEFAULT_IMAGE;
        
        // Lấy phần tử đầu tiên của mảng
        const firstImage = imagePath[0];
        if (!firstImage) return DEFAULT_IMAGE;
        
        return normalizeImageUrl(firstImage);
    }
    
    // Xử lý trường hợp là chuỗi JSON
    if (typeof imagePath === 'string') {
        if (imagePath.startsWith('[') || imagePath.startsWith('{')) {
            try {
                const parsed = JSON.parse(imagePath);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return normalizeImageUrl(parsed[0]);
                }
                if (parsed && typeof parsed === 'object') {
                    return normalizeImageUrl(parsed.url || parsed.path || parsed.src || '');
                }
            } catch (e) {
                // Nếu không phải JSON hợp lệ, tiếp tục xử lý bình thường
            }
        }
        
        // Xử lý các trường hợp còn lại bằng normalizeImageUrl
        return normalizeImageUrl(imagePath);
    }
    
    // Fallback cuối cùng
    return DEFAULT_IMAGE;
};