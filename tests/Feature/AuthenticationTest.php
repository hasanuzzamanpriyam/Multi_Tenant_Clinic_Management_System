<?php

namespace Tests\Feature;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_visiting_login_is_redirected_to_dashboard(): void
    {
        $clinic = Clinic::factory()->create();
        $user = User::factory()->create([
            'role' => 'patient',
            'tenant_id' => $clinic->id,
        ]);

        $response = $this->actingAs($user)->get('/login');

        $response->assertRedirect('/dashboard');
    }

    public function test_users_cannot_authenticate_with_invalid_password(): void
    {
        $clinic = Clinic::factory()->create();
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
            'tenant_id' => $clinic->id,
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }
}