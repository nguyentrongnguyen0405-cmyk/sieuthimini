<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['user', 'details.product'])->orderBy('created_at', 'desc')->get();
        
        $formattedOrders = $orders->map(function ($order) {
            return [
                'id' => 'INV-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                'employeeId' => $order->user_id,
                'employeeName' => $order->user ? $order->user->name : 'Nhân viên',
                'customerName' => $order->customer_name,
                'subtotal' => (float)$order->subtotal,
                'discount' => (float)$order->discount_amount,
                'total' => (float)$order->total_amount,
                'paymentMethod' => $order->payment_method,
                'cashReceived' => (float)$order->cash_given,
                'change' => (float)$order->change_return,
                'createdAt' => $order->created_at->toIso8601String(),
                'items' => $order->details->map(function ($detail) {
                    return [
                        'productId' => $detail->product_id,
                        'name' => $detail->product ? $detail->product->name : 'Sản phẩm đã xóa',
                        'quantity' => $detail->quantity,
                        'price' => (float)$detail->unit_price,
                        'subtotal' => (float)($detail->quantity * $detail->unit_price)
                    ];
                })
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedOrders
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.productId' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'subtotal' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'total' => 'required|numeric',
            'paymentMethod' => 'required|string',
            'cashReceived' => 'nullable|numeric',
            'change' => 'nullable|numeric',
            'customerName' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $order = Order::create([
                'user_id' => $request->user()->id,
                'customer_name' => $validated['customerName'] ?? 'Khách lẻ',
                'subtotal' => $validated['subtotal'],
                'discount_amount' => $validated['discount'] ?? 0,
                'total_amount' => $validated['total'],
                'payment_method' => $validated['paymentMethod'],
                'cash_given' => $validated['cashReceived'] ?? $validated['total'],
                'change_return' => $validated['change'] ?? 0,
            ]);

            foreach ($validated['items'] as $item) {
                // Verify product stock
                $product = Product::lockForUpdate()->find($item['productId']);
                if (!$product) {
                    throw new \Exception("Không tìm thấy sản phẩm");
                }
                
                if ($product->stock_qty < $item['quantity']) {
                    throw new \Exception("Sản phẩm {$product->name} không đủ tồn kho (Còn {$product->stock_qty})");
                }

                // Deduct stock
                $product->stock_qty -= $item['quantity'];
                $product->save();

                // Create Order Detail
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price']
                ]);
            }

            DB::commit();

            // Load relations for response
            $order->load(['user', 'details.product']);
            
            $formattedOrder = [
                'id' => 'INV-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                'employeeId' => $order->user_id,
                'employeeName' => $order->user ? $order->user->name : 'Nhân viên',
                'customerName' => $order->customer_name,
                'subtotal' => (float)$order->subtotal,
                'discount' => (float)$order->discount_amount,
                'total' => (float)$order->total_amount,
                'paymentMethod' => $order->payment_method,
                'cashReceived' => (float)$order->cash_given,
                'change' => (float)$order->change_return,
                'createdAt' => $order->created_at->toIso8601String(),
                'items' => $order->details->map(function ($detail) {
                    return [
                        'productId' => $detail->product_id,
                        'name' => $detail->product ? $detail->product->name : 'Sản phẩm',
                        'quantity' => $detail->quantity,
                        'price' => (float)$detail->unit_price,
                        'subtotal' => (float)($detail->quantity * $detail->unit_price)
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'message' => 'Thanh toán thành công',
                'invoice' => $formattedOrder
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function storePublic(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.productId' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'subtotal' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'total' => 'required|numeric',
            'paymentMethod' => 'required|string',
            'customerName' => 'required|string',
            'shippingPhone' => 'required|string',
            'shippingAddress' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();
            
            // Tìm admin hoặc user đầu tiên để gán user_id (vì store cần id người tạo)
            $adminUser = \App\Models\User::where('role', 'admin')->first() ?? \App\Models\User::first();

            $order = Order::create([
                'user_id' => $adminUser->id,
                'customer_name' => $validated['customerName'] . ' - Đặt Online (' . $validated['shippingPhone'] . ')',
                'subtotal' => $validated['subtotal'],
                'discount_amount' => $validated['discount'] ?? 0,
                'total_amount' => $validated['total'],
                'payment_method' => $validated['paymentMethod'],
                'cash_given' => $validated['total'], // Đặt online mặc định là đưa đủ (hoặc chuyển khoản đủ)
                'change_return' => 0,
            ]);

            foreach ($validated['items'] as $item) {
                // Verify product stock
                $product = Product::lockForUpdate()->find($item['productId']);
                if (!$product || $product->stock_qty < $item['quantity']) {
                    throw new \Exception("Sản phẩm không đủ tồn kho");
                }

                // Deduct stock
                $product->stock_qty -= $item['quantity'];
                $product->save();

                // Create Order Detail
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price']
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đặt hàng thành công',
                'order_id' => 'INV-' . str_pad($order->id, 4, '0', STR_PAD_LEFT)
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
