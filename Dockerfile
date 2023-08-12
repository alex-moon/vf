# install
FROM node:16.13.0 as install

WORKDIR /opt/vf

RUN apt update -y && apt install -y git vim less procps

COPY ./ /opt/vf/

RUN yarn install

# build
FROM install as build

WORKDIR /opt/vf

COPY --from=install /opt/vf/node_modules/ node_modules/

RUN mkdir -p dist

COPY ./ /opt/vf/

RUN yarn build

# serve
FROM nginx:latest

RUN rm /var/log/nginx/*

WORKDIR /opt/vf

RUN apt update -y && apt install -y vim less procps

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /opt/vf/dist/ dist/

EXPOSE 443

CMD ["nginx"]
