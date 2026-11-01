<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'generic_name',
        'description',
        'category',
        'manufacturer',
        'dosage_form',
        'strength',
        'is_prescription_only',
    ];

    protected $casts = [
        'is_prescription_only' => 'boolean',
    ];

    public function stockItems()
    {
        return $this->hasMany(StockItem::class);
    }
}
