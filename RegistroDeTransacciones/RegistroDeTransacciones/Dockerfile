# Usa esta fase cuando ejecutes desde VS en modo rápido
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Usa esta fase para compilar el proyecto de servicio
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copia el archivo .csproj y restaura las dependencias
COPY RegistroDeTransacciones/RegistroDeTransacciones.csproj .
RUN dotnet restore RegistroDeTransacciones.csproj

# Copia todos los demás archivos del proyecto
COPY . .

# Entra al directorio del proyecto y compila
WORKDIR "/src/RegistroDeTransacciones"
RUN dotnet build -c $BUILD_CONFIGURATION -o /app/build

# Usa esta fase para publicar
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
WORKDIR "/src/RegistroDeTransacciones"
RUN dotnet publish -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Usa esta fase en producción
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RegistroDeTransacciones.dll"]