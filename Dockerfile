FROM mhart/alpine-node:8

WORKDIR /code
VOLUME /code/data

ENV NODE_ENV=development \
  APP_ENV=prd

RUN yarn && yarn build

CMD ["node", "."]