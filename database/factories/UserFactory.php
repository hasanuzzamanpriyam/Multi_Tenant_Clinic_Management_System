<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'tenant_id' => Clinic::factory(),
            'role' => 'patient',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create a super admin user with no tenant.
     */
    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'super_admin',
            'tenant_id' => null,
            'is_active' => true,
        ]);
    }

    /**
     * Create a clinic admin user.
     */
    public function clinicAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'clinic_admin',
            'is_active' => true,
        ]);
    }

    /**
     * Create a doctor user.
     */
    public function doctor(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'doctor',
            'specialty' => fake()->randomElement([
                'General Practice',
                'Cardiology',
                'Dermatology',
                'Neurology',
                'Orthopedics',
                'Pediatrics',
                'Psychiatry',
                'Ophthalmology',
            ]),
            'is_active' => true,
        ]);
    }

    /**
     * Create a patient user.
     */
    public function patient(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'patient',
            'is_active' => true,
        ]);
    }

    /**
     * Create an inactive user (pending approval).
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
