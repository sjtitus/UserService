FROM node:lts-alpine AS build
WORKDIR /usr/src/app

ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm ci 
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app

FROM node:lts-alpine
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY . /usr/src/app

CMD "npm" "start"