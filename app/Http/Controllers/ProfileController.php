<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Show the user's profile page.
     */
    public function edit(Request $request)
    {
        $user = $request->user()->load('tenant');

        return Inertia::render('Profile/Edit', [
            'user' => $user,
            'canManageTwoFactor' => config('fortify.features')['two_factor_authentication'] ?? false,
        ]);
    }
}