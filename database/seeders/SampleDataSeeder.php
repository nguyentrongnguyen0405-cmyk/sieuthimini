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
            ['name' => 'Gạo ST25 (5kg)', 'barcode' => '8934563001', 'cat' => 'Thực phẩm', 'price' => 125000, 'import_price' => 100000, 'stock_qty' => 45, 'unit' => 'Bao', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/c8/12/a0/8af3a08e175db1b9ba20ada30e85237a.png'],
            ['name' => 'Nước mắm Nam Ngư 500ml', 'barcode' => '8934563002', 'cat' => 'Gia vị', 'price' => 32000, 'import_price' => 25000, 'stock_qty' => 80, 'unit' => 'Chai', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/51/bc/0b/929c3b76fd2ef9cdfae88bcc256429bc.png'],
            ['name' => 'Bia Tiger (Thùng 24 lon)', 'barcode' => '8934563003', 'cat' => 'Đồ uống', 'price' => 350000, 'import_price' => 320000, 'stock_qty' => 10, 'unit' => 'Thùng', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/48/68/68/ca9c65dea29b95dc6582b40c0bbd7d32.png'],
            ['name' => 'Sữa tươi Vinamilk 1L', 'barcode' => '8934563004', 'cat' => 'Sữa', 'price' => 35000, 'import_price' => 28000, 'stock_qty' => 120, 'unit' => 'Hộp', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/06/11/ff/bb13def7804281bafd97384710d96c2d.png'],
            ['name' => 'Mì Hảo Hảo (Thùng 30 gói)', 'barcode' => '8934563005', 'cat' => 'Thực phẩm', 'price' => 100000, 'import_price' => 85000, 'stock_qty' => 50, 'unit' => 'Thùng', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/d2/a9/65/abc22b0f31e2efd78e54ef13b922ec99.png'],
            ['name' => 'Dầu ăn Simply 1L', 'barcode' => '8934563006', 'cat' => 'Gia vị', 'price' => 45000, 'import_price' => 38000, 'stock_qty' => 60, 'unit' => 'Chai', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/55/e1/f5/4c884f67ec892edbcf120f11e2b0671f.png'],
            ['name' => 'Bột giặt OMO 3kg', 'barcode' => '8934563007', 'cat' => 'Đồ dùng', 'price' => 120000, 'import_price' => 100000, 'stock_qty' => 5, 'unit' => 'Túi', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/f4/9d/d7/1b55046669b86b5b968a4dcd07c4f0d2.png'],
            ['name' => 'Bánh ChocoPie 12 cái', 'barcode' => '8934563008', 'cat' => 'Bánh kẹo', 'price' => 55000, 'import_price' => 45000, 'stock_qty' => 30, 'unit' => 'Hộp', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/e4/17/42/9c6a43da1ddabbbf1fc5698fd4a01168.jpg'],
            ['name' => 'Nước rửa chén Sunlight 4kg', 'barcode' => '8934563009', 'cat' => 'Đồ dùng', 'price' => 95000, 'import_price' => 80000, 'stock_qty' => 0, 'unit' => 'Can', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/39/2a/81/03e1c6fd6d3adecdde0a3e47f21a0044.png'],
            ['name' => 'Trứng gà (Vỉ 10 quả)', 'barcode' => '8934563010', 'cat' => 'Thực phẩm', 'price' => 30000, 'import_price' => 24000, 'stock_qty' => 40, 'unit' => 'Vỉ', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/c7/f9/aa/17bfb9baddcc2a266dd8e991ec22be0f.jpg'],
            ['name' => 'Thịt bò (1kg)', 'barcode' => '8934563011', 'cat' => 'Thịt & Cá', 'price' => 250000, 'import_price' => 200000, 'stock_qty' => 15, 'unit' => 'Kg', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/90/40/19/835976c1b607a42d2a64e5819b639099.jpg'],
            ['name' => 'Rau muống', 'barcode' => '8934563012', 'cat' => 'Rau củ', 'price' => 15000, 'import_price' => 8000, 'stock_qty' => 2, 'unit' => 'Bó', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/af/3b/40/f9d9119e738af92fea3c545900fea92f.jpg'],
            ['name' => 'Coca Cola 1.5L', 'barcode' => '8934563013', 'cat' => 'Đồ uống', 'price' => 20000, 'import_price' => 15000, 'stock_qty' => 100, 'unit' => 'Chai', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/72/33/dd/5ec26520a7fe13ebbf743057e189b09e.jpg'],
            ['name' => 'Đường tinh luyện Biên Hòa 1kg', 'barcode' => '8934563014', 'cat' => 'Gia vị', 'price' => 22000, 'import_price' => 18000, 'stock_qty' => 80, 'unit' => 'Gói', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/61/4f/c2/a428c2b668037b219f9f3fa78493a9ce.png'],
            ['name' => 'Sữa chua Vinamilk (Lốc 4 hộp)', 'barcode' => '8934563015', 'cat' => 'Sữa', 'price' => 24000, 'import_price' => 19000, 'stock_qty' => 60, 'unit' => 'Lốc', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/3e/fd/2c/f92a172793f09e0cc1d3769e9405f194.png'],
            ['name' => 'Nước suối Aquafina 500ml', 'barcode' => '8934563016', 'cat' => 'Đồ uống', 'price' => 5000, 'import_price' => 3500, 'stock_qty' => 200, 'unit' => 'Chai', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/df/fb/59/38a29b88e0f4589592b1ff9e75c9a97a.png'],
            ['name' => 'Giấy vệ sinh Watersilk (Lốc 10 cuộn)', 'barcode' => '8934563017', 'cat' => 'Đồ dùng', 'price' => 60000, 'import_price' => 50000, 'stock_qty' => 40, 'unit' => 'Lốc', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/8d/fd/a1/3ec102431afd352f5c94f42f6f940c37.png'],
            ['name' => 'Bánh mì sandwich', 'barcode' => '8934563018', 'cat' => 'Thực phẩm', 'price' => 20000, 'import_price' => 15000, 'stock_qty' => 10, 'unit' => 'Gói', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/73/1c/09/dddcde11aa5c9446af558649785d8c21.png'],
            ['name' => 'Kem đánh răng P/S 230g', 'barcode' => '8934563019', 'cat' => 'Đồ dùng', 'price' => 35000, 'import_price' => 28000, 'stock_qty' => 50, 'unit' => 'Tuýp', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/81/f4/de/c7559e9d0ec88c1fefc7927ceaa902d6.png'],
            ['name' => 'Dầu gội Clear 630g', 'barcode' => '8934563020', 'cat' => 'Đồ dùng', 'price' => 150000, 'import_price' => 130000, 'stock_qty' => 25, 'unit' => 'Chai', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/e4/98/64/416e1bee69b852404fe640ff510c54b6.png'],
            ['name' => 'Kẹo dẻo Chupa Chups', 'barcode' => '8934563021', 'cat' => 'Bánh kẹo', 'price' => 15000, 'import_price' => 10000, 'stock_qty' => 100, 'unit' => 'Gói', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/e3/9e/49/e9ccc57c24cf44520d7a35a0e9b6c1e4.jpg'],
            ['name' => 'Cà phê G7 3in1 (Hộp 21 gói)', 'barcode' => '8934563022', 'cat' => 'Đồ uống', 'price' => 55000, 'import_price' => 45000, 'stock_qty' => 45, 'unit' => 'Hộp', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/b7/22/9e/6aac9937c65fe03853928bf4816711c7.jpg'],
            ['name' => 'Nước tương Chinsu 250ml', 'barcode' => '8934563023', 'cat' => 'Gia vị', 'price' => 15000, 'import_price' => 11000, 'stock_qty' => 70, 'unit' => 'Chai', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/d7/35/be/e34daa4044a6c0d1870c538bf384ecb0.png'],
            ['name' => 'Cà rốt', 'barcode' => '8934563024', 'cat' => 'Rau củ', 'price' => 25000, 'import_price' => 18000, 'stock_qty' => 3, 'unit' => 'Kg', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/44/8b/53/34a7c883b08ddc69942efb572b294da6.jpg'],
            ['name' => 'Táo Mỹ', 'barcode' => '8934563025', 'cat' => 'Rau củ', 'price' => 80000, 'import_price' => 60000, 'stock_qty' => 20, 'unit' => 'Kg', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/97/81/01/c6d9bc094008261bea5d6c32c7178a82.png'],
            ['name' => 'Chuối', 'barcode' => '8934563026', 'cat' => 'Rau củ', 'price' => 20000, 'import_price' => 12000, 'stock_qty' => 15, 'unit' => 'Nải', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/80/8d/55/ba8d9d7af0c72391654d7adb02edd082.jpg'],
            ['name' => 'Bánh Oreo', 'barcode' => '8934563027', 'cat' => 'Bánh kẹo', 'price' => 18000, 'import_price' => 14000, 'stock_qty' => 60, 'unit' => 'Cây', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/88/b8/74/c38064d74ef6408fc1bf1cba84786fda.png'],
            ['name' => 'Xúc xích Vissan', 'barcode' => '8934563028', 'cat' => 'Thực phẩm', 'price' => 25000, 'import_price' => 20000, 'stock_qty' => 50, 'unit' => 'Gói', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/e7/1c/bd/12f0bee51936f444dcc803619265b898.jpg'],
            ['name' => 'Phô mai Bò cười', 'barcode' => '8934563029', 'cat' => 'Sữa', 'price' => 40000, 'import_price' => 32000, 'stock_qty' => 40, 'unit' => 'Hộp', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/b9/de/d7/1a41e0c84413d4a6bea2493ad635708f.png'],
            ['name' => 'Cá hộp 3 Cô Gái', 'barcode' => '8934563031', 'cat' => 'Thực phẩm', 'price' => 20000, 'import_price' => 16000, 'stock_qty' => 35, 'unit' => 'Hộp', 'image_url' => 'https://salt.tikicdn.com/cache/750x750/ts/product/bd/4c/53/fa6d2b862408b7352536303813fa5fb9.jpg'],
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
