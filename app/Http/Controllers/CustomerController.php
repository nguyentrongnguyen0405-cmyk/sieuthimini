<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:customers',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'tier' => 'nullable|in:member,silver,gold,vip',
            'points' => 'nullable|integer',
            'birthday' => 'nullable|date',
            'notes' => 'nullable|string'
        ]);

        $customer = Customer::create($validated);

        return response()->json([
            'success' => true,
            'data' => $customer,
            'message' => 'Thêm khách hàng thành công'
        ], 201);
    }

    public function show($id)
    {
        $customer = Customer::find($id);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng'], 404);
        }
        return response()->json(['success' => true, 'data' => $customer]);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::find($id);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:customers,phone,' . $id,
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'tier' => 'nullable|in:member,silver,gold,vip',
            'points' => 'nullable|integer',
            'birthday' => 'nullable|date',
            'notes' => 'nullable|string'
        ]);

        $customer->update($validated);

        return response()->json([
            'success' => true,
            'data' => $customer,
            'message' => 'Cập nhật khách hàng thành công'
        ]);
    }

    public function destroy($id)
    {
        $customer = Customer::find($id);
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng'], 404);
        }
        $customer->delete();
        return response()->json([
            'success' => true,
            'message' => 'Xóa khách hàng thành công'
        ]);
    }
}
