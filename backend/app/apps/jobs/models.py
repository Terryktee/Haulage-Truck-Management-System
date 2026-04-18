from django.db import models


class Job(models.Model):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_TRANSIT = "in_transit"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (ASSIGNED, "Assigned"),
        (IN_TRANSIT, "In Transit"),
        (COMPLETED, "Completed"),
        (CANCELLED, "Cancelled"),
    ]

    job_id = models.BigAutoField(primary_key=True)
    pickup_location = models.CharField(max_length=255)
    delivery_location = models.CharField(max_length=255)
    cargo_description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    assigned_truck = models.ForeignKey(
        "trucks.Truck",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="jobs",
    )
    assigned_driver = models.ForeignKey(
        "drivers.Driver",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="jobs",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Job {self.job_id} - {self.pickup_location} to {self.delivery_location}"