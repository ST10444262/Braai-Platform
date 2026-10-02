import { QuoteRequest, EnquiryResponse } from "@/types/enquiry";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const QUOTES_ENDPOINT = `${API_BASE_URL}/api/public/quotes`;

export async function submitQuoteRequest(payload: QuoteRequest):Promise<EnquiryResponse>{

    const res = await fetch(QUOTES_ENDPOINT, {
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload),
    });
    if(!res.ok){
        throw new Error(`Quote request has failed with the status: ${res.status}`);
    }
    return res.text();
}

//contact us call. Product id is omitted as theres no product id on contact us form
export async function submitContactUsEnquiry(payload: Omit<QuoteRequest,'productId'>):Promise<EnquiryResponse>{
    const requestBody = JSON.stringify({...payload, productId:null});
    const maxAttempts = 3; //max amount of attempts to submit the contact us form
    let lastError:unknown;

    //for loop to track number of attempts before sending error message
    for(let attempt = 1;attempt<=maxAttempts;attempt++){
        try{
        const res = await fetch(QUOTES_ENDPOINT, {
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body:requestBody,
    });
    if(!res.ok){
        throw new Error(`Quote request has failed with the status: ${res.status}`);
    }
    return res.text();
        }catch(err){
            lastError = err;
            if(attempt<maxAttempts){
                await new Promise((resolve)=>setTimeout(resolve, attempt*1000));//1 second retry time the first request and then 2 seconds after that
            }
        }
    }
    throw lastError;
}