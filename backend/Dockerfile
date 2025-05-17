FROM node
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=8000
EXPOSE 8000
CMD [ "sh", "-c", "npm run build && npm start"]