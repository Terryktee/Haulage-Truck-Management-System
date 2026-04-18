from rest_framework import serializers

from apps.jobs.models import Job
from apps.trucks.models import Truck
from apps.drivers.models import Driver
from apps.jobs.services import assign_job, update_job_status


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "job_id",
            "pickup_location",
            "delivery_location",
            "cargo_description",
            "status",
            "assigned_truck",
            "assigned_driver",
        ]
        read_only_fields = ["status"]

    def create(self, validated_data):
        truck = validated_data.pop("assigned_truck", None)
        driver = validated_data.pop("assigned_driver", None)

        job = Job.objects.create(**validated_data)

        if truck and driver:
            assign_job(job, truck, driver)

        return job


class JobStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ["status"]

    def update(self, instance, validated_data):
        new_status = validated_data.get("status", instance.status)
        return update_job_status(instance, new_status)