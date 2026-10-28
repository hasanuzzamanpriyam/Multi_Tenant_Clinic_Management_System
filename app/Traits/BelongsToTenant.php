<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    /**
     * Prevent infinite recursion when retrieving authenticated user in global scope.
     */
    protected static bool $resolvingTenantScope = false;

    /**
     * Boot the trait.
     */
    protected static function bootBelongsToTenant(): void
    {
        // Global scope to filter by tenant_id
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (static::$resolvingTenantScope) {
                return;
            }

            static::$resolvingTenantScope = true;

            try {
                $user = Auth::user();

                // Super admin bypasses the scope completely
                if ($user && ($user->role === 'super_admin' || $user->tenant_id === null)) {
                    return;
                }

                // Apply tenant filter for non-super-admin users
                if ($user && $user->tenant_id) {
                    $builder->where($builder->getModel()->getTable().'.tenant_id', $user->tenant_id);
                }
            } finally {
                static::$resolvingTenantScope = false;
            }
        });

        // Automatically set tenant_id on model creation
        static::creating(function (Model $model) {
            $user = Auth::user();

            // Only set tenant_id if not already set and user has a tenant
            if ($user && $user->tenant_id && ! $model->tenant_id) {
                $model->tenant_id = $user->tenant_id;
            }
        });
    }

    /**
     * Scope a query to include all tenants (for super admin).
     */
    public function scopeWithoutTenantScope(Builder $builder): Builder
    {
        return $builder->withoutGlobalScope('tenant');
    }

    /**
     * Scope a query to a specific tenant.
     */
    public function scopeForTenant(Builder $builder, int $tenantId): Builder
    {
        return $builder->withoutGlobalScope('tenant')->where('tenant_id', $tenantId);
    }
}
