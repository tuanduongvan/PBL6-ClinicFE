# Kiểm tra Flow Đánh Giá

## Flow hoàn chỉnh

### 1. **Bệnh nhân vào trang "Lịch hẹn của tôi"**
   - URL: `/patient/my-appointments`
   - Hiển thị danh sách appointments

### 2. **Bệnh nhân click nút "Đánh giá"**
   - Chỉ hiển thị với appointments có status = "completed"
   - Gọi `handleRateClick(appointment)`
   - Mở `RatingModal` với doctor và appointment

### 3. **Bệnh nhân điền form đánh giá**
   - Chọn số sao (1-5)
   - Nhập comment (tùy chọn)
   - Click "Gửi đánh giá"

### 4. **RatingModal xử lý submit**
   - Validate: rating phải từ 1-5
   - Validate: appointment phải tồn tại
   - Gọi API: `ratingsAPI.create({ appointment_id, rating, comment })`
   - POST `/api/ratings/` với payload:
     ```json
     {
       "appointment_id": 6,
       "rating": 5,
       "comment": "Bác sĩ rất tốt"
     }
     ```

### 5. **Backend xử lý**
   - Validation:
     - Appointment status = "completed"
     - Appointment chưa có rating
     - User là patient của appointment
   - Tạo Rating record
   - Cập nhật `average_rating` của doctor
   - Trả về Rating object

### 6. **Frontend xử lý response**
   - Success: Hiển thị toast "Thành công"
   - Đóng modal
   - Refresh danh sách appointments
   - Error: Hiển thị error message trong modal

## Các điểm cần kiểm tra

### ✅ Frontend
- [ ] RatingModal hiển thị đúng thông tin doctor
- [ ] Validation rating (1-5) hoạt động
- [ ] API call được gửi đúng payload
- [ ] Error handling hiển thị message rõ ràng
- [ ] Success toast hiển thị
- [ ] Appointments list được refresh sau khi đánh giá

### ✅ Backend
- [ ] Endpoint `/api/ratings/` nhận request đúng
- [ ] Validation appointment status
- [ ] Validation duplicate rating
- [ ] Validation user permission
- [ ] Tạo Rating thành công
- [ ] Cập nhật average_rating của doctor
- [ ] Trả về response đúng format

## Test Cases

### Test Case 1: Đánh giá thành công
1. Login với tài khoản patient
2. Vào `/patient/my-appointments`
3. Tìm appointment có status = "completed"
4. Click "Đánh giá"
5. Chọn 5 sao, nhập comment
6. Click "Gửi đánh giá"
7. **Expected**: Toast success, modal đóng, appointments refresh

### Test Case 2: Đánh giá appointment đã có rating
1. Thực hiện Test Case 1
2. Click "Đánh giá" lại cho cùng appointment
3. **Expected**: Error message "Lịch hẹn này đã được đánh giá"

### Test Case 3: Đánh giá appointment chưa completed
1. Tìm appointment có status != "completed"
2. **Expected**: Không có nút "Đánh giá"

### Test Case 4: Validation
1. Mở modal đánh giá
2. Không chọn sao, click "Gửi đánh giá"
3. **Expected**: Error "Vui lòng chọn đánh giá"

## Debug

### Kiểm tra Network Request
1. Mở DevTools > Network
2. Filter: "ratings"
3. Xem request POST `/api/ratings/`
4. Kiểm tra:
   - Request payload
   - Response status
   - Response data

### Kiểm tra Console
1. Mở DevTools > Console
2. Xem error messages nếu có
3. Kiểm tra API response

### Kiểm tra Backend Logs
```bash
docker compose logs -f web
# Hoặc xem console output của Django server
```

## Common Issues

### Issue 1: "Lịch hẹn này đã được đánh giá"
- **Nguyên nhân**: Appointment đã có rating
- **Giải pháp**: Kiểm tra xem appointment đã có rating chưa

### Issue 2: "Chỉ có thể đánh giá lịch hẹn đã hoàn thành"
- **Nguyên nhân**: Appointment status != "completed"
- **Giải pháp**: Đảm bảo appointment đã được complete

### Issue 3: "Bạn chỉ có thể đánh giá lịch hẹn của chính mình"
- **Nguyên nhân**: User không phải patient của appointment
- **Giải pháp**: Kiểm tra appointment.patient == user.patient

### Issue 4: 500 Internal Server Error
- **Nguyên nhân**: Lỗi backend (có thể do migrations chưa chạy)
- **Giải pháp**: 
  ```bash
  docker compose exec web python manage.py migrate
  docker compose restart web
  ```

