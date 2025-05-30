# 📋 راهنمای Scripts پروژه

## 🚀 Development Scripts

### `npm run dev`
```bash
npm run dev
```
**چی میشه:**
- ✅ پروژه روی پورت `4002` اجرا میشه
- ✅ Turbopack فعال میشه (سریع‌تر از webpack)
- ✅ Hot reload فعال
- ✅ تمام warnings و errors نمایش داده میشه
- 🌐 آدرس: `http://localhost:4002`

**مناسب برای:** کدنویسی روزانه، توسعه

---

### `npm start`
```bash
npm start
```
**چی میشه:**
- ✅ پروژه build شده روی پورت `4002` اجرا میشه
- ✅ حالت production
- ❌ Hot reload ندارد
- 🌐 آدرس: `http://localhost:4002`

**مناسب برای:** تست production build در local

---

## 🔨 Build Scripts

### `npm run build`
```bash
npm run build
```
**چی میشه:**
- ✅ بیلد استاندارد
- ⚠️ ESLint warnings نشون میده ولی متوقف نمیشه
- 🚫 ESLint errors باعث توقف میشه
- 🚫 TypeScript errors باعث توقف میشه
- 📦 فولدر `.next` ساخته میشه

**مناسب برای:** بیلد عادی، CI/CD

---

### `npm run build:production`
```bash
npm run build:production
```
**چی میشه:**
- ✅ NODE_ENV=production تنظیم میشه
- ✅ ESLint errors نادیده گرفته میشه (از کانفیگ)
- ✅ TypeScript errors نادیده گرفته میشه (از کانفیگ)
- 📦 بهینه‌سازی بیشتر
- 🎯 آماده deploy

**مناسب برای:** deploy روی سرور

---

### `npm run build:force`
```bash
npm run build:force
```
**چی میشه:**
- ✅ تمام ESLint errors نادیده گرفته میشه
- ✅ متغیر محیطی `ESLINT_NO_DEV_ERRORS=true` تنظیم میشه
- 🚨 حتی اگر کد مشکل داشته باشه build میگیره
- 📦 فولدر `.next` ساخته میشه

**مناسب برای:** اضطراری، hotfix سریع

---

## 🔍 Lint Scripts

### `npm run lint`
```bash
npm run lint
```
**چی میشه:**
- 📝 تمام warnings و errors رو نشون میده
- ❌ هیچ چیزی تصحیح نمیکنه
- 📊 خلاصه مشکلات

**خروجی مثال:**
```
✖ 15 problems (5 errors, 10 warnings)
```

---

### `npm run lint:fix`
```bash
npm run lint:fix
```
**چی میشه:**
- 🔧 مشکلات قابل تصحیح رو خودکار درست میکنه
- ✅ Formatting، spacing، semicolon
- ✅ Import های اضافی حذف میشه
- ❌ مشکلات منطقی تصحیح نمیشه

**قبل از:**
```javascript
import { unused } from 'lib'
const x=1    // no semicolon, bad spacing
```

**بعد از:**
```javascript
const x = 1; // fixed spacing and semicolon
```

---

### `npm run lint:strict`
```bash
npm run lint:strict
```
**چی میشه:**
- 🚫 حتی 1 warning باعث fail شدن میشه
- 📊 `--max-warnings 0` 
- 🎯 کیفیت 100%

**اگر موفق باشه:**
```
✓ No ESLint warnings or errors
```

**اگر fail بشه:**
```
✖ ESLint found too many warnings (maximum: 0)
```

---

## 🚦 Workflow توصیه شده

### روزانه:
```bash
npm run dev          # شروع کار
npm run lint:fix     # قبل از commit
```

### قبل از merge:
```bash
npm run lint:strict  # چک کیفیت
npm run build        # تست build
```

### Deploy:
```bash
npm run build:production  # معمولی
npm run build:force       # اضطراری
npm start                 # تست local
```

## 🎯 خلاصه سریع

| Script | سرعت | کیفیت | مناسب برای |
|--------|-------|--------|------------|
| `dev` | 🚀 خیلی سریع | - | کدنویسی |
| `build` | 🐌 معمولی | 🎯 بالا | تست |
| `build:production` | 🐌 معمولی | 🟡 متوسط | Deploy |
| `build:force` | 🐌 معمولی | 🔴 پایین | اضطراری |
| `lint:strict` | ⚡ سریع | 🎯 عالی | Quality gate |