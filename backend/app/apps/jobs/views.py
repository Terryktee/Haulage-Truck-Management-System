from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.jobs.models import Job
from apps.jobs.serializers import (
    JobSerializer,
    JobCreateSerializer,
    JobStatusUpdateSerializer,
)
from apps.jobs.services import assign_job
from apps.trucks.models import Truck
from apps.drivers.models import Driver


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return JobCreateSerializer
        if self.action == "update_status":
            return JobStatusUpdateSerializer
        return JobSerializer

    @action(detail=True, methods=["post"], url_path="assign")
    def assign(self, request, pk=None):
        job = self.get_object()
        truck_id = request.data.get("assigned_truck")
        driver_id = request.data.get("assigned_driver")

        if not truck_id or not driver_id:
            return Response(
                {"detail": "assigned_truck and assigned_driver are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        truck = Truck.objects.get(id=truck_id)
        driver = Driver.objects.get(id=driver_id)

        job = assign_job(job, truck, driver)
        return Response(JobSerializer(job).data)

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        job = self.get_object()
        serializer = JobStatusUpdateSerializer(job, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(JobSerializer(job).data)