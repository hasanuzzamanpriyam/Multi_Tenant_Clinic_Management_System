<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = User::where('role', 'doctor')->where('is_active', true);

        if ($user->role !== 'super_admin') {
            $query->where('tenant_id', $user->tenant_id);
        }

        $doctors = $query->with('clinic')->paginate(15);

        return response()->json($doctors);
    }
}
