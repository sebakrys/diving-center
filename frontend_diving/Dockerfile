# Etap 1: Budowanie aplikacji
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

# Etap 2: Serwowanie aplikacji za pomocą Nginx
FROM nginx:alpine

# Zainstaluj 'envsubst' do dynamicznego zastępowania zmiennych
RUN apk add --no-cache gettext

# Usuń domyślny plik konfiguracyjny Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Skopiuj zbudowane pliki aplikacji
COPY --from=build /app/build /usr/share/nginx/html

# Skopiuj nasz szablon konfiguracji Nginx
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Ustaw zmienną środowiskową PORT (Cloud Run ją dostarcza automatycznie)
ENV PORT 8080

# Eksponuj port (opcjonalnie, Cloud Run używa zmiennej PORT)
EXPOSE 8080

# Uruchom Nginx z dynamicznym zastępowaniem zmiennych
CMD ["sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
