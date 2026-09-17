import { ProductOptions } from "@/types/home";

export async function getOptions(): Promise<ProductOptions[]>
{
    //all images using a placeholder for now
    return[
    { id: '1', title: 'Free Standing Fireplaces', image: '/categories/insert.webp', link: '/fireplaces?type=freestanding' },
    { id: '2', title: 'Insert Fireplaces', image: '/categories/insert.webp', link: '/fireplaces?type=insert' },
    { id: '3', title: 'Gas Fireplaces', image: '/categories/insert.webp', link: '/fireplaces?type=gas' },
    { id: '4', title: 'Braais', image: '/categories/insert.webp', link: '/braais' },
    ];
}