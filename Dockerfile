# Usa uma imagem do Node como base
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos do projeto pro container
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta usada pela sua API (ajuste se for diferente)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
