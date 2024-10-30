# Użyj oficjalnego obrazu Node.js jako bazowego
FROM node:20 AS build

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj plik package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm install

# Skopiuj pozostałe pliki aplikacji
COPY . .

# Zbuduj aplikację
RUN npm run build

# Serwuj aplikację za pomocą Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
