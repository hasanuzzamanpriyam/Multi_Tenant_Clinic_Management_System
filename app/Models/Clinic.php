<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clinic extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
    ];

    /**
     * Get the users associated with the clinic.
     */
    public function users()
    {
        return $this->hasMany(User::class, 'tenant_id');
    }

    /**
     * Get the appointments associated with the clinic.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'tenant_id');
    }

    /**
     * Get the doctor availabilities associated with the clinic.
     */
    public function doctorAvailabilities()
    {
        return $this->hasMany(DoctorAvailability::class, 'tenant_id');
    }
}