// same as useBraaiProductDetail, just replacing braai with fireplace

"use client";
import { useState, useEffect } from 'react';
import { getFireplaceProductById } from '@/services/ProductService';
import { FireplaceProductDetail } from '@/types/product';

export function useFireplaceProductDetail(id: string){
    //holds the individual products data and starts as null as nothings been selected yet
    const [product, setProduct] = useState<FireplaceProductDetail | null>(null);
    //true while waiting for the products information to load from api and false once its loaded
    const [loading, setLoading] = useState(true);

    //fetching the individual product data
    useEffect(()=>{
        async function load(){
            setLoading(true);
            const individualFireplaceProduct = await getFireplaceProductById(id);
            //saving the product details into the state
            setProduct(individualFireplaceProduct);
            //turning the loading status to false now that the data is ready
            setLoading(false);
        }
        load();
    }, [id]); //rerunning this code everytime the id changes
    return{product, loading}; //returning the data to the ui
}