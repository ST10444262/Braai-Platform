using Microsoft.AspNetCore.Mvc.Filters;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Inflame_Backend.Filters
{
    /// <summary>
    /// Global Action Filter that intercepts incoming requests and sanitizes string properties 
    /// within DTOs to prevent Cross-Site Scripting (XSS) attacks.
    /// </summary>
    public class XssSanitizationFilter : IActionFilter
    {
        #region IActionFilter Implementation

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Executes before the action method is invoked.
        /// Iterates through all incoming action arguments to sanitize them.
        /// </summary>
        /// <param name="context">The context of the action being executed.</param>
        public void OnActionExecuting(ActionExecutingContext context)
        {
            // Loop through every argument passed to the controller action
            foreach (var argument in context.ActionArguments.Values)
            {
                if (argument != null)
                {
                    SanitizeObject(argument);
                }
            }
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Executes after the action method has completed. 
        /// No post-processing is required for sanitization.
        /// </summary>
        /// <param name="context">The context of the action that was executed.</param>
        public void OnActionExecuted(ActionExecutedContext context)
        {
            // No action needed after execution
        }

        #endregion
        //------------------------------------------------------------------------------------------//
        #region Sanitization Logic

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Recursively inspects the properties of an object. If a string property is found, 
        /// it strips out any HTML tags to sanitize against XSS.
        /// </summary>
        /// <param name="obj">The object to sanitize.</param>
        private void SanitizeObject(object obj)
        {
            if (obj == null) return;

            // Get all public instance properties of the object
            var properties = obj.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
            
            foreach (var property in properties)
            {
                // Check if the property is a string and can be read/written
                if (property.PropertyType == typeof(string) && property.CanRead && property.CanWrite)
                {
                    var value = (string)property.GetValue(obj);
                    if (!string.IsNullOrEmpty(value))
                    {
                        // Basic XSS Sanitization: strip out HTML tags using Regex
                        var sanitizedValue = Regex.Replace(value, "<.*?>", string.Empty);
                        
                        // Only update if the value actually changed
                        if (value != sanitizedValue)
                        {
                            property.SetValue(obj, sanitizedValue);
                        }
                    }
                }
                // Recursively check nested complex objects (excluding strings)
                else if (property.PropertyType.IsClass && property.PropertyType != typeof(string))
                {
                    var nestedObj = property.GetValue(obj);
                    if (nestedObj != null)
                    {
                        SanitizeObject(nestedObj);
                    }
                }
            }
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
