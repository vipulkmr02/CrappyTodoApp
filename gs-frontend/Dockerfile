FROM node:alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
ARG API_URL
ENV VITE_API_URL=$API_URL
RUN npx expo export --platform web

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx" ,"-g", "daemon off;"]
