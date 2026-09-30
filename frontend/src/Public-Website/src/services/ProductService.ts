import { BraaiProduct, BraaiProductDetail } from "@/types/product";
import { OnSpecialProduct } from "@/types/product";

export async function getBraaiProducts(): Promise<BraaiProduct[]>{

    //FILL WITH REAL PRODUCTS API CALL ONCE I HAVE THEM

    //DELETE MOCK CALL BELOW
    return mockBraaiProducts;
}

export async function getBraaiProductById(id: string): Promise<BraaiProductDetail | null> {
    //FILL WITH REAL API CALL ONCE HAVE IT
    return mockBraaiProducts.find((p) => p.id === id) ?? null;
}

export async function getOnSpecialProducts(): Promise<OnSpecialProduct[]>{
    //FILL WITH ACTUAL API CALL
    return MOCK_SPECIAL_PRODUCTS;
}

const MOCK_SPECIAL_PRODUCTS: OnSpecialProduct[] = [
  { id: 's1', name: 'Kratki Nadia 14G', brand: 'Kratki', category: 'fireplace', price: 103000, onSpecial: 94500, image: '/categories/insert.webp' },
  { id: 's2', name: 'Kratki K6', brand: 'Kratki', category: 'fireplace', price: 28200, onSpecial: 23500, image: '/categories/insert.webp' },
  { id: 's3', name: 'SAfire Heeta 600 Arc', brand: 'Heeta', category: 'fireplace', price: 23890, onSpecial: 21995, image: '/categories/insert.webp' },
  { id: 's4', name: 'Kratki K12', brand: 'Kratki', category: 'fireplace', price: 21900, onSpecial: 16900, image: '/categories/insert.webp' },
  { id: 's5', name: 'Kratki AB-S', brand: 'Kratki', category: 'fireplace', price: 42600, onSpecial: 34080, image: '/categories/insert.webp' },
  { id: 's6', name: 'Kratki Rollo 2', brand: 'Heeta', category: 'fireplace', price: 42000, onSpecial: 33500, image: '/categories/insert.webp' },
  { id: 's7', name: 'Chad-O-Chef Entertainer', brand: 'Chad-O-Chef', category: 'braai', price: 49900, onSpecial: 44900, image: '/categories/insert.webp' },
];


const mockBraaiProducts: BraaiProductDetail[] = [
 // { id: '1', name: 'Chad-O-Chef 4 Burner Hybrid Gas Grill', brand: 'Chad-O-Chef', price: 52700, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Gas & Wood Hybrid' },
 // { id: '2', name: 'Chad-O-Chef Entertainer', brand: 'Chad-O-Chef', price: 49900, image: '/categories/insert.webp', braaiType: 'Built-In', fuelType: 'Gas' },
 // { id: '3', name: 'Joe Jr. with Cast Iron Stand', brand: 'Kamado Joe', price: 11879, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Charcoal' },
 // { id: '4', name: 'Classic Joe Grill Series I', brand: 'Kamado Joe', price: 23775, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Charcoal' },
 // { id: '5', name: 'SAfire Pyro Wood Braai with Pizza Oven', brand: 'Safire', price: 61450, image: '/categories/insert.webp', braaiType: 'Built-In', fuelType: 'Wood' },
 // { id: '6', name: 'Home Fires Spit SDL Built-In Braai', brand: 'Safire', price: 40160, onSpecial: 35900, image: '/categories/insert.webp', braaiType: 'Built-In', fuelType: 'Wood' },
 // { id: '7', name: 'Cadac Meridian 4-Burner', brand: 'Cadac', price: 18500, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Gas' },
 // { id: '8', name: 'Jetmaster Braai Insert 900', brand: 'Jetmaster', price: 27300, image: '/categories/insert.webp', braaiType: 'Built-In', fuelType: 'Wood' },
 {
    id: '1',
    name: 'Chad-O-Chef 4 Burner Hybrid Gas Grill',
    brand: 'Chad-O-Chef',
    price: 52700,
    image: '/categories/insert.webp',
    braaiType: 'Freestanding',
    fuelType: 'Gas & Wood Hybrid',
    description: 'A versatile hybrid braai combining gas convenience with authentic wood-fired flavour.',
  },
  {
    id: '2',
    name: 'Chad-O-Chef Entertainer',
    brand: 'Chad-O-Chef',
    price: 49900,
    image: '/categories/insert.webp',
    braaiType: 'Built-In',
    fuelType: 'Gas',
    description: 'A built-in gas braai designed for effortless outdoor entertaining.',
  },
  {
    id: '3',
    name: 'Joe Jr. with Cast Iron Stand',
    brand: 'Kamado Joe',
    price: 11879,
    image: '/categories/insert.webp',
    braaiType: 'Freestanding',
    fuelType: 'Charcoal',
    description: 'A compact ceramic kamado grill, perfect for smaller outdoor spaces.',
  },
];