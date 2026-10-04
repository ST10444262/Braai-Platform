using System;
using System.Collections.Generic;
using FluentAssertions;
using Inflame_Backend.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Moq;
using System.Reflection;
using Xunit;

namespace Inflame_Backend.Tests.Security
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for the XssSanitizationFilter, verifying that the filter correctly
    /// strips HTML/script tags from string properties while leaving non-string types untouched.
    /// </summary>
    public class XssSanitizationFilterTests
    {
        private readonly XssSanitizationFilter _filter;

        //----------------------------------------------------------------------------------------------//
        public XssSanitizationFilterTests()
        {
            _filter = new XssSanitizationFilter();
        }

        //----------------------------------------------------------------------------------------------//
        #region Helper Models

        /// <summary>Simple flat DTO for basic sanitization tests.</summary>
        private class SimpleDto
        {
            public string? Name { get; set; }
            public string? Description { get; set; }
            public int Age { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        /// <summary>Nested DTO to verify recursive sanitization.</summary>
        private class NestedDto
        {
            public string? TopLevelField { get; set; }
            public SimpleDto? Child { get; set; }
        }

        /// <summary>DTO with a list property to test collection recursion.</summary>
        private class DtoWithList
        {
            public List<SimpleDto>? Items { get; set; }
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Helper: Build ActionExecutingContext

        /// <summary>
        /// Creates a minimal ActionExecutingContext containing the given argument
        /// so the filter's OnActionExecuting method can be exercised.
        /// </summary>
        private static ActionExecutingContext BuildContext(string argKey, object argValue)
        {
            var httpContext = new DefaultHttpContext();
            var actionContext = new ActionContext(
                httpContext,
                new RouteData(),
                new ActionDescriptor());

            var actionArguments = new Dictionary<string, object?> { { argKey, argValue } };

            return new ActionExecutingContext(
                actionContext,
                new List<IFilterMetadata>(),
                actionArguments,
                controller: new object());
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Test 1 – Malicious HTML/script tags stripped from simple string properties

        [Fact]
        public void OnActionExecuting_WhenStringPropertyContainsScriptTag_ShouldStripHtml()
        {
            // Arrange
            var dto = new SimpleDto
            {
                Name = "<script>alert('xss')</script>Legitimate Name",
                Description = "Normal description"
            };
            var context = BuildContext("dto", dto);

            // Act
            _filter.OnActionExecuting(context);

            // Assert
            dto.Name.Should().Be("alert('xss')Legitimate Name",
                because: "the <script> and </script> tags must be removed");
            dto.Description.Should().Be("Normal description",
                because: "clean strings should remain unchanged");
        }

        [Fact]
        public void OnActionExecuting_WhenStringPropertyContainsImgTag_ShouldStripHtml()
        {
            // Arrange
            var dto = new SimpleDto
            {
                Name = "<img src=x onerror=alert(1)>Valid"
            };
            var context = BuildContext("dto", dto);

            // Act
            _filter.OnActionExecuting(context);

            // Assert
            dto.Name.Should().Be("Valid",
                because: "the <img …> tag must be stripped");
        }

        [Fact]
        public void OnActionExecuting_WhenStringHasNoHtml_ShouldLeaveStringUnchanged()
        {
            // Arrange
            var dto = new SimpleDto
            {
                Name = "Perfectly Safe Name",
                Description = "No HTML whatsoever"
            };
            var context = BuildContext("dto", dto);

            // Act
            _filter.OnActionExecuting(context);

            // Assert
            dto.Name.Should().Be("Perfectly Safe Name");
            dto.Description.Should().Be("No HTML whatsoever");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Test 2 – Recursive sanitization of nested objects and lists

        [Fact]
        public void OnActionExecuting_WhenNestedObjectContainsHtml_ShouldSanitizeRecursively()
        {
            // Arrange
            var dto = new NestedDto
            {
                TopLevelField = "<b>Bold</b> text",
                Child = new SimpleDto
                {
                    Name = "<script>evil()</script>Child Name",
                    Description = "Safe child description"
                }
            };
            var context = BuildContext("dto", dto);

            // Act
            _filter.OnActionExecuting(context);

            // Assert
            dto.TopLevelField.Should().Be("Bold text",
                because: "the <b> and </b> tags on the top-level property must be stripped");
            dto.Child!.Name.Should().Be("evil()Child Name",
                because: "the <script> and </script> tags in the nested object must also be stripped");
            dto.Child.Description.Should().Be("Safe child description");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Test 3 – Non-string properties (int, bool, DateTime) are completely untouched

        [Fact]
        public void OnActionExecuting_WhenDtoHasNonStringProperties_ShouldNotAlterThem()
        {
            // Arrange
            var expectedAge = 42;
            var expectedActive = true;
            var expectedDate = new DateTime(2024, 1, 15);

            var dto = new SimpleDto
            {
                Name = "<em>name</em>",
                Age = expectedAge,
                IsActive = expectedActive,
                CreatedAt = expectedDate
            };
            var context = BuildContext("dto", dto);

            // Act
            _filter.OnActionExecuting(context);

            // Assert – only string changed; primitives/value-types untouched
            dto.Name.Should().Be("name");
            dto.Age.Should().Be(expectedAge,
                because: "integer properties must never be modified by the XSS filter");
            dto.IsActive.Should().Be(expectedActive,
                because: "boolean properties must never be modified by the XSS filter");
            dto.CreatedAt.Should().Be(expectedDate,
                because: "DateTime properties must never be modified by the XSS filter");
        }

        [Fact]
        public void OnActionExecuted_ShouldDoNothing()
        {
            // Arrange – OnActionExecuted has no effect; test just confirms it does not throw
            var httpContext = new DefaultHttpContext();
            var actionContext = new ActionContext(
                httpContext, new RouteData(), new ActionDescriptor());
            var executedContext = new ActionExecutedContext(
                actionContext,
                new List<IFilterMetadata>(),
                controller: new object());

            // Act & Assert
            var act = () => _filter.OnActionExecuted(executedContext);
            act.Should().NotThrow();
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
