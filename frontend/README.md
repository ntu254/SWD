# GreenLoop Frontend 🌿

Chào mừng đến với **GreenLoop Frontend Repository**! Đây là ứng dụng phía client cho nền tảng thu gom và tái chế rác thải thông minh GreenLoop.

## 🚀 Công Nghệ Sử Dụng

Dự án được xây dựng dựa trên các công nghệ hiện đại, tối ưu cho hiệu năng và trải nghiệm người dùng:

*   **Core:** [React](https://react.dev/) (v18) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/) (Fast & Lightweight)
*   **Styling:** [TailwindCSS v3](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Routing:** [React Router DOM](https://reactrouter.com/) (v6)
*   **HTTP Client:** [Axios](https://axios-http.com/)

---

## 📂 Cấu Trúc Dự Án (Feature-First Architecture)

Dự án áp dụng kiến trúc **Feature-First**, giúp code dễ bảo trì và mở rộng khi team đông người.

```
frontend/src/
├── features/              # Chứa các module tính năng (Quan trọng)
│   ├── auth/              # Đăng nhập, Đăng ký
│   │   ├── components/    # Component riêng của Auth (LoginForm...)
│   │   └── pages/         # Các trang Auth (LoginPage...)
│   ├── landing/           # Trang chủ, giới thiệu
│   └── gamification/      # Tính năng tích điểm, đổi quà (GreenPoints)
│
├── shared/                # Code dùng chung cho toàn dự án
│   ├── components/        # UI Components cơ bản (Button, Input, Modal...)
│   ├── contexts/          # Global State (AuthContext, ThemeContext...)
│   ├── services/          # API services (axios client, api calls)
│   ├── types/             # TypeScript definitions dùng chung
│   └── utils/             # Helper functions, constants
│
├── App.tsx                # Main App component & Routing setup
└── main.tsx               # Entry point
```

### 🎯 Quy Tắc Code (Conventions)

1.  **Aliases Imports:**
    Luôn sử dụng **Absolute Imports** (đã config trong `vite.config.ts` & `tsconfig.json`) thay vì `../../`:
    *   `@features/*` -> `src/features/*`
    *   `@shared/*` -> `src/shared/*`
    *   `@components/*` -> `src/shared/components/*`
    *   `@services/*` -> `src/shared/services/*`
    *   `@utils/*` -> `src/shared/utils/*`

    **Ví dụ:**
    ```tsx
    // ✅ Đúng
    import Button from '@components/Button';
    import { useAuth } from '@shared/contexts';

    // ❌ Sai
    import Button from '../../shared/components/Button';
    ```

2.  **Naming:**
    *   **Component:** PascalCase (e.g., `LoginForm.tsx`)
    *   **Function/Hook:** camelCase (e.g., `useAuth.ts`, `formatDate.ts`)
    *   **Constant:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

---

## 🛠️ Cài Đặt & Chạy Dự Án

### Yêu cầu
*   [Node.js](https://nodejs.org/) (v16 trở lên)
*   [npm](https://www.npmjs.com/) hoặc yarn/pnpm

### Các bước
1.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

2.  **Cấu hình môi trường:**
    *   Tạo file `.env` từ `.env.example`:
    ```bash
    cp .env.example .env
    ```
    *   Cập nhật `VITE_API_URL` nếu backend chạy ở port khác mặc định.

3.  **Chạy máy chủ phát triển (Dev Server):**
    ```bash
    npm run dev
    ```
    *   Truy cập: `http://localhost:3000`

4.  **Build Production:**
    ```bash
    npm run build
    ```

---

## 🎨 Design System & UI

*   Chúng ta sử dụng **Tailwind CSS** cho styling.
*   **Colors:** Màu Brand chính được define trong `tailwind.config.js` (e.g., `brand-500`, `brand-600`). Hãy ưu tiên sử dụng màu này thay vì màu hardcode hex.
*   **Responsive:** Luôn test giao diện trên mobile (`sm:`), tablet (`md:`), và desktop (`lg:`).

---

## 🤝 Git Workflow

*   **Branching:** Tạo branch mới cho mỗi ticket/feature (e.g., `feature/login-page`, `fix/navbar-bug`).
*   **Commit Message:** Rõ ràng, mô tả những thay đổi chính.

---

Have a productive day! Happy Coding! 🌿✨
