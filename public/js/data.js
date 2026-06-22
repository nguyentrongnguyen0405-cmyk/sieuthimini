window.MiniMart = window.MiniMart || {};

MiniMart.Data = (function() {
  const STORAGE_KEYS = {
    PRODUCTS: 'minimart_products',
    INVOICES: 'minimart_invoices',
    USERS: 'minimart_users',
    STOCK_ENTRIES: 'minimart_stock_entries',
    CUSTOMERS: 'minimart_customers',
    CURRENT_USER: 'minimart_current_user',
    INITIALIZED: 'minimart_initialized_v3'
  };

  const categories = [
    { id: 'thuc-pham', name: 'Thực phẩm', icon: '🍚' },
    { id: 'do-uong', name: 'Đồ uống', icon: '🥤' },
    { id: 'gia-vi', name: 'Gia vị', icon: '🧂' },
    { id: 'banh-keo', name: 'Bánh kẹo', icon: '🍪' },
    { id: 'do-dung', name: 'Đồ dùng', icon: '🧴' },
    { id: 'sua', name: 'Sữa', icon: '🥛' },
    { id: 'rau-cu', name: 'Rau củ', icon: '🥬' },
    { id: 'thit-ca', name: 'Thịt & Cá', icon: '🥩' }
  ];

  const sampleProducts = [
    { id: 'P001', name: 'Gạo ST25 (5kg)', code: '8934563001', category: 'thuc-pham', price: 125000, costPrice: 100000, stock: 45, unit: 'Bao', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80', status: 'active' },
    { id: 'P002', name: 'Nước mắm Nam Ngư 500ml', code: '8934563002', category: 'gia-vi', price: 32000, costPrice: 25000, stock: 80, unit: 'Chai', image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?w=200&q=80', status: 'active' },
    { id: 'P003', name: 'Bia Tiger (Thùng 24 lon)', code: '8934563003', category: 'do-uong', price: 350000, costPrice: 320000, stock: 10, unit: 'Thùng', image: 'https://images.unsplash.com/photo-1605548230624-8d2d0419c517?w=200&q=80', status: 'active' },
    { id: 'P004', name: 'Sữa tươi Vinamilk 1L', code: '8934563004', category: 'sua', price: 35000, costPrice: 28000, stock: 120, unit: 'Hộp', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80', status: 'active' },
    { id: 'P005', name: 'Mì Hảo Hảo (Thùng 30 gói)', code: '8934563005', category: 'thuc-pham', price: 100000, costPrice: 85000, stock: 50, unit: 'Thùng', image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=200&q=80', status: 'active' },
    { id: 'P006', name: 'Dầu ăn Simply 1L', code: '8934563006', category: 'gia-vi', price: 45000, costPrice: 38000, stock: 60, unit: 'Chai', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80', status: 'active' },
    { id: 'P007', name: 'Bột giặt OMO 3kg', code: '8934563007', category: 'do-dung', price: 120000, costPrice: 100000, stock: 5, unit: 'Túi', image: 'https://images.unsplash.com/photo-1584820927498-cafe6c1c8774?w=200&q=80', status: 'active' },
    { id: 'P008', name: 'Bánh ChocoPie 12 cái', code: '8934563008', category: 'banh-keo', price: 55000, costPrice: 45000, stock: 30, unit: 'Hộp', image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=200&q=80', status: 'active' },
    { id: 'P009', name: 'Nước rửa chén Sunlight 4kg', code: '8934563009', category: 'do-dung', price: 95000, costPrice: 80000, stock: 0, unit: 'Can', image: 'https://images.unsplash.com/photo-1584820927498-cafe6c1c8774?w=200&q=80', status: 'active' },
    { id: 'P010', name: 'Trứng gà (Vỉ 10 quả)', code: '8934563010', category: 'thuc-pham', price: 30000, costPrice: 24000, stock: 40, unit: 'Vỉ', image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=200&q=80', status: 'active' },
    { id: 'P011', name: 'Thịt bò (1kg)', code: '8934563011', category: 'thit-ca', price: 250000, costPrice: 200000, stock: 15, unit: 'Kg', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=200&q=80', status: 'active' },
    { id: 'P012', name: 'Rau muống', code: '8934563012', category: 'rau-cu', price: 15000, costPrice: 8000, stock: 2, unit: 'Bó', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&q=80', status: 'active' },
    { id: 'P013', name: 'Coca Cola 1.5L', code: '8934563013', category: 'do-uong', price: 20000, costPrice: 15000, stock: 100, unit: 'Chai', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80', status: 'active' },
    { id: 'P014', name: 'Đường tinh luyện Biên Hòa 1kg', code: '8934563014', category: 'gia-vi', price: 22000, costPrice: 18000, stock: 80, unit: 'Gói', image: 'https://images.unsplash.com/photo-1624460113854-5264b971a2fc?w=200&q=80', status: 'active' },
    { id: 'P015', name: 'Sữa chua Vinamilk (Lốc 4 hộp)', code: '8934563015', category: 'sua', price: 24000, costPrice: 19000, stock: 60, unit: 'Lốc', image: 'https://images.unsplash.com/photo-1574722772633-e401c33eb317?w=200&q=80', status: 'active' },
    { id: 'P016', name: 'Nước suối Aquafina 500ml', code: '8934563016', category: 'do-uong', price: 5000, costPrice: 3500, stock: 200, unit: 'Chai', image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=200&q=80', status: 'active' },
    { id: 'P017', name: 'Giấy vệ sinh Watersilk (Lốc 10 cuộn)', code: '8934563017', category: 'do-dung', price: 60000, costPrice: 50000, stock: 40, unit: 'Lốc', image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=200&q=80', status: 'active' },
    { id: 'P018', name: 'Bánh mì sandwich', code: '8934563018', category: 'thuc-pham', price: 20000, costPrice: 15000, stock: 10, unit: 'Gói', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80', status: 'active' },
    { id: 'P019', name: 'Kem đánh răng P/S 230g', code: '8934563019', category: 'do-dung', price: 35000, costPrice: 28000, stock: 50, unit: 'Tuýp', image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=200&q=80', status: 'active' },
    { id: 'P020', name: 'Dầu gội Clear 630g', code: '8934563020', category: 'do-dung', price: 150000, costPrice: 130000, stock: 25, unit: 'Chai', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80', status: 'active' },
    { id: 'P021', name: 'Kẹo dẻo Chupa Chups', code: '8934563021', category: 'banh-keo', price: 15000, costPrice: 10000, stock: 100, unit: 'Gói', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=200&q=80', status: 'active' },
    { id: 'P022', name: 'Cà phê G7 3in1 (Hộp 21 gói)', code: '8934563022', category: 'do-uong', price: 55000, costPrice: 45000, stock: 45, unit: 'Hộp', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=200&q=80', status: 'active' },
    { id: 'P023', name: 'Nước tương Chinsu 250ml', code: '8934563023', category: 'gia-vi', price: 15000, costPrice: 11000, stock: 70, unit: 'Chai', image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?w=200&q=80', status: 'active' },
    { id: 'P024', name: 'Cà rốt', code: '8934563024', category: 'rau-cu', price: 25000, costPrice: 18000, stock: 3, unit: 'Kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&q=80', status: 'active' },
    { id: 'P025', name: 'Táo Mỹ', code: '8934563025', category: 'rau-cu', price: 80000, costPrice: 60000, stock: 20, unit: 'Kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=200&q=80', status: 'active' },
    { id: 'P026', name: 'Chuối', code: '8934563026', category: 'rau-cu', price: 20000, costPrice: 12000, stock: 15, unit: 'Nải', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=80', status: 'active' },
    { id: 'P027', name: 'Bánh Oreo', code: '8934563027', category: 'banh-keo', price: 18000, costPrice: 14000, stock: 60, unit: 'Cây', image: 'https://images.unsplash.com/photo-1558961363-a0c6589710db?w=200&q=80', status: 'active' },
    { id: 'P028', name: 'Xúc xích Vissan', code: '8934563028', category: 'thuc-pham', price: 25000, costPrice: 20000, stock: 50, unit: 'Gói', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&q=80', status: 'active' },
    { id: 'P029', name: 'Phô mai Bò cười', code: '8934563029', category: 'sua', price: 40000, costPrice: 32000, stock: 40, unit: 'Hộp', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&q=80', status: 'active' },
    { id: 'P030', name: 'Mì Ý', code: '8934563030', category: 'thuc-pham', price: 35000, costPrice: 28000, stock: 0, unit: 'Gói', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&q=80', status: 'active' },
    { id: 'P031', name: 'Cá hộp 3 Cô Gái', code: '8934563031', category: 'thuc-pham', price: 20000, costPrice: 16000, stock: 35, unit: 'Hộp', image: 'https://images.unsplash.com/photo-1611756536067-128cb52b610c?w=200&q=80', status: 'active' }
  ];

  const sampleUsers = [
    { id: 'U001', username: 'admin', password: 'admin123', fullName: 'Nguyễn Văn An', role: 'admin' },
    { id: 'U002', username: 'nhanvien', password: 'nv123', fullName: 'Trần Thị Bình', role: 'employee' }
  ];

  let sampleInvoices = [];
  
  function get(key) { try { return JSON.parse(localStorage.getItem(key)) || null; } catch(e) { return null; } }
  function set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function generateId() { return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

  const sampleCustomers = [
    { id: 'C001', name: 'Nguyễn Thị Hoa', phone: '0901234567', email: 'hoa.nguyen@gmail.com', address: '12 Lê Lợi, Q.1, TP.HCM', tier: 'vip', points: 15200, totalSpent: 12500000, orderCount: 45, birthday: '1990-03-15', notes: 'Khách quen, thích mua đồ organic', createdAt: '2025-01-10T08:00:00Z', updatedAt: '2026-05-20T10:00:00Z' },
    { id: 'C002', name: 'Trần Văn Minh', phone: '0912345678', email: 'minh.tran@yahoo.com', address: '45 Nguyễn Huệ, Q.1, TP.HCM', tier: 'gold', points: 8500, totalSpent: 8200000, orderCount: 32, birthday: '1985-07-22', notes: '', createdAt: '2025-02-14T09:00:00Z', updatedAt: '2026-05-18T11:00:00Z' },
    { id: 'C003', name: 'Lê Thị Mai', phone: '0923456789', email: 'mai.le@gmail.com', address: '78 Trần Hưng Đạo, Q.5, TP.HCM', tier: 'gold', points: 7200, totalSpent: 6800000, orderCount: 28, birthday: '1992-11-05', notes: 'Hay mua sữa cho con', createdAt: '2025-03-01T10:00:00Z', updatedAt: '2026-05-15T14:00:00Z' },
    { id: 'C004', name: 'Phạm Đức Anh', phone: '0934567890', email: 'anh.pham@outlook.com', address: '23 Lý Tự Trọng, Q.3, TP.HCM', tier: 'silver', points: 4300, totalSpent: 3900000, orderCount: 18, birthday: '1988-09-12', notes: '', createdAt: '2025-04-20T11:00:00Z', updatedAt: '2026-05-10T09:00:00Z' },
    { id: 'C005', name: 'Hoàng Thị Lan', phone: '0945678901', email: '', address: '56 Hai Bà Trưng, Q.3, TP.HCM', tier: 'silver', points: 3100, totalSpent: 2800000, orderCount: 14, birthday: '1995-01-28', notes: 'Thích khuyến mãi', createdAt: '2025-05-10T08:30:00Z', updatedAt: '2026-04-25T16:00:00Z' },
    { id: 'C006', name: 'Vũ Văn Hùng', phone: '0956789012', email: 'hung.vu@gmail.com', address: '90 Điện Biên Phủ, Bình Thạnh, TP.HCM', tier: 'member', points: 1500, totalSpent: 1200000, orderCount: 8, birthday: '1993-06-18', notes: '', createdAt: '2025-06-01T07:00:00Z', updatedAt: '2026-04-20T10:00:00Z' },
    { id: 'C007', name: 'Đỗ Thị Thanh', phone: '0967890123', email: 'thanh.do@gmail.com', address: '34 Cách Mạng Tháng 8, Q.10, TP.HCM', tier: 'vip', points: 18900, totalSpent: 15600000, orderCount: 52, birthday: '1987-12-03', notes: 'Khách VIP, mua hàng mỗi tuần', createdAt: '2024-12-01T09:00:00Z', updatedAt: '2026-05-25T08:00:00Z' },
    { id: 'C008', name: 'Bùi Quốc Tuấn', phone: '0978901234', email: '', address: '67 Võ Văn Tần, Q.3, TP.HCM', tier: 'member', points: 800, totalSpent: 650000, orderCount: 5, birthday: '', notes: '', createdAt: '2026-01-15T14:00:00Z', updatedAt: '2026-05-05T11:00:00Z' },
    { id: 'C009', name: 'Ngô Minh Tâm', phone: '0989012345', email: 'tam.ngo@gmail.com', address: '12 Phan Xích Long, Phú Nhuận, TP.HCM', tier: 'silver', points: 5600, totalSpent: 4500000, orderCount: 22, birthday: '1991-04-10', notes: '', createdAt: '2025-07-20T10:00:00Z', updatedAt: '2026-05-22T09:00:00Z' },
    { id: 'C010', name: 'Phan Thị Yến', phone: '0990123456', email: 'yen.phan@yahoo.com', address: '89 Nguyễn Văn Cừ, Q.5, TP.HCM', tier: 'gold', points: 9800, totalSpent: 9100000, orderCount: 38, birthday: '1989-08-25', notes: 'Hay mua rau củ tươi', createdAt: '2025-01-25T08:00:00Z', updatedAt: '2026-05-24T15:00:00Z' },
    { id: 'C011', name: 'Lý Văn Phong', phone: '0911223344', email: '', address: '45 Hoàng Sa, Q.1, TP.HCM', tier: 'member', points: 200, totalSpent: 180000, orderCount: 2, birthday: '1998-02-14', notes: 'Khách mới', createdAt: '2026-05-01T16:00:00Z', updatedAt: '2026-05-20T17:00:00Z' },
    { id: 'C012', name: 'Mai Thị Kim', phone: '0922334455', email: 'kim.mai@gmail.com', address: '78 Pasteur, Q.3, TP.HCM', tier: 'member', points: 1100, totalSpent: 950000, orderCount: 6, birthday: '1994-10-30', notes: '', createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-05-15T12:00:00Z' }
  ];

  function initSampleData() {
    if (get(STORAGE_KEYS.INITIALIZED)) return;
    set(STORAGE_KEYS.PRODUCTS, sampleProducts);
    set(STORAGE_KEYS.USERS, sampleUsers);
    set(STORAGE_KEYS.CUSTOMERS, sampleCustomers);
    
    // No mock invoices
    sampleInvoices = [];
    set(STORAGE_KEYS.INVOICES, sampleInvoices);
    set(STORAGE_KEYS.STOCK_ENTRIES, []);
    set(STORAGE_KEYS.INITIALIZED, true);
  }

  return {
    STORAGE_KEYS,
    categories,
    generateId,
    initSampleData,
    getProducts: () => get(STORAGE_KEYS.PRODUCTS) || [],
    setProducts: (arr) => set(STORAGE_KEYS.PRODUCTS, arr),
    getInvoices: () => get(STORAGE_KEYS.INVOICES) || [],
    setInvoices: (arr) => set(STORAGE_KEYS.INVOICES, arr),
    addInvoice: (inv) => { const all = get(STORAGE_KEYS.INVOICES) || []; all.unshift(inv); set(STORAGE_KEYS.INVOICES, all); },
    getUsers: () => get(STORAGE_KEYS.USERS) || [],
    getStockEntries: () => get(STORAGE_KEYS.STOCK_ENTRIES) || [],
    addStockEntry: (entry) => { const all = get(STORAGE_KEYS.STOCK_ENTRIES) || []; all.unshift(entry); set(STORAGE_KEYS.STOCK_ENTRIES, all); },
    getCurrentUser: () => get(STORAGE_KEYS.CURRENT_USER),
    setCurrentUser: (user) => set(STORAGE_KEYS.CURRENT_USER, user),
    clearCurrentUser: () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER),
    getCustomers: () => get(STORAGE_KEYS.CUSTOMERS) || [],
    setCustomers: (arr) => set(STORAGE_KEYS.CUSTOMERS, arr),
    getCategories: () => categories
  };
})();
