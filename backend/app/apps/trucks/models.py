from django.db import models


class Truck(models.Model):
    AVAILABLE = "available"
    IN_TRANSIT = "in_transit"
    MAINTENANCE = "maintenance"

    STATUS_CHOICES = [
        (AVAILABLE, "Available"),
        (IN_TRANSIT, "In Transit"),
        (MAINTENANCE, "Maintenance"),
    ]

    truck_id = models.BigAutoField(primary_key=True)
    registration_number = models.CharField(max_length=50, unique=True)
    capacity = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=AVAILABLE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.registration_number