# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY ["Back/Reversi.Api/Reversi.Api.csproj", "Back/Reversi.Api/"]
COPY ["Back/Reversi.Core/Reversi.Core.csproj", "Back/Reversi.Core/"]
COPY ["Back/Reversi.Data/Reversi.Data.csproj", "Back/Reversi.Data/"]

# Restore dependencies
RUN dotnet restore "Back/Reversi.Api/Reversi.Api.csproj"

# Copy source
COPY . .

# Build
RUN dotnet build "Back/Reversi.Api/Reversi.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Back/Reversi.Api/Reversi.Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port 80 (Azure uses 80 by default)
EXPOSE 80

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "Reversi.Api.dll"]
