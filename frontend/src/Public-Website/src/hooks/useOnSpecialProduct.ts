'use client';

//Similar to UseBraaiProduct just with a tab filter instead of dropdowns and theres no search
import { useState, useEffect, useMemo } from 'react';
import { getOnSpecialProducts } from '@/services/ProductService';
import { OnSpecialProduct, ProductCategory } from '@/types/product';

const ITEMS_ON_PAGE = 6; //number of products on special displayed on page

export function useOnSpecialProducts(){
    //state is used instead of variables so react can notice and update when something changes
    //holds the list of all the products on special that have been fetched from the database
    const[allSpecials, setAllSpecials] = useState<OnSpecialProduct[]>([]);

     //set to true while fetching the products on special and then false once the data arrives
    const[loading, setLoading] = useState(true);
    //Tracks the currently selected category tab. it starts on all when opening the page
    const [activeTab, setActiveTabState] = useState<'all' | ProductCategory>('all');
    //the current page number the user is on. it starts at 1
    const [page, setPage] = useState(1);

    //fetching the data 
    //use effect is used when fetching data from an api
    useEffect(()=>{
        async function loadSpecials(){
            setLoading(true);
            const specialsProducts = await getOnSpecialProducts(); //gets the products on special from the api and saves it
            setAllSpecials(specialsProducts); //saves the products into the state
            setLoading(false); //turn off the loading indicator
        }
        loadSpecials();
    },[]); //the empty array is used to tell react to only run this once when the component first appears on the screen and to not run it again(reduces amount of api calls to make)

    //changes the active category tab and resets the page back to 1 at the same time
    function setActiveTab(tab: 'all'|ProductCategory){
        setActiveTabState(tab);
        setPage(1);
    }

    //usememo caches the filtered array so it only recalculates when the filter tab is changed
    const filtered = useMemo(()=>{
        if(activeTab === 'all'){
            return allSpecials;
        }

        //if not all then keeping only the products matching the active category tab
        return allSpecials.filter((product)=>product.category === activeTab);
    }, [allSpecials, activeTab]);

    //Splitting the products into pages
    //calculating how many pages well need based on how many products there are 
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_ON_PAGE));

    //calculating the start and end indexes for items on the current page
    const startIndex = (page -1) * ITEMS_ON_PAGE; //for example page 2 will start at index 6 as there is 6 items on each page
    const endIndex = page * ITEMS_ON_PAGE; //page 2 will end on index 12

    //getting only the products for the current page
    const productsPerPage = filtered.slice(startIndex, endIndex);

    return{
        products: productsPerPage, loading, activeTab, setActiveTab, page, setPage, totalPages
    };

}