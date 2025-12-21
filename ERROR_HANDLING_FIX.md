# Fix: Console Error - API Error Data: {}

## Vấn Đề

Khi đăng ký bác sĩ, console hiển thị lỗi:
```
API Error Data: {}
```

Lỗi này xảy ra khi backend trả về response nhưng `error.response?.data` là một object rỗng `{}`, khiến frontend không thể hiển thị thông báo lỗi chi tiết.

## Nguyên Nhân

1. **Backend trả về lỗi nhưng không có data**: Khi có lỗi validation hoặc server error, backend có thể trả về response với status code nhưng `data` là empty object.

2. **Network errors**: Khi có lỗi network, `error.response` có thể không tồn tại hoặc `data` là empty.

3. **Error handling không đầy đủ**: Frontend không xử lý đầy đủ các trường hợp lỗi khác nhau.

## Giải Pháp

### 1. Cải Thiện Error Handling ở Frontend (`services/api/auth.ts`)

- ✅ Thêm logging chi tiết hơn để debug
- ✅ Xử lý riêng các loại lỗi:
  - Network errors (không có response)
  - Validation errors (400 Bad Request)
  - Authentication errors (401)
  - Server errors (500)
- ✅ Đảm bảo luôn trả về message và errors object

### 2. Cải Thiện Error Response ở Backend (`doctor/views.py`)

- ✅ Đảm bảo validation errors luôn có nội dung
- ✅ Thêm fallback message nếu errors object rỗng
- ✅ Cải thiện error message để dễ hiểu hơn

### 3. Cải Thiện Error Handling ở Form (`app/auth/doctor-register/page.tsx`)

- ✅ Thêm try-catch để bắt cả errors được throw
- ✅ Log chi tiết hơn để debug
- ✅ Hiển thị error message rõ ràng hơn cho user

## Các Thay Đổi Chi Tiết

### Frontend - `services/api/auth.ts`

```typescript
// Trước:
catch (error: any) {
  console.error('API Error Data:', error.response?.data);
  const errData = error.response?.data;
  // ...
}

// Sau:
catch (error: any) {
  // Logging chi tiết
  console.error('API Error Status:', error.response?.status);
  console.error('API Error Data:', error.response?.data);
  console.error('API Error Headers:', error.response?.headers);
  console.error('Error Message:', error.message);
  console.error('Error Code:', error.code);
  
  // Xử lý từng loại lỗi
  if (!error.response) {
    // Network error
    return { success: false, message: 'Network error...', errors: {} };
  }
  
  if (statusCode === 400) {
    // Validation error
    // ...
  }
  // ...
}
```

### Backend - `doctor/views.py`

```python
# Trước:
return Response({
    'message': 'Đăng ký thất bại!',
    'errors': serializer.errors
}, status=status.HTTP_400_BAD_REQUEST)

# Sau:
error_response = {
    'message': 'Đăng ký thất bại!',
    'errors': serializer.errors
}

# Thêm fallback nếu errors rỗng
if not serializer.errors:
    error_response['message'] = 'Đăng ký thất bại! Vui lòng kiểm tra lại thông tin đã nhập.'
    error_response['errors'] = {'non_field_errors': ['Dữ liệu không hợp lệ.']}

return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
```

## Kết Quả

Sau khi fix:

1. ✅ **Logging tốt hơn**: Console sẽ hiển thị đầy đủ thông tin về lỗi (status, data, headers, message, code)

2. ✅ **Error messages rõ ràng**: User sẽ nhận được thông báo lỗi cụ thể thay vì generic message

3. ✅ **Xử lý đầy đủ các trường hợp**: 
   - Network errors
   - Validation errors
   - Authentication errors
   - Server errors

4. ✅ **Fallback messages**: Luôn có message ngay cả khi errors object rỗng

## Cách Test

1. **Test với invalid data**: Submit form với dữ liệu không hợp lệ
   - Kiểm tra console có log đầy đủ không
   - Kiểm tra error message có hiển thị không

2. **Test với network error**: Tắt internet và submit form
   - Kiểm tra có hiển thị "Network error" không

3. **Test với server error**: Tạm thời tắt backend và submit form
   - Kiểm tra có hiển thị "Server error" không

## Debug Tips

Khi gặp lỗi tương tự trong tương lai:

1. **Kiểm tra console logs**: Xem tất cả các log được thêm vào
   - `API Error Status`
   - `API Error Data`
   - `API Error Headers`
   - `Error Message`
   - `Error Code`

2. **Kiểm tra Network tab**: Xem request/response trong browser DevTools

3. **Kiểm tra backend logs**: Xem server có log gì không

4. **Kiểm tra CORS**: Đảm bảo CORS được cấu hình đúng

