# op-project/Dockerfile
FROM node:20-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install --production

# 나머지 코드 복사
COPY . .

# 서버 포트
EXPOSE 3000

# 서버 실행
CMD ["node", "server.js"]
