<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
});

Route::get('/index.html', function () {
    return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
});

Route::get('/dashboard.html', function () {
    return response(file_get_contents(public_path('dashboard.html')))->header('Content-Type', 'text/html');
});
