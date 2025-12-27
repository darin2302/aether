using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Protocols.Configuration;
using Microsoft.IdentityModel.Tokens;
using Models;
using Services;
namespace Api;
public class ServiceRegistry(WebApplicationBuilder builder, IConfiguration Config)
{
    private WebApplicationBuilder Builder { get; } = builder;
    private IConfiguration Config { get; } = Config;
    public void RegisterServices()
    {
        Builder.Services.AddScoped<AuthService, AuthService>();
        Builder.Services.AddScoped<ChannelService, ChannelService>();
        Builder.Services.AddScoped<ChannelMemberService, ChannelMemberService>();
        Builder.Services.AddScoped<PostService, PostService>();
        Builder.Services.AddScoped<CommentService, CommentService>();
        Builder.Services.AddScoped<ReplyService, ReplyService>();
        Builder.Services.AddScoped<UserService, UserService>();

        Builder.Services.AddScoped<IUserPostInteractionService<Like>, UPIService<Like>>
            (serviceProvider => new UPIService<Like>(Config));

        Builder.Services.AddScoped<IUserPostInteractionService<Dislike>, UPIService<Dislike>>
            (serviceProvider => new UPIService<Dislike>(Config));

        Builder.Services.AddScoped<IUserPostInteractionService<Save>, UPIService<Save>>
            (serviceProvider => new UPIService<Save>(Config));

        Builder.Services.AddScoped<AugmentedUPIService<Like>, AugmentedUPIService<Like>>
            (serviceProvider => new AugmentedUPIService<Like>(Config));

        Builder.Services.AddScoped<AugmentedUPIService<Dislike>, AugmentedUPIService<Dislike>>
            (serviceProvider => new AugmentedUPIService<Dislike>(Config));
    }

    public void RegisterAuth()
    {
        Builder.Services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(x =>
            {
                JwtSettings? jwtSettings = Config.GetSection("JwtSettings").Get<JwtSettings>()
                    ?? throw new InvalidConfigurationException();

                x.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidIssuer = jwtSettings.ValidIssuer,
                    ValidAudiences = jwtSettings.ValidAudiences,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings.SigningKey)
                    ),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true
                };
            });
        // Authorization is handled by custom AuthMiddleware
        // No FallbackPolicy needed - it was blocking CORS preflight
        Builder.Services.AddAuthorization();
    }
}
