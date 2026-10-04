import { ApiProduct, BraaiProduct, BraaiProductDetail, FireplaceProduct, FireplaceProductDetail } from "@/types/product";
import { OnSpecialProduct } from "@/types/product";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/public/products`;

//fetching all products from api
async function getProducts(category?: 'braai' | 'fireplace'):Promise<ApiProduct[]>{
    const params = new URLSearchParams({pageSize: '100'});
    if(category) params.set('category', category);
    const res = await fetch(`${PRODUCTS_ENDPOINT}?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch products (status ${res.status})`);
    return res.json();
}

//fetching a product by its id
async function getProductById(id:string): Promise<ApiProduct|null>{
    const res = await fetch(`${PRODUCTS_ENDPOINT}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch the product ${id} with (status ${res.status})`);
    return res.json();
}

//getting the products image from database
function getProductImageUrl(product: ApiProduct):string{
    const pImage = product.images.find((img)=>img.isPrimary);
    return pImage?.url ?? product.images[0]?.url??'/categories/insert.webp';
}
//getting the products category
function isCategory(product:ApiProduct, category:'braai'|'fireplace'):boolean{
    return product.productType.toLowerCase() === category;
}


//mapping api product to different interfaces in the types folder
function toBraaiProduct(p: ApiProduct): BraaiProductDetail {
  return{
    id:p.id,
    name:p.name,
    brand:p.brand,
    price:p.price,
    onSpecial:p.onSpecial,
    image:getProductImageUrl(p),
    braaiType:p.category,
    fuelType:p.fuelType ?? '', 
    description:p.description,
  };
}

function toFireplaceProduct(p: ApiProduct): FireplaceProductDetail {
  return{
    id:p.id,
    name:p.name,
    brand:p.brand,
    price:p.price,
    onSpecial:p.onSpecial,
    image:getProductImageUrl(p),
    fireplaceType:p.category,
    heatOutputKw:p.heatOutputKw ?? undefined, 
    description:p.description,
  };
}
function toOnSpecialProduct(p:ApiProduct):OnSpecialProduct{
    return{
        id: p.id,
        name:p.name,
        brand:p.brand,
        category:isCategory(p, 'braai') ? 'braai' : 'fireplace',
        price:p.price,
        onSpecial:p.onSpecial as number,
        image:getProductImageUrl(p),
    };
}


export async function getBraaiProducts(): Promise<BraaiProduct[]>{

    //category is filtered on the client side in case the backends category filter fails
   // const braaiProducts = await getProducts('braai');
    const braaiProducts = await getProducts();
    return braaiProducts.filter((p)=>isCategory(p, 'braai')).map(toBraaiProduct);
}

export async function getBraaiProductById(id: string): Promise<BraaiProductDetail | null> {
    //fetching the product by its id
    const braaiProduct = await getProductById(id)
    if(!braaiProduct || !isCategory(braaiProduct, 'braai'))return null;
    return toBraaiProduct(braaiProduct);
}

export async function getOnSpecialProducts(): Promise<OnSpecialProduct[]>{
    //not filtering here as specials are for both braais and fireplaces
    const specialCatalogue = await getProducts();
    return specialCatalogue.filter((p)=>p.onSpecial!=null).map(toOnSpecialProduct);
}

export async function getFireplaceProducts(): Promise<FireplaceProduct[]>{
    //category is filtered on the client side in case the backends category filter fails
    const fireplaceProducts = await getProducts();
    return fireplaceProducts.filter((p)=>isCategory(p, 'fireplace')).map(toFireplaceProduct);
}

export async function getFireplaceProductById(id: string): Promise<FireplaceProductDetail | null>{
    //fetching the product by its id
    const fireplaceProduct = await getProductById(id)
    if(!fireplaceProduct || !isCategory(fireplaceProduct, 'fireplace'))return null;
    return toFireplaceProduct(fireplaceProduct);
}




