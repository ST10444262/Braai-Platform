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