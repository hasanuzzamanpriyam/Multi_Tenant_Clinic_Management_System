<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use App\Services\SystemActivityService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;

class SuperAdminActivityController extends Controller
{
    /**
     * Display the system-wide activity log for Super Admin.
     */
    public function index(Request $request, SystemActivityService $activityService)
    {
        $category = $request->input('category');
        $search = $request->input('search');

        // Fetch aggregated activities
        $allActivities = $activityService->getActivities(150, $category, $search);

        // Manually paginate the collection for smooth UI pagination
        $perPage = 15;
        $page = (int) $request->input('page', 1);
        $total = $allActivities->count();

        $paginatedItems = $allActivities->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $paginatedItems,
            $total,
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('SuperAdmin/Activity/Index', [
            'activities' => $paginator,
            'filters' => [
                'category' => $category ?? '',
                'search' => $search ?? '',
            ],
            'clinics' => Clinic::select(['id', 'name'])->get(),
            'totalCount' => $total,
        ]);
    }
}

