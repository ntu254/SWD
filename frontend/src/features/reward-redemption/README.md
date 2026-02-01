# Reward Redemption Management Feature

## 📋 Tổng Quan

Feature **Reward Redemption Management** (SWD-32-FE) cho phép Administrator quản lý phần thưởng đổi điểm trong hệ thống GreenLoop. Đây là một phần quan trọng trong hệ thống Gamification, khuyến khích người dân tham gia phân loại rác và thu gom rác thông qua cơ chế điểm thưởng.

## 🎯 Chức Năng Chính

### CRUD Operations

- ✅ **Create**: Tạo phần thưởng mới với đầy đủ thông tin
- ✅ **Read**: Xem danh sách phần thưởng với bộ lọc mạnh mẽ
- ✅ **Update**: Cập nhật thông tin phần thưởng
- ✅ **Delete**: Xóa phần thưởng

### Tính Năng Bổ Sung

- 📊 **Statistics Dashboard**: Hiển thị thống kê tổng quan (total, active, out of stock, total points)
- 🔍 **Advanced Filters**: Lọc theo category, status, points range, search by name
- 📦 **Stock Management**: Cập nhật nhanh số lượng tồn kho
- 🎨 **Category Icons**: Icon trực quan cho từng loại phần thưởng
- ⏰ **Validity Period**: Quản lý thời gian hiệu lực của phần thưởng

## 🏗️ Cấu Trúc Feature

```
features/reward-redemption/
├── components/
│   ├── RewardCard.tsx          # Card hiển thị reward với actions
│   ├── RewardForm.tsx          # Form tạo/sửa reward
│   ├── RewardModal.tsx         # Modal wrapper cho form
│   └── index.ts                # Barrel export
├── hooks/
│   └── useRewards.ts           # Hook quản lý state và CRUD
├── pages/
│   └── RewardManagementPage.tsx # Main page cho admin
├── services/
│   └── rewardService.ts        # API service calls
├── types/
│   └── index.ts                # TypeScript types & enums
└── index.ts                    # Feature barrel export
```

## 🎨 UI/UX Guidelines Đã Áp Dụng

### Màu Sắc (Theo UI-Template.md)

- **Brand-500** (Xanh lá): Actions chính, buttons
- **Accent-500** (Vàng/Cam): Điểm thưởng, rewards
- **Light Theme**: Background trắng với shadow-xl
- **Status Colors**:
  - Active: `green-500`
  - Inactive: `gray-500`
  - Out of Stock: `red-500`
  - Expired: `yellow-500`

### Animations

- ✅ **zoom-in**: Modal animation
- ✅ **fade-in**: Backdrop animation
- ✅ **pulse**: Loading animation
- ✅ **hover effects**: Card hover với shadow-2xl

### Layout

- ✅ Card thiết kế nổi (`shadow-xl`) trên nền sáng
- ✅ Gradient backgrounds cho headers
- ✅ Grid responsive (1 col mobile, 2-3 cols desktop)

## 📦 Types & Enums

### Reward Interface

```typescript
interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  category: RewardCategory;
  status: RewardStatus;
  validFrom?: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enums

```typescript
enum RewardCategory {
  VOUCHER = 'VOUCHER', // 🎫
  GIFT = 'GIFT', // 🎁
  DISCOUNT = 'DISCOUNT', // 💰
  SERVICE = 'SERVICE', // ⚙️
  OTHER = 'OTHER', // 📦
}

enum RewardStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  EXPIRED = 'EXPIRED',
}
```

## 🔌 API Integration

### Endpoints (Expected)

```
GET    /api/v1/rewards              # Get all rewards (with filters)
GET    /api/v1/rewards/:id          # Get single reward
POST   /api/v1/rewards              # Create reward
PUT    /api/v1/rewards/:id          # Update reward
DELETE /api/v1/rewards/:id          # Delete reward
PATCH  /api/v1/rewards/:id/stock    # Update stock
GET    /api/v1/rewards/redemptions  # Get redemption history
GET    /api/v1/rewards/stats        # Get statistics
```

### Filter Parameters

- `category`: RewardCategory
- `status`: RewardStatus
- `minPoints`: number
- `maxPoints`: number
- `search`: string

## 💻 Cách Sử Dụng

### 1. Import Feature

```typescript
import { RewardManagementPage } from '@features/reward-redemption';
```

### 2. Add to Router

```typescript
// In your routing configuration
<Route path="/admin/rewards" element={<RewardManagementPage />} />
```

### 3. Sử dụng Components riêng lẻ

```typescript
import { RewardCard, useRewards } from '@features/reward-redemption';

function MyComponent() {
  const { rewards, loading, fetchRewards } = useRewards();

  useEffect(() => {
    fetchRewards();
  }, []);

  return (
    <div>
      {rewards.map(reward => (
        <RewardCard
          key={reward.id}
          reward={reward}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateStock={handleUpdateStock}
        />
      ))}
    </div>
  );
}
```

### 4. Sử dụng Hook

```typescript
import { useRewards } from '@features/reward-redemption';

function MyComponent() {
  const {
    rewards,
    loading,
    error,
    fetchRewards,
    createReward,
    updateReward,
    deleteReward,
    updateStock,
  } = useRewards();

  // Use the functions...
}
```

## 🧪 Testing Checklist

- [ ] Tạo reward mới thành công
- [ ] Sửa reward thành công
- [ ] Xóa reward thành công (với confirmation)
- [ ] Cập nhật stock thành công
- [ ] Filter theo category hoạt động
- [ ] Filter theo status hoạt động
- [ ] Search by name hoạt động
- [ ] Clear filters hoạt động
- [ ] Statistics hiển thị chính xác
- [ ] Validation form hoạt động
- [ ] Error handling hoạt động
- [ ] Loading states hiển thị đúng
- [ ] Responsive design trên mobile/tablet/desktop
- [ ] Animations mượt mà

## 🔗 Dependencies

### Shared Dependencies

- `@shared/services/api/client` - API client với interceptors
- `@shared/types` - ApiResponse, ApiError types

### External Dependencies

- `react` - UI library
- `axios` - HTTP client (via apiClient)

## 📝 Notes

1. **Authentication**: Feature này yêu cầu JWT token trong localStorage
2. **Authorization**: Chỉ dành cho role ADMINISTRATOR
3. **Backend Integration**: Cần backend implement các endpoints tương ứng
4. **Image Upload**: Hiện tại chỉ support imageUrl (string), có thể mở rộng để upload file
5. **Redemption History**: Có service method nhưng chưa hiển thị trong UI, có thể mở rộng thành tab riêng

## 🚀 Future Enhancements

- [ ] Upload image file thay vì URL
- [ ] Bulk operations (delete, update status)
- [ ] Export rewards to CSV/Excel
- [ ] Redemption history tab
- [ ] Analytics dashboard cho rewards
- [ ] Preview reward before creating
- [ ] Duplicate reward feature
- [ ] Batch stock update
- [ ] Email notifications khi reward mới

## 👥 Phân Công (Theo README.md)

- **Phụ trách**: Đạt, Bình, Tín
- **Feature**: Quản lý phần thưởng đổi điểm (CRUD)

---

**Happy Coding!** 🎁✨
