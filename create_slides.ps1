$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = 1
Start-Sleep -Seconds 2

$pres = $ppt.Presentations.Add(1)
Start-Sleep -Seconds 1

function New-Slide($idx, $layout, $title, $body) {
    $s = $pres.Slides.Add($idx, $layout)
    Start-Sleep -Milliseconds 500
    $s.Shapes.Item(1).TextFrame.TextRange.Text = $title
    $s.Shapes.Item(1).TextFrame.TextRange.Font.Size = 28
    $s.Shapes.Item(1).TextFrame.TextRange.Font.Bold = 1
    if ($body -ne $null) {
        $s.Shapes.Item(2).TextFrame.TextRange.Text = $body
        $s.Shapes.Item(2).TextFrame.TextRange.Font.Size = 14
    }
    Start-Sleep -Milliseconds 300
}

# SLIDE 1
$s1 = $pres.Slides.Add(1, 1)
Start-Sleep -Milliseconds 500
$s1.Shapes.Item(1).TextFrame.TextRange.Text = "Bao Cao Bai Tap Lon`nCong Nghe Phan Mem"
$s1.Shapes.Item(1).TextFrame.TextRange.Font.Size = 32
$s1.Shapes.Item(1).TextFrame.TextRange.Font.Bold = 1
$s1.Shapes.Item(2).TextFrame.TextRange.Text = "He thong POS & Cua hang Truc tuyen MiniMart POS`n`nLop: 23DTHC5 - 23DTHC4`nNhom: [Ten nhom]`n`n- [Ho ten 1] - Truong nhom`n- [Ho ten 2] - Thanh vien`n- [Ho ten 3] - Thanh vien"
$s1.Shapes.Item(2).TextFrame.TextRange.Font.Size = 16
Start-Sleep -Milliseconds 300

# SLIDE 2
New-Slide 2 2 "Thuc Trang & Noi Dau Nganh Ban Le" "Thanh toan un tac: Quay thu ngan thu cong de sai sot khi dong khach.`n`nTon kho mat kiem soat: Khong nam bat duoc so luong hang thuc te theo thoi gian thuc.`n`nRao can thanh toan QR: Khach phai tu nhap so tien, so tai khoan, de sai so.`n`nThieu cham soc thanh vien: Khong tu dong hoa tich diem va chiet khau VIP/Gold/Silver."

# SLIDE 3
New-Slide 3 2 "MiniMart POS - Giai Phap Chuyen Doi So" "Storefront cho Khach hang: Dat mua truc tuyen, VietQR dong tu dong dien tien.`n`nCashier POS: Ban hang tai quay sieu toc, tinh tien thoi lai tu dong.`n`nQuan ly Kho: Them moi/chinh sua san pham truc quan, cap nhat ton kho tuc thi.`n`nDashboard: Bieu do hoa hoat dong kinh doanh truc quan."

# SLIDE 4
New-Slide 4 2 "Phan Tich He Thong - Bieu Do Use Case" "Khach hang: Xem san pham, quan ly gio hang, dat hang & thanh toan QR.`n`nThu ngan: Dang nhap, lap hoa don tai quay, tinh tien, in bien lai.`n`nQuan ly: Bieu do doanh thu, quan ly san pham, dieu phoi kho.`n`n[Chen hinh ve Use Case Diagram vao day]"

# SLIDE 5
New-Slide 5 2 "Nghiep Vu Dat Hang & VietQR Dong (Activity Diagram)" "B1 - Chon hang: Duyet danh muc -> Them vao gio.`n`nB2 - Ap VIP: Nhap SDT -> He thong tu hien thi chiet khau (2%-10%).`n`nB3 - Quet QR: He thong sinh ma QR dong chua chinh xac so tien can tra.`n`nB4 - Duyet don: Du lieu dong bo sang man hinh POS.`n`n[Chen hinh ve Activity Diagram vao day]"

# SLIDE 6
New-Slide 6 2 "Luong Thanh Toan - Sequence Diagram" "Tuong tac giua cac doi tuong:`n`nKhach hang <-> Giao dien Web <-> He thong <-> API VietQR`n`nWeb gui yeu cau sinh QR -> Ma hoa thong tin don hang -> VietQR tra ve hinh QR -> Khach quet -> Xac nhan thanh toan.`n`n[Chen hinh ve Sequence Diagram vao day]"

# SLIDE 7
New-Slide 7 2 "Mo Hinh Co So Du Lieu (ERD)" "Products: Ma vach, ten, danh muc, gia ban, ton kho, link anh.`n`nCustomers: Phan hang VIP/Vang/Bac, diem tich luy, tong chi tieu.`n`nInvoices: Ma INV-/ONL-, san pham mua, tong tien, phuong thuc thanh toan.`n`nStock_Entries: Bien dong kho (ai lam, so luong, ghi chu ly do).`n`n[Chen hinh ve ERD vao day]"

# SLIDE 8
New-Slide 8 2 "Quan Tri Du An Agile/Scrum" "Epic 1: eCommerce Storefront - Dat hang online, VIP, VietQR.`n`nEpic 2: Cashier POS - Ban hang tai quay, tinh tien thua, in bien lai.`n`nEpic 3: Inventory Admin - Quan ly ton kho, Visual Image Editor.`n`nQuy trinh: Phan ra User Stories va Tasks trong Sprint."

# SLIDE 9
New-Slide 9 2 "Cong Nghe & Git Workflow" "Tech Stack: HTML5, CSS3, Vanilla JS Module, localStorage.`n`nGit Workflow:`n- Fork du an -> Clone ve local`n- Tao nhanh: git checkout -b feature/ten-tinh-nang`n- Lap trinh -> Commit -> Push`n- Tao Pull Request -> Review -> Merge vao Develop`n`nMoi truong: Laragon + Apache tai minimart-pos.test:8000"

# SLIDE 10
New-Slide 10 2 "Demo Giao Dien Khach Hang (Storefront)" "[Chen hinh Cua hang Storefront online]`n`nGiao dien Glassmorphism Dark mode sang trong.`nTich hop gio hang va sinh ma QR dong.`n`n[Chen hinh Gio hang & Thanh toan QR]"

# SLIDE 11
New-Slide 11 2 "Demo Giao Dien Quan Tri (POS & Dashboard)" "[Chen hinh Dashboard, Bieu do doanh thu]`n`nMan hinh thu ngan sieu toc, tinh tien thua tu dong.`nBieu do thong ke chuyen nghiep cho chu cua hang.`n`n[Chen hinh Form san pham voi Preview anh]"

# SLIDE 12
New-Slide 12 2 "Tong Ket & Dinh Huong Phat Trien" "Ket qua dat duoc:`n- Hoan thanh 100% yeu cau chuc nang.`n- Giao dien tham my cao (Dark mode glassmorphism).`n- Tuan thu Git, Agile/Scrum nghiem ngat.`n`nDinh huong tuong lai:`n- Tich hop Backend (Laravel/NodeJS).`n- Lien ket cong thanh toan that.`n`nCAM ON THAY VA CAC BAN DA LANG NGHE!`nQ&A - Moi dat cau hoi."

# Save
$savePath = "C:\laragon\www\minimart-pos\MiniMart_POS_Slide.pptx"
Start-Sleep -Seconds 1
$pres.SaveAs($savePath)
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "=========================================="
Write-Host "DA TAO XONG FILE POWERPOINT 12 SLIDE!"
Write-Host "Luu tai: $savePath"
Write-Host "=========================================="
Write-Host "PowerPoint dang mo - ban co the chinh sua!"
