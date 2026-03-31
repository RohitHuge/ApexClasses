import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderService } from '../order/orderService';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await orderService.getProducts();
            if (res.success) {
                setProducts(res.products);
            }
        } catch (error) {
            console.error('Fetch products error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProductContext.Provider value={{ products, loading, fetchProducts }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);
