FROM node:lts

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package.json .
COPY --chown=node:node package-lock.json .
COPY --chown=node:node tsconfig.json .
COPY --chown=node:node tsconfig.build.json .
COPY --chown=node:node config ./config
COPY --chown=node:node src ./src

USER node
RUN npm install
EXPOSE 8080

CMD ["npm", "run", "start"]
