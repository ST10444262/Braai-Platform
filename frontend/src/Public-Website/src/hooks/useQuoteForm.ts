'use client';
import { useState, type FormEvent } from 'react';
import { submitQuoteRequest } from '@/services/EnquiryService';

//these are the optional error fields
type FormErrors = {firstName?:string; lastName?:string; email?:string; phoneNumber?:string};


export function useQuoteForm(productId: string){
    //states for the input form to store the text typed into each field
    const[firstName, setFirstName] = useState('');
    const[lastName, setLastName] = useState('');
    const[email, setEmail] = useState('');
    const[phoneNumber, setPhoneNumber] = useState('');
    const[message, setMessage] = useState('');

    //tracking errors and loading states once the form has been submitted
    const[errors, setErrors] = useState<FormErrors>({}); // this is for the validation errors for inputs
    const[submitting, setSubmitting] = useState(false); //is true while the request is being sent to server
    const[submitted, setSubmitted] = useState(false); //true once the request succeeds
    const[submitError, setSubmitError] = useState<string | null>(null); //holds the server error message if sending fails

      // checking if the email address is in a valid format using regex
    function isValidEmail(emailText: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailText);
    }

    //validation logic to check all required fields. Similar to contact us page
    function validate(): boolean {
        const newErrors: FormErrors = {};

        // Checking if the full name is empty
        if (!firstName.trim()) {
            newErrors.firstName = 'Please enter your first name.';
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'Please enter your last name.';
        }

        // Check if email is empty or in the incorrect format
        if (!email.trim()) {
            newErrors.email = 'Please enter your email.';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        // Check if phone number is empty
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Please enter your phone number.';
        }

        // Save collected errors to state so the UI can display them
        setErrors(newErrors);

        // Returns true if no errors were found so the length is 0 or false if errors exist
        return Object.keys(newErrors).length === 0;
    }


    //handling submitting the form
    async function handleSubmit(e: FormEvent){
        //prevents the default browser behaviour which is to refresh the whole page on a submit
        e.preventDefault();

        //resets the previous server error message before retrying to submit the form
        setSubmitError(null);

        if(!validate()) return; //stopping the execution early if the validation for the form fails

        //turning on the loading state so the submit button can be greyed out to stop the user from submitting the same form multiple time
        setSubmitting(true);

        try{
            //sending quote request to api
            await submitQuoteRequest({firstName, lastName, email, phone: phoneNumber, productId, message:message||undefined,}); //sending notes as undefined incase its an empty string

            //marking the form as successfully submitted
            setSubmitted(true);
        }catch(err){
            console.error('Quote request failed: ', err);
            setSubmitError("We could not send your request. Please try again or give us a call");
        }finally{setSubmitting(false);} //turning off loading state
        
    }
    return {
    firstName, setFirstName, lastName, setLastName, email, setEmail, phoneNumber, setPhoneNumber, message, setMessage, errors, submitting, submitted, submitError, handleSubmit,
  };


}