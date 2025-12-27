using Exceptions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models;
using Npgsql;

namespace Services;

public class ChannelService(IConfiguration config) : DbService(config)
{

    public async Task<Channel> Create(Channel newChannel)
    {
        NpgsqlParameter value = new("@ColumnValue", newChannel.Name);
        // if (await RecordExistsAsync<string>("Channels", "name", value))
        // {
        //     throw new ConflictException($"Channel with name {newChannel.Name} already exists.");
        // }

        newChannel.Id = Guid.NewGuid();
        newChannel.IsPopular = false;
        newChannel.DateOfCreation = DateTime.Now;
        NpgsqlParameter[] parameters = [
            new NpgsqlParameter("@Name", newChannel.Name),
            new NpgsqlParameter("@Description", newChannel.Description),
        ];
        QueryResult<Channel> result = await ExecuteQueryCommandAsync(@$"
            INSERT INTO channels
            VALUES(
                '{newChannel.Id}'::uuid, 
                '{newChannel.OwnerId}'::uuid, 
                @Name, 
                @Description, 
                false,
                '{newChannel.DateOfCreation}'::TIMESTAMP
            )
            RETURNING *;"
        , MapChannelFromReader, parameters);

        ChannelMemberService cmService = new(_config);
        await cmService.Create(new ChannelMember
        {
            ChannelId = result.Record.Id,
            UserId = result.Record.OwnerId
        });

        return result.Record;
    }

    public async Task<Channel> GetOne(Guid id)
    {
        QueryResult<Channel> result = await ExecuteQueryCommandAsync(
            $"SELECT * FROM channels WHERE id = '{id}'::uuid",
            MapChannelFromReader);

        if (!result.HasRecord)
            throw new NotFoundException("Channel not found.");

        return result.Record;
    }

    public async Task<Channel> GetOneByCriteria<T>(string columnName, T columnValue)
    {
        string command =
            $@"SELECT * FROM channels WHERE {columnName} = @ColumnValue{ColumnTypeHelper.GetAnnotation<T>()}";

        NpgsqlParameter[] parameters =
        [
            new NpgsqlParameter("@ColumnValue", columnValue)
        ];
        QueryResult<Channel> result = await ExecuteQueryCommandAsync(command, MapChannelFromReader, parameters);

        if (!result.HasRecord)
            throw new NotFoundException("Channel not found.");

        return result.Record;
    }
    public async Task<List<Channel>> GetAllByCriteria<T>(string columnName, T columnValue)
    {
        string command =
            $@"SELECT * FROM channels WHERE {columnName} = @ColumnValue{ColumnTypeHelper.GetAnnotation<T>()}";
        NpgsqlParameter[] parameters =
        [
            new NpgsqlParameter("@ColumnValue", columnValue)
        ];
        List<Channel> result = await ExecuteQueryListCommandAsync(command, MapChannelFromReader, parameters);
        return result;
    }

    public async Task<List<Channel>> SearchChannels(string name)
    {
        string command =
            $@"SELECT * FROM channels WHERE name LIKE @Name";
        NpgsqlParameter[] parameters = 
        [
            new NpgsqlParameter("@Name", name)
        ];
        List<Channel> result = await ExecuteQueryListCommandAsync(command, MapChannelFromReader, parameters);
        return result;
    }
    public async Task<List<Channel>> GetPopularChannels()
    {
        List<Channel> popularChannels = await ExecuteQueryListCommandAsync($@"
        SELECT * FROM channels
        WHERE isPopular"
        , MapChannelFromReader);

        return popularChannels;
    }
    public async Task<string> GetName(Guid id)
    {
        QueryResult<string> result = await ExecuteQueryCommandAsync(
            @$"SELECT name FROM channels
               WHERE id = '{id}'::uuid", 
            (reader) => reader.GetString(0));

        if (!result.HasRecord)
            throw new NotFoundException("No such channel");

        return result.Record;
    }
    public async Task Update(Channel updatedChannel)
    {

        NpgsqlParameter[] parameters = [
            new NpgsqlParameter("@UpdatedName", updatedChannel.Name),
            new NpgsqlParameter("@UpdatedDescription", updatedChannel.Description),
        ];
        int rowsAffected = await ExecuteNonQueryCommandAsync($@"
            UPDATE channels
            SET name = @UpdatedName,
                description = @UpdatedDescription,
                ispopular = {updatedChannel.IsPopular}
            WHERE id = '{updatedChannel.Id}'::uuid
            AND ownerid = '{updatedChannel.OwnerId}'::uuid
        ", parameters);

        if (rowsAffected <= 0)
            throw new NotFoundException("No such channel exists.");
    }
    public async Task Delete(Guid id, Guid ownerId)
    {
        ;
        if(! await RecordExistsAsync("channels","id", id))
            throw new NotFoundException("No such channel");

        await CleanupService.CleanupChannel(id, ownerId, _config);

        await ExecuteNonQueryCommandAsync($@"
            DELETE FROM channels 
            WHERE id = '{id}'::uuid
            AND ownerid = '{ownerId}'::uuid
       ");
    }

    // ============================================
    // OPTIMIZED METHODS - Return ChannelDetailDto with member count
    // ============================================

    private const string ChannelDetailQuery = @"
        SELECT 
            c.id, c.ownerid, c.name, c.description, c.ispopular, c.dateofcreation,
            (SELECT COUNT(*) FROM channelmembers cm WHERE cm.channelid = c.id) as membercount
        FROM channels c";

    public async Task<ChannelDetailDto> GetOneDetailed(Guid id)
    {
        QueryResult<ChannelDetailDto> result = await ExecuteQueryCommandAsync(
            $"{ChannelDetailQuery} WHERE c.id = '{id}'::uuid",
            MapChannelDetailFromReader);

        if (!result.HasRecord)
            throw new NotFoundException("Channel not found.");

        return result.Record;
    }

    public async Task<ChannelDetailDto> GetOneByCriteriaDetailed<T>(string columnName, T columnValue)
    {
        string command =
            $@"{ChannelDetailQuery} WHERE c.{columnName} = @ColumnValue{ColumnTypeHelper.GetAnnotation<T>()}";

        NpgsqlParameter[] parameters =
        [
            new NpgsqlParameter("@ColumnValue", columnValue)
        ];
        QueryResult<ChannelDetailDto> result = await ExecuteQueryCommandAsync(command, MapChannelDetailFromReader, parameters);

        if (!result.HasRecord)
            throw new NotFoundException("Channel not found.");

        return result.Record;
    }

    public async Task<List<ChannelDetailDto>> GetPopularChannelsDetailed()
    {
        return await ExecuteQueryListCommandAsync(
            $@"{ChannelDetailQuery}
               WHERE c.ispopular = true
               ORDER BY c.dateofcreation DESC",
            MapChannelDetailFromReader);
    }

    public async Task<List<ChannelDetailDto>> GetRelatedChannelsDetailed(Guid userId)
    {
        return await ExecuteQueryListCommandAsync(
            $@"{ChannelDetailQuery}
               JOIN channelmembers cm ON c.id = cm.channelid
               WHERE cm.userid = '{userId}'::uuid
               ORDER BY c.dateofcreation DESC",
            MapChannelDetailFromReader);
    }

    public async Task<List<ChannelDetailDto>> SearchChannelsDetailed(string name)
    {
        string command =
            $@"{ChannelDetailQuery} WHERE c.name LIKE @Name";
        NpgsqlParameter[] parameters =
        [
            new NpgsqlParameter("@Name", $"%{name}%")
        ];
        return await ExecuteQueryListCommandAsync(command, MapChannelDetailFromReader, parameters);
    }

    private ChannelDetailDto MapChannelDetailFromReader(NpgsqlDataReader reader)
    {
        return new ChannelDetailDto
        {
            Id = reader.GetGuid(0),
            OwnerId = reader.GetGuid(1),
            Name = reader.GetString(2),
            Description = reader.IsDBNull(3) ? "" : reader.GetString(3),
            IsPopular = reader.GetBoolean(4),
            DateOfCreation = reader.GetDateTime(5),
            MemberCount = reader.GetInt32(6)
        };
    }

    // ============================================
    // LEGACY METHODS - Keep for backwards compatibility
    // ============================================

    public static Channel MapChannelFromReader(NpgsqlDataReader reader)
    {
        return new Channel()
        {
            Id = reader.GetGuid(0),
            OwnerId = reader.GetGuid(1),
            Name = reader.GetString(2),
            Description = reader.IsDBNull(3) ? "" : reader.GetString(3),
            IsPopular = reader.GetBoolean(4),
            DateOfCreation = reader.GetDateTime(5)
        };
    }
}