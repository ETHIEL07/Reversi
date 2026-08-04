# Build stage: compile .NET 10 to IL.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Reversi.Api/Reversi.Api.csproj", "Reversi.Api/"]
COPY ["Reversi.Core/Reversi.Core.csproj", "Reversi.Core/"]
COPY ["Reversi.Data/Reversi.Data.csproj", "Reversi.Data/"]
RUN dotnet restore "Reversi.Api/Reversi.Api.csproj"

COPY . .
RUN dotnet build "Reversi.Api/Reversi.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Reversi.Api/Reversi.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage: .NET runtime only, no SDK.
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=publish /app/publish .

# Swagger off in prod, listen on port 8080 (Fly.io standard), allow external hosts.
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Reversi.Api.dll"]
