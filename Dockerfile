# Usar una imagen base de Node.js
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json desde la carpeta back
COPY back/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos del backend
COPY back/ .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
