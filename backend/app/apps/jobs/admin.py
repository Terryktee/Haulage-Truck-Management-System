from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "job_id",
        "pickup_location",
        "delivery_location",
        "status",
        "assigned_truck",
        "assigned_driver",
        "created_at",
    )
    search_fields = (
        "pickup_location",
        "delivery_location",
        "cargo_description",
    )
    list_filter = ("status",)
    autocomplete_fields = ("assigned_truck", "assigned_driver")
    ordering = ("-created_at",)