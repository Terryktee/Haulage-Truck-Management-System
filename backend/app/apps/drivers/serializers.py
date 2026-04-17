from rest_framework import serializers
from .models import Driver


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ["driver_id", "name", "license_number", "phone_number", "created_at"]
