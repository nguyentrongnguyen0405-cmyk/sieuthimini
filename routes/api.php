<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;

use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\StockEntryController;

// Public API cho Khách hàng (Storefront)
Route::get('/public/categories', [CategoryController::class, 'index']);
Route::get('/public/products', [ProductController::class, 'index']);
Route::post('/public/orders', [OrderController::class, 'storePublic']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);

    // API CRUD cho Danh mục
    Route::apiResource('categories', CategoryController::class);
    
    // API CRUD cho Sản phẩm
    Route::apiResource('products', ProductController::class);

    // API CRUD cho Hóa đơn
    Route::apiResource('orders', OrderController::class);

    // API CRUD cho Khách hàng
    Route::apiResource('customers', CustomerController::class);

    // API CRUD cho Tồn kho
    Route::apiResource('stock-entries', StockEntryController::class)->only(['index', 'store']);
});
