FROM node:alpine AS build
WORKDIR /app
COPY ./package*.json .
RUN npm install
COPY . .
ENV PORT=8000
ENV FRONTEND_URL=http://localhost:3000
EXPOSE 8000
RUN npm run build
CMD ["npm", "start"]
