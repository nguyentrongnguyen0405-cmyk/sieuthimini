<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$products = App\Models\Product::all();
$file = base_path('database/seeders/SampleDataSeeder.php');
$content = file_get_contents($file);
foreach($products as $p) {
    $content = preg_replace('#(\'name\'\s*=>\s*\''.preg_quote($p->name, '#').'\'.*?\'image_url\'\s*=>\s*\').*?(\')#s', '${1}'.$p->image_url.'$2', $content);
}
file_put_contents($file, $content);
echo "Seeder updated.";
