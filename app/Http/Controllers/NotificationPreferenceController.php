<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    public function edit(Request $request)
    {
        $preference = $request->user()->notificationPreference;

        return inertia('NotificationPreferences/Edit', [
            'preference' => $preference,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'email_enabled' => 'sometimes|boolean',
            'sms_enabled' => 'sometimes|boolean',
            'push_enabled' => 'sometimes|boolean',
            'reminder_minutes_before' => 'sometimes|integer|min:5|max:10080',
        ]);

        $user->notificationPreference()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return back()->with('success', 'Notification preferences updated successfully.');
    }
}
