import { BraaiProduct } from "@/types/product";

export async function getBraaiProducts(): Promise<BraaiProduct[]>{

    //FILL WITH REAL PRODUCTS API CALL ONCE I HAVE THEM

    //DELETE MOCK CALL BELOW
    return mockBraaiProducts;
}

const mockBraaiProducts: BraaiProduct[] = [
  { id: '1', name: 'Chad-O-Chef 4 Burner Hybrid Gas Grill', brand: 'Chad-O-Chef', price: 52700, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Gas & Wood Hybrid' },
  { id: '2', name: 'Chad-O-Chef Entertainer', brand: 'Chad-O-Chef', price: 49900, image: '/categories/insert.webp', braaiType: 'Built-In', fuelType: 'Gas' },
  { id: '3', name: 'Joe Jr. with Cast Iron Stand', brand: 'Kamado Joe', price: 11879, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Charcoal' },
  { id: '4', name: 'Classic Joe Grill Series I', brand: 'Kamado Joe', price: 23775, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Charcoal' },
  { id: '5', name: 'SAfire Pyro Wood Braai with Pizza Oven', brand: 'Safire', price: 61450, image: '/categories/insert.webp', braaiType: 'Built-In', fuelType: 'Wood' },
  { id: '6', name: 'Home Fires Spit SDL Built-In Braai', brand: 'Safire', price: 40160, onSpecial: 35900, image: '/categories/insert.webp', braaiType: 'Built-In', fuelType: 'Wood' },
  { id: '7', name: 'Cadac Meridian 4-Burner', brand: 'Cadac', price: 18500, image: '/categories/insert.webp', braaiType: 'Freestanding', fuelType: 'Gas' },
  { id: '8', name: 'Jetmaster Braai Insert 900', brand: 'Jetmaster', price: 27300, image: '/categories/insert.webp', braaiType: 'Built-In', fuelType: 'Wood' },
];