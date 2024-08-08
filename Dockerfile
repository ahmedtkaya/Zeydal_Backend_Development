FROM node:21

WORKDIR /app

COPY package*.json ./

RUN npm install

#uygulama kaynak kodunu kopyalar
COPY . . 

ENV PORT=3000
ENV MONGO_URI=mongodb+srv://atkahmed9924:LbBrFKqYiLKMhuya@zeydalcluster.kfoeudp.mongodb.net/Zeydal_Backend_development?retryWrites=true&w=majority&appName=ZeydalCluster

EXPOSE 3000

CMD [ "npm","run","dev" ]


