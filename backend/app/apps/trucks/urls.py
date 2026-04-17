from django.urls import path,include
from .views import TruckList,TruckDetail
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path("" , TruckList.as_view()),
    path("<int:pk>",TruckDetail.as_view())
]

urlpatterns = format_suffix_patterns(urlpatterns)