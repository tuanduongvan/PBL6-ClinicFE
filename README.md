# PBL6 Clinic - Hệ Thống Đặt Lịch Khám Bệnh

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cài Đặt](#cài-đặt)
3. [Chạy Ứng Dụng](#chạy-ứng-dụng)
4. [Hướng Dẫn Test](#hướng-dẫn-test)
   - [Test Tính Năng Patient](#test-tính-năng-patient)
   - [Test Tính Năng Doctor](#test-tính-năng-doctor)
   - [Test Tính Năng Chung](#test-tính-năng-chung)
5. [Test Cases Chi Tiết](#test-cases-chi-tiết)
6. [Troubleshooting](#troubleshooting)

---

## 📖 Tổng Quan

Hệ thống đặt lịch khám bệnh với đầy đủ tính năng cho bệnh nhân và bác sĩ:

### Tính Năng Chính:
- ✅ Đặt lịch hẹn khám bệnh
- ✅ Quản lý appointments (accept/reject/cancel/reschedule)
- ✅ Hồ sơ khám bệnh (Medical Records)
- ✅ Đơn thuốc (Prescriptions)
- ✅ Lịch sử khám bệnh (Medical History)
- ✅ Tìm kiếm và lọc bác sĩ
- ✅ Thông báo real-time

---

## 🚀 Cài Đặt

### Yêu Cầu:
- Node.js >= 18.x
- npm hoặc yarn
- Backend API đang chạy (Django REST Framework)

### Bước 1: Clone Repository
```bash
cd /home/toanledinh/Documents/Workspace/PBL6/Front_End/PBL6-ClinicFE
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
# hoặc
yarn install
```

### Bước 3: Cấu Hình Environment
Tạo file `.env.local` (nếu chưa có):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Bước 4: Chạy Development Server
```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

---

## 🧪 Chạy Ứng Dụng

### 1. Khởi Động Backend
Đảm bảo backend Django đang chạy:
```bash
cd /home/toanledinh/Documents/Workspace/PBL6/Back_End/PBL6_BookingCare
python3 manage.py runserver
```

### 2. Khởi Động Frontend
```bash
cd /home/toanledinh/Documents/Workspace/PBL6/Front_End/PBL6-ClinicFE
npm run dev
```

### 3. Truy Cập Ứng Dụng
Mở trình duyệt: `http://localhost:3000`

---

## 📝 Hướng Dẫn Test

## Test Tính Năng Patient

### 1. Test Đăng Ký/Đăng Nhập

#### Test Case 1.1: Đăng Ký Tài Khoản Patient
**Bước thực hiện:**
1. Truy cập trang chủ
2. Click "Sign Up"
3. Điền thông tin:
   - First Name: `Test`
   - Last Name: `Patient`
   - Email: `patient@test.com`
   - Password: `password123`
   - Role: Chọn `Patient`
4. Click "Sign Up"

**Kết quả mong đợi:**
- ✅ Đăng ký thành công
- ✅ Tự động đăng nhập
- ✅ Redirect về trang chủ hoặc dashboard

#### Test Case 1.2: Đăng Nhập Patient
**Bước thực hiện:**
1. Click "Sign In"
2. Nhập email và password đã đăng ký
3. Click "Sign In"

**Kết quả mong đợi:**
- ✅ Đăng nhập thành công
- ✅ Hiển thị tên user ở header
- ✅ Có dropdown menu với các options

---

### 2. Test Tìm Kiếm và Lọc Bác Sĩ

#### Test Case 2.1: Tìm Kiếm Bác Sĩ Theo Tên
**Bước thực hiện:**
1. Đăng nhập với tài khoản Patient
2. Vào trang "Our Doctors" hoặc `/doctors`
3. Nhập tên bác sĩ vào search bar (ví dụ: "Nguyen")
4. Quan sát kết quả

**Kết quả mong đợi:**
- ✅ Danh sách bác sĩ được lọc theo tên
- ✅ Hiển thị số lượng kết quả
- ✅ Kết quả cập nhật real-time khi gõ

#### Test Case 2.2: Lọc Bác Sĩ Theo Chuyên Khoa
**Bước thực hiện:**
1. Ở trang Doctors
2. Chọn một chuyên khoa từ dropdown "Chuyên khoa"
3. Quan sát kết quả

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị bác sĩ thuộc chuyên khoa đã chọn
- ✅ Số lượng kết quả được cập nhật

#### Test Case 2.3: Lọc Bác Sĩ Theo Mức Giá
**Bước thực hiện:**
1. Chọn mức giá từ dropdown (ví dụ: "Dưới 500k")
2. Quan sát kết quả

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị bác sĩ có giá trong khoảng đã chọn
- ✅ Kết quả được cập nhật ngay lập tức

#### Test Case 2.4: Sắp Xếp Bác Sĩ
**Bước thực hiện:**
1. Chọn "Sắp xếp" → "Theo tên"
2. Thử các options khác: "Giá tăng dần", "Kinh nghiệm"
3. Quan sát thứ tự danh sách

**Kết quả mong đợi:**
- ✅ Danh sách được sắp xếp đúng theo option đã chọn
- ✅ Có thể kết hợp với filter khác

#### Test Case 2.5: Xóa Bộ Lọc
**Bước thực hiện:**
1. Áp dụng nhiều filter
2. Click "Xóa bộ lọc"
3. Quan sát kết quả

**Kết quả mong đợi:**
- ✅ Tất cả filter được reset
- ✅ Hiển thị lại toàn bộ danh sách bác sĩ

---

### 3. Test Đặt Lịch Hẹn

#### Test Case 3.1: Đặt Lịch Hẹn Mới
**Bước thực hiện:**
1. Vào trang Doctors
2. Chọn một bác sĩ
3. Click "Đặt Lịch Ngay"
4. Điền thông tin:
   - Chọn ngày khám
   - Chọn khung giờ (time slot)
   - Nhập lý do khám (optional)
   - Nhập ghi chú (optional)
5. Click "Đặt Lịch"

**Kết quả mong đợi:**
- ✅ Hiển thị modal đặt lịch
- ✅ Calendar hiển thị các ngày available
- ✅ Time slots hiển thị đúng theo schedule của bác sĩ
- ✅ Đặt lịch thành công, hiển thị toast notification
- ✅ Appointment được tạo với status "PENDING"
- ✅ Modal đóng lại

#### Test Case 3.2: Đặt Lịch - Validation
**Bước thực hiện:**
1. Mở modal đặt lịch
2. Không chọn ngày, click "Đặt Lịch"
3. Chọn ngày quá khứ
4. Chọn time slot đã được đặt

**Kết quả mong đợi:**
- ✅ Hiển thị error message khi thiếu thông tin
- ✅ Không cho phép chọn ngày quá khứ
- ✅ Time slots đã được đặt hiển thị disabled hoặc không có
- ✅ Không thể submit form khi validation fail

---

### 4. Test Quản Lý Appointments

#### Test Case 4.1: Xem Danh Sách Appointments
**Bước thực hiện:**
1. Đăng nhập với tài khoản Patient
2. Vào "My Appointments" hoặc `/patient/my-appointments`
3. Quan sát danh sách

**Kết quả mong đợi:**
- ✅ Hiển thị tất cả appointments của user
- ✅ Hiển thị đầy đủ thông tin: ngày, giờ, bác sĩ, trạng thái
- ✅ Status badges có màu sắc phù hợp:
  - PENDING: màu vàng
  - ACCEPTED: màu xanh lá
  - REJECTED: màu đỏ
  - COMPLETED: màu xanh dương
  - CANCELED: màu xám

#### Test Case 4.2: Hủy Lịch Hẹn
**Bước thực hiện:**
1. Vào My Appointments
2. Tìm appointment có status "PENDING" hoặc "ACCEPTED"
3. Click "Hủy lịch"
4. Xác nhận trong dialog

**Kết quả mong đợi:**
- ✅ Hiển thị confirmation dialog
- ✅ Hiển thị thông tin appointment trong dialog
- ✅ Sau khi confirm, appointment status chuyển thành "CANCELED"
- ✅ Hiển thị toast notification thành công
- ✅ Danh sách được refresh tự động
- ✅ Button "Hủy lịch" biến mất sau khi hủy

#### Test Case 4.3: Hủy Lịch - Validation (12 giờ)
**Bước thực hiện:**
1. Tìm appointment sắp diễn ra (< 12 giờ)
2. Thử click "Hủy lịch"

**Kết quả mong đợi:**
- ✅ Button "Hủy lịch" không hiển thị hoặc disabled
- ✅ Hoặc hiển thị error message: "Không thể hủy lịch hẹn do đã quá thời gian cho phép"

#### Test Case 4.4: Đổi Lịch Hẹn (Reschedule)
**Bước thực hiện:**
1. Vào My Appointments
2. Tìm appointment có status "ACCEPTED" hoặc "CONFIRMED"
3. Click "Reschedule"
4. Chọn ngày mới
5. Chọn time slot mới
6. Click "Đổi lịch"

**Kết quả mong đợi:**
- ✅ Modal reschedule hiển thị
- ✅ Hiển thị thông tin appointment hiện tại
- ✅ Calendar chỉ cho phép chọn ngày hợp lệ
- ✅ Validation: không cho đổi trong vòng 12 giờ trước giờ khám
- ✅ Sau khi đổi, appointment status chuyển về "PENDING"
- ✅ Hiển thị toast notification
- ✅ Danh sách được refresh

#### Test Case 4.5: Reschedule - Validation
**Bước thực hiện:**
1. Mở modal reschedule
2. Chọn ngày quá khứ
3. Chọn time slot đã được đặt
4. Thử đổi lịch trong vòng 12 giờ trước giờ khám

**Kết quả mong đợi:**
- ✅ Không cho phép chọn ngày quá khứ
- ✅ Time slots đã được đặt không thể chọn
- ✅ Hiển thị error nếu thử đổi trong vòng 12 giờ

---

### 5. Test Real-time Notifications

#### Test Case 5.1: Nhận Thông Báo Khi Doctor Accept
**Bước thực hiện:**
1. Đăng nhập với tài khoản Patient
2. Đặt một lịch hẹn mới
3. Đăng nhập với tài khoản Doctor (tab khác)
4. Accept appointment đó
5. Quay lại tab Patient

**Kết quả mong đợi:**
- ✅ Trong vòng 5 giây, hiển thị toast notification:
  - Title: "Cập nhật lịch hẹn"
  - Message: "Lịch hẹn của bạn đã được bác sĩ xác nhận"
  - Variant: success (màu xanh)
- ✅ Danh sách appointments tự động refresh
- ✅ Status của appointment chuyển thành "ACCEPTED"

#### Test Case 5.2: Nhận Thông Báo Khi Doctor Reject
**Bước thực hiện:**
1. Tương tự Test Case 5.1, nhưng Doctor reject appointment

**Kết quả mong đợi:**
- ✅ Hiển thị toast notification:
  - Title: "Cập nhật lịch hẹn"
  - Message: "Lịch hẹn của bạn không được chấp nhận, vui lòng chọn ca khác"
  - Variant: destructive (màu đỏ)
- ✅ Status chuyển thành "REJECTED"
- ✅ Danh sách được refresh

---

### 6. Test Medical Records

#### Test Case 6.1: Xem Hồ Sơ Khám Bệnh
**Bước thực hiện:**
1. Đăng nhập với tài khoản Patient
2. Vào "Medical History" → Click "Xem chi tiết hồ sơ"
   - Hoặc truy cập trực tiếp `/patient/medical-records`
3. Quan sát danh sách hồ sơ

**Kết quả mong đợi:**
- ✅ Hiển thị tất cả hồ sơ khám bệnh
- ✅ Mỗi hồ sơ hiển thị:
  - Tên bác sĩ
  - Ngày và giờ khám
  - Lý do khám
  - Mô tả/chẩn đoán
  - Tình trạng trước/sau khám
  - Ngày tạo
- ✅ Empty state nếu chưa có hồ sơ nào

---

### 7. Test Prescriptions

#### Test Case 7.1: Xem Đơn Thuốc
**Bước thực hiện:**
1. Vào `/patient/prescriptions`
2. Quan sát danh sách đơn thuốc

**Kết quả mong đợi:**
- ✅ Hiển thị đơn thuốc được group theo appointment
- ✅ Mỗi đơn thuốc hiển thị:
  - Tên bác sĩ
  - Ngày khám
  - Danh sách treatments với:
    - Tên phác đồ điều trị
    - Mục đích
    - Thuốc (nếu có)
    - Liều lượng
    - Lịch uống
- ✅ Empty state nếu chưa có đơn thuốc

---

### 8. Test Medical History

#### Test Case 8.1: Xem Lịch Sử Khám Bệnh
**Bước thực hiện:**
1. Vào `/patient/medical-history`
2. Quan sát timeline

**Kết quả mong đợi:**
- ✅ Hiển thị timeline các lần khám (mới nhất trước)
- ✅ Mỗi item hiển thị:
  - Tên bác sĩ
  - Ngày và giờ khám
  - Status badge
  - Hồ sơ khám (nếu có)
  - Đơn thuốc (nếu có)
  - Links đến chi tiết
- ✅ Có thể click "Xem chi tiết hồ sơ" hoặc "Xem chi tiết đơn thuốc"
- ✅ Empty state nếu chưa có lịch sử

---

## Test Tính Năng Doctor

### 1. Test Đăng Nhập Doctor

#### Test Case 1.1: Đăng Nhập Doctor
**Bước thực hiện:**
1. Click "Sign In"
2. Nhập email và password của Doctor
3. Click "Sign In"

**Kết quả mong đợi:**
- ✅ Đăng nhập thành công
- ✅ Redirect đến `/doctor/dashboard`
- ✅ Hiển thị "Welcome, Dr. [Last Name]"

---

### 2. Test Quản Lý Appointments

#### Test Case 2.1: Xem Danh Sách Appointments
**Bước thực hiện:**
1. Vào Doctor Dashboard
2. Quan sát danh sách appointments

**Kết quả mong đợi:**
- ✅ Hiển thị 2 sections:
  - "Lịch hẹn đang chờ" (PENDING)
  - "Lịch hẹn đã chấp nhận" (ACCEPTED/CONFIRMED)
- ✅ Mỗi appointment hiển thị:
  - Tên bệnh nhân
  - Ngày và giờ
  - Status badge
  - Notes (nếu có)

#### Test Case 2.2: Chấp Nhận Appointment
**Bước thực hiện:**
1. Tìm appointment có status "PENDING"
2. Click "Chấp nhận"
3. Quan sát kết quả

**Kết quả mong đợi:**
- ✅ Button hiển thị loading state
- ✅ Appointment chuyển từ "PENDING" sang "ACCEPTED"
- ✅ Appointment di chuyển từ section "Đang chờ" sang "Đã chấp nhận"
- ✅ Hiển thị toast notification: "Đã chấp nhận lịch hẹn"
- ✅ Patient nhận được notification (test ở tab khác)

#### Test Case 2.3: Từ Chối Appointment
**Bước thực hiện:**
1. Tìm appointment "PENDING"
2. Click "Từ chối"
3. Quan sát kết quả

**Kết quả mong đợi:**
- ✅ Button hiển thị loading state
- ✅ Appointment status chuyển thành "REJECTED"
- ✅ Appointment biến mất khỏi danh sách "Đang chờ"
- ✅ Hiển thị toast notification
- ✅ Patient nhận được notification

---

### 3. Test Tạo Hồ Sơ Khám Bệnh

#### Test Case 3.1: Tạo Hồ Sơ Khám Mới
**Bước thực hiện:**
1. Tìm appointment có status "ACCEPTED" hoặc "CONFIRMED"
2. Click "Tạo hồ sơ khám"
3. Điền form:
   - Lý do khám: "Khám da liễu"
   - Mô tả: "Bệnh nhân bị viêm da"
   - Tình trạng trước khám: "Da đỏ, ngứa"
   - Tình trạng sau khám: "Đã kê đơn thuốc"
4. Click "Tạo hồ sơ"

**Kết quả mong đợi:**
- ✅ Modal hiển thị với form đầy đủ
- ✅ Validation: "Lý do khám" là required
- ✅ Sau khi submit, hiển thị toast: "Đã tạo hồ sơ khám bệnh"
- ✅ Modal đóng lại
- ✅ Danh sách appointments được refresh

#### Test Case 3.2: Chỉnh Sửa Hồ Sơ Khám
**Bước thực hiện:**
1. Tìm appointment đã có hồ sơ
2. Click "Tạo hồ sơ khám" (sẽ load existing record)
3. Chỉnh sửa thông tin
4. Click "Cập nhật"

**Kết quả mong đợi:**
- ✅ Modal hiển thị với dữ liệu hiện tại
- ✅ Title modal là "Chỉnh sửa Hồ Sơ Khám Bệnh"
- ✅ Button submit là "Cập nhật"
- ✅ Sau khi update, hiển thị toast: "Đã cập nhật hồ sơ khám bệnh"

---

### 4. Test Kê Đơn Thuốc

#### Test Case 4.1: Tạo Đơn Thuốc
**Bước thực hiện:**
1. Tìm appointment "ACCEPTED" hoặc "CONFIRMED"
2. Click "Kê đơn thuốc"
3. Điền thông tin treatment đầu tiên:
   - Tên phác đồ: "Điều trị viêm da"
   - Mục đích: "Giảm viêm, ngứa"
   - Liều lượng: "1 viên"
   - Số ngày: "7"
   - Giờ uống: "08:00"
4. Click "Thêm phác đồ điều trị" để thêm treatment thứ 2
5. Điền thông tin treatment thứ 2
6. Click "Tạo đơn thuốc"

**Kết quả mong đợi:**
- ✅ Modal hiển thị với form
- ✅ Có thể thêm nhiều treatments
- ✅ Có thể xóa treatment bằng button X
- ✅ Validation: Tên và Mục đích là required
- ✅ Sau khi submit, hiển thị toast: "Đã tạo X phác đồ điều trị"
- ✅ Modal đóng lại
- ✅ Danh sách được refresh

#### Test Case 4.2: Tạo Đơn Thuốc - Multiple Treatments
**Bước thực hiện:**
1. Tạo đơn thuốc với 3 treatments khác nhau
2. Submit

**Kết quả mong đợi:**
- ✅ Tất cả 3 treatments được tạo thành công
- ✅ Toast hiển thị: "Đã tạo 3 phác đồ điều trị"
- ✅ Patient có thể xem tất cả trong trang Prescriptions

---

### 5. Test Hoàn Thành Appointment

#### Test Case 5.1: Complete Appointment
**Bước thực hiện:**
1. Tìm appointment "ACCEPTED" hoặc "CONFIRMED"
2. (Optional) Tạo hồ sơ khám và đơn thuốc trước
3. Click "Hoàn thành"
4. Quan sát kết quả

**Kết quả mong đợi:**
- ✅ Button hiển thị loading state
- ✅ Appointment status chuyển thành "COMPLETED"
- ✅ Appointment biến mất khỏi section "Đã chấp nhận"
- ✅ Hiển thị toast notification
- ✅ Patient nhận được notification
- ✅ Nếu chưa có record, hệ thống tự động tạo empty record

---

## Test Tính Năng Chung

### 1. Test Navigation

#### Test Case 1.1: Header Navigation
**Bước thực hiện:**
1. Đăng nhập với Patient
2. Click vào avatar ở header
3. Quan sát dropdown menu

**Kết quả mong đợi:**
- ✅ Hiển thị:
  - My Profile
  - My Appointments
  - Medical History (mới)
  - Logout
- ✅ Click vào các items để navigate

#### Test Case 1.2: Responsive Menu
**Bước thực hiện:**
1. Resize browser về mobile size
2. Click hamburger menu
3. Quan sát mobile menu

**Kết quả mong đợi:**
- ✅ Menu hiển thị đúng trên mobile
- ✅ Có thể đóng/mở menu
- ✅ Tất cả links hoạt động

---

### 2. Test Error Handling

#### Test Case 2.1: API Error
**Bước thực hiện:**
1. Tắt backend server
2. Thử thực hiện một action (ví dụ: đặt lịch)

**Kết quả mong đợi:**
- ✅ Hiển thị error toast với message rõ ràng
- ✅ UI không bị crash
- ✅ Có thể retry sau khi bật lại backend

#### Test Case 2.2: Network Error
**Bước thực hiện:**
1. Disconnect internet
2. Thử load trang hoặc thực hiện action

**Kết quả mong đợi:**
- ✅ Hiển thị error message phù hợp
- ✅ Có thể retry khi có internet lại

---

### 3. Test Loading States

#### Test Case 3.1: Loading Indicators
**Bước thực hiện:**
1. Thực hiện các actions (đặt lịch, accept, reject, etc.)
2. Quan sát loading states

**Kết quả mong đợi:**
- ✅ Tất cả buttons hiển thị loading spinner khi đang xử lý
- ✅ Buttons bị disabled trong lúc loading
- ✅ Không thể click multiple times
- ✅ Loading state biến mất sau khi hoàn thành

---

## 📋 Test Cases Chi Tiết

### Test Flow Hoàn Chỉnh

#### Flow 1: Patient Đặt Lịch → Doctor Accept → Complete
1. **Patient đặt lịch:**
   - Đăng nhập Patient
   - Tìm bác sĩ
   - Đặt lịch hẹn
   - ✅ Status: PENDING

2. **Doctor accept:**
   - Đăng nhập Doctor (tab khác)
   - Vào dashboard
   - Accept appointment
   - ✅ Status: ACCEPTED
   - ✅ Patient nhận notification

3. **Doctor tạo hồ sơ và đơn thuốc:**
   - Tạo hồ sơ khám
   - Kê đơn thuốc
   - ✅ Hồ sơ và đơn thuốc được tạo

4. **Doctor complete:**
   - Click "Hoàn thành"
   - ✅ Status: COMPLETED
   - ✅ Patient nhận notification

5. **Patient xem kết quả:**
   - Vào Medical History
   - ✅ Thấy appointment completed
   - ✅ Có hồ sơ khám và đơn thuốc
   - Vào Medical Records
   - ✅ Thấy hồ sơ chi tiết
   - Vào Prescriptions
   - ✅ Thấy đơn thuốc

#### Flow 2: Patient Reschedule
1. Patient có appointment ACCEPTED
2. Click "Reschedule"
3. Chọn ngày và giờ mới
4. ✅ Status chuyển về PENDING
5. Doctor phải accept lại

#### Flow 3: Patient Cancel
1. Patient có appointment PENDING hoặc ACCEPTED
2. Click "Hủy lịch"
3. Confirm trong dialog
4. ✅ Status: CANCELED
5. ✅ Appointment biến mất khỏi danh sách

---

## 🔧 Troubleshooting

### Lỗi Thường Gặp

#### 1. "Cannot connect to API"
**Nguyên nhân:**
- Backend chưa chạy
- URL API không đúng

**Giải pháp:**
- Kiểm tra backend đang chạy: `http://localhost:8000`
- Kiểm tra file `.env.local` có đúng `NEXT_PUBLIC_API_URL`
- Kiểm tra CORS settings trong backend

#### 2. "401 Unauthorized"
**Nguyên nhân:**
- Token hết hạn
- Chưa đăng nhập

**Giải pháp:**
- Đăng xuất và đăng nhập lại
- Kiểm tra token trong localStorage

#### 3. "Appointment not found"
**Nguyên nhân:**
- Appointment đã bị xóa
- ID không đúng

**Giải pháp:**
- Refresh trang
- Kiểm tra appointment còn tồn tại trong database

#### 4. "Cannot cancel appointment"
**Nguyên nhân:**
- Đã quá 12 giờ trước giờ khám
- Status không cho phép cancel

**Giải pháp:**
- Kiểm tra thời gian appointment
- Chỉ có thể cancel PENDING, ACCEPTED, CONFIRMED
- Không thể cancel trong vòng 12 giờ trước giờ khám

#### 5. "Modal không hiển thị"
**Nguyên nhân:**
- State không được set đúng
- Component chưa được import

**Giải pháp:**
- Kiểm tra console có lỗi
- Kiểm tra state `isOpen` có đúng không
- Kiểm tra component đã được import và render

#### 6. "Notifications không hiển thị"
**Nguyên nhân:**
- Polling interval chưa chạy
- Backend chưa tạo notification

**Giải pháp:**
- Kiểm tra polling interval (5 giây)
- Kiểm tra backend có tạo notification không
- Kiểm tra notification type có đúng không

---

## 📊 Checklist Test

### Patient Features
- [ ] Đăng ký/Đăng nhập
- [ ] Tìm kiếm bác sĩ
- [ ] Lọc bác sĩ (chuyên khoa, giá)
- [ ] Sắp xếp bác sĩ
- [ ] Đặt lịch hẹn
- [ ] Xem danh sách appointments
- [ ] Hủy lịch hẹn
- [ ] Đổi lịch hẹn (reschedule)
- [ ] Nhận notifications (accept/reject)
- [ ] Xem hồ sơ khám bệnh
- [ ] Xem đơn thuốc
- [ ] Xem lịch sử khám bệnh

### Doctor Features
- [ ] Đăng nhập
- [ ] Xem danh sách appointments
- [ ] Chấp nhận appointment
- [ ] Từ chối appointment
- [ ] Tạo hồ sơ khám bệnh
- [ ] Chỉnh sửa hồ sơ khám bệnh
- [ ] Kê đơn thuốc
- [ ] Hoàn thành appointment

### Common Features
- [ ] Navigation menu
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Empty states

---

## 📝 Notes

- Tất cả test cases đã được verify với code hiện tại
- Backend API phải đang chạy để test đầy đủ
- Một số tính năng cần 2 tài khoản (Patient + Doctor) để test flow hoàn chỉnh
- Notifications polling mỗi 5 giây, có thể mất vài giây để hiển thị

---

## 🎯 Kết Luận

Sau khi test tất cả các tính năng trên, hệ thống sẽ hoạt động đầy đủ với:
- ✅ Tất cả tính năng Phase 1 Critical đã hoàn thành
- ✅ UI/UX đã được tối ưu
- ✅ Error handling và validation đầy đủ
- ✅ Real-time updates qua notifications

**Happy Testing! 🚀**

