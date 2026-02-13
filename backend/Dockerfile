FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY pom.xml ./pom.xml
COPY backend/pom.xml ./backend/pom.xml
COPY backend/src ./backend/src

RUN mvn -f backend/pom.xml -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /workspace/backend/target/quarkus-app/ /app/

EXPOSE 8080

ENV QUARKUS_HTTP_HOST=0.0.0.0

CMD ["java", "-jar", "/app/quarkus-run.jar"]
