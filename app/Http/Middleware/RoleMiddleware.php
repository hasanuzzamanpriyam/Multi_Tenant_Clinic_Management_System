<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     * @param  string|array  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], SymfonyResponse::HTTP_UNAUTHORIZED);
        }

        // Normalize roles to array
        $allowedRoles = is_array($roles[0]) ? $roles[0] : $roles;

        // Check if user has one of the allowed roles
        if (! in_array($user->role, $allowedRoles, true)) {
            return response()->json(['message' => 'Forbidden.'], SymfonyResponse::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}