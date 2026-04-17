from django.contrib import admin
from .models import Driver


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ("driver_id", "name", "license_number", "phone_number", "created_at")
    search_fields = ("name", "license_number", "phone_number")
    ordering = ("-created_at",)