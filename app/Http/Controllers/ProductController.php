<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with('category')->get();
        return response()->json(['success' => true, 'data' => $products]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'barcode' => 'required|string|unique:products,barcode',
            'import_price' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'stock_qty' => 'nullable|integer|min:0',
            'unit' => 'nullable|string',
            'image_url' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        $product = Product::create($validated);
        $product->load('category');

        return response()->json(['success' => true, 'message' => 'Thêm sản phẩm thành công', 'data' => $product]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load('category');
        return response()->json(['success' => true, 'data' => $product]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'barcode' => 'required|string|unique:products,barcode,' . $product->id,
            'import_price' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'stock_qty' => 'nullable|integer|min:0',
            'unit' => 'nullable|string',
            'image_url' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        $product->update($validated);
        $product->load('category');

        return response()->json(['success' => true, 'message' => 'Cập nhật sản phẩm thành công', 'data' => $product]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Thay vì xóa cứng, ta chuyển trạng thái thành inactive
        $product->update(['status' => 'inactive']);
        return response()->json(['success' => true, 'message' => 'Đã ngừng bán sản phẩm']);
    }
}
