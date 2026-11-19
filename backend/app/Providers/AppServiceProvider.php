<?php

namespace App\Providers;

use App\Listeners\ProvisionStarterWorkspace;
use App\Models\Task;
use App\Observers\TaskObserver;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Task::observe(TaskObserver::class);

        Event::listen(Registered::class, ProvisionStarterWorkspace::class);
    }
}
