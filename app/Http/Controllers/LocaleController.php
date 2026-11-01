<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LocaleController extends Controller
{
    public function set(Request $request, string $locale)
    {
        $allowed = ['en', 'es', 'fr', 'ar'];

        if (! in_array($locale, $allowed, true)) {
            return back()->withErrors(['locale' => 'Invalid locale.']);
        }

        $request->session()->put('locale', $locale);

        $user = Auth::user();
        if ($user) {
            $user->update(['locale' => $locale]);
        }

        return back()->with('success', 'Language updated.');
    }
}
