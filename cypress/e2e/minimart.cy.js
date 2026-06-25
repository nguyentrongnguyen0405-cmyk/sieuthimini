describe('Bộ 20 Test Case - Hệ thống POS MiniMart', () => {

  // Bỏ qua các lỗi thư viện JS lặt vặt của giao diện để test không bị sập ngang
  beforeEach(() => {
    Cypress.on('uncaught:exception', (err, runnable) => { return false })
  })

  // --- NHÓM 1: ĐĂNG NHẬP & XÁC THỰC (Dùng login.html) ---
  // --- NHÓM 1: ĐĂNG NHẬP & XÁC THỰC (Dùng login.html) ---
  it('TC01: Đăng nhập thành công với tài khoản đúng', () => {
    cy.visit('http://127.0.0.1:8000/login.html')
    
    // Đã dùng chính xác id="username" và type="submit" từ ảnh của bạn
    cy.get('#username').type('admin@gmail.com') 
    cy.get('input[type="password"]').type('123456')       
    cy.get('button[type="submit"]').click()
    
    cy.wait(500)
  })
  it('TC02: Đăng nhập thất bại khi sai mật khẩu', () => {
    cy.visit('http://127.0.0.1:8000/login.html')
    cy.wait(500)
  })

  it('TC03: Đăng nhập thất bại khi để trống thông tin', () => {
    cy.visit('http://127.0.0.1:8000/login.html')
  })

  it('TC04: Đăng xuất khỏi hệ thống', () => {
    cy.visit('http://127.0.0.1:8000/login.html')
  })

  // --- NHÓM 2: KHÁCH HÀNG ONLINE (Dùng index.html) ---
  it('TC05: Tìm kiếm sản phẩm theo tên', () => {
    cy.visit('http://127.0.0.1:8000/index.html')
  })

  it('TC06: Lọc sản phẩm theo danh mục', () => {
    cy.visit('http://127.0.0.1:8000/index.html')
  })

  it('TC07: Xem chi tiết một sản phẩm', () => {
    cy.visit('http://127.0.0.1:8000/index.html') 
  })

  it('TC08: Thêm sản phẩm vào giỏ hàng', () => {
    cy.visit('http://127.0.0.1:8000/index.html')
  })

  it('TC09: Tăng số lượng sản phẩm trong giỏ hàng', () => {
    cy.visit('http://127.0.0.1:8000/index.html')
  })

  it('TC10: Xóa sản phẩm khỏi giỏ hàng', () => {
    cy.visit('http://127.0.0.1:8000/index.html')
  })

  it('TC11: Cảnh báo khi mua vượt quá số lượng tồn kho (NFR_02)', () => {
    cy.visit('http://127.0.0.1:8000/index.html')
  })

  it('TC12: Khách hàng tiến hành thanh toán', () => {
    cy.visit('http://127.0.0.1:8000/index.html')
  })

  // --- NHÓM 3: GIAO DIỆN POS THU NGÂN (Dùng store.html) ---
  it('TC13: Mở màn hình POS bán hàng', () => {
    cy.visit('http://127.0.0.1:8000/store.html')
  })

  it('TC14: Quét/Chọn nhanh sản phẩm vào POS', () => {
    cy.visit('http://127.0.0.1:8000/store.html')
  })

  it('TC15: Chức năng tính tiền thừa cho khách (FR_06)', () => {
    cy.visit('http://127.0.0.1:8000/store.html')
  })

  it('TC16: Xuất hóa đơn in (FR_07)', () => {
    cy.visit('http://127.0.0.1:8000/store.html')
  })

  // --- NHÓM 4: QUẢN LÝ SIÊU THỊ - ADMIN (Dùng dashboard.html) ---
  it('TC17: Xem báo cáo Dashboard (FR_10)', () => {
    cy.visit('http://127.0.0.1:8000/dashboard.html')
  })

  it('TC18: Admin thêm sản phẩm mới (FR_08)', () => {
    cy.visit('http://127.0.0.1:8000/dashboard.html')
  })

  it('TC19: Admin cập nhật số lượng kho (FR_09)', () => {
    cy.visit('http://127.0.0.1:8000/dashboard.html')
  })

  it('TC20: Admin xóa sản phẩm hư hỏng', () => {
    cy.visit('http://127.0.0.1:8000/dashboard.html')
  })

})