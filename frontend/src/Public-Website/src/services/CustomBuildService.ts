import { CustomBuildRequest, CustomBuildResponse } from "@/types/customBuild";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export async function submitCustomBuild(payload: CustomBuildRequest): Promise<CustomBuildResponse>{
    const res = await fetch(`${API_BASE_URL}/api/public/customBuilds`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload),
    });

    if(!res.ok){
        throw new Error('Failed to submit custom build: ${res.status}');
    }

    return res.json();
}