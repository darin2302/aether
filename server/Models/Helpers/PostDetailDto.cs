namespace Models;

/// <summary>
/// DTO containing post data with all related information (owner, channel, counts)
/// Used to avoid N+1 queries by fetching everything in a single request
/// </summary>
public class PostDetailDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public Guid ChannelId { get; set; }
    public required string Title { get; set; }
    public string? Text { get; set; }
    public string? LinkUrl { get; set; }
    public string? ImgUrl { get; set; }
    public DateTime DateOfCreation { get; set; }
    public bool IsPopular { get; set; }

    public string OwnerUsername { get; set; } = "";
    public string ChannelName { get; set; } = "";

    public int LikesCount { get; set; }
    public int DislikesCount { get; set; }
    public int CommentCount { get; set; }

    /// <summary>
    /// Creates a PostDetailDto from a base Post object
    /// </summary>
    public static PostDetailDto FromPost(Post post)
    {
        return new PostDetailDto
        {
            Id = post.Id,
            OwnerId = post.OwnerId,
            ChannelId = post.ChannelId,
            Title = post.Title,
            Text = post.Text,
            LinkUrl = post.LinkUrl,
            ImgUrl = post.ImgUrl,
            DateOfCreation = post.DateOfCreation,
            IsPopular = post.IsPopular
        };
    }
}

