# build
# FROM node:16.13.0 as build
FROM nginx:latest

RUN rm /var/log/nginx/*
RUN apt update -y && apt install -y vim less procps

WORKDIR /opt/vf

COPY ./dist/ /opt/vf/dist/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443

CMD ["nginx"]
