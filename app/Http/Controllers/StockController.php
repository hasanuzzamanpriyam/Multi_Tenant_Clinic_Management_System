<?php

namespace App\Http\Controllers;

use App\Models\StockItem;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = StockItem::with(['medicine']);

        if ($user->role === 'super_admin') {
            // all
        } else {
            $query->where('tenant_id', $user->tenant_id);
        }

        $stock = $query->paginate(15);

        return inertia('Stock/Index', [
            'stock' => $stock,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:0',
            'reorder_level' => 'sometimes|integer|min:0',
            'unit_price' => 'sometimes|numeric|min:0',
            'expiry_date' => 'sometimes|date',
            'batch_number' => 'sometimes|string|max:100',
            'supplier' => 'sometimes|string|max:255',
        ]);

        StockItem::create([
            'medicine_id' => $request->medicine_id,
            'tenant_id' => $request->user()->tenant_id,
            'quantity' => $request->quantity,
            'reorder_level' => $request->reorder_level ?? 10,
            'unit_price' => $request->unit_price,
            'expiry_date' => $request->expiry_date,
            'batch_number' => $request->batch_number,
            'supplier' => $request->supplier,
        ]);

        return back()->with('success', 'Stock item added.');
    }

    public function update(Request $request, StockItem $stock)
    {
        if ($request->user()->role !== 'super_admin' && $stock->tenant_id !== $request->user()->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'quantity' => 'sometimes|integer|min:0',
            'reorder_level' => 'sometimes|integer|min:0',
            'unit_price' => 'sometimes|numeric|min:0',
        ]);

        $stock->update($request->only(['quantity', 'reorder_level', 'unit_price']));

        return back()->with('success', 'Stock updated.');
    }
}
