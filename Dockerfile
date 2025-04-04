# Usa uma imagem do Node como base
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos do projeto para o container
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta usada pela API (ajuste se for diferente)
EXPOSE 3000

# Gera os tipos do Prisma com base no schema.prisma
RUN npx prisma generate

# Comando para iniciar a aplicação e aplicar migrations
CMD npx prisma migrate deploy && npm start
