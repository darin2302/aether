using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Models;
using Services;
namespace Api;

public class UserEndpoints(WebApplication app) : EndpointMapper(app)
{
    public void Map()
    {
        _app.MapGet("/users/{id:guid}/related/channels", 
        async
        (
            [FromServices] ChannelMemberService cmService,
            [FromRoute] Guid id
        ) => Results.Ok(new { channelList = await cmService.GetRelatedChannels(id) }));

        // OPTIMIZED: Returns posts with all related data
        _app.MapGet("/users/{id:guid}/related/posts", 
        async 
        (
            [FromServices] PostService postService,
            [FromQuery] int? limit,
            [FromQuery] int? offset,
            [FromRoute] Guid id
        ) => Results.Ok(new { postList = await postService.GetRelatedPostsDetailed(id, limit, offset) }));

        _app.MapGet("/users/{id:guid}/username", 
        async
        (
            [FromServices] UserService userService,
            [FromRoute] Guid id
        ) => Results.Ok(await userService.GetName(id))
        ).AllowAnonymous();

        _app.MapGet("/users/{username}",
        async
        (
            [FromServices] UserService userService,
            [FromRoute] string username
        ) => Results.Ok(await userService.GetByUsername(username))
        ).AllowAnonymous();

        // OPTIMIZED: Returns posts with all related data
        _app.MapGet("/users/{id:guid}/posts",
        async
        (
            [FromServices] PostService postService,
            [FromRoute] Guid id 
        ) => 
        {
            return Results.Ok(new { postList = await postService.GetPostsFromUserDetailed(id) });
        }).AllowAnonymous();
    }
}