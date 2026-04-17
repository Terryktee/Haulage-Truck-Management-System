from rest_framework import serializers
from .models import Truck

class TruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields=["truck_id", "registration_number", "capacity", "status", "created_at"]

