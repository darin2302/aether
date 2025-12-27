using Exceptions;
using Api;

var builder = WebApplication.CreateBuilder(args);

IConfiguration config = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .AddEnvironmentVariables()
    .Build();

// CORS configuration
var allowedOrigins = config["AllowedOrigins"]?.Split(",") ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                var uri = new Uri(origin);
                return uri.Host == "localhost" ||
                       allowedOrigins.Any(allowed => origin.Contains(allowed.Trim()));
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var serviceRegistry = new ServiceRegistry(builder, config);

serviceRegistry.RegisterServices();
serviceRegistry.RegisterAuth();

var app = builder.Build();
app.UseCors();
app.UseMiddleware<ExceptionHandler>();
app.UseMiddleware<AuthMiddleware>();

// Health check endpoint
app.MapGet("/health", async () =>
{
    try
    {
        var connString = config.GetConnectionString("aether");
        using var conn = new Npgsql.NpgsqlConnection(connString);
        await conn.OpenAsync();
        return Results.Ok(new { status = "healthy", database = "connected" });
    }
    catch (Exception ex)
    {
        return Results.Ok(new { status = "unhealthy", database = "failed", error = ex.Message });
    }
}).AllowAnonymous();

new AuthEndpoints(app).Map();
new ChannelEndpoints(app).Map();
new PostEndpoints(app).Map();
new UserPostInteractionEndpoints(app).Map();
new CommentEndpoints(app).Map();
new UserEndpoints(app).Map();

app.Run();