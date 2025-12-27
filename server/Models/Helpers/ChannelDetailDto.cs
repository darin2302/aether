namespace Models;

/// <summary>
/// DTO containing channel data with member count
/// Used to avoid N+1 queries by fetching everything in a single request
/// </summary>
public class ChannelDetailDto
{
    public Guid Id { get; set; }
    public required Guid OwnerId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateTime DateOfCreation { get; set; }
    public bool IsPopular { get; set; }

    // Aggregated count (computed via subquery)
    public int MemberCount { get; set; }

    /// <summary>
    /// Creates a ChannelDetailDto from a base Channel object
    /// </summary>
    public static ChannelDetailDto FromChannel(Channel channel)
    {
        return new ChannelDetailDto
        {
            Id = channel.Id,
            OwnerId = channel.OwnerId,
            Name = channel.Name,
            Description = channel.Description,
            DateOfCreation = channel.DateOfCreation,
            IsPopular = channel.IsPopular
        };
    }
}

