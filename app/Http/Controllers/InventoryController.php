<?php

namespace App\Http\Controllers;

use App\Models\LowStockAlert;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function lowStockAlerts(Request $request)
    {
        $user = $request->user();

        $query = LowStockAlert::with(['stockItem.medicine']);

        if ($user->role !== 'super_admin') {
            $query->where('tenant_id', $user->tenant_id);
        }

        $alerts = $query->where('status', 'active')->paginate(15);

        return inertia('Inventory/LowStockAlerts', [
            'alerts' => $alerts,
        ]);
    }

    public function resolveAlert(Request $request, LowStockAlert $alert)
    {
        if ($request->user()->role !== 'super_admin' && $alert->tenant_id !== $request->user()->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        $alert->update(['status' => 'resolved', 'resolved_at' => now()]);

        return back()->with('success', 'Alert resolved.');
    }
}
