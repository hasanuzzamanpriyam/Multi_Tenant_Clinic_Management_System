<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperAdminUserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index(Request $request)
    {
        $users = User::with('clinic')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"))
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->latest()
            ->paginate(15);

        return Inertia::render('super-admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Request $request)
    {
        $clinics = \App\Models\Clinic::all(['id', 'name']);

        return Inertia::render('super-admin/users/create', [
            'clinics' => $clinics,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:super_admin,clinic_admin,doctor,patient',
            'tenant_id' => 'nullable|exists:clinics,id',
            'phone' => 'nullable|string|max:20',
            'specialty' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:0|max:120',
            'gender' => 'nullable|string|max:20',
        ]);

        User::create($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, User $user)
    {
        $user->load('clinic');

        return Inertia::render('super-admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request, User $user)
    {
        $clinics = \App\Models\Clinic::all(['id', 'name']);

        return Inertia::render('super-admin/users/edit', [
            'user' => $user,
            'clinics' => $clinics,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:super_admin,clinic_admin,doctor,patient',
            'tenant_id' => 'nullable|exists:clinics,id',
            'phone' => 'nullable|string|max:20',
            'specialty' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:0|max:120',
            'gender' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = $request->validate(['password' => 'required|string|min:8|confirmed'])['password'];
        }

        $user->update($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}