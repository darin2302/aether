FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# adjusted file paths because of railway.json being in root
COPY ["server/Api/Api.csproj", "Api/"]
COPY ["server/Models/Models.csproj", "Models/"]
COPY ["server/Services/Services.csproj", "Services/"]
RUN dotnet restore "Api/Api.csproj"
COPY server/ .
WORKDIR "/src/Api"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Api.dll"]

