# Thôn Trang Liên Nhật API

API server cho website Thôn Trang Liên Nhật, được triển khai trên Vercel Serverless Functions.

## Tổng quan

API này cung cấp các endpoint để truy xuất và quản lý:
- Sản phẩm (Products)
- Dịch vụ (Services)
- Trải nghiệm (Experiences)
- Tin tức (News)
- Upload hình ảnh

## Công nghệ sử dụng

- Node.js 18.x
- Vercel Serverless Functions
- Database: JSON file (database.json)

## Cấu trúc project

```
/
├── api/                  # Thư mục chứa Serverless Functions
│   ├── products/         # Endpoint cho sản phẩm
│   ├── services/         # Endpoint cho dịch vụ
│   ├── experiences/      # Endpoint cho trải nghiệm
│   ├── news/             # Endpoint cho tin tức
│   └── upload.js         # Endpoint xử lý upload file
├── database-utils.js     # Utilities cho việc đọc/ghi database
├── database.json         # File lưu trữ dữ liệu
└── vercel.json           # Cấu hình cho Vercel
```

## API Endpoints

- **Products**: `/api/products` và `/api/products/[id]`
- **Services**: `/api/services` và `/api/services/[id]`
- **Experiences**: `/api/experiences` và `/api/experiences/[id]`
- **News**: `/api/news` và `/api/news/[id]`
- **Upload**: `/api/upload` (POST) 