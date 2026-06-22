<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'barcode', 'import_price', 'price', 'stock_qty', 'unit', 'image_url', 'status'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
