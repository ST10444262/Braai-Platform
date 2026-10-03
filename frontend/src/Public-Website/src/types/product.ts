//interface for braaiproduct
export interface BraaiProduct{
    id: string;
    name: string;
    brand: string;
    price: number;
    onSpecial?: number|null;
    image: string;
    braaiType: string; //example would be freestanding or built in
    fuelType: string; //example would be gas, wood or charcoal
}

export interface BraaiProductDetail extends BraaiProduct{
    description: string;
}

export type ProductCategory = 'braai' | 'fireplace';

export interface OnSpecialProduct{
    id: string;
    name: string;
    brand: string;
    category: ProductCategory;
    price: number;
    onSpecial: number;
    image: string;
}


export interface FireplaceProduct{
    id: string;
    name: string;
    brand: string;
    price: number;
    onSpecial?: number|null;
    image: string;
    fireplaceType: string;
    heatOutputKw?: number;
}

export interface FireplaceProductDetail extends FireplaceProduct{
    description: string;
}

export interface ApiProduct{
  id: string;
  name: string;
  category: string;
  productType: string;
  brand: string;
  isImported: boolean;
  isCustomisable: boolean;
  price: number;
  onSpecial: number | null;
  description: string;
  images: ApiProductImage[];
  fuelType: string | null;       
  heatOutputKw: number | null;
}

export interface ApiProductImage{
    url: string;
    isPrimary: boolean;
}