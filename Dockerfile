# Build stage
FROM oven/bun:1 as build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

ARG BUILD_ENV
## Sample command
# docker build --build-arg BUILD_ENV=dev -t your-image-name:tag .
# docker build --build-arg BUILD_ENV=uat -t your-image-name:tag .
RUN echo "Building for environment: $BUILD_ENV" \
    && if [ "$BUILD_ENV" = "uat" ]; then bun run build:staging; \
       elif [ "$BUILD_ENV" = "dev" ]; then bun run build:dev; \
       elif [ "$BUILD_ENV" = "prd" ]; then bun run build:prod; \
       else bun run build; \
       fi

# Production stage
# Deploy stage
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]