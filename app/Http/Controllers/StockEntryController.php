<?php

namespace App\Http\Controllers;

use App\Models\StockEntry;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockEntryController extends Controller
{
    public function index()
    {
        $entries = StockEntry::with(['product', 'user'])->orderBy('created_at', 'desc')->get();
        
        $formatted = $entries->map(function ($entry) {
            return [
                'id' => $entry->id,
                'productId' => $entry->product_id,
                'productName' => $entry->product ? $entry->product->name : 'Sản phẩm',
                'type' => $entry->type,
                'quantity' => $entry->quantity,
                'note' => $entry->note,
                'createdBy' => $entry->user ? $entry->user->name : 'Hệ thống',
                'createdAt' => $entry->created_at->toIso8601String()
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:import,export',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $product = Product::lockForUpdate()->find($validated['product_id']);
            
            if ($validated['type'] === 'export' && $product->stock_qty < $validated['quantity']) {
                throw new \Exception("Số lượng xuất vượt quá tồn kho hiện tại ({$product->stock_qty})");
            }

            // Update product stock
            if ($validated['type'] === 'import') {
                $product->stock_qty += $validated['quantity'];
            } else {
                $product->stock_qty -= $validated['quantity'];
            }
            $product->save();

            // Add stock entry
            $entry = StockEntry::create([
                'product_id' => $validated['product_id'],
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'note' => $validated['note'] ?? null,
                'created_by' => $request->user()->id
            ]);

            DB::commit();

            $entry->load(['product', 'user']);
            $formatted = [
                'id' => $entry->id,
                'productId' => $entry->product_id,
                'productName' => $entry->product ? $entry->product->name : 'Sản phẩm',
                'type' => $entry->type,
                'quantity' => $entry->quantity,
                'note' => $entry->note,
                'createdBy' => $entry->user ? $entry->user->name : 'Hệ thống',
                'createdAt' => $entry->created_at->toIso8601String()
            ];

            return response()->json([
                'success' => true,
                'data' => $formatted,
                'message' => ($validated['type'] === 'import' ? 'Nhập hàng' : 'Xuất hàng') . ' thành công'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
