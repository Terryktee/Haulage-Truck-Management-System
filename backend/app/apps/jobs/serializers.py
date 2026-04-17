from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ["job_id", "pickup_location", "delivery_location", "status", "assigned_truck", "assigned_driver", "created_at"]

