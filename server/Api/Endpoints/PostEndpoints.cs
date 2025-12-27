using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Models;
using Services;

namespace Api;

public class PostEndpoints(WebApplication app) : EndpointMapper(app)
{
    public void Map()
    {
        MapCoreEndpoints();
        MapUPIEndpoints();
        MapCommentEndpoints();
    }

    private void MapCoreEndpoints()
    {
        _app.MapPost("/posts",
        async
        (HttpContext context,
         [FromBody] Post newPost,
         [FromServices] PostService postService
        ) => Results.Ok(new { postData = await postService.Create(newPost) })
        );

        // OPTIMIZED: Returns post with all related data in one request
        _app.MapGet("/posts/{postId:guid}",
        async
        (
            [FromServices] PostService postService,
            [FromRoute] Guid postId
        ) => Results.Ok(new { postData = await postService.GetOneDetailed(postId) })
        ).AllowAnonymous();

        // OPTIMIZED: Returns posts with all related data in one request
        _app.MapGet("/posts/popular",
        async 
        (
            [FromServices] PostService postService,
            [FromQuery] int? limit,
            [FromQuery] int? offset
        ) => 
        {
            var postList = await postService.GetPopularPostsDetailed(limit, offset);
            return Results.Ok(new { postList });
        }).AllowAnonymous();
    }

    private void MapUPIEndpoints()
    {
        _app.MapGet("/posts/{postId:guid}/likescount",
        async
        (
            [FromServices] IUserPostInteractionService<Like> likeService,
            [FromRoute] Guid postId
        ) => Results.Ok(await likeService.GetCount(postId))
        ).AllowAnonymous();

        _app.MapGet("posts/{postId:guid}/dislikescount",
        async
        (
            [FromServices] IUserPostInteractionService<Dislike> dislikeService,
            [FromRoute] Guid postId
        ) => Results.Ok(await dislikeService.GetCount(postId))
        ).AllowAnonymous();
    }

    private void MapCommentEndpoints()
    {
        _app.MapGet("/posts/{postId:guid}/comments",
        async
        (
            [FromServices] CommentService commentService,
            [FromRoute] Guid postId
        ) => Results.Ok(new
        {
            commentList = await commentService.GetCommentsFromPost(postId)
        })
        ).AllowAnonymous();

        _app.MapGet("/posts/{postId:guid}/commentCount", 
        async
        (
            [FromServices] CommentService commentService,
            [FromRoute] Guid postId
        ) => Results.Ok(await commentService.GetCommentCountFromPost(postId))
        ).AllowAnonymous();
    }
}