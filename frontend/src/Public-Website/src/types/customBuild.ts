export interface CustomBuildRequest{
    optionType: string;
    widthMm: number;
    heightMm: number;
    depthMm: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export type CustomBuildResponse = string;