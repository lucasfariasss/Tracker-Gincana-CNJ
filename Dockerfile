# Etapa 1: Build da aplicação (Node.js)
FROM node:18-alpine AS build

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (cache eficiente)
COPY package.json package-lock.json ./
RUN npm install

# Copia o restante do código e faz o build
COPY . .
RUN npm run build

# Etapa 2: Servidor Web leve (Nginx) para servir o estático
FROM nginx:alpine

# Copia o build da etapa anterior para a pasta do Nginx
# Nota: Se seu projeto usa Vite, a pasta geralmente é /dist. Se for CRA, é /build.
# Verifique qual pasta seu comando 'npm run build' gera.
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuração customizada do Nginx (necessário para React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]