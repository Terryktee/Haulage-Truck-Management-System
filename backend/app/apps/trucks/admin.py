from django.contrib import admin
from .models import Truck

@admin.register(Truck)
class TruckAdmin(admin.ModelAdmin):
    list_display = ("truck_id", "registration_number", "capacity", "status", "created_at")
    search_fields = ("registration_number", "status")
    list_filter = ("status",)
    ordering = ("-created_at",)