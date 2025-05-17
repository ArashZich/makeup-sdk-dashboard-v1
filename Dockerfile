FROM node:18-alpine

WORKDIR /app

# کپی فایل‌های package.json و package-lock.json
COPY package*.json ./
RUN npm install

# کپی کل پروژه
COPY . .

# ساخت برنامه
RUN npm run build

# نمایان کردن پورت
EXPOSE 3030

# دستور اجرا
CMD ["npm", "start"]