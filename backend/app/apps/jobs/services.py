from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.jobs.models import Job
from apps.trucks.models import Truck
from apps.drivers.models import Driver


ACTIVE_JOB_STATUSES = [Job.ASSIGNED, Job.IN_TRANSIT]


def validate_truck_availability(truck: Truck) -> None:
    if truck.status in [Truck.IN_TRANSIT, Truck.MAINTENANCE]:
        raise ValidationError(
            {"assigned_truck": "This truck is not available for assignment."}
        )


def validate_driver_availability(driver: Driver) -> None:
    has_active_job = Job.objects.filter(
        assigned_driver=driver,
        status__in=ACTIVE_JOB_STATUSES
    ).exists()

    if has_active_job:
        raise ValidationError(
            {"assigned_driver": "This driver already has an active job."}
        )


@transaction.atomic
def assign_job(job: Job, truck: Truck, driver: Driver) -> Job:
    validate_truck_availability(truck)
    validate_driver_availability(driver)

    job.assigned_truck = truck
    job.assigned_driver = driver
    job.status = Job.ASSIGNED
    job.save()

    truck.status = Truck.IN_TRANSIT
    truck.save()

    return job


@transaction.atomic
def update_job_status(job: Job, new_status: str) -> Job:
    job.status = new_status
    job.save()

    truck = job.assigned_truck

    if truck:
        if new_status in [Job.ASSIGNED, Job.IN_TRANSIT]:
            truck.status = Truck.IN_TRANSIT
        elif new_status in [Job.COMPLETED, Job.CANCELLED]:
            truck.status = Truck.AVAILABLE

        truck.save()

    return job