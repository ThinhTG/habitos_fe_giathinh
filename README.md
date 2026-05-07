# HabitOS Frontend

Ứng dụng quản lý thói quen dành cho cá nhân. Người dùng đăng nhập để tạo, cập nhật, xoá và theo dõi các thói quen hằng ngày.

## Tính năng chính

- Đăng nhập người dùng.
- CRUD thói quen (tạo mới, chỉnh sửa, xoá).
- Giao diện quản lý thói quen trực quan.

## Cấu hình API

Ứng dụng gọi API theo biến môi trường `VITE_API_URL`.

Ví dụ:

- `VITE_API_URL=http://localhost:8080/api`

Các endpoint mặc định:

- `POST /auths/login`
- `GET /habits`
- `POST /habits`
- `PATCH /habits/:id`
- `DELETE /habits/:id`

> Lưu ý: Nếu chạy dev và backend không bật CORS, có thể dùng proxy `/api` trong `vite.config.js` và đặt `VITE_API_URL=/api`.

## Phát triển

Sau khi cài đặt dependencies, chạy chế độ dev:

```powershell
npm install
npm run dev
```

## Build production

```powershell
npm run build
npm run preview
```
