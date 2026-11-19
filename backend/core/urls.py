from django.urls import path

from .views import HealthView

# domain.com/api/core/...
urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
]
