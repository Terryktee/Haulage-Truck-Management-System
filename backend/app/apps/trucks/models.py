from django.db import models


class Truck(models.Model):
    STATUS_CHOICES = [
        ("available", "Available"),
        ("in_transit", "In Transit"),
        ("maintenance", "Maintenance"),
    ]
    truck_id = models.AutoField(primary_key=True)
    registration_number = models.CharField(max_length=50, unique=True)
    capacity = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.registration_number
