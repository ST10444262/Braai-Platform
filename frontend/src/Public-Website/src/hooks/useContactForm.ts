'use client';


import { useState, FormEvent } from "react"; //useState is used for storing data that changes
import { submitContactUsEnquiry } from "@/services/EnquiryService";
//import { QuoteRequest } from "@/types/enquiry";


//creates the structure for the error messages
//? is used as all fields are null until they receive an error message
type FormErrors ={
    firstName?:string;
    lastName?:string;
    email?:string;
    phoneNumber?:string;
    message?:string;
};


export function useContactUsForm(){

  //states for the input form to store the text typed into each field
  const[firstName, setFirstName] = useState('');
  const[lastName, setLastName] = useState('');
  const[email, setEmail] = useState('');
  const[phoneNumber, setPhoneNumber] = useState('');
  const[message, setMessage] = useState('');
  //holds validation messages for all the fields that fail the validation
  const [errors, setErrors] = useState<FormErrors>({});

  // submitting is true while waiting for the apis response(will be used to show a spinner while form submission is loading)
  const [submitting, setSubmitting] = useState(false);
  //changes to true after the contact us form message is successfully sent
  const [submitted, setSubmitted] = useState(false);
  //holds a server error if the sending fails or returns null if there are no errors
  const [submitError, setSubmitError] = useState<string | null>(null);


  // checking if the email address is in a valid format using regex
  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Validating all inputs and returns true if valid
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

    //checking if message is empty
    if (!message.trim()) {
        newErrors.message = 'Please enter a message.';
    }

    //saves the collected error messages into react state so the ui can display them
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; //counts how many errors exist. returns true if there are no errors and false if there are errors
  }

  // Handles form submission logic
  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); //stops the page from refreshing when the form is submitted
    setSubmitError(null);

    // Stop if validation fails
    if (!validate()) return;

    setSubmitting(true);

    //tries to send data to api and catches any errors
    try {
      await submitContactUsEnquiry({firstName, lastName, email, phoneNumber, message});
      setSubmitted(true);
    } catch (err) {
      console.error('Contact us form submission failed:', err);
      setSubmitError("We could not send your message. Please try again, or call us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return {firstName, setFirstName, lastName, setLastName, email, setEmail, phoneNumber, setPhoneNumber, message, setMessage, errors, submitting, submitted, submitError, handleSubmit,};
}