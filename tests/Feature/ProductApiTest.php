<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test API Public lấy danh sách sản phẩm.
     */
    public function test_can_fetch_public_products()
    {
        // 1. Arrange (Chuẩn bị dữ liệu)
        $category = Category::create([
            'name' => 'Nước giải khát',
            'description' => 'Đồ uống có ga',
            'icon' => '🥤'
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Coca Cola',
            'price' => 10000,
            'stock_qty' => 50,
            'status' => 'active',
            'barcode' => '8935049500543'
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Pepsi (Hết hàng)',
            'price' => 10000,
            'stock_qty' => 0,
            'status' => 'active',
            'barcode' => '8935049500111'
        ]);

        // 2. Act (Hành động: Gửi request lên API Public)
        $response = $this->getJson('/api/public/products');

        // 3. Assert (Khẳng định kết quả)
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true
                 ])
                 ->assertJsonFragment([
                     'name' => 'Coca Cola',
                     'price' => "10000.00"
                 ]);
    }
}
