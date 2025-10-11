# Room Status Documentation

## Các trạng thái phòng được hỗ trợ

### 1. `available` - Còn trống

- **Màu sắc**: Xanh lá (`green`)
- **Ý nghĩa**: Phòng sẵn sàng cho thuê
- **Hiển thị**: "Còn trống"
- **Tính năng**:
  - Cho phép đặt cọc
  - Hiển thị đầy đủ thông tin
  - Có thể thêm vào yêu thích

### 2. `rented` - Đã được thuê

- **Màu sắc**: Đỏ (`red`)
- **Ý nghĩa**: Phòng đã có người thuê
- **Hiển thị**: "Đã thuê"
- **Tính năng**:
  - Không cho phép đặt cọc
  - Hiển thị thông tin để tham khảo
  - Không thể thêm vào yêu thích

### 3. `maintenance` - Đang bảo trì

- **Màu sắc**: Cam (`orange`)
- **Ý nghĩa**: Phòng tạm thời không thể cho thuê do đang bảo trì
- **Hiển thị**: "Đang bảo trì"
- **Tính năng**:
  - Không cho phép đặt cọc
  - Hiển thị thông báo tạm thời không cho thuê
  - Không thể thêm vào yêu thích

### 4. `default` - Không xác định

- **Màu sắc**: Xám (`default`)
- **Ý nghĩa**: Trạng thái không rõ hoặc lỗi dữ liệu
- **Hiển thị**: "Không xác định"
- **Tính năng**: Tương tự như maintenance (an toàn)

## Cách sử dụng trong code

### Backend Model (rooms.js)

```javascript
status: {
  type: String,
  enum: ['available', 'rented', 'maintenance'],
  default: 'available'
}
```

### Frontend Helper Function

```javascript
const getRoomStatusInfo = (status) => {
  switch (status) {
    case 'available':
      return { text: 'Còn trống', color: 'green' };
    case 'rented':
      return { text: 'Đã thuê', color: 'red' };
    case 'maintenance':
      return { text: 'Đang bảo trì', color: 'orange' };
    default:
      return { text: 'Không xác định', color: 'default' };
  }
};
```

### CSS Classes

```scss
.ant-tag-green {
  background: #52c41a;
  color: white;
}
.ant-tag-red {
  background: #ff4d4f;
  color: white;
}
.ant-tag-orange {
  background: #fa8c16;
  color: white;
}
.ant-tag-default {
  background: #d9d9d9;
  color: #666;
}
```

## Các component sử dụng

1. **Card Component**: Hiển thị trạng thái với logic ẩn/hiện tính năng
2. **ManagerRooms**: Hiển thị và chỉnh sửa trạng thái phòng
3. **Search/Filter**: Lọc phòng theo trạng thái

## Quy tắc chuyển đổi trạng thái

```
available → rented (khi có người thuê)
available → maintenance (khi cần bảo trì)
rented → available (khi hết hợp đồng)
rented → maintenance (khi cần bảo trì khẩn cấp)
maintenance → available (sau khi hoàn thành bảo trì)
```

## Lưu ý quan trọng

- Luôn validate trạng thái trước khi cập nhật database
- Sử dụng enum để đảm bảo tính nhất quán
- Fallback về 'available' nếu không có trạng thái
- Test tất cả các trường hợp edge case
