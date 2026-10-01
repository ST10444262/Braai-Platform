import { BraaiProduct, BraaiProductDetail, FireplaceProduct, FireplaceProductDetail } from "@/types/product";
import { OnSpecialProduct } from "@/types/product";

export async function getBraaiProducts(): Promise<BraaiProduct[]>{

    //FILL WITH REAL PRODUCTS API CALL ONCE I HAVE THEM

    //DELETE MOCK CALL BELOW
    return MOCK_PRODUCTS.filter((p) => p.category === 'braai') as BraaiProduct[];
}

export async function getBraaiProductById(id: string): Promise<BraaiProductDetail | null> {
    //FILL WITH REAL API CALL ONCE HAVE IT
    const product = MOCK_PRODUCTS.find((p) => p.id === id && p.category === 'braai');
    return (product as BraaiProductDetail) ?? null;
}

export async function getOnSpecialProducts(): Promise<OnSpecialProduct[]>{
    //FILL WITH ACTUAL API CALL
    return MOCK_PRODUCTS.filter((p) => p.onSpecial != null) as OnSpecialProduct[];
}

export async function getFireplaceProducts(): Promise<FireplaceProduct[]>{
    //FILL WITH ACTUAL API CALL
    return MOCK_PRODUCTS.filter((p) => p.category === 'fireplace') as FireplaceProduct[];
}

export async function getFireplaceProductById(id: string): Promise<FireplaceProductDetail | null>{
    //FILL WITH ACTUAL API CALL
    const product = MOCK_PRODUCTS.find((p) => p.id === id && p.category === 'fireplace');
    return (product as FireplaceProductDetail) ?? null;
}

interface MockProduct {
  id: string;
  name: string;
  brand: string;
  category: 'braai' | 'fireplace';
  price: number;
  onSpecial?: number;
  image: string;
  description: string;
  braaiType?: string;
  fuelType?: string;
  fireplaceType?:string;
  heatOutputKw?:number;
}


const MOCK_PRODUCTS: MockProduct[] = [
  { id: '1', name: 'Chad-O-Chef 4 Burner Hybrid Gas Grill', brand: 'Chad-O-Chef', category: 'braai', price: 52700, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Gas & Wood Hybrid', description: 'A versatile hybrid braai combining gas convenience with authentic wood-fired flavour.' },
  { id: '2', name: 'Chad-O-Chef Entertainer', brand: 'Chad-O-Chef', category: 'braai', price: 49900, onSpecial: 44900, image: '/categories/insert.webp', braaiType: 'Built-In', fuelType: 'Gas', description: 'A built-in gas braai designed for effortless outdoor entertaining.' },
  { id: '3', name: 'Joe Jr. with Cast Iron Stand', brand: 'Kamado Joe', category: 'braai', price: 11879, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Charcoal', description: 'A compact ceramic kamado grill, perfect for smaller outdoor spaces.' },
  { id: '4', name: 'Kratki Nadia 14G', brand: 'Kratki', category: 'fireplace', price: 103000, onSpecial: 94500, image: '/categories/insert.webp', description: 'A striking freestanding wood-burning fireplace with panoramic glass.', fireplaceType: 'Freestanding', heatOutputKw: 9 },
  { id: '5', name: 'Kratki K6', brand: 'Kratki', category: 'fireplace', price: 28200, onSpecial: 23500, image: '/categories/insert.webp', description: 'A compact insert fireplace ideal for smaller living spaces.', fireplaceType: 'Insert', heatOutputKw: 6 },
  { id: '6', name: 'SAfire Heeta 600 Arc', brand: 'Heeta', category: 'fireplace', price: 23890, onSpecial: 21995, image: '/categories/insert.webp', description: 'A modern linear gas fireplace with a striking arc-shaped flame.', fireplaceType: 'Built-In', heatOutputKw: 7 },
];



