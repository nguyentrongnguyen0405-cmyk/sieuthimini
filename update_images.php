<?php

use App\Models\Product;
use Illuminate\Support\Facades\Http;

$products = Product::all();

foreach ($products as $product) {
    echo "Updating: " . $product->name . "\n";
    $query = urlencode($product->name);
    
    try {
        // Mock a user agent to avoid basic blocks
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ])->timeout(10)->get("https://tiki.vn/api/v2/products?q={$query}");
        
        $data = $response->json();
        
        if (isset($data['data']) && count($data['data']) > 0) {
            $imageUrl = $data['data'][0]['thumbnail_url'];
            $imageUrl = str_replace('280x280', '750x750', $imageUrl);
            $product->image_url = $imageUrl;
            $product->save();
            echo " -> OK: " . $imageUrl . "\n";
        } else {
            echo " -> Not found on Tiki\n";
        }
    } catch (\Exception $e) {
        echo " -> Error: " . $e->getMessage() . "\n";
    }
    
    // sleep 0.5s
    usleep(500000);
}

echo "Finished updating images.\n";
