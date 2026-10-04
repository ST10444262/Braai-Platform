//same as useBraaiProduct, just with different filters and changing from braai to fireplace

"use client";
import { useState, useEffect, useMemo } from 'react';
import { getFireplaceProducts } from '@/services/ProductService';
import { FireplaceProduct } from '@/types/product';

const ITEMS_ON_PAGE = 6;

export function useFireplaceProducts(){

    //state is used instead of variables so react can notice and update when something changes
    //holds the list of all the products that have been fetched from the database
    const[allProducts, setAllProducts] = useState<FireplaceProduct[]>([])

    //set to true while fetching the products and then false once the data arrives
    const[loading, setLoading] = useState(true);

    //states for filtering and searching
    const[search, setSearchState] = useState(''); //the text in the search bar
    const[fireplaceType, setFireplaceTypeState] = useState(''); //the selected fireplace type from the filter dropdown
    const[powerRating, setPowerRatingState] = useState(''); // the selected power rating from the filter dropdown
    const[brand, setBrandState] = useState(''); // the selected brand from the filter dropdown

    const[sort, setSortState] = useState('name_asc'); //the default sort is name in ascending order
    const[page, setPage] = useState(1); //starting at page 1

    //fetching the data 
    //use effect is used when fetching data from an api
    useEffect(()=>{
        async function loadProducts(){
            setLoading(true);
            const fireplaceProducts = await getFireplaceProducts(); //gets the products from the api and saves it
            setAllProducts(fireplaceProducts); //saves the products into the state
            setLoading(false); //turn off the loading indicator
        }
        loadProducts();
    },[]); //the empty array is used to tell react to only run this once when the component first appears on the screen and to not run it again(reduces amount of api calls to make)
    
    //these are methods to update the filter and then reset back to page 1
    function setSearch(value: string) {
        setSearchState(value);
        setPage(1); // Reset to page 1 instantly in the same action
    }

    function setFireplaceType(value: string) {
        setFireplaceTypeState(value);
        setPage(1);
    }

    function setPowerRating(value: string) {
        setPowerRatingState(value);
        setPage(1);
    }

    function setBrand(value: string) {
        setBrandState(value);
        setPage(1);
    }

    function setSort(value: string) {
        setSortState(value);
        setPage(1);
    }

    //these are the dropdown menu options and where we extract the unique values for the dropdown menus
    //usememo is used to cache the dropdown arrays so they dont need to recalculate
    const fireplaceTypes = useMemo(()=> uniqueValues(allProducts, "fireplaceType"), [allProducts]);
    const powerRatings = useMemo(() => Array.from(new Set(allProducts.map((p) => String(p.heatOutputKw)))),[allProducts]);
    const brands = useMemo(()=> uniqueValues(allProducts, "brand"), [allProducts]);

    //Logic to filter and sort 
    const filtered = useMemo(()=>{
        //filtering products based on what the user selects
        const filteredList = allProducts.filter((p)=>{
            //checking if the product name contains search text
            const searchFound = p.name.toLowerCase().includes(search.toLowerCase());
            //checking the dropdown filters. if its empty then accept all products
            const matchFireplaceType = !fireplaceType  || p.fireplaceType  === fireplaceType ;
            const matchPower = !powerRating || String(p.heatOutputKw) === powerRating;
            const matchBrand = !brand || p.brand === brand;

            //a product must pass all the conditions to stay in the list
            return searchFound && matchFireplaceType && matchPower && matchBrand;
        });

        //sorting the filtered list based on the chosen sorting option
        return filteredList.sort((itemA,itemB)=>{
            if(sort === 'price_asc') return itemA.price - itemB.price; 
            if(sort === 'price_desc') return itemB.price - itemA.price;
            if(sort === 'name_desc') return itemB.name.localeCompare(itemA.name);
            //default fallback
            return itemA.name.localeCompare(itemB.name);
        });
    }, [allProducts, search, fireplaceType, powerRating, brand, sort]);

    //Splitting the products into pages
    //calculating how many pages well need based on how many products there are 
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_ON_PAGE));

    //calculating the start and end indexes for items on the current page
    const startIndex = (page -1) * ITEMS_ON_PAGE; //for example page 2 will start at index 6 as there is 6 items on each page
    const endIndex = page * ITEMS_ON_PAGE; //page 2 will end on index 12

    //getting only the products for the current page
    const productsPerPage = filtered.slice(startIndex, endIndex);

    //function to reset all the text and filter dropdown menus back to empty
    function clearFilters(){
        setSearchState('');
        setFireplaceTypeState('');
        setPowerRatingState('');
        setBrandState('');
        setPage(1);
    }

    return{
        products: productsPerPage,
        loading,
        fireplaceTypes,
        powerRatings,
        brands,
        search,
        setSearch,       
        fireplaceType,
        setFireplaceType,   
        powerRating,
        setPowerRating,    
        brand,
        setBrand,       
        sort,
        setSort,        
        page,
        setPage,
        totalPages,
        clearFilters,
    };

}

//function to extract unique dropdown options from the product array
function uniqueValues(products: FireplaceProduct[], key: 'fireplaceType'  | 'brand'): string[] {
  //Get an array containing only the specified field for example all fireplaceType strings
  const allValues = products.map((product) => product[key]);

  //Remove any undefined, null, or empty string values
  const validValues = allValues.filter((value): value is string => Boolean(value));

  //Set automatically eliminates duplicate values and Array.from converts it back to an array
  return Array.from(new Set(validValues));
}