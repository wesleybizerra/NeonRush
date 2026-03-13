# Usa a imagem oficial do Node.js (versão 20 Alpine, que é mais leve)
FROM node:20-alpine
# Define o diretório de trabalho dentro do container
WORKDIR /app
# Copia os arquivos de dependências primeiro (para aproveitar o cache do Docker)
COPY package*.json ./
# Instala as dependências
RUN npm install
# Copia o resto do código do projeto para dentro do container
COPY . .
# Gera a build de produção do frontend (Vite)
RUN npm run build
# Expõe a porta 3000 (que é a que o nosso server.ts usa)
EXPOSE 3000
# Define as variáveis de ambiente padrão para produção
ENV NODE_ENV=production
ENV PORT=3000
# Comando para iniciar o servidor
CMD ["npm", "start"]