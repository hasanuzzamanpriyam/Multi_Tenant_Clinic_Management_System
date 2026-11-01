<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $medicines = Medicine::paginate(15);

        return inertia('Medicines/Index', [
            'medicines' => $medicines,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'sometimes|string|max:100',
            'manufacturer' => 'sometimes|string|max:255',
            'dosage_form' => 'sometimes|string|max:100',
            'strength' => 'sometimes|string|max:100',
            'is_prescription_only' => 'sometimes|boolean',
        ]);

        Medicine::create($request->only([
            'name',
            'generic_name',
            'description',
            'category',
            'manufacturer',
            'dosage_form',
            'strength',
            'is_prescription_only',
        ]));

        return back()->with('success', 'Medicine added to catalog.');
    }
}
