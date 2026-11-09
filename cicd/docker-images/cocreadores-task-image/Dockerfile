FROM amazoncorretto:21-alpine

RUN apk update && apk add --no-cache bash curl tar aws-cli

COPY entrypoint.sh /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]