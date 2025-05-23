import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './Product.module.scss';
import { Link } from 'react-router-dom';
import Button from '~/components/Button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faImage } from '@fortawesome/free-solid-svg-icons';
import { DEFAULT_IMAGE } from '~/utils/imageUtils';
import { ImageUtils } from '~/utils/api';
import config from '~/config';
import routes from '~/config/routes';

const cx = classNames.bind(styles);

function Product({ image, name, link, productId, category }) {
    const [imageError, setImageError] = useState(false);
    const [finalImageUrl, setFinalImageUrl] = useState(DEFAULT_IMAGE);
    const imgRef = useRef(null);
    
    // Ensure we have a valid link
    const productLink = link || `${routes.products}/san-pham/${productId}`;
    
    // Process image URL using our API client's ImageUtils
    useEffect(() => {
        let isComponentMounted = true;
        
        // Reset error state on new image prop
        setImageError(false);
        
        const processImageUrl = () => {
            if (!isComponentMounted) return;
            
            let imageToProcess = null;
            
            // Handle different image prop types
            if (Array.isArray(image) && image.length > 0) {
                imageToProcess = image[0];
            } else if (typeof image === 'string' && image.trim() !== '') {
                imageToProcess = image;
            }
            
            if (imageToProcess) {
                // Use our ImageUtils to fix the URL
                const fixedUrl = ImageUtils.fixImageUrl(imageToProcess);
                console.log(`[Product] Fixed image URL for "${name}":`, {
                    original: imageToProcess,
                    fixed: fixedUrl
                });
                setFinalImageUrl(fixedUrl);
            } else {
                console.log(`[Product] No valid image for "${name}", using default`);
                setFinalImageUrl(DEFAULT_IMAGE);
            }
        };
        
        processImageUrl();
        
        // Cleanup
        return () => {
            isComponentMounted = false;
        };
    }, [image, name]);
    
    // Error handler for image load failures
    const handleImageError = (e) => {
        console.error(`[Product] Image failed to load for "${name}":`, finalImageUrl);
        e.target.onerror = null; // Prevent infinite loop
        setImageError(true);
    };

    return (
            <div className={cx('product-item')}>
            <div className={cx('product-image-container')}>
                {imageError ? (
                    <div className={cx('product-image-error')}>
                        <FontAwesomeIcon icon={faImage} className={cx('error-icon')} />
                        <span>Ảnh không hiển thị</span>
                    </div>
                ) : (
                    <img 
                        ref={imgRef}
                        className={cx('product-item-image')} 
                        src={finalImageUrl}
                        alt={name} 
                        onError={handleImageError}
                    />
                )}
            </div>
                <div className={cx('product-item-details')}>
                    <h2 className={cx('product-item-name')}>{name}</h2>

                <Link to={productLink} className={cx('detail-button-link')}>
                    <Button rounded outline rightIcon={<FontAwesomeIcon icon={faChevronRight}/>} className={cx('product-item-button')}>
                        Xem chi tiết
                    </Button>
                </Link>
            </div>
        </div>
    );
}

Product.propTypes = {
    image: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
    ]),
    name: PropTypes.string.isRequired,
    link: PropTypes.string,
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.string
};

export default Product; 