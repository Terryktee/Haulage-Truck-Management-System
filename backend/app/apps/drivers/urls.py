from django.urls import path,include
from .views import DriverList,DriverDetail
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path("" , DriverList.as_view()),
    path("<int:pk>/",DriverDetail.as_view())
]

urlpatterns = format_suffix_patterns(urlpatterns)