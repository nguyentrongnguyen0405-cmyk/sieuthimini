<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // --- Categories ---
        $categoriesData = [
            ['name' => 'Thực phẩm', 'icon' => '🍚'],
            ['name' => 'Đồ uống', 'icon' => '🥤'],
            ['name' => 'Gia vị', 'icon' => '🧂'],
            ['name' => 'Bánh kẹo', 'icon' => '🍪'],
            ['name' => 'Đồ dùng', 'icon' => '🧴'],
            ['name' => 'Sữa', 'icon' => '🥛'],
            ['name' => 'Rau củ', 'icon' => '🥬'],
            ['name' => 'Thịt & Cá', 'icon' => '🥩']
        ];

        $catMap = [];
        foreach ($categoriesData as $c) {
            $cat = Category::updateOrCreate(['name' => $c['name']], ['icon' => $c['icon']]);
            $catMap[$c['name']] = $cat->id;
        }

        // --- Products ---
        $sampleProducts = [
            ['name' => 'Gạo ST25 (5kg)', 'barcode' => '8934563001', 'cat' => 'Thực phẩm', 'price' => 125000, 'import_price' => 100000, 'stock_qty' => 45, 'unit' => 'Bao', 'image_url' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80'],
            ['name' => 'Nước mắm Nam Ngư 500ml', 'barcode' => '8934563002', 'cat' => 'Gia vị', 'price' => 32000, 'import_price' => 25000, 'stock_qty' => 80, 'unit' => 'Chai', 'image_url' => 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?w=200&q=80'],
            ['name' => 'Bia Tiger (Thùng 24 lon)', 'barcode' => '8934563003', 'cat' => 'Đồ uống', 'price' => 350000, 'import_price' => 320000, 'stock_qty' => 10, 'unit' => 'Thùng', 'image_url' => 'https://images.unsplash.com/photo-1605548230624-8d2d0419c517?w=200&q=80'],
            ['name' => 'Sữa tươi Vinamilk 1L', 'barcode' => '8934563004', 'cat' => 'Sữa', 'price' => 35000, 'import_price' => 28000, 'stock_qty' => 120, 'unit' => 'Hộp', 'image_url' => 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80'],
            ['name' => 'Mì Hảo Hảo (Thùng 30 gói)', 'barcode' => '8934563005', 'cat' => 'Thực phẩm', 'price' => 100000, 'import_price' => 85000, 'stock_qty' => 50, 'unit' => 'Thùng', 'image_url' => 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=200&q=80'],
            ['name' => 'Dầu ăn Simply 1L', 'barcode' => '8934563006', 'cat' => 'Gia vị', 'price' => 45000, 'import_price' => 38000, 'stock_qty' => 60, 'unit' => 'Chai', 'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80'],
            ['name' => 'Bột giặt OMO 3kg', 'barcode' => '8934563007', 'cat' => 'Đồ dùng', 'price' => 120000, 'import_price' => 100000, 'stock_qty' => 5, 'unit' => 'Túi', 'image_url' => 'https://images.unsplash.com/photo-1584820927498-cafe6c1c8774?w=200&q=80'],
            ['name' => 'Bánh ChocoPie 12 cái', 'barcode' => '8934563008', 'cat' => 'Bánh kẹo', 'price' => 55000, 'import_price' => 45000, 'stock_qty' => 30, 'unit' => 'Hộp', 'image_url' => 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=200&q=80'],
            ['name' => 'Nước rửa chén Sunlight 4kg', 'barcode' => '8934563009', 'cat' => 'Đồ dùng', 'price' => 95000, 'import_price' => 80000, 'stock_qty' => 0, 'unit' => 'Can', 'image_url' => 'https://images.unsplash.com/photo-1584820927498-cafe6c1c8774?w=200&q=80'],
            ['name' => 'Trứng gà (Vỉ 10 quả)', 'barcode' => '8934563010', 'cat' => 'Thực phẩm', 'price' => 30000, 'import_price' => 24000, 'stock_qty' => 40, 'unit' => 'Vỉ', 'image_url' => 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=200&q=80'],
            ['name' => 'Thịt bò (1kg)', 'barcode' => '8934563011', 'cat' => 'Thịt & Cá', 'price' => 250000, 'import_price' => 200000, 'stock_qty' => 15, 'unit' => 'Kg', 'image_url' => 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=200&q=80'],
            ['name' => 'Rau muống', 'barcode' => '8934563012', 'cat' => 'Rau củ', 'price' => 15000, 'import_price' => 8000, 'stock_qty' => 2, 'unit' => 'Bó', 'image_url' => 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&q=80'],
            ['name' => 'Coca Cola 1.5L', 'barcode' => '8934563013', 'cat' => 'Đồ uống', 'price' => 20000, 'import_price' => 15000, 'stock_qty' => 100, 'unit' => 'Chai', 'image_url' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80'],
            ['name' => 'Đường tinh luyện Biên Hòa 1kg', 'barcode' => '8934563014', 'cat' => 'Gia vị', 'price' => 22000, 'import_price' => 18000, 'stock_qty' => 80, 'unit' => 'Gói', 'image_url' => 'https://images.unsplash.com/photo-1624460113854-5264b971a2fc?w=200&q=80'],
            ['name' => 'Sữa chua Vinamilk (Lốc 4 hộp)', 'barcode' => '8934563015', 'cat' => 'Sữa', 'price' => 24000, 'import_price' => 19000, 'stock_qty' => 60, 'unit' => 'Lốc', 'image_url' => 'https://images.unsplash.com/photo-1574722772633-e401c33eb317?w=200&q=80'],
            ['name' => 'Nước suối Aquafina 500ml', 'barcode' => '8934563016', 'cat' => 'Đồ uống', 'price' => 5000, 'import_price' => 3500, 'stock_qty' => 200, 'unit' => 'Chai', 'image_url' => 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=200&q=80'],
            ['name' => 'Giấy vệ sinh Watersilk (Lốc 10 cuộn)', 'barcode' => '8934563017', 'cat' => 'Đồ dùng', 'price' => 60000, 'import_price' => 50000, 'stock_qty' => 40, 'unit' => 'Lốc', 'image_url' => 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=200&q=80'],
            ['name' => 'Bánh mì sandwich', 'barcode' => '8934563018', 'cat' => 'Thực phẩm', 'price' => 20000, 'import_price' => 15000, 'stock_qty' => 10, 'unit' => 'Gói', 'image_url' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80'],
            ['name' => 'Kem đánh răng P/S 230g', 'barcode' => '8934563019', 'cat' => 'Đồ dùng', 'price' => 35000, 'import_price' => 28000, 'stock_qty' => 50, 'unit' => 'Tuýp', 'image_url' => 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=200&q=80'],
            ['name' => 'Dầu gội Clear 630g', 'barcode' => '8934563020', 'cat' => 'Đồ dùng', 'price' => 150000, 'import_price' => 130000, 'stock_qty' => 25, 'unit' => 'Chai', 'image_url' => 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80'],
            ['name' => 'Kẹo dẻo Chupa Chups', 'barcode' => '8934563021', 'cat' => 'Bánh kẹo', 'price' => 15000, 'import_price' => 10000, 'stock_qty' => 100, 'unit' => 'Gói', 'image_url' => 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=200&q=80'],
            ['name' => 'Cà phê G7 3in1 (Hộp 21 gói)', 'barcode' => '8934563022', 'cat' => 'Đồ uống', 'price' => 55000, 'import_price' => 45000, 'stock_qty' => 45, 'unit' => 'Hộp', 'image_url' => 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=200&q=80'],
            ['name' => 'Nước tương Chinsu 250ml', 'barcode' => '8934563023', 'cat' => 'Gia vị', 'price' => 15000, 'import_price' => 11000, 'stock_qty' => 70, 'unit' => 'Chai', 'image_url' => 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?w=200&q=80'],
            ['name' => 'Cà rốt', 'barcode' => '8934563024', 'cat' => 'Rau củ', 'price' => 25000, 'import_price' => 18000, 'stock_qty' => 3, 'unit' => 'Kg', 'image_url' => 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&q=80'],
            ['name' => 'Táo Mỹ', 'barcode' => '8934563025', 'cat' => 'Rau củ', 'price' => 80000, 'import_price' => 60000, 'stock_qty' => 20, 'unit' => 'Kg', 'image_url' => 'https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=200&q=80'],
            ['name' => 'Chuối', 'barcode' => '8934563026', 'cat' => 'Rau củ', 'price' => 20000, 'import_price' => 12000, 'stock_qty' => 15, 'unit' => 'Nải', 'image_url' => 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=80'],
            ['name' => 'Bánh Oreo', 'barcode' => '8934563027', 'cat' => 'Bánh kẹo', 'price' => 18000, 'import_price' => 14000, 'stock_qty' => 60, 'unit' => 'Cây', 'image_url' => 'https://images.unsplash.com/photo-1558961363-a0c6589710db?w=200&q=80'],
            ['name' => 'Xúc xích Vissan', 'barcode' => '8934563028', 'cat' => 'Thực phẩm', 'price' => 25000, 'import_price' => 20000, 'stock_qty' => 50, 'unit' => 'Gói', 'image_url' => 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&q=80'],
            ['name' => 'Phô mai Bò cười', 'barcode' => '8934563029', 'cat' => 'Sữa', 'price' => 40000, 'import_price' => 32000, 'stock_qty' => 40, 'unit' => 'Hộp', 'image_url' => 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&q=80'],
            ['name' => 'Cá hộp 3 Cô Gái', 'barcode' => '8934563031', 'cat' => 'Thực phẩm', 'price' => 20000, 'import_price' => 16000, 'stock_qty' => 35, 'unit' => 'Hộp', 'image_url' => 'https://images.unsplash.com/photo-1611756536067-128cb52b610c?w=200&q=80'],
        ];

        foreach ($sampleProducts as $p) {
            Product::updateOrCreate(
                ['barcode' => $p['barcode']],
                [
                    'name' => $p['name'],
                    'category_id' => $catMap[$p['cat']] ?? 1,
                    'import_price' => $p['import_price'],
                    'price' => $p['price'],
                    'stock_qty' => $p['stock_qty'],
                    'unit' => $p['unit'],
                    'image_url' => $p['image_url'],
                    'status' => 'active'
                ]
            );
        }

        // --- Customers ---
        $sampleCustomers = [
            ['name' => 'Nguyễn Thị Hoa', 'phone' => '0901234567', 'email' => 'hoa.nguyen@gmail.com', 'address' => '12 Lê Lợi, Q.1, TP.HCM', 'tier' => 'vip', 'points' => 15200],
            ['name' => 'Trần Văn Minh', 'phone' => '0912345678', 'email' => 'minh.tran@yahoo.com', 'address' => '45 Nguyễn Huệ, Q.1, TP.HCM', 'tier' => 'gold', 'points' => 8500],
            ['name' => 'Lê Thị Mai', 'phone' => '0923456789', 'email' => 'mai.le@gmail.com', 'address' => '78 Trần Hưng Đạo, Q.5, TP.HCM', 'tier' => 'gold', 'points' => 7200],
            ['name' => 'Phạm Đức Anh', 'phone' => '0934567890', 'email' => 'anh.pham@outlook.com', 'address' => '23 Lý Tự Trọng, Q.3, TP.HCM', 'tier' => 'silver', 'points' => 4300],
            ['name' => 'Hoàng Thị Lan', 'phone' => '0945678901', 'email' => '', 'address' => '56 Hai Bà Trưng, Q.3, TP.HCM', 'tier' => 'silver', 'points' => 3100],
        ];

        foreach ($sampleCustomers as $c) {
            Customer::firstOrCreate(
                ['phone' => $c['phone']],
                [
                    'name' => $c['name'],
                    'email' => $c['email'] ?: null,
                    'address' => $c['address'],
                    'tier' => $c['tier'],
                    'points' => $c['points']
                ]
            );
        }

        $this->command->info('✅ Đã chèn dữ liệu mẫu thành công!');
    }
}
