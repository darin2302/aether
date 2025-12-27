public class AuthMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;
    private readonly List<string> exceptedPaths = [
        "/auth/login",
        "/auth/signup"
    ];

    public async Task Invoke(HttpContext context)
    {
        // Allow CORS preflight requests (OPTIONS)
        if (context.Request.Method == HttpMethods.Options)
        {
            await _next(context);
            return;
        }

        // if the method is GET or the path is excepted -> move on
        if(context.Request.Method == HttpMethods.Get || exceptedPaths.Contains(context.Request.Path.Value))
        {
            await _next(context);
            return;
        }

        if (context.User.Identity.IsAuthenticated)
        {
            var userIdClaim = context.User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out _))
            {
                // User has a valid userId claim, proceed to the next middleware or endpoint
                await _next(context);
                return;
            }
        }
        var userIClaim = context.User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
        // User is not authenticated or not authorized to perform the operation
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        await context.Response.WriteAsJsonAsync(userIClaim);
    }
}