//interface for braaiproduct
export interface BraaiProduct{
    id: string;
    name: string;
    brand: string;
    price: number;
    onSpecial?: number;
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